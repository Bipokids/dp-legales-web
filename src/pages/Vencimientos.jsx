import { useState, useEffect } from 'react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { db, auth } from '../config/firebase'; // IMPORTAMOS AUTH
import { motion } from 'framer-motion';
import { Search, Trash2, Pencil, Scale, CalendarClock } from 'lucide-react'; 

export default function Vencimientos() {
  const [vencimientos, setVencimientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [idEdicion, setIdEdicion] = useState(null); 
  const [formulario, setFormulario] = useState({ cliente: '', fecha: '', hora: '', lugar: '', anticipacion: '', unidad: 'dias' });

  useEffect(() => {
    // RUTA AISLADA
    const vencimientosRef = ref(db, `vencimientos/${auth.currentUser.uid}`);
    onValue(vencimientosRef, (snapshot) => {
      const data = snapshot.val();
      setVencimientos(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
  }, []);

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idEdicion) {
      // RUTA AISLADA
      const registroRef = ref(db, `vencimientos/${auth.currentUser.uid}/${idEdicion}`);
      update(registroRef, formulario).then(() => {
        setFormulario({ cliente: '', fecha: '', hora: '', lugar: '', anticipacion: '', unidad: 'dias' });
        setIdEdicion(null);
      });
    } else {
      // RUTA AISLADA
      const vencimientosRef = ref(db, `vencimientos/${auth.currentUser.uid}`);
      const nuevoRegistroRef = push(vencimientosRef); 
      set(nuevoRegistroRef, formulario).then(() => setFormulario({ cliente: '', fecha: '', hora: '', lugar: '', anticipacion: '', unidad: 'dias' }));
    }
  };

  const cargarParaEditar = (item) => {
    setFormulario({ cliente: item.cliente, fecha: item.fecha, hora: item.hora, lugar: item.lugar, anticipacion: item.anticipacion, unidad: item.unidad });
    setIdEdicion(item.id);
  };

  const cancelarEdicion = () => {
    setFormulario({ cliente: '', fecha: '', hora: '', lugar: '', anticipacion: '', unidad: 'dias' });
    setIdEdicion(null);
  };

  const eliminarRegistro = (id) => {
    if(window.confirm('¿Seguro que desea eliminar este registro del sistema?')) {
      // RUTA AISLADA
      const registroRef = ref(db, `vencimientos/${auth.currentUser.uid}/${id}`);
      remove(registroRef);
      if (id === idEdicion) cancelarEdicion();
    }
  };

  const resultadosFiltrados = vencimientos.filter(v => v.cliente.toLowerCase().includes(busqueda.toLowerCase()) || v.lugar.toLowerCase().includes(busqueda.toLowerCase()));

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px', marginTop: '12px' };
  const inputStyle = { padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#1e293b' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px' }}><Scale size={28} color="white" /></div>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }}>Gestión de Vencimientos</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Administración de plazos, audiencias y recordatorios procesales.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', backgroundColor: 'white', padding: '30px 25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: idEdicion ? '#d97706' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} />{idEdicion ? 'Editando Registro' : 'Nuevo Vencimiento'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Nombre del Cliente / Carátula:</label>
            <input type="text" name="cliente" value={formulario.cliente} onChange={handleChange} required style={inputStyle} placeholder="Ej. Pérez c/ Gómez s/ Daños" />
            <label style={labelStyle}>Lugar de Presentación / Audiencia:</label>
            <input type="text" name="lugar" value={formulario.lugar} onChange={handleChange} required style={inputStyle} placeholder="Ej. Juzgado Civil N° 3" />
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Fecha:</label><input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Hora límite:</label><input type="time" name="hora" value={formulario.hora} onChange={handleChange} required style={inputStyle} /></div>
            </div>
            <label style={labelStyle}>Configurar Alerta Anticipada:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" name="anticipacion" value={formulario.anticipacion} onChange={handleChange} required style={{...inputStyle, flex: 1}} min="1" placeholder="Cantidad" />
              <select name="unidad" value={formulario.unidad} onChange={handleChange} style={{...inputStyle, flex: 1}}>
                <option value="dias">Días</option>
                <option value="horas">Horas</option>
              </select>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '12px', marginTop: '25px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', backgroundColor: idEdicion ? '#d97706' : '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} type="submit">
              {idEdicion ? 'Actualizar Registro' : 'Guardar Registro'}
            </motion.button>
            {idEdicion && <button type="button" onClick={cancelarEdicion} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Cancelar Edición</button>}
          </form>
        </div>

        <div style={{ flex: '2 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Search size={20} color="#94a3b8" />
            <input type="text" placeholder="Buscar por cliente, carátula o juzgado..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ border: 'none', outline: 'none', padding: '10px', width: '100%', background: 'transparent', color: '#1e293b', fontSize: '15px' }} />
          </div>
          <div>
            {resultadosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', margin: 0 }}>No se encontraron registros activos.</p></div>
            ) : (
              resultadosFiltrados.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={cardStyle}>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '16px' }}>{item.cliente}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#475569', fontSize: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📅 {item.fecha} a las {item.hora} hs</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📍 {item.lugar}</span>
                    </div>
                    <div style={{ marginTop: '10px', display: 'inline-block', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>🔔 Alerta programada: {item.anticipacion} {item.unidad} antes</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                    <motion.button whileHover={{ scale: 1.1, color: '#d97706' }} onClick={() => cargarParaEditar(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '5px' }} title="Modificar registro"><Pencil size={20} /></motion.button>
                    <motion.button whileHover={{ scale: 1.1, color: '#ef4444' }} onClick={() => eliminarRegistro(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '5px' }} title="Eliminar registro"><Trash2 size={20} /></motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}