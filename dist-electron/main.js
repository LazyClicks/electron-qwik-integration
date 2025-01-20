import s, { app as i, BrowserWindow as w } from "electron";
import r from "node:path";
import v from "node:fs/promises";
const m = -6, p = async (e, a) => {
  try {
    const n = await v.stat(e);
    if (n.isFile())
      return e;
    if (n.isDirectory())
      return p(r.join(e, `${a}.html`));
  } catch {
  }
};
function y(e) {
  if (e = {
    isCorsEnabled: !0,
    scheme: "app",
    hostname: "-",
    file: "index",
    ...e
  }, !e.directory)
    throw new Error("The `directory` option is required");
  e.directory = r.resolve(s.app.getAppPath(), e.directory);
  const a = async (n, o) => {
    const c = r.join(e.directory, `${e.file}.html`), l = r.join(e.directory, decodeURIComponent(new URL(n.url).pathname)), f = r.relative(e.directory, l);
    if (!(!f.startsWith("..") && !r.isAbsolute(f))) {
      o({ error: m });
      return;
    }
    const h = await p(l, e.file), d = r.extname(l);
    if (!h && d && d !== ".html" && d !== ".asar") {
      o({ error: m });
      return;
    }
    o({
      path: h || c
    });
  };
  return s.protocol.registerSchemesAsPrivileged([
    {
      scheme: e.scheme,
      privileges: {
        standard: !0,
        secure: !0,
        allowServiceWorkers: !0,
        supportFetchAPI: !0,
        corsEnabled: e.isCorsEnabled
      }
    }
  ]), s.app.on("ready", () => {
    (e.partition ? s.session.fromPartition(e.partition) : s.session.defaultSession).protocol.registerFileProtocol(e.scheme, a);
  }), async (n, o) => {
    const c = o ? "?" + new URLSearchParams(o).toString() : "";
    await n.loadURL(`${e.scheme}://${e.hostname}${c}`);
  };
}
process.env.DIST = r.join(__dirname, "../dist");
process.env.VITE_PUBLIC = i.isPackaged ? process.env.DIST : r.join(process.env.DIST, "../public");
const E = y({ directory: "dist" });
let t;
const u = process.env.VITE_DEV_SERVER_URL;
function g() {
  t = new w({
    icon: r.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    backgroundColor: "#fff",
    webPreferences: {
      preload: r.join(__dirname, "preload.js"),
      nodeIntegration: !1
    }
  }), t.webContents.on("did-finish-load", () => {
    t == null || t.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), u ? t.loadURL(u) : E(t);
}
i.on("window-all-closed", () => {
  process.platform !== "darwin" && (i.quit(), t = null);
});
i.on("activate", () => {
  w.getAllWindows().length === 0 && g();
});
i.whenReady().then(g);
