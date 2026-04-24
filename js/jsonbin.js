const JSONBIN = {
  BASE: "https://api.jsonbin.io/v3/b",
  KEY: "$2a$10$w4s0yGLGWGdtbtqWXnUa/ulkuknRemES2b6n7fA4pxIH9G5sOea/K",
  BINS: {
    usuarios:   "69eab1cd36566621a8e5fd40",
    tramites:   "69eab344856a6821896778f4",
    documentos: "69eab375aaba8821972f9f84"
  },

  async get(bin) {
    const r = await fetch(`${this.BASE}/${this.BINS[bin]}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": this.KEY,
        "X-Access-Key": this.KEY,
        "Content-Type": "application/json"
      }
    });
    if (!r.ok) throw new Error(`Error GET ${bin}: ${r.status}`);
    const data = await r.json();
    return data.record;
  },

  async set(bin, record) {
    const r = await fetch(`${this.BASE}/${this.BINS[bin]}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": this.KEY,
        "X-Access-Key": this.KEY
      },
      body: JSON.stringify(record)
    });
    if (!r.ok) throw new Error(`Error PUT ${bin}: ${r.status}`);
    return await r.json();
  }
};
