// reserva-jordy.js - Lógica específica para la página de reserva

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de reservas Jordy Barber cargado');
    
    // Variables globales
    let reservaActual = {
        servicio: null,
        fecha: null,
        hora: null,
        nombre: '',
        telefono: '',
        notas: ''
    };
    
    // Inicializar formulario
    inicializarFormularioReserva();
    
    // Configurar fecha mínima (hoy)
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
        fechaInput.value = hoy;
        
        // Actualizar reserva cuando cambia la fecha
        fechaInput.addEventListener('change', function() {
            reservaActual.fecha = this.value;
            actualizarResumen();
        });
    }
    
    // Configurar hora
    const horaSelect = document.getElementById('hora');
    if (horaSelect) {
        horaSelect.addEventListener('change', function() {
            reservaActual.hora = this.value;
            actualizarResumen();
        });
    }
    
    // Configurar nombre
    const nombreInput = document.getElementById('nombre');
    if (nombreInput) {
        nombreInput.addEventListener('input', function() {
            reservaActual.nombre = this.value;
        });
    }
    
    // Configurar teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            reservaActual.telefono = this.value;
        });
    }
    
    // Configurar notas
    const notasInput = document.getElementById('notas');
    if (notasInput) {
        notasInput.addEventListener('input', function() {
            reservaActual.notas = this.value;
        });
    }
    
    // Manejar envío del formulario
    const reservaForm = document.getElementById('reservaForm');
    if (reservaForm) {
        reservaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarReservaCompleta();
        });
    }
    
    // Verificar si viene de la página principal con servicio seleccionado
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get('servicio');
    if (servicioParam) {
        seleccionarServicioPorId(servicioParam);
    }
});

function inicializarFormularioReserva() {
    // Botones de selección de servicio
    document.querySelectorAll('.servicio-option').forEach(option => {
        option.addEventListener('click', function() {
            seleccionarServicio(this);
        });
    });
    
    // Botones de navegación entre pasos
    const nextStep1 = document.getElementById('nextStep1');
    if (nextStep1) {
        nextStep1.addEventListener('click', function() {
            if (!reservaActual.servicio) {
                alert('Por favor selecciona un servicio primero');
                return;
            }
            cambiarPaso(1, 2);
        });
    }
    
    const nextStep2 = document.getElementById('nextStep2');
    if (nextStep2) {
        nextStep2.addEventListener('click', function() {
            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;
            
            if (!fecha || !hora) {
                alert('Por favor selecciona fecha y hora');
                return;
            }
            
            cambiarPaso(2, 3);
        });
    }
    
    // Botones "Anterior"
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const step2 = document.getElementById('step2');
            const step3 = document.getElementById('step3');
            
            if (step3.classList.contains('active')) {
                cambiarPaso(3, 2);
            } else if (step2.classList.contains('active')) {
                cambiarPaso(2, 1);
            }
        });
    });
}

function seleccionarServicio(elemento) {
    // Remover selección anterior
    document.querySelectorAll('.servicio-option').forEach(opt => {
        opt.classList.remove('selected');
        opt.querySelector('.btn-seleccionar').textContent = 'Seleccionar';
    });
    
    // Agregar selección actual
    elemento.classList.add('selected');
    elemento.querySelector('.btn-seleccionar').textContent = '✓ Seleccionado';
    
    // Guardar datos del servicio
    const servicioId = elemento.dataset.servicio;
    const servicioNombre = elemento.querySelector('h4').textContent;
    const servicioPrecio = elemento.querySelector('.servicio-precio').textContent.replace('$', '').replace('.', '');
    const servicioDuracion = elemento.querySelector('.servicio-duracion').textContent;
    
    reservaActual.servicio = {
        id: servicioId,
        nombre: servicioNombre,
        precio: parseInt(servicioPrecio),
        duracion: servicioDuracion
    };
    
    // Actualizar resumen
    actualizarResumen();
}

function seleccionarServicioPorId(servicioId) {
    const servicioElement = document.querySelector(`.servicio-option[data-servicio="${servicioId}"]`);
    if (servicioElement) {
        seleccionarServicio(servicioElement);
    }
}

function cambiarPaso(actual, siguiente) {
    // Ocultar paso actual
    const stepActual = document.getElementById(`step${actual}`);
    if (stepActual) {
        stepActual.classList.remove('active');
    }
    
    // Mostrar paso siguiente
    const stepSiguiente = document.getElementById(`step${siguiente}`);
    if (stepSiguiente) {
        stepSiguiente.classList.add('active');
        
        // Si vamos al paso 3, actualizar campos automáticamente
        if (siguiente === 3) {
            const nombreInput = document.getElementById('nombre');
            const telefonoInput = document.getElementById('telefono');
            
            // Intentar cargar datos del usuario si está logueado
            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
            if (usuarioActual) {
                if (nombreInput && !nombreInput.value) {
                    nombreInput.value = usuarioActual.nombre;
                    reservaActual.nombre = usuarioActual.nombre;
                }
                if (telefonoInput && !telefonoInput.value && usuarioActual.telefono) {
                    telefonoInput.value = usuarioActual.telefono;
                    reservaActual.telefono = usuarioActual.telefono;
                }
            }
        }
    }
    
    // Scroll al inicio del formulario
    window.scrollTo({
        top: document.querySelector('.reserva-form-container').offsetTop - 100,
        behavior: 'smooth'
    });
}

function actualizarResumen() {
    const resumenServicio = document.getElementById('resumenServicio');
    const resumenFecha = document.getElementById('resumenFecha');
    const resumenHora = document.getElementById('resumenHora');
    const resumenTotal = document.getElementById('resumenTotal');
    
    if (reservaActual.servicio) {
        resumenServicio.textContent = reservaActual.servicio.nombre;
    }
    
    if (reservaActual.fecha) {
        resumenFecha.textContent = formatFecha(reservaActual.fecha);
    }
    
    if (reservaActual.hora) {
        resumenHora.textContent = formatHora(reservaActual.hora);
    }
    
    if (reservaActual.servicio) {
        resumenTotal.textContent = `$${reservaActual.servicio.precio.toLocaleString()}`;
    }
}

function procesarReservaCompleta() {
    // Validaciones finales
    if (!reservaActual.servicio) {
        alert('Por favor selecciona un servicio');
        cambiarPaso(3, 1);
        return;
    }
    
    if (!reservaActual.fecha || !reservaActual.hora) {
        alert('Por favor selecciona fecha y hora');
        cambiarPaso(3, 2);
        return;
    }
    
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    
    if (!nombre || !telefono) {
        alert('Por favor completa tu nombre y teléfono');
        return;
    }
    
    // Crear objeto de reserva completo
    const reservaCompleta = {
        id: Date.now(),
        ...reservaActual,
        nombre: nombre,
        telefono: telefono,
        notas: document.getElementById('notas').value || '',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        codigo: 'JB-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    
    // Guardar reserva en localStorage
    guardarReserva(reservaCompleta);
    
    // Enviar WhatsApp
    enviarWhatsAppReserva(reservaCompleta);
    
    // Mostrar confirmación
    mostrarConfirmacionFinal(reservaCompleta);
}

function guardarReserva(reserva) {
    let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    reservas.push(reserva);
    localStorage.setItem('reservasJordy', JSON.stringify(reservas));
    console.log('Reserva guardada:', reserva);
}

function enviarWhatsAppReserva(reserva) {
    const mensaje = `📅 *NUEVA RESERVA - Jordy Barber*%0A%0A` +
                   `👤 *Cliente:* ${reserva.nombre}%0A` +
                   `📞 *Teléfono:* ${reserva.telefono}%0A` +
                   `✂️ *Servicio:* ${reserva.servicio.nombre}%0A` +
                   `💰 *Precio:* $${reserva.servicio.precio.toLocaleString()}%0A` +
                   `📅 *Fecha:* ${formatFecha(reserva.fecha)}%0A` +
                   `⏰ *Hora:* ${formatHora(reserva.hora)}%0A` +
                   `🆔 *Código:* ${reserva.codigo}%0A%0A` +
                   (reserva.notas ? `📝 *Notas:* ${reserva.notas}%0A%0A` : '') +
                   `⏱️ *Reserva creada:* ${new Date().toLocaleString()}`;
    
    const url = `https://wa.me/573004513605?text=${mensaje}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(url, '_blank');
    
    // También enviar copia al cliente si tiene WhatsApp
    const mensajeCliente = `✅ *RESERVA CONFIRMADA - Jordy Barber*%0A%0A` +
                          `¡Hola ${reserva.nombre}! Tu reserva ha sido confirmada:%0A%0A` +
                          `✂️ *Servicio:* ${reserva.servicio.nombre}%0A` +
                          `📅 *Fecha:* ${formatFecha(reserva.fecha)}%0A` +
                          `⏰ *Hora:* ${formatHora(reserva.hora)}%0A` +
                          `💰 *Total:* $${reserva.servicio.precio.toLocaleString()}%0A` +
                          `🆔 *Código:* ${reserva.codigo}%0A%0A` +
                          `📍 *Jordy Barber*%0A` +
                          `📞 300 451 3605%0A%0A` +
                          `📌 *Por favor:*%0A` +
                          `• Llegar 5 minutos antes%0A` +
                          `• Cancelaciones con 2h de anticipación%0A` +
                          `• Traer tu código de reserva`;
    
    const urlCliente = `https://wa.me/57${reserva.telefono.replace(/\D/g, '')}?text=${mensajeCliente}`;
    
    // Abrir WhatsApp para el cliente (opcional)
    setTimeout(() => {
        window.open(urlCliente, '_blank');
    }, 1000);
}

function mostrarConfirmacionFinal(reserva) {
    // Ocultar formulario
    const reservaForm = document.getElementById('reservaForm');
    if (reservaForm) {
        reservaForm.style.display = 'none';
    }
    
    // Ocultar sidebar
    const sidebar = document.querySelector('.reserva-info-sidebar');
    if (sidebar) {
        sidebar.style.display = 'none';
    }
    
    // Mostrar confirmación
    const confirmacionHTML = `
        <div class="confirmacion-final">
            <div class="confirmacion-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>¡Reserva Confirmada!</h2>
            <p class="confirmacion-subtitle">Tu cita ha sido agendada exitosamente</p>
            
            <div class="detalles-reserva">
                <div class="detalle-item">
                    <span class="detalle-label">Código de Reserva:</span>
                    <span class="detalle-value codigo-reserva">${reserva.codigo}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Servicio:</span>
                    <span class="detalle-value">${reserva.servicio.nombre}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Fecha:</span>
                    <span class="detalle-value">${formatFecha(reserva.fecha)}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Hora:</span>
                    <span class="detalle-value">${formatHora(reserva.hora)}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Total:</span>
                    <span class="detalle-value precio-final">$${reserva.servicio.precio.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="instrucciones-final">
                <h3><i class="fas fa-info-circle"></i> Instrucciones Importantes</h3>
                <ul>
                    <li><i class="fas fa-check"></i> Llega 5 minutos antes de tu cita</li>
                    <li><i class="fas fa-check"></i> Presenta tu código de reserva (${reserva.codigo})</li>
                    <li><i class="fas fa-check"></i> Cancelaciones con 2 horas de anticipación</li>
                    <li><i class="fas fa-check"></i> Se ha enviado confirmación por WhatsApp</li>
                </ul>
            </div>
            
            <div class="acciones-final">
                <a href="index.html" class="btn-accion volver-inicio">
                    <i class="fas fa-home"></i> Volver al Inicio
                </a>
                <a href="mis-reservas.html" class="btn-accion ver-reservas">
                    <i class="fas fa-calendar-check"></i> Ver Mis Reservas
                </a>
                <button onclick="window.print()" class="btn-accion imprimir">
                    <i class="fas fa-print"></i> Imprimir Confirmación
                </button>
            </div>
            
            <div class="whatsapp-final">
                <p><i class="fab fa-whatsapp"></i> ¿Preguntas? Contacta a Jordy por WhatsApp</p>
                <a href="https://wa.me/573004513605" class="btn-whatsapp-final" target="_blank">
                    <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                </a>
            </div>
        </div>
    `;
    
    const reservaContainer = document.querySelector('.reserva-form-container');
    if (reservaContainer) {
        reservaContainer.innerHTML = confirmacionHTML;
        
        // Agregar estilos para la confirmación
        agregarEstilosConfirmacion();
    }
}

function agregarEstilosConfirmacion() {
    const estilos = `
        <style>
            .confirmacion-final {
                text-align: center;
                padding: 2rem;
            }
            
            .confirmacion-icon {
                font-size: 4rem;
                color: var(--success);
                margin-bottom: 1rem;
            }
            
            .confirmacion-final h2 {
                color: var(--primary);
                margin-bottom: 0.5rem;
            }
            
            .confirmacion-subtitle {
                color: var(--gray);
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }
            
            .detalles-reserva {
                background: var(--light);
                border-radius: 10px;
                padding: 2rem;
                margin: 2rem 0;
                text-align: left;
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
            
            .codigo-reserva {
                color: var(--secondary);
                font-size: 1.2rem;
                letter-spacing: 1px;
            }
            
            .precio-final {
                color: var(--secondary);
                font-size: 1.3rem;
            }
            
            .instrucciones-final {
                background: white;
                border-radius: 10px;
                padding: 1.5rem;
                margin: 2rem 0;
                text-align: left;
                border-left: 4px solid var(--accent);
            }
            
            .instrucciones-final h3 {
                color: var(--primary);
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .instrucciones-final ul {
                list-style: none;
            }
            
            .instrucciones-final li {
                margin-bottom: 0.5rem;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            
            .instrucciones-final li i {
                color: var(--success);
                margin-top: 3px;
            }
            
            .acciones-final {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
                flex-wrap: wrap;
            }
            
            .btn-accion {
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                text-decoration: none;
                font-weight: 600;
                transition: var(--transition);
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .volver-inicio {
                background: var(--primary);
                color: white;
            }
            
            .ver-reservas {
                background: var(--accent);
                color: white;
            }
            
            .imprimir {
                background: var(--light);
                color: var(--primary);
                border: 2px solid var(--light);
                cursor: pointer;
                font-size: 1rem;
            }
            
            .whatsapp-final {
                background: rgba(37, 211, 102, 0.1);
                border-radius: 10px;
                padding: 1.5rem;
                margin-top: 2rem;
            }
            
            .whatsapp-final p {
                color: var(--dark);
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .btn-whatsapp-final {
                background: var(--whatsapp);
                color: white;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                text-decoration: none;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                transition: var(--transition);
            }
            
            .btn-whatsapp-final:hover {
                background: #128C7E;
            }
            
            @media print {
                .navbar-jordy,
                .footer-jordy,
                .whatsapp-float,
                .acciones-final,
                .whatsapp-final {
                    display: none !important;
                }
                
                .confirmacion-final {
                    padding: 0;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', estilos);
}

// Funciones auxiliares
function formatFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatHora(horaStr) {
    const [hora, minutos] = horaStr.split(':');
    const horaNum = parseInt(hora);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
    return `${hora12}:${minutos} ${periodo}`;
}

// Hacer funciones disponibles globalmente
window.seleccionarServicioPorId = seleccionarServicioPorId;