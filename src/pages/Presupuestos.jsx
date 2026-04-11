import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { FileText, Plus, Trash2, Printer, ChevronLeft, Eye } from 'lucide-react';
import logoEstudio from '../assets/logo_completo.png';

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [vista, setVista] = useState('lista'); 
  const [presupuestoActual, setPresupuestoActual] = useState(null);

  const [cliente, setCliente] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [validez, setValidez] = useState('15 días');
  // Ahora los ítems tienen un "valor" y un "tipo" (fijo o porcentaje)
  const [items, setItems] = useState([{ descripcion: '', valor: '', tipo: 'fijo' }]);
  const [notas, setNotas] = useState('Los honorarios detallados no incluyen gastos de aportes, tasas de justicia ni diligenciamientos, salvo que se especifique lo contrario.');

  const colorSlateBlue = '#0f172a';

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const presupuestosRef = ref(database, `presupuestos/${user.uid}`);
    const unsubscribe = onValue(presupuestosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setPresupuestos(lista);
      } else {
        setPresupuestos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const agregarItem = () => setItems([...items, { descripcion: '', valor: '', tipo: 'fijo' }]);
  
  const actualizarItem = (index, campo, nuevoValor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = nuevoValor;
    setItems(nuevosItems);
  };

  const eliminarItem = (index) => {
    if (items.length > 1) {
      const nuevosItems = items.filter((_, i) => i !== index);
      setItems(nuevosItems);
    }
  };

  // Solo sumamos los ítems que sean de tipo "fijo" (los porcentajes no se suman)
  const calcularTotal = (itemsArray) => {
    return itemsArray
      .filter(item => (item.tipo || 'fijo') === 'fijo')
      .reduce((acc, item) => acc + (parseFloat(item.valor || item.monto) || 0), 0);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const guardarPresupuesto = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !cliente.trim()) return;

    // Aceptamos el ítem si tiene descripción y un valor ingresado
    const itemsValidos = items.filter(item => item.descripcion.trim() !== '' && item.valor !== '');
    if (itemsValidos.length === 0) return alert("Debe agregar al menos un ítem válido.");

    const total = calcularTotal(itemsValidos);

    const nuevoPresupuesto = {
      cliente,
      fecha,
      validez,
      items: itemsValidos,
      notas,
      total,
      timestamp: new Date().getTime()
    };

    const presupuestosRef = ref(database, `presupuestos/${user.uid}`);
    push(presupuestosRef, nuevoPresupuesto);

    setCliente('');
    setItems([{ descripcion: '', valor: '', tipo: 'fijo' }]);
    setVista('lista');
  };

  const eliminarPresupuesto = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta cotización? Esta acción no se puede deshacer.")) {
      const user = auth.currentUser;
      const docRef = ref(database, `presupuestos/${user.uid}/${id}`);
      remove(docRef);
      setVista('lista');
    }
  };

  const abrirDetalle = (presupuesto) => {
    setPresupuestoActual(presupuesto);
    setVista('detalle');
  };

  const imprimirPresupuesto = () => {
    window.print();
  };

  const PrintStyles = () => (
    <style>
      {`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background-color: white !important; }
          body * { visibility: hidden; }
          #area-imprimible, #area-imprimible * { visibility: visible; }
          #area-imprimible { 
            position: absolute; left: 0; top: 0; width: 100%; max-width: 100%;
            padding: 0 !important; margin: 0 !important; border: none !important; 
            box-shadow: none !important; box-sizing: border-box !important; 
          }
          .no-print { display: none !important; }
        }
      `}
    </style>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <PrintStyles />

      {/* VISTA: LISTA */}
      {vista === 'lista' && (
        <div className="no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: colorSlateBlue, margin: '0 0 8px 0', fontSize: '28px' }}>Presupuestos</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Historial de cotizaciones de honorarios</p>
            </div>
            <button 
              onClick={() => setVista('nuevo')}
              style={{ backgroundColor: colorSlateBlue, color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              <Plus size={18} /> Crear Presupuesto
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {presupuestos.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No hay presupuestos generados.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Fecha</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Cliente / Ref.</th>
                    <th style={{ padding: '15px', textAlign: 'right', color: '#475569', fontWeight: '600' }}>Total / Honorarios</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px', color: colorSlateBlue }}>{p.fecha}</td>
                      <td style={{ padding: '15px', color: colorSlateBlue, fontWeight: '500' }}>{p.cliente}</td>
                      <td style={{ padding: '15px', color: colorSlateBlue, textAlign: 'right', fontWeight: 'bold' }}>
                        {/* Si hay un total fijo lo mostramos, si es 0 significa que es puro porcentaje */}
                        {p.total > 0 ? formatearMoneda(p.total) : 'A resultado (%)'}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => abrirDetalle(p)} title="Ver y Descargar" style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Eye size={16} />
                          </button>
                          <button onClick={() => eliminarPresupuesto(p.id)} title="Eliminar" style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VISTA: NUEVO PRESUPUESTO */}
      {vista === 'nuevo' && (
        <div className="no-print">
          <button onClick={() => setVista('lista')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', fontWeight: 'bold' }}>
            <ChevronLeft size={18} /> Volver
          </button>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: colorSlateBlue, marginTop: 0, marginBottom: '20px' }}>Generar Cotización</h2>
            
            <form onSubmit={guardarPresupuesto}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Cliente / Destinatario</label>
                  <input type="text" value={cliente} onChange={e => setCliente(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Fecha</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* SECCIÓN DE ÍTEMS DINÁMICOS */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>Detalle de Servicios / Honorarios</label>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <input type="text" placeholder="Ej: Demanda Laboral" value={item.descripcion} onChange={e => actualizarItem(index, 'descripcion', e.target.value)} required style={{ flex: 3, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    
                    {/* SELECTOR FIJO/PORCENTAJE */}
                    <select value={item.tipo || 'fijo'} onChange={e => actualizarItem(index, 'tipo', e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: colorSlateBlue, fontWeight: 'bold' }}>
                      <option value="fijo">Monto Fijo ($)</option>
                      <option value="porcentaje">Porcentaje (%)</option>
                    </select>

                    <input type="number" placeholder={item.tipo === 'porcentaje' ? "Ej: 20" : "Ej: 50000"} value={item.valor} onChange={e => actualizarItem(index, 'valor', e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    
                    <button type="button" onClick={() => eliminarItem(index)} style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 15px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={agregarItem} style={{ background: 'none', border: '1px dashed #cbd5e1', color: colorSlateBlue, width: '100%', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>+ Agregar otro ítem</button>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Notas o Condiciones (Impreso al pie)</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: colorSlateBlue }}>
                  Total Fijo: {formatearMoneda(calcularTotal(items))}
                </div>
                <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Guardar y Generar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISTA: PLANTILLA IMPRIMIBLE */}
      {vista === 'detalle' && presupuestoActual && (
        <div>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <button onClick={() => setVista('lista')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <ChevronLeft size={18} /> Volver
            </button>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => eliminarPresupuesto(presupuestoActual.id)} style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={16} /> Eliminar
              </button>
              
              <button onClick={imprimirPresupuesto} style={{ backgroundColor: colorSlateBlue, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Printer size={18} /> Imprimir / Guardar PDF
              </button>
            </div>
          </div>

          {/* ÁREA IMPRIMIBLE */}
          <div id="area-imprimible" style={{ backgroundColor: 'white', padding: '50px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: '#1e293b' }}>
            
            {/* NUEVO MEMBRETE ACTUALIZADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '30px' }}>
              
              {/* Logo Izquierda */}
              <img src={logoEstudio} alt="DP Legales - Estudio Jurídico" style={{ height: '60px', objectFit: 'contain' }} />
              
              {/* Datos Derecha */}
              <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ fontSize: '15px', color: colorSlateBlue }}>DP Legales - Estudio Jurídico</strong><br />
                Sarmiento 4652 2° 10, CABA<br />
                Tel: 11-2846-3308<br />
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '24px', color: colorSlateBlue, letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '30px' }}>Presupuesto de Honorarios</h1>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Preparado para:</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: colorSlateBlue }}>{presupuestoActual.cliente}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Fecha de emisión:</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: colorSlateBlue }}>{presupuestoActual.fecha}</p>
                </div>
              </div>
            </div>

            {presupuestoActual.items && presupuestoActual.items.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: colorSlateBlue, color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderTopLeftRadius: '6px' }}>Descripción del Servicio</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderTopRightRadius: '6px', width: '200px' }}>Honorarios / Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestoActual.items.map((item, index) => {
                    // Verificamos si es monto viejo o nuevo valor
                    const valorItem = item.valor || item.monto; 
                    const esFijo = (item.tipo || 'fijo') === 'fijo';

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '15px 12px', color: '#334155' }}>{item.descripcion}</td>
                        <td style={{ padding: '15px 12px', textAlign: 'right', fontWeight: '500', color: colorSlateBlue }}>
                          {esFijo ? formatearMoneda(valorItem) : `${valorItem} %`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Solo mostramos la caja de total si existen montos fijos para sumar */}
            {presupuestoActual.total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                <div style={{ width: '380px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: colorSlateBlue }}>
                    <span>TOTAL FIJO ESTIMADO:</span>
                    <span>{formatearMoneda(presupuestoActual.total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Condiciones y Notas:</strong></p>
              <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>{presupuestoActual.notas}</p>
              <p style={{ margin: 0 }}><em>* Presupuesto válido por {presupuestoActual.validez} a partir de la fecha de emisión.</em></p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}