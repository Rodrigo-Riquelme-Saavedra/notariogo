// ── UTILIDADES ──
function usuarioActual() {
  return JSON.parse(localStorage.getItem('notariogo_user') || 'null');
}

function cerrarSesion() {
  localStorage.removeItem('notariogo_user');
  window.location.href = 'index.html';
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function esAdmin() {
  const user = usuarioActual();
  return user && user.rol === 'admin';
}

// ── NAV DINÁMICO ──
document.addEventListener('DOMContentLoaded', () => {
  const user = usuarioActual();
  const actions = document.querySelector('.nav-actions');
  if (!actions) return;

  if (user) {
    actions.innerHTML = `
      <span style="font-size:13px; font-weight:600; color:var(--gray-700);">
        Hola, ${user.nombre.split(' ')[0]}
      </span>
      ${user.rol === 'admin' ? `<a href="admin.html" class="btn-outline" style="color:#1E6FE8;">Panel Admin</a>` : ''}
      <a href="mis-documentos.html" class="btn-outline">Mis documentos</a>
      <button onclick="cerrarSesion()" class="btn-primary">Cerrar sesión</button>
    `;
  }
});

// ── ESTADO COLORES ──
function estadoColor(estado) {
  const colores = {
    'Pendiente':   { bg: '#FEF3C7', text: '#92400E' },
    'En proceso':  { bg: '#DBEAFE', text: '#1E40AF' },
    'Completado':  { bg: '#D1FAE5', text: '#065F46' },
    'Rechazado':   { bg: '#FEE2E2', text: '#991B1B' }
  };
  return colores[estado] || { bg: '#EEF2F9', text: '#3A4A6B' };
}

// ── PÁGINA: TRÁMITES ──
async function iniciarTramite(tipo, emoji) {
  const user = usuarioActual();
  if (!user) return window.location.href = 'login.html';

  try {
    const data = await JSONBIN.get('tramites');
    const nuevo = {
      id: Date.now(),
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      usuarioEmail: user.email,
      tipo, emoji,
      estado: 'Pendiente',
      fecha: new Date().toISOString()
    };
    data.tramites.push(nuevo);
    await JSONBIN.set('tramites', data);
    alert('✅ Trámite iniciado correctamente. Puedes seguirlo en "Mis documentos".');
    window.location.href = 'mis-documentos.html';
  } catch(e) {
    alert('Error al iniciar el trámite. Intenta más tarde.');
  }
}

// ── PÁGINA: MIS DOCUMENTOS ──
async function cargarMisDocumentos() {
  const user = usuarioActual();
  if (!user) return window.location.href = 'login.html';

  const contenido = document.getElementById('mis-docs-contenido');
  if (!contenido) return;

  contenido.innerHTML = '<p style="color:var(--gray-500); text-align:center;">Cargando...</p>';

  try {
    const data = await JSONBIN.get('tramites');
    const misTramites = data.tramites.filter(t => t.usuarioId === user.id);

    if (misTramites.length === 0) {
      contenido.innerHTML = `
        <div style="text-align:center; padding:4rem 2rem;">
          <div style="font-size:48px; margin-bottom:1rem;">📄</div>
          <h3 style="font-family:var(--serif); color:var(--navy); margin-bottom:.5rem;">Aún no tienes trámites</h3>
          <p style="color:var(--gray-500); margin-bottom:1.5rem;">Inicia tu primer trámite notarial en minutos.</p>
          <a href="tramites.html" class="btn-primary">Iniciar trámite</a>
        </div>`;
      return;
    }

    contenido.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem;">
        ${misTramites.map(t => {
          const col = estadoColor(t.estado);
          return `
          <div style="background:white; border:2px solid #C1CBDF; border-radius:14px; padding:1.25rem; box-shadow:0 2px 8px rgba(13,27,62,0.06);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.75rem;">
              <span style="font-size:26px;">${t.emoji || '📋'}</span>
              <span style="font-size:11px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:100px; background:${col.bg}; color:${col.text};">${t.estado}</span>
            </div>
            <h4 style="font-size:14px; font-weight:700; color:#0D1B3E; margin-bottom:.25rem;">${t.tipo}</h4>
            <p style="font-size:12px; color:#7888A8;">${formatearFecha(t.fecha)}</p>
          </div>`;
        }).join('')}
      </div>`;
  } catch(e) {
    contenido.innerHTML = '<p style="color:red; text-align:center;">Error al cargar. Intenta más tarde.</p>';
  }
}
