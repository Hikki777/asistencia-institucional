import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Settings, BarChart3, Wrench, User, Clock, Users, FileText, Activity } from 'lucide-react';
import { authAPI } from './api/endpoints';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import AlumnosPanel from './components/AlumnosPanel';
import PersonalPanel from './components/PersonalPanel';
import AsistenciasPanel from './components/AsistenciasPanel';
import ConfiguracionPanel from './components/ConfiguracionPanel';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import RepairPanel from './components/RepairPanel';
import ReportesPanel from './components/ReportesPanel';
import MetricsPanel from './components/MetricsPanel';

import SetupWizard from './components/SetupWizard';
import LoginPage from './pages/LoginPage';
import client from './api/client';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const [isInitialized, setIsInitialized] = useState(null); // null=loading, false=setup needed, true=ready

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const res = await client.get('/institucion');
      // Si existe y tiene flag inicializado, todo ok
      if (res.data && res.data.inicializado) {
        setIsInitialized(true);
      } else {
        setIsInitialized(false);
      }
    } catch (error) {
      // Si da error (ej 404 o 500), asumimos que falta setup o hay problema
      // Pero si es 404 es seguro que falta setup (o tabla vacía)
      setIsInitialized(false);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !user) {
      authAPI.me()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        });
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/login';
  };

  // El router maneja /login sin token, el resto requiere token

  if (isInitialized === null) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Cargando sistema...</div>;
  }

  return (
    <ErrorBoundary fallbackMessage="Ha ocurrido un error en la aplicación. Por favor, recarga la página.">
      <Router>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar - Solo mostrar si está autenticado */}
          {isLoggedIn && (
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition duration-200 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static`}
          >
          <div className="p-6 border-b border-blue-700">
            <h1 className="text-2xl font-bold">🎓 Gestión Institucional</h1>
            <p className="text-sm text-blue-200">Registro de Asistencias</p>
            {user && (
              <div className="mt-3 pt-3 border-t border-blue-700 flex items-center gap-2 text-sm">
                <User size={16} className="text-blue-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 truncate">{user.email}</p>
                  <p className="text-blue-300 text-xs capitalize">{user.rol}</p>
                </div>
              </div>
            )}
          </div>

          <nav className="p-4 space-y-2">
            <NavLink to="/" icon={Home} label="Dashboard" />
            <NavLink to="/alumnos" icon={BarChart3} label="Alumnos" />
            <NavLink to="/docentes" icon={Users} label="Personal" />
            <NavLink to="/asistencias" icon={Clock} label="Asistencias" />
            <NavLink to="/reportes" icon={FileText} label="Reportes" />
            <NavLink to="/metricas" icon={Activity} label="Métricas" />
            <NavLink to="/configuracion" icon={Settings} label="Configuración Institucional" />
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </aside>
          )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Menu - Solo mostrar si está autenticado */}
          {isLoggedIn && (
          <div className="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">🎓 Registro Institucional</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          )}

          {/* Close sidebar when clicking outside on mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Page Content */}
          <main className="p-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/setup" element={!isInitialized ? <SetupWizard onComplete={() => setIsInitialized(true)} /> : <Navigate to="/login" />} />
              {/* Ruta temporal para testing del SetupWizard */}
              <Route path="/setup-preview" element={<SetupWizard onComplete={() => setIsInitialized(true)} />} />
              <Route path="/login" element={
                !isInitialized ? <Navigate to="/setup" /> :
                isLoggedIn ? <Navigate to="/" /> : <LoginPage />
              } />
              <Route path="/" element={
                !isInitialized ? <Navigate to="/setup" /> :
                isLoggedIn ? <Dashboard /> : <Navigate to="/login" />
              } />
              <Route path="/alumnos" element={isLoggedIn ? <AlumnosPanel /> : <Navigate to="/login" />} />
              <Route path="/docentes" element={isLoggedIn ? <PersonalPanel /> : <Navigate to="/login" />} />
              <Route path="/asistencias" element={isLoggedIn ? <AsistenciasPanel /> : <Navigate to="/login" />} />
              <Route path="/reportes" element={isLoggedIn ? <ReportesPanel /> : <Navigate to="/login" />} />
              <Route path="/metricas" element={isLoggedIn ? <MetricsPanel /> : <Navigate to="/login" />} />
                <Route path="/configuracion" element={isLoggedIn ? <ConfiguracionPanel /> : <Navigate to="/login" />} />
              <Route path="/diagnostics" element={isLoggedIn ? <DiagnosticsPanel /> : <Navigate to="/login" />} />
              <Route path="/repair" element={isLoggedIn ? <RepairPanel /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
    </ErrorBoundary>
  );
}

/* eslint-disable no-unused-vars */
function NavLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition font-medium"
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}
/* eslint-enable no-unused-vars */

export default App;
