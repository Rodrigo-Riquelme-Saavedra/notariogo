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
      <a href="mis-documentos.html" class="btn-outline">Mis documentos</a>
      <button onclick="cerrarSesion()" class="btn-primary">Cerrar sesión</button>
    `;
  }
});

// ── PÁGINA: MIS DOCUMENTOS ──
async function cargarMisDocumentos() {
  const user = usuarioActual();
  if (!user) return window.location.href = 'login.html';

  const contenido = document.getElementById('mis-docs-contenido');
  if (!contenido) return;

  contenido.innerHTML = '<p style="color:var(--gray-500);">Cargando...</p>';

  try {
    const data = await JSONBIN.get('tramites');
    const misTramites = data.tramites.filter(t => t.usuarioId === user.id);

    if (misTramites.length === 0) {
      contenido.innerHTML = `
        <div style="text-align:center; padding:4rem 2rem;">
          <div style="font-size:48px; margin-bottom:1rem;">📄</div>
          <h3 style="font-family:var(--serif); color:var(--navy); margin-bottom:.5rem;">
            Aún no tienes trámites
          </h3>
          <p style="color:var(--gray-500); margin-bottom:1.5rem;">
            Inicia tu primer trámite notarial en minutos.
          </p>
          <a href="tramites.html" class="btn-primary">Iniciar trámite</a>
        </div>
      `;
      return;
    }

    contenido.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem;">
        ${misTramites.map(t => `
          <div style="background:var(--white); border:1px solid var(--gray-100);
                      border-radius:14px; padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.75rem;">
              <span style="font-size:24px;">${t.emoji || '📋'}</span>
              <span style="font-size:11px; font-weight:700; text-transform:uppercase;
                           padding:4px 10px; border-radius:100px;
                           background:${estadoColor(t.estado).bg};
                           color:${estadoColor(t.estado).text};">
                ${t.estado}
              </span>
            </div>
            <h4 style="font-size:14px; font-weight:700; color:var(--navy); margin-bottom:.25rem;">
              ${t.tipo}
            </h4>
            <p style="font-size:12px; color:var(--gray-500);">
              ${formatearFecha(t.fecha)}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  } catch(e) {
    contenido.innerHTML = '<p style="color:red;">Error al cargar tus trámites. Intenta más tarde.</p>';
  }
}

function estadoColor(estado) {
  const colores = {
    'Pendiente':   { bg: '#FEF3C7', text: '#92400E' },
    'En proceso':  { bg: '#DBEAFE', text: '#1E40AF' },
    'Completado':  { bg: '#D1FAE5', text: '#065F46' },
    'Rechazado':   { bg: '#FEE2E2', text: '#991B1B' }
  };
  return colores[estado] || { bg: 'var(--gray-100)', text: 'var(--gray-700)' };
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
