// SISTEMA DE RESERVAS UNIFICADO - Jordy Barber

// Precios de servicios
const SERVICIOS_JORDY = [
    {
        id: 'corte-barba-cejas',
        nombre: 'CORTE + BARBA + CEJAS',
        precio: 20000,
        duracion: 60,
        descripcion: 'Completo cuidado facial'
    },
    {
        id: 'corte-nino',
        nombre: 'CORTE DE NIÑO',
        precio: 15000,
        duracion: 30,
        descripcion: 'Especial para los más pequeños'
    },
    {
        id: 'corte-caballero',
        nombre: 'CORTE DE CABALLERO',
        precio: 15000,
        duracion: 45,
        descripcion: 'Estilo clásico o moderno'
    },
    {
        id: 'corte-barba',
        nombre: 'CORTE + BARBA',
        precio: 18000,
        duracion: 50,
        descripcion: 'Combinación perfecta'
    },
    {
        id: 'corte-cejas',
        nombre: 'CORTE + CEJAS',
        precio: 17000,
        duracion: 40,
        descripcion: 'Estilo completo facial'
    }
];

// ===== CREAR RESERVA =====
function crearReserva(servicioId, fecha, hora, notas = '') {
    try {
        const usuario = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
        
        if (!usuario) {
            return { success: false, error: 'Debes iniciar sesión para reservar' };
        }
        
        // Buscar servicio
        const servicio = SERVICIOS_JORDY.find(s => s.id === servicioId);
        if (!servicio) {
            return { success: false, error: 'Servicio no encontrado' };
        }
        
        // Crear objeto de reserva
        const nuevaReserva = {
            id: Date.now(),
            clienteId: usuario.id,
            clienteNombre: usuario.nombre,
            clienteEmail: usuario.email,
            clienteTelefono: usuario.telefono || '',
            servicio: servicio.nombre,
            servicioId: servicio.id,
            precio: servicio.precio,
            fecha: fecha,
            hora: hora,
            notas: notas,
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString(),
            codigo: 'JB-' + Math.random().toString(36).substr(2, 6).toUpperCase()
        };
        
        // Guardar reserva
        let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
        reservas.push(nuevaReserva);
        localStorage.setItem('reservasJordy', JSON.stringify(reservas));
        
        // Enviar WhatsApp a Jordy
        enviarWhatsAppReserva(nuevaReserva);
        
        return { 
            success: true, 
            reserva: nuevaReserva,
            mensaje: 'Reserva creada exitosamente'
        };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== OBTENER RESERVAS DEL USUARIO =====
function obtenerReservasUsuario() {
    try {
        const usuario = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
        if (!usuario) return [];
        
        const todasReservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
        
        // Filtrar reservas del usuario (por email o ID)
        return todasReservas.filter(reserva => 
            reserva.clienteEmail === usuario.email || 
            reserva.clienteId === usuario.id
        );
        
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
}

// ===== ENVIAR WHATSAPP =====
function enviarWhatsAppReserva(reserva) {
    const numeroJordy = '573004513605'; // Número de Jordy
    
    const mensaje = `📅 *NUEVA RESERVA - Jordy Barber*%0A%0A` +
                   `👤 *Cliente:* ${reserva.clienteNombre}%0A` +
                   `📞 *Teléfono:* ${reserva.clienteTelefono || 'No especificado'}%0A` +
                   `📧 *Email:* ${reserva.clienteEmail}%0A` +
                   `✂️ *Servicio:* ${reserva.servicio}%0A` +
                   `💰 *Precio:* $${reserva.precio.toLocaleString()}%0A` +
                   `📅 *Fecha:* ${formatearFecha(reserva.fecha)}%0A` +
                   `⏰ *Hora:* ${formatearHora(reserva.hora)}%0A` +
                   `🆔 *Código:* ${reserva.codigo}%0A` +
                   (reserva.notas ? `📝 *Notas:* ${reserva.notas}%0A` : '') +
                   `⏱️ *Reservado el:* ${new Date(reserva.fechaCreacion).toLocaleString()}`;
    
    const url = `https://wa.me/${numeroJordy}?text=${mensaje}`;
    
    // Abrir en nueva pestaña
    setTimeout(() => {
        window.open(url, '_blank');
    }, 500);
    
    return url;
}

// ===== FORMATEAR FECHA Y HORA =====
function formatearFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr + 'T00:00:00');
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return fechaStr;
    }
}

function formatearHora(horaStr) {
    try {
        const [hora, minutos] = horaStr.split(':');
        const horaNum = parseInt(hora);
        const periodo = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
        return `${hora12}:${minutos} ${periodo}`;
    } catch (e) {
        return horaStr;
    }
}

// ===== INICIALIZAR FORMULARIO DE RESERVA =====
function inicializarFormularioReserva() {
    console.log('🔄 Inicializando formulario de reserva...');
    
    const formulario = document.getElementById('reservaForm');
    if (!formulario) return;
    
    // Configurar fecha mínima (hoy)
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
        fechaInput.value = hoy;
    }
    
    // Configurar selección de servicio
    const servicioOptions = document.querySelectorAll('.servicio-option');
    servicioOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            servicioOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Marcar como seleccionado
            this.classList.add('selected');
            
            // Actualizar resumen
            const servicioId = this.dataset.servicio;
            const servicio = SERVICIOS_JORDY.find(s => s.id === servicioId);
            
            if (servicio) {
                document.getElementById('resumenServicio').textContent = servicio.nombre;
                document.getElementById('resumenTotal').textContent = `$${servicio.precio.toLocaleString()}`;
            }
        });
    });
    
    // Actualizar resumen cuando cambia fecha/hora
    const inputsResumen = ['fecha', 'hora'];
    inputsResumen.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', function() {
                const resumenElement = document.getElementById('resumen' + id.charAt(0).toUpperCase() + id.slice(1));
                if (resumenElement) {
                    if (id === 'hora') {
                        resumenElement.textContent = formatearHora(this.value);
                    } else {
                        resumenElement.textContent = formatearFecha(this.value);
                    }
                }
            });
        }
    });
    
    // Manejar envío del formulario
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Verificar si hay usuario logueado
        const usuario = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
        if (!usuario) {
            alert('Debes iniciar sesión para reservar');
            window.location.href = 'login.html';
            return;
        }
        
        // Obtener datos del formulario
        const servicioSeleccionado = document.querySelector('.servicio-option.selected');
        if (!servicioSeleccionado) {
            alert('Por favor selecciona un servicio');
            return;
        }
        
        const servicioId = servicioSeleccionado.dataset.servicio;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const nombre = document.getElementById('nombre')?.value || usuario.nombre;
        const telefono = document.getElementById('telefono')?.value || usuario.telefono || '';
        const notas = document.getElementById('notas')?.value || '';
        
        if (!fecha || !hora) {
            alert('Por favor completa fecha y hora');
            return;
        }
        
        // Crear reserva
        const resultado = crearReserva(servicioId, fecha, hora, notas);
        
        if (resultado.success) {
            // Mostrar confirmación
            mostrarConfirmacionReserva(resultado.reserva);
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = 'mis-reservas.html';
            }, 3000);
        } else {
            alert('Error: ' + resultado.error);
        }
    });
    
    // Configurar navegación entre pasos
    configurarPasosReserva();
}

function configurarPasosReserva() {
    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    
    // Paso siguiente
    nextButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStep = currentStep.nextElementSibling;
            
            if (nextStep && nextStep.classList.contains('form-step')) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
            }
        });
    });
    
    // Paso anterior
    prevButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStep = currentStep.previousElementSibling;
            
            if (prevStep && prevStep.classList.contains('form-step')) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
            }
        });
    });
}

function mostrarConfirmacionReserva(reserva) {
    const mensaje = `✅ ¡Reserva Confirmada!\n\n` +
                   `Servicio: ${reserva.servicio}\n` +
                   `Fecha: ${formatearFecha(reserva.fecha)}\n` +
                   `Hora: ${formatearHora(reserva.hora)}\n` +
                   `Total: $${reserva.precio.toLocaleString()}\n` +
                   `Código: ${reserva.codigo}\n\n` +
                   `Se ha enviado un mensaje a Jordy.\n` +
                   `Llega 5 minutos antes.`;
    
    alert(mensaje);
}

// ===== INICIALIZAR AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Sistema de reservas cargado');
    
    // Inicializar formulario si está en la página de reserva
    if (window.location.pathname.includes('reservar.html')) {
        inicializarFormularioReserva();
    }
    
    // Inicializar mis reservas si está en esa página
    if (window.location.pathname.includes('mis-reservas.html')) {
        // Verificar autenticación
        if (!window.verificarSesionActiva || !window.verificarSesionActiva()) {
            alert('Debes iniciar sesión para ver tus reservas');
            window.location.href = 'login.html';
        }
    }
});

// ===== EXPORTAR FUNCIONES =====
window.crearReserva = crearReserva;
window.obtenerReservasUsuario = obtenerReservasUsuario;
window.enviarWhatsAppReserva = enviarWhatsAppReserva;
window.formatearFecha = formatearFecha;
window.formatearHora = formatearHora;
window.inicializarFormularioReserva = inicializarFormularioReserva;