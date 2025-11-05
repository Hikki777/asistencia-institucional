import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Settings, BarChart3, Wrench, User, Clock, Users } from 'lucide-react';
import { authAPI } from './api/endpoints';
import Dashboard from './components/Dashboard';
import AlumnosPanel from './components/AlumnosPanel';
import DocentesPanel from './components/DocentesPanel';
import AsistenciasPanel from './components/AsistenciasPanel';
import ConfiguracionPanel from './components/ConfiguracionPanel';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import RepairPanel from './components/RepairPanel';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

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

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
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
            <NavLink to="/docentes" icon={Users} label="Docentes" />
            <NavLink to="/asistencias" icon={Clock} label="Asistencias" />
            <NavLink to="/configuracion" icon={Settings} label="Configuración" />
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Menu */}
          <div className="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">🎓 Registro Institucional</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

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
              <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/alumnos" element={isLoggedIn ? <AlumnosPanel /> : <Navigate to="/login" />} />
              <Route path="/docentes" element={isLoggedIn ? <DocentesPanel /> : <Navigate to="/login" />} />
              <Route path="/asistencias" element={isLoggedIn ? <AsistenciasPanel /> : <Navigate to="/login" />} />
              <Route path="/configuracion" element={isLoggedIn ? <ConfiguracionPanel /> : <Navigate to="/login" />} />
              <Route path="/diagnostics" element={isLoggedIn ? <DiagnosticsPanel /> : <Navigate to="/login" />} />
              <Route path="/repair" element={isLoggedIn ? <RepairPanel /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
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
