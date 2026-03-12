import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, auth } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function Alertas() {
  const [alertasActivas, setAlertasActivas] = useState([]);
  
  // Guardamos la base de datos cruda
  const [datosBD, setDatosBD] = useState(null);
  
  // Nuestro Reloj Digital Invisible
  const [horaActual, setHoraActual] = useState(new Date());

  // 1. ESCUCHAMOS A FIREBASE (Se dispara al instante si agregas o borras algo)
  useEffect(() => {
    if (!auth.currentUser) return;
    const vencimientosRef = ref(db, `vencimientos/${auth.currentUser.uid}`);
    
    const unsubscribe = onValue(vencimientosRef, (snapshot) => {
      setDatosBD(snapshot.val());
    });
    
    return () => unsubscribe();
  }, []);

  // 2. EL RELOJ INVISIBLE (Avanza cada 10 segundos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date()); // Le avisa a React que el tiempo avanzó
    }, 10000); 
    
    return () => clearInterval(intervalo);
  }, []);

  // 3. LA CALCULADORA (Se ejecuta si cambian los datos O si avanza el reloj)
  useEffect(() => {
    if (!datosBD) {
      setAlertasActivas([]);
      return;
    }

    const alertas = [];
    
    Object.keys(datosBD).forEach(key => {
      const item = datosBD[key];
      
      // Si ya fue marcada como leída, la ignoramos de inmediato
      if (item.leido) return; 

      const fechaVencimiento = new Date(`${item.fecha}T${item.hora}`);
      const diferenciaMs = fechaVencimiento.getTime() - horaActual.getTime();
      
      const msPorHora = 1000 * 60 * 60;
      const msPorDia = msPorHora * 24;
      
      // Forzamos que sea un número para evitar errores matemáticos de JavaScript
      const cantidadAnticipacion = Number(item.anticipacion); 
      
      let anticipacionMs = item.unidad === 'dias' 
        ? cantidadAnticipacion * msPorDia 
        : cantidadAnticipacion * msPorHora;

      // Si la diferencia de tiempo entra en el rango de alerta, la disparamos
      if (diferenciaMs <= anticipacionMs) {
        const estaVencido = diferenciaMs < 0;
        alertas.push({ id: key, ...item, estaVencido });
      }
    });

    // Ordenamos para que las más urgentes aparezcan arriba
    alertas.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
    
    setAlertasActivas(alertas);
  }, [datosBD, horaActual]); // Los "gatillos" que disparan este efecto

  const marcarComoLeido = (id) => {
    const registroRef = ref(db, `vencimientos/${auth.currentUser.uid}/${id}`);
    update(registroRef, { leido: true });
  };

  if (alertasActivas.length === 0) return null;

  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginTop: 0 }}>
        <AlertTriangle size={24} />
        Alertas y Vencimientos Próximos
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {alertasActivas.map((alerta) => (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: alerta.estaVencido ? '#fef2f2' : '#fffbeb',
                borderLeft: `5px solid ${alerta.estaVencido ? '#ef4444' : '#f59e0b'}`,
                padding: '15px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' }}>
                  {alerta.cliente} - {alerta.lugar}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={16} />
                  {alerta.estaVencido ? 'VENCIDO EL:' : 'VENCE EL:'} {alerta.fecha} a las {alerta.hora} hs
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: alerta.estaVencido ? '#ef4444' : '#f59e0b', 
                  color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold'
                }}>
                  {alerta.estaVencido ? 'Urgente' : 'Próximo'}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, color: '#16a34a' }} whileTap={{ scale: 0.9 }}
                  onClick={() => marcarComoLeido(alerta.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Marcar como leído"
                >
                  <CheckCircle size={24} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}