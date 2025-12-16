// mis-reservas.js - Gestión de reservas del cliente

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mis Reservas - Sistema cargado');
    
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar reservas del usuario
    cargarMisReservas();
    
    // Configurar filtro
    const filtroEstado = document.getElementById('filtroEstado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            cargarMisReservas(this.value);
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutUser');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    
    // Configurar modal
    configurarModal();
});

function verificarAutenticacion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    
    if (!usuarioActual) {
        alert('Debes iniciar sesión para ver tus reservas');
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar nombre del usuario en la página
    document.getElementById('logoutUser').innerHTML = `<i class="fas fa-user"></i> ${usuarioActual.nombre}`;
}

function cargarMisReservas(filtro = 'todas') {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    if (!usuarioActual) return;
    
    // Obtener todas las reservas
    const todasReservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    
    // Filtrar reservas del usuario actual
    let misReservas = todasReservas.filter(reserva => 
        reserva.nombre === usuarioActual.nombre || 
        reserva.telefono === usuarioActual.telefono
    );
    
    // Aplicar filtro adicional si se especifica
    if (filtro !== 'todas') {
        misReservas = misReservas.filter(reserva => reserva.estado === filtro);
    }
    
    // Ordenar por fecha (más recientes primero)
    misReservas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));
    
    // Actualizar estadísticas
    actualizarEstadisticas(misReservas);
    
    // Mostrar reservas
    mostrarReservas(misReservas);
    
    // Mostrar/ocultar mensaje de "sin reservas"
    const sinReservas = document.getElementById('sinReservas');
    const loading = document.querySelector('.loading-reservas');
    
    if (loading) loading.style.display = 'none';
    
    if (misReservas.length === 0) {
        if (sinReservas) sinReservas.style.display = 'block';
    } else {
        if (sinReservas) sinReservas.style.display = 'none';
    }
}

function actualizarEstadisticas(reservas) {
    // Total de reservas
    document.getElementById('totalReservas').textContent = reservas.length;
    
    // Reservas confirmadas
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    document.getElementById('reservasConfirmadas').textContent = confirmadas;
    
    // Reservas pendientes
    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
    document.getElementById('reservasPendientes').textContent = pendientes;
    
    // Total gastado
    const totalGastado = reservas.reduce((total, reserva) => {
        return total + (parseInt(reserva.precio) || 0);
    }, 0);
    
    document.getElementById('totalGastado').textContent = `$${totalGastado.toLocaleString()}`;
}

function mostrarReservas(reservas) {
    const contenedor = document.getElementById('reservasLista');
    if (!contenedor) return;
    
    let html = '';
    
    reservas.forEach(reserva => {
        const fecha = new Date(reserva.fecha + 'T' + reserva.hora);
        const ahora = new Date();
        const puedeReagendar = fecha > ahora && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
        const puedeCancelar = fecha > ahora && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
        
        html += `
            <div class="reserva-card" data-id="${reserva.id}">
                <div class="reserva-header">
                    <div class="reserva-title">
                        <i class="fas fa-cut"></i>
                        <h3>${reserva.servicio || 'Servicio'}</h3>
                    </div>
                    <span class="reserva-status status-${reserva.estado}">
                        ${reserva.estado.toUpperCase()}
                    </span>
                </div>
                
                <div class="reserva-info">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatearFecha(reserva.fecha)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatearHora(reserva.hora)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span class="reserva-precio">$${parseInt(reserva.precio || 0).toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-hashtag"></i>
                        <span>ID: ${reserva.id}</span>
                    </div>
                </div>
                
                ${reserva.notas ? `
                    <div class="reserva-notas">
                        <i class="fas fa-sticky-note"></i>
                        <span>${reserva.notas}</span>
                    </div>
                ` : ''}
                
                <div class="reserva-actions">
                    <button class="btn-action-reserva btn-detalles" onclick="verDetallesReserva(${reserva.id})">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                    
                    ${puedeReagendar ? `
                        <button class="btn-action-reserva btn-reagendar" onclick="reagendarReserva(${reserva.id})">
                            <i class="fas fa-calendar-alt"></i> Reagendar
                        </button>
                    ` : ''}
                    
                    ${puedeCancelar ? `
                        <button class="btn-action-reserva btn-cancelar" onclick="cancelarMiReserva(${reserva.id})">
                            <i class="fas fa-times-circle"></i> Cancelar
                        </button>
                    ` : ''}
                    
                    <button class="btn-action-reserva btn-whatsapp-reserva" onclick="contactarWhatsApp(${reserva.id})">
                        <i class="fab fa-whatsapp"></i> Contactar
                    </button>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

function verDetallesReserva(idReserva) {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const reserva = reservas.find(r => r.id === idReserva);
    
    if (!reserva) {
        alert('Reserva no encontrada');
        return;
    }
    
    const modalContent = document.getElementById('modalDetallesContent');
    const modal = document.getElementById('modalDetalles');
    
    if (modalContent && modal) {
        const fecha = new Date(reserva.fecha + 'T' + reserva.hora);
        const ahora = new Date();
        const puedeReagendar = fecha > ahora && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
        const puedeCancelar = fecha > ahora && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
        
        modalContent.innerHTML = `
            <h3><i class="fas fa-info-circle"></i> Detalles de la Reserva</h3>
            
            <div class="detalles-grid">
                <div class="detalle-item">
                    <span class="detalle-label">ID Reserva:</span>
                    <span class="detalle-value">${reserva.id}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Servicio:</span>
                    <span class="detalle-value">${reserva.servicio || 'No especificado'}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Fecha:</span>
                    <span class="detalle-value">${formatearFecha(reserva.fecha)}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Hora:</span>
                    <span class="detalle-value">${formatearHora(reserva.hora)}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Precio:</span>
                    <span class="detalle-value precio-detalle">$${parseInt(reserva.precio || 0).toLocaleString()}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Estado:</span>
                    <span class="detalle-value status-${reserva.estado}">${reserva.estado.toUpperCase()}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Reservado el:</span>
                    <span class="detalle-value">${new Date(reserva.fechaCreacion).toLocaleDateString('es-ES')}</span>
                </div>
            </div>
            
            ${reserva.notas ? `
                <div class="notas-detalle">
                    <h4><i class="fas fa-sticky-note"></i> Notas:</h4>
                    <p>${reserva.notas}</p>
                </div>
            ` : ''}
            
            <div class="acciones-detalle">
                ${puedeReagendar ? `
                    <button class="btn-accion-detalle btn-reagendar-detalle" onclick="reagendarReserva(${reserva.id}); cerrarModal()">
                        <i class="fas fa-calendar-alt"></i> Reagendar
                    </button>
                ` : ''}
                
                ${puedeCancelar ? `
                    <button class="btn-accion-detalle btn-cancelar-detalle" onclick="cancelarMiReserva(${reserva.id}); cerrarModal()">
                        <i class="fas fa-times-circle"></i> Cancelar Reserva
                    </button>
                ` : ''}
                
                <button class="btn-accion-detalle btn-whatsapp-detalle" onclick="contactarWhatsApp(${reserva.id}); cerrarModal()">
                    <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                </button>
            </div>
            
            <style>
                .detalles-grid {
                    background: var(--light);
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                }
                
                .detalle-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.8rem 0;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                }
                
                .detalle-item:last-child {
                    border-bottom: none;
                }
                
                .detalle-label {
                    color: var(--gray);
                    font-weight: 500;
                }
                
                .detalle-value {
                    color: var(--primary);
                    font-weight: 600;
                }
                
                .precio-detalle {
                    color: var(--secondary);
                    font-size: 1.2rem;
                }
                
                .notas-detalle {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    border-left: 4px solid var(--accent);
                }
                
                .notas-detalle h4 {
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .acciones-detalle {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                    margin-top: 1.5rem;
                }
                
                .btn-accion-detalle {
                    padding: 0.8rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .btn-reagendar-detalle {
                    background: var(--accent);
                    color: white;
                }
                
                .btn-cancelar-detalle {
                    background: var(--light);
                    color: var(--secondary);
                    border: 2px solid var(--light);
                }
                
                .btn-whatsapp-detalle {
                    background: var(--whatsapp);
                    color: white;
                }
                
                .btn-accion-detalle:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
            </style>
        `;
        
        modal.classList.add('active');
    }
}

function reagendarReserva(idReserva) {
    if (confirm('¿Deseas reagendar esta reserva? Serás redirigido al formulario de reserva.')) {
        // Guardar el ID de la reserva a reagendar
        localStorage.setItem('reservaAReagendar', idReserva);
        
        // Redirigir al formulario de reserva
        window.location.href = 'reservar.html';
    }
}

function cancelarMiReserva(idReserva) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }
    
    // Obtener todas las reservas
    let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    
    // Encontrar la reserva a cancelar
    const index = reservas.findIndex(r => r.id === idReserva);
    
    if (index !== -1) {
        // Verificar si se puede cancelar (más de 2 horas antes)
        const reserva = reservas[index];
        const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
        const ahora = new Date();
        const horasDiferencia = (fechaReserva - ahora) / (1000 * 60 * 60);
        
        if (horasDiferencia < 2) {
            alert('Las cancelaciones deben hacerse con al menos 2 horas de anticipación.');
            return;
        }
        
        // Cambiar estado a cancelada
        reservas[index].estado = 'cancelada';
        reservas[index].fechaCancelacion = new Date().toISOString();
        
        // Guardar cambios
        localStorage.setItem('reservasJordy', JSON.stringify(reservas));
        
        // Notificar a Jordy por WhatsApp
        enviarWhatsAppCancelacion(reserva);
        
        // Recargar la lista de reservas
        const filtroActual = document.getElementById('filtroEstado').value;
        cargarMisReservas(filtroActual);
        
        alert('Reserva cancelada exitosamente');
    }
}

function contactarWhatsApp(idReserva) {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const reserva = reservas.find(r => r.id === idReserva);
    
    if (!reserva) return;
    
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    const numeroJordy = '573004513605';
    
    const mensaje = `Hola Jordy, soy ${usuarioActual?.nombre || 'cliente'}. ` +
                   `Tengo una consulta sobre mi reserva (ID: ${reserva.id}) del ${formatearFecha(reserva.fecha)} ` +
                   `a las ${formatearHora(reserva.hora)}.`;
    
    const url = `https://wa.me/${numeroJordy}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function enviarWhatsAppCancelacion(reserva) {
    const numeroJordy = '573004513605';
    
    const mensaje = `❌ *CANCELACIÓN DE RESERVA - Jordy Barber*\n\n` +
                   `👤 *Cliente:* ${reserva.nombre}\n` +
                   `📞 *Teléfono:* ${reserva.telefono}\n` +
                   `✂️ *Servicio:* ${reserva.servicio}\n` +
                   `📅 *Fecha Cancelada:* ${formatearFecha(reserva.fecha)}\n` +
                   `⏰ *Hora Cancelada:* ${formatearHora(reserva.hora)}\n` +
                   `🆔 *ID Reserva:* ${reserva.id}\n` +
                   `⏱️ *Cancelado el:* ${new Date().toLocaleString()}`;
    
    const url = `https://wa.me/${numeroJordy}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function configurarModal() {
    const modal = document.getElementById('modalDetalles');
    const closeBtn = document.querySelector('.close-modal-reserva');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModal();
            }
        });
    }
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
}

function cerrarModal() {
    const modal = document.getElementById('modalDetalles');
    if (modal) {
        modal.classList.remove('active');
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActualJordy');
        window.location.href = 'index.html';
    }
}

// Funciones auxiliares
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearHora(horaStr) {
    const [hora, minutos] = horaStr.split(':');
    const horaNum = parseInt(hora);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
    return `${hora12}:${minutos} ${periodo}`;
}

// Hacer funciones disponibles globalmente
window.verDetallesReserva = verDetallesReserva;
window.reagendarReserva = reagendarReserva;
window.cancelarMiReserva = cancelarMiReserva;
window.contactarWhatsApp = contactarWhatsApp;
window.cerrarModal = cerrarModal;