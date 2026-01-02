const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

// Variables globales
let mainWindow;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Gestión Institucional",
    icon: path.join(__dirname, "..", "frontend-react", "public", "logo.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Ocultar menú por defecto
  mainWindow.setMenuBarVisibility(false);

  // Cargar la app
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // En producción, cargar el archivo local compilado
    mainWindow.loadFile(path.join(__dirname, "..", "frontend-react", "dist", "index.html"));
  }

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

