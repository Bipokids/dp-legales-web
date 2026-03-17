import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Vencimientos from './pages/Vencimientos';
import Deudas from './pages/Deudas';
import Login from './pages/Login';
import Causas from './pages/Causas';
import Presupuestos from './pages/Presupuestos';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificamos si hay una sesión activa en Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando sistema...</div>;
  }

  // Si no hay usuario, forzamos la vista del Login
  if (!usuario) {
    return <Login />;
  }

  // Si hay usuario, mostramos el sistema normal
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vencimientos" element={<Vencimientos />} />
        <Route path="/deudas" element={<Deudas />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/causas" element={<Causas />} />
        <Route path="/presupuestos" element={<Presupuestos />} />
      </Routes>
    </div>
  );
}

export default App;