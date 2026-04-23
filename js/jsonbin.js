const JSONBIN = {
  BASE: "https://api.jsonbin.io/v3/b",
  KEY: "TU_MASTER_KEY_AQUI",
  BINS: {
    usuarios:    "TU_BIN_ID_USUARIOS",
    tramites:    "TU_BIN_ID_TRAMITES",
    documentos:  "TU_BIN_ID_DOCUMENTOS"
  },

  async get(bin) {
    const r = await fetch(`${this.BASE}/${this.BINS[bin]}/latest`, {
      headers: { "X-Master-Key": this.KEY }
    });
    const data = await r.json();
    return data.record;
  },

  async set(bin, record) {
    const r = await fetch(`${this.BASE}/${this.BINS[bin]}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": this.KEY
      },
      body: JSON.stringify(record)
    });
    return await r.json();
  }
};
