import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { Search, Plus, FileText, ChevronRight, Clock, Trash2, Edit, Save, X } from 'lucide-react';

export default function Causas() {
  const [causas, setCausas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [causaSeleccionada, setCausaSeleccionada] = useState(null);
  
  // Estados para crear
  const [mostrarNuevaCausa, setMostrarNuevaCausa] = useState(false);
  const [nuevaReferencia, setNuevaReferencia] = useState('');
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState('');

  // Estados para editar seguimientos
  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const colorSlateBlue = '#0f172a';

  // 1. Cargar causas
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const causasRef = ref(database, `causas/${user.uid}`);
    const unsubscribe = onValue(causasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaCausas = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          seguimientos: data[key].seguimientos 
            ? Object.keys(data[key].seguimientos).map(segKey => ({
                id: segKey,
                ...data[key].seguimientos[segKey]
              })).sort((a, b) => b.timestamp - a.timestamp) // Ordenar por fecha, más reciente arriba
            : []
        }));
        setCausas(listaCausas);
        
        if (causaSeleccionada) {
          const actualizada = listaCausas.find(c => c.id === causaSeleccionada.id);
          setCausaSeleccionada(actualizada || null);
        }
      } else {
        setCausas([]);
        setCausaSeleccionada(null);
      }
    });

    return () => unsubscribe();
  }, [causaSeleccionada?.id]);

  // 2. Crear Causa
  const crearCausa = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !nuevaReferencia.trim()) return;

    const causasRef = ref(database, `causas/${user.uid}`);
    const nuevaCausaRef = push(causasRef);
    
    set(nuevaCausaRef, {
      referencia: nuevaReferencia,
      fechaCreacion: new Date().toISOString()
    });

    setNuevaReferencia('');
    setMostrarNuevaCausa(false);
  };

  // 3. Eliminar Causa Completa
  const eliminarCausa = () => {
    if (window.confirm(`¿Está seguro de eliminar el expediente "${causaSeleccionada.referencia}" y todo su historial? Esta acción NO se puede deshacer.`)) {
      const user = auth.currentUser;
      const causaRef = ref(database, `causas/${user.uid}/${causaSeleccionada.id}`);
      remove(causaRef);
      setCausaSeleccionada(null);
    }
  };

  // 4. Agregar Seguimiento
  const agregarSeguimiento = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !causaSeleccionada || !nuevoSeguimiento.trim()) return;

    const seguimientosRef = ref(database, `causas/${user.uid}/${causaSeleccionada.id}/seguimientos`);
    const nuevoSegRef = push(seguimientosRef);
    
    const ahora = new Date();
    set(nuevoSegRef, {
      fecha: ahora.toLocaleDateString('es-AR'),
      hora: ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      texto: nuevoSeguimiento,
      timestamp: ahora.getTime() 
    });

    setNuevoSeguimiento('');
  };

  // 5. Iniciar Edición de un Seguimiento
  const iniciarEdicion = (seg) => {
    setEditandoId(seg.id);
    setTextoEdicion(seg.texto);
  };

  // 6. Guardar Edición de un Seguimiento
  const guardarEdicion = (segId) => {
    const user = auth.currentUser;
    if (!user || !textoEdicion.trim()) return;

    const segRef = ref(database, `causas/${user.uid}/${causaSeleccionada.id}/seguimientos/${segId}`);
    update(segRef, { texto: textoEdicion });

    setEditandoId(null);
    setTextoEdicion('');
  };

  // 7. Eliminar un Seguimiento individual
  const eliminarSeguimiento = (segId) => {
    if (window.confirm("¿Desea eliminar este registro de la bitácora?")) {
      const user = auth.currentUser;
      const segRef = ref(database, `causas/${user.uid}/${causaSeleccionada.id}/seguimientos/${segId}`);
      remove(segRef);
    }
  };

  const causasFiltradas = causas.filter(c => 
    c.referencia.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* COLUMNA IZQUIERDA: Buscador y Lista */}
      <div style={{ width: '350px', flexShrink: 0, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 20px 0', color: colorSlateBlue, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={24} /> Expedientes
        </h2>

        {/* Buscador */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Buscar por carátula..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Botón Nueva Causa */}
        {!mostrarNuevaCausa ? (
          <button 
            onClick={() => setMostrarNuevaCausa(true)}
            style={{ width: '100%', padding: '10px', backgroundColor: colorSlateBlue, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '20px' }}
          >
            <Plus size={18} /> Nueva Causa
          </button>
        ) : (
          <form onSubmit={crearCausa} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <input 
              type="text" 
              placeholder="Referencia o Carátula..." 
              value={nuevaReferencia}
              onChange={(e) => setNuevaReferencia(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
              <button type="button" onClick={() => setMostrarNuevaCausa(false)} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}

        {/* Lista de Causas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
          {causasFiltradas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No hay causas registradas.</p>
          ) : (
            causasFiltradas.map(causa => (
              <div 
                key={causa.id}
                onClick={() => setCausaSeleccionada(causa)}
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: causaSeleccionada?.id === causa.id ? `2px solid ${colorSlateBlue}` : '1px solid #e2e8f0',
                  backgroundColor: causaSeleccionada?.id === causa.id ? '#f8fafc' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: colorSlateBlue, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {causa.referencia}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {causa.seguimientos.length} actualizaciones
                  </p>
                </div>
                <ChevronRight size={18} color={causaSeleccionada?.id === causa.id ? colorSlateBlue : '#cbd5e1'} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Detalle y Seguimientos */}
      <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', minHeight: '600px' }}>
        {causaSeleccionada ? (
          <>
            {/* Header de la Causa (Título y Botón de Eliminar) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: colorSlateBlue, fontSize: '24px' }}>{causaSeleccionada.referencia}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Bitácora de movimientos</p>
              </div>
              <button 
                onClick={eliminarCausa}
                title="Eliminar Expediente"
                style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}
              >
                <Trash2 size={16} /> Eliminar Causa
              </button>
            </div>

            {/* Formulario de Nuevo Seguimiento */}
            <form onSubmit={agregarSeguimiento} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                placeholder="Escriba la nueva actualización de la causa..."
                value={nuevoSeguimiento}
                onChange={(e) => setNuevoSeguimiento(e.target.value)}
                required
                rows="3"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <button 
                type="submit"
                style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: colorSlateBlue, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Agregar Registro
              </button>
            </form>

            {/* Línea de tiempo de seguimientos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {causaSeleccionada.seguimientos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  Aún no hay registros de seguimiento para esta causa.
                </div>
              ) : (
                causaSeleccionada.seguimientos.map((seg) => (
                  <div key={seg.id} style={{ display: 'flex', gap: '15px' }}>
                    {/* Indicador visual de tiempo */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colorSlateBlue }}></div>
                      <div style={{ width: '2px', height: '100%', backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>
                    </div>
                    
                    {/* Tarjeta de contenido */}
                    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      
                      {/* Cabecera del evento (Fecha y botones de acción) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>
                          <Clock size={14} /> {seg.fecha} a las {seg.hora} hs
                        </div>
                        
                        {/* Botones de Editar y Eliminar evento */}
                        {editandoId !== seg.id && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => iniciarEdicion(seg)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }} title="Editar">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => eliminarSeguimiento(seg.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }} title="Eliminar registro">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Cuerpo del evento (Modo Lectura o Modo Edición) */}
                      {editandoId === seg.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <textarea 
                            value={textoEdicion}
                            onChange={(e) => setTextoEdicion(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditandoId(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                              <X size={14} /> Cancelar
                            </button>
                            <button onClick={() => guardarEdicion(seg.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                              <Save size={14} /> Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                          {seg.texto}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px' }}>Seleccione una causa del panel izquierdo</p>
            <p style={{ fontSize: '14px' }}>o cree una nueva para comenzar a registrar seguimientos.</p>
          </div>
        )}
      </div>
    </div>
  );
}