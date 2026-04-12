import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebase'; 
import { motion } from 'framer-motion';
// Agregamos Calculator (o un ícono de recibo) para Presupuestos
import { Calendar, Users, Scale, Briefcase, ChevronRight, FileText, Calculator } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import Alertas from '../components/Alertas';

export default function Dashboard() {
  const [cantidadClientes, setCantidadClientes] = useState(0);
  const [cantidadVencimientos, setCantidadVencimientos] = useState(0);
  const [cantidadCausas, setCantidadCausas] = useState(0);
  const [cantidadPresupuestos, setCantidadPresupuestos] = useState(0); // Nuevo estado

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return; // Validación de seguridad

    const userUid = user.uid;

    const clientesRef = ref(db, `clientes/${userUid}`);
    onValue(clientesRef, (snapshot) => {
      setCantidadClientes(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });

    const vencimientosRef = ref(db, `vencimientos/${userUid}`);
    onValue(vencimientosRef, (snapshot) => {
      setCantidadVencimientos(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });

    const causasRef = ref(db, `causas/${userUid}`);
    onValue(causasRef, (snapshot) => {
      setCantidadCausas(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });

    // NUEVO: LEEMOS LOS PRESUPUESTOS DEL USUARIO ACTUAL
    const presupuestosRef = ref(db, `presupuestos/${userUid}`);
    onValue(presupuestosRef, (snapshot) => {
      setCantidadPresupuestos(snapshot.val() ? Object.keys(snapshot.val()).length : 0);
    });
  }, []);

  const bigCardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)', flex: '1 1 300px', display: 'flex', flexDirection: 'column', color: '#0f172a', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' };

  // Capturamos el email para la validación
  const usuarioEmail = auth.currentUser?.email;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* CABECERA Y CONTADORES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>Panel de Control</h1>
          
          {/* SUBTÍTULO DINÁMICO */}
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            {usuarioEmail === 'mdurante@sistema.com' 
              ? 'Mariela Durante y Asoc.' 
              : 'Estudio Jurídico DP Legales'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* NUEVO: Contador de Presupuestos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <Calculator size={16} color="#475569" />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}><strong style={{ color: '#0f172a' }}>{cantidadPresupuestos}</strong> Cotizaciones</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <FileText size={16} color="#475569" />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}><strong style={{ color: '#0f172a' }}>{cantidadCausas}</strong> Causas</span>
          </div>
          
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

      {/* CUADRÍCULA DE MÓDULOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/vencimientos')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><Scale size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Gestión de Vencimientos</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Administre plazos legales, audiencias y recordatorios para asegurar el estricto cumplimiento procesal.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/deudas')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><Briefcase size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Clientes y Honorarios</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Controle la cartera de clientes, saldos pendientes y gestione la administración de honorarios.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/causas')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><FileText size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Seguimiento de Causas</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Registre la bitácora de expedientes, actualice novedades procesales y mantenga el historial ordenado.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>

        {/* Tarjeta 4: Presupuestos (NUEVA) */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)' }} style={bigCardStyle} onClick={() => navigate('/presupuestos')}>
          <div style={{ backgroundColor: '#0f172a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px' }}><Calculator size={30} color="white" /></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Presupuestos</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', flexGrow: 1 }}>Genere cotizaciones formales de honorarios para enviar a sus clientes en formato PDF.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '25px', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>Ingresar al módulo <ChevronRight size={18} /></div>
        </motion.div>

      </div>
    </div>
  );
}