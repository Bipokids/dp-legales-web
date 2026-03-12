import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react'; // Quitamos Scale porque usaremos tu logo

// IMPORTAMOS TU LOGO DIRECTO DESDE ASSETS
import logoEstudio from '../assets/logo_completo.png';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Truco: Convertimos el usuario "dplegales" en un correo falso para Firebase
    const emailFormateado = usuario.includes('@') ? usuario : `${usuario}@sistema.com`;

    try {
      await signInWithEmailAndPassword(auth, emailFormateado, password);
    } catch (err) {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  const inputStyle = { padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '15px', color: '#1e293b', marginBottom: '20px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ backgroundColor: 'white', padding: '50px 40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)', width: '100%', maxWidth: '400px', textAlign: 'center', borderTop: '5px solid #0f172a' }}
      >
        
        {/* REEMPLAZAMOS EL CÍRCULO POR EL LOGO REAL */}
        <img 
          src={logoEstudio} 
          alt="Logo DP Legales" 
          style={{ 
            height: '80px', // Un tamaño generoso para que destaque en el login
            width: 'auto', 
            objectFit: 'contain', 
            margin: '0 auto 20px auto',
            display: 'block'
          }} 
        />
        
        <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '24px' }}>DP Legales</h1>
        <p style={{ color: '#64748b', margin: '0 0 30px 0', fontSize: '14px' }}>Acceso restringido al sistema</p>

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Usuario</label>
            <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required style={inputStyle} placeholder="Ingrese su usuario" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: 0, marginBottom: '20px' }}>{error}</p>}

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            type="submit"
          >
            <Lock size={18} /> Iniciar Sesión
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}