import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

import logoEstudio from '../assets/logo_completo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  return (
    <nav style={{
      backgroundColor: '#f1f5f9', // Un gris azulado muy sutil y serio
      padding: '12px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #cbd5e1', // Borde inferior un tono más oscuro para separar
      borderTop: '4px solid #0f172a', // ACENTO CORPORATIVO: Línea superior azul noche
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' // Sombra un poco más profunda
    }}>
      
      {/* SECCIÓN IZQUIERDA: LOGO CORPORATIVO */}
      <div 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        title="Volver al Inicio"
      >
        <img 
          src={logoEstudio} 
          alt="Logo DP Legales" 
          style={{ 
            height: '45px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>

      {/* SECCIÓN DERECHA: USUARIO Y BOTÓN DE SALIDA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {location.pathname !== '/' && (
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Panel de Control
          </button>
        )}

        <span style={{ 
          fontSize: '14px', 
          color: '#475569', 
          borderLeft: '1px solid #cbd5e1', 
          paddingLeft: '20px',
          fontWeight: '500'
        }}>
          {auth.currentUser?.email}
        </span>
        
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            padding: '6px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#ef4444';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#ef4444';
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}