import { useState, useEffect } from 'react';
import { ref, push, set, update, onValue, remove } from 'firebase/database';
import { db, auth } from '../config/firebase'; // IMPORTAMOS AUTH
import { motion } from 'framer-motion';
import { Search, UserPlus, Trash2, ArrowDownCircle, ArrowUpCircle, Briefcase, Pencil } from 'lucide-react';

export default function Deudas() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [idEdicion, setIdEdicion] = useState(null);
  const [formCliente, setFormCliente] = useState({ nombre: '', telefono: '', deudaInicial: '' });
  const [montosMovimiento, setMontosMovimiento] = useState({});

  useEffect(() => {
    // RUTA AISLADA
    const clientesRef = ref(db, `clientes/${auth.currentUser.uid}`);
    onValue(clientesRef, (snapshot) => {
      const data = snapshot.val();
      setClientes(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
  }, []);

  const handleNuevoCliente = (e) => {
    e.preventDefault();
    if (idEdicion) {
      // RUTA AISLADA
      const clienteRef = ref(db, `clientes/${auth.currentUser.uid}/${idEdicion}`);
      update(clienteRef, { nombre: formCliente.nombre, telefono: formCliente.telefono, deuda_total: Number(formCliente.deudaInicial) || 0 }).then(() => {
        setFormCliente({ nombre: '', telefono: '', deudaInicial: '' });
        setIdEdicion(null);
      });
    } else {
      // RUTA AISLADA
      const clientesRef = ref(db, `clientes/${auth.currentUser.uid}`);
      const nuevoClienteRef = push(clientesRef);
      set(nuevoClienteRef, { nombre: formCliente.nombre, telefono: formCliente.telefono, deuda_total: Number(formCliente.deudaInicial) || 0 }).then(() => setFormCliente({ nombre: '', telefono: '', deudaInicial: '' }));
    }
  };

  const cargarParaEditar = (cliente) => {
    setFormCliente({ nombre: cliente.nombre, telefono: cliente.telefono || '', deudaInicial: cliente.deuda_total });
    setIdEdicion(cliente.id);
  };

  const cancelarEdicion = () => {
    setFormCliente({ nombre: '', telefono: '', deudaInicial: '' });
    setIdEdicion(null);
  };

  const actualizarDeuda = (id, deudaActual, tipo) => {
    const montoIngresado = Number(montosMovimiento[id]);
    if (!montoIngresado || montoIngresado <= 0) return alert("Por favor, ingresa un monto válido mayor a 0.");
    let nuevaDeuda = deudaActual;
    if (tipo === 'pago') nuevaDeuda -= montoIngresado;
    else if (tipo === 'costo') nuevaDeuda += montoIngresado;

    // RUTA AISLADA
    const clienteRef = ref(db, `clientes/${auth.currentUser.uid}/${id}`);
    update(clienteRef, { deuda_total: nuevaDeuda });
    setMontosMovimiento({ ...montosMovimiento, [id]: '' });
  };

  const eliminarCliente = (id) => {
    if(window.confirm('¿Seguro que desea eliminar este cliente y todo su historial de la base de datos?')) {
      // RUTA AISLADA
      const clienteRef = ref(db, `clientes/${auth.currentUser.uid}/${id}`);
      remove(clienteRef);
      if (id === idEdicion) cancelarEdicion();
    }
  };

  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px', marginTop: '12px' };
  const inputStyle = { padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#1e293b' };
  const cardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' };
  const actionButtonStyle = { padding: '8px 12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px' }}><Briefcase size={28} color="white" /></div>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }}>Clientes y Honorarios</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Control de cartera, cuenta corriente y saldos pendientes.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', backgroundColor: 'white', padding: '30px 25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: idEdicion ? '#d97706' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} />{idEdicion ? 'Editando Cliente' : 'Registrar Cliente'}
          </h2>
          <form onSubmit={handleNuevoCliente}>
            <label style={labelStyle}>Nombre o Razón Social:</label>
            <input type="text" value={formCliente.nombre} onChange={(e) => setFormCliente({...formCliente, nombre: e.target.value})} required style={inputStyle} placeholder="Ej. Gómez, María" />
            <label style={labelStyle}>Teléfono / Contacto (Opcional):</label>
            <input type="tel" value={formCliente.telefono} onChange={(e) => setFormCliente({...formCliente, telefono: e.target.value})} style={inputStyle} placeholder="Ej. 11 1234-5678" />
            <label style={labelStyle}>{idEdicion ? 'Ajustar Saldo ($):' : 'Deuda Inicial ($):'}</label>
            <input type="number" value={formCliente.deudaInicial} onChange={(e) => setFormCliente({...formCliente, deudaInicial: e.target.value})} required style={inputStyle} min="0" placeholder="0.00" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '12px', marginTop: '25px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', backgroundColor: idEdicion ? '#d97706' : '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} type="submit">
              {idEdicion ? 'Actualizar Ficha' : 'Guardar Cliente'}
            </motion.button>
            {idEdicion && <button type="button" onClick={cancelarEdicion} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Cancelar Edición</button>}
          </form>
        </div>

        <div style={{ flex: '2 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Search size={20} color="#94a3b8" />
            <input type="text" placeholder="Buscar cliente por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ border: 'none', outline: 'none', padding: '10px', width: '100%', background: 'transparent', color: '#1e293b', fontSize: '15px' }} />
          </div>
          <div>
            {clientesFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', margin: 0 }}>No hay clientes registrados en cartera.</p></div>
            ) : (
              clientesFiltrados.map((cliente) => (
                <motion.div key={cliente.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '20px' }}>{cliente.nombre}</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>📞 {cliente.telefono || 'Sin teléfono registrado'}</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saldo Actual</p>
                        <h2 style={{ margin: 0, color: cliente.deuda_total <= 0 ? '#16a34a' : '#ef4444', fontSize: '28px' }}>${cliente.deuda_total.toLocaleString()}</h2>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <motion.button whileHover={{ scale: 1.1, color: '#d97706' }} onClick={() => cargarParaEditar(cliente)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '5px' }} title="Editar ficha"><Pencil size={18} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1, color: '#ef4444' }} onClick={() => eliminarCliente(cliente.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '5px' }} title="Eliminar cliente"><Trash2 size={18} /></motion.button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative', flex: '1 1 120px' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</span>
                      <input type="number" placeholder="Monto a aplicar" value={montosMovimiento[cliente.id] || ''} onChange={(e) => setMontosMovimiento({...montosMovimiento, [cliente.id]: e.target.value})} style={{ ...inputStyle, paddingLeft: '25px', margin: 0 }} min="1" />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => actualizarDeuda(cliente.id, cliente.deuda_total, 'pago')} style={{ ...actionButtonStyle, flex: '1 1 120px', backgroundColor: '#16a34a' }}><ArrowDownCircle size={16} /> Aplicar Pago</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => actualizarDeuda(cliente.id, cliente.deuda_total, 'costo')} style={{ ...actionButtonStyle, flex: '1 1 120px', backgroundColor: '#ef4444' }}><ArrowUpCircle size={16} /> Sumar Cargo</motion.button>
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