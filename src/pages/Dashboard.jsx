import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebase'; // IMPORTAMOS AUTH
import { motion } from 'framer-motion';
import { Calendar, Users, Scale, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Alertas from '../components/Alertas';

export default function Dashboard() {
  const [cantidadClientes, setCantidadClientes] = useState(0);
  const [cantidadVencimientos, setCantidadVencimientos] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // LEEMOS SOLO LOS CLIENTES DEL USUARIO ACTUAL
    const clientesRef = ref(db, `clientes/${auth.currentUser.uid}`);
    onValue(clientesRef, (snapshot) => {
      setCantidadClientes(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });

    // LEEMOS SOLO LOS VENCIMIENTOS DEL USUARIO ACTUAL
    const vencimientosRef = ref(db, `vencimientos/${auth.currentUser.uid}`);
    onValue(vencimientosRef, (snapshot) => {
      setCantidadVencimientos(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });
  }, []);

  const bigCardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)', flex: '1 1 300px', display: 'flex', flexDirection: 'column', color: '#0f172a', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>Panel de Control</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Estudio Jurídico DP Legales</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <Calendar size={16} color="#475569" />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}><strong style={{ color: '#0f172a' }}>{cantidadVencimientos}</strong> Activos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <Users size={16} color="#475569" />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}><strong style={{ color: '#0f172a' }}>{cantidadClientes}</strong> Clientes</span>
          </div>
        </div>
      </div>

      <Alertas />

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/vencimientos')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><Scale size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Gestión de Vencimientos</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Administre plazos legales, audiencias y recordatorios para asegurar el estricto cumplimiento de todas las obligaciones procesales.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/deudas')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><Briefcase size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Clientes y Honorarios</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Controle la cartera de clientes, registre movimientos de cuenta, saldos pendientes y gestione la administración general de honorarios.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>
      </div>
    </div>
  );
}