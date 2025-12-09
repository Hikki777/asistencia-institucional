const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");

// Variables globales
let mainWindow;
let backendProcess;
const isDev = !app.isPackaged;
const PORT = 5000; // Puerto fijo por ahora, idealmente dinámico

// Ruta al backend
const backendScript = path.join(__dirname, "..", "backend", "server.js");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "HikariOpen",
    icon: path.join(__dirname, "..", "frontend-react", "public", "logo.png"), // Asegúrate de tener un icono
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Ocultar menú por defecto en producción
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Cargar la app
  const startUrl = isDev ? "http://localhost:5173" : `http://localhost:${PORT}`; // En prod servimos el frontend desde el backend

  // Esperar a que el backend esté listo antes de cargar
  setTimeout(() => {
    mainWindow.loadURL(startUrl).catch((err) => {
      console.error("Error loading URL:", err);
      // Reintentar o mostrar página de error
    });
  }, 2000);

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startBackend() {
  if (isDev) {
    console.log(
      "Modo desarrollo: Backend debe ser iniciado manualmente o por script separado"
    );
    return;
  }
  backendProcess.stderr.on("data", (data) => {
    console.error(`[Backend Error]: ${data}`);
  });
}

app.whenReady().then(() => {
  startBackend();
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

app.on("will-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
