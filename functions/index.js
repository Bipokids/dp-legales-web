const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.chequearvencimientosautomatica = onSchedule("every 1 hours", async (event) => {
    const db = admin.database();
    
    const snapshot = await db.ref('vencimientos').once('value');
    const vencimientosUsuarios = snapshot.val();

    if (!vencimientosUsuarios) return null;

    const ahora = new Date();
    const promesas = []; 

    for (const uid in vencimientosUsuarios) {
        const vencimientos = vencimientosUsuarios[uid];

        for (const idRegistro in vencimientos) {
            const item = vencimientos[idRegistro];

            if (item.leido || item.notificado_automaticamente) continue;

            const fechaVencimiento = new Date(`${item.fecha}T${item.hora}`);
            const diferenciaMs = fechaVencimiento.getTime() - ahora.getTime();
            
            const msPorHora = 1000 * 60 * 60;
            const msPorDia = msPorHora * 24;
            
            let anticipacionMs = item.unidad === 'dias' 
                ? item.anticipacion * msPorDia 
                : item.anticipacion * msPorHora;

            if (diferenciaMs <= anticipacionMs) {
                console.log(`[ALERTA DISPARADA] Usuario: ${uid} | Cliente: ${item.cliente}`);

                // 1. BUSCAMOS EL TOKEN DEL CELULAR DE ESTE USUARIO
                const tokenSnapshot = await db.ref(`usuarios/${uid}/fcmToken`).once('value');
                const fcmToken = tokenSnapshot.val();

                // 2. SI EL USUARIO TIENE LA APP INSTALADA, MANDAMOS EL PUSH
                if (fcmToken) {
                    const payload = {
                        token: fcmToken,
                        notification: {
                            title: '🚨 Vencimiento Próximo: DP Legales',
                            body: `Carátula: ${item.cliente}\nFecha límite: ${item.fecha} a las ${item.hora}`
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                sound: 'default',
                                channelId: 'alertas_legales' // Prioridad alta para que suene
                            }
                        }
                    };
                    
                    // Disparamos el mensaje a los servidores de Google
                    promesas.push(admin.messaging().send(payload).catch(error => {
                        console.error("Error enviando push:", error);
                    }));
                }

                // 3. Marcamos como notificado para que no lo vuelva a molestar en una hora
                const updateRef = db.ref(`vencimientos/${uid}/${idRegistro}`);
                promesas.push(updateRef.update({ notificado_automaticamente: true }));
            }
        }
    }

    await Promise.all(promesas);
    console.log("Revisión de notificaciones PUSH completada.");
    return null;
});