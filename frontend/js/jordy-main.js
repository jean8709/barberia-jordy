// jordy-main.js - Versión corregida para Netlify

// Navegación responsive
document.addEventListener('DOMContentLoaded', function() {
    console.log('Jordy Barber - Sistema cargado en Netlify');
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Verificar si hay parámetros en la URL para servicios específicos
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get('servicio');
    
    if (servicioParam) {
        localStorage.setItem('servicioSeleccionado', servicioParam);
    }
    
    // Inicializar sistema de reservas si está en la página de reserva
    if (window.location.pathname.includes('reservar.html')) {
        inicializarReservaJordy();
    }
    
    // Inicializar autenticación
    inicializarUsuariosDemo();
    
    // Cargar usuario actual si existe
    cargarUsuarioActual();
});

// Sistema de autenticación - Versión simplificada
function inicializarUsuariosDemo() {
    // Solo crear usuarios si no existen
    if (!localStorage.getItem('usuariosJordy')) {
        const usuariosDemo = [
            {
                id: 1,
                email: 'jordy@barber.com',
                password: 'jordy123',
                nombre: 'Jordy Barber',
                telefono: '3004513605',
                rol: 'admin',
                fechaRegistro: new Date().toISOString()
            },
            {
                id: 2,
                email: 'cliente@ejemplo.com',
                password: 'cliente123',
                nombre: 'Cliente Ejemplo',
                telefono: '3001234567',
                rol: 'cliente',
                fechaRegistro: new Date().toISOString()
            }
        ];
        localStorage.setItem('usuariosJordy', JSON.stringify(usuariosDemo));
        console.log('Usuarios demo creados para Netlify');
    }
}

// Función de login simplificada
function loginJordy(email, password) {
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        localStorage.setItem('usuarioActualJordy', JSON.stringify(usuario));
        return usuario;
    }
    return null;
}

// Función de logout
function logoutJordy() {
    localStorage.removeItem('usuarioActualJordy');
    window.location.href = 'index.html';
}

// Verificar si el usuario está autenticado
function estaAutenticado() {
    return localStorage.getItem('usuarioActualJordy') !== null;
}

// Cargar información del usuario actual
function cargarUsuarioActual() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    
    if (usuarioActual) {
        // Actualizar navegación si es admin
        if (usuarioActual.rol === 'admin') {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                // Buscar y actualizar botón de login
                const loginItems = navMenu.querySelectorAll('li');
                loginItems.forEach(item => {
                    if (item.innerHTML.includes('btn-login-jordy')) {
                        item.innerHTML = `
                            <div class="dropdown">
                                <a href="#" class="btn-login-jordy">
                                    <i class="fas fa-user"></i> ${usuarioActual.nombre.split(' ')[0]}
                                </a>
                                <div class="dropdown-menu">
                                    <a href="admin.html"><i class="fas fa-cog"></i> Panel Admin</a>
                                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                                </div>
                            </div>
                        `;
                        
                        // Agregar evento al botón de logout
                        setTimeout(() => {
                            const logoutBtn = document.getElementById('logoutBtn');
                            if (logoutBtn) {
                                logoutBtn.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    logoutJordy();
                                });
                            }
                        }, 100);
                    }
                });
            }
        }
    }
}

// Sistema de reservas simplificado para Netlify
function inicializarReservaJordy() {
    console.log('Inicializando sistema de reservas en Netlify');
    
    // Configurar fecha mínima (hoy)
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
        fechaInput.value = hoy;
    }
    
    // Configurar horas disponibles
    cargarHorasDisponibles();
    
    // Manejar envío del formulario de reserva
    const reservaForm = document.getElementById('reservaForm');
    if (reservaForm) {
        reservaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarReservaSimple();
        });
    }
}

function cargarHorasDisponibles() {
    const horas = [
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00'
    ];
    
    const horaSelect = document.getElementById('hora');
    if (horaSelect) {
        // Limpiar solo si no tiene opciones
        if (horaSelect.options.length <= 1) {
            horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            
            horas.forEach(hora => {
                const option = document.createElement('option');
                option.value = hora;
                option.textContent = formatearHoraSimple(hora);
                horaSelect.appendChild(option);
            });
        }
    }
}

function procesarReservaSimple() {
    const servicioSelect = document.getElementById('servicio');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    
    // Validaciones básicas
    if (!servicioSelect || !fechaInput || !horaSelect) {
        alert('Error en el formulario');
        return;
    }
    
    if (!servicioSelect.value || !fechaInput.value || !horaSelect.value) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Obtener datos del formulario
    const servicioTexto = servicioSelect.options[servicioSelect.selectedIndex].text;
    const servicioNombre = servicioTexto.split(' - ')[0];
    const servicioPrecio = servicioTexto.includes('$') ? 
        servicioTexto.split('$')[1]?.split(' ')[0]?.replace('.', '') : '20000';
    
    // Crear objeto de reserva
    const reserva = {
        id: Date.now(),
        fecha: fechaInput.value,
        hora: horaSelect.value,
        servicio: servicioNombre,
        precio: parseInt(servicioPrecio) || 20000,
        nombre: nombreInput ? nombreInput.value : '',
        telefono: telefonoInput ? telefonoInput.value : '',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        codigo: 'JB-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    
    // Guardar reserva
    guardarReservaSimple(reserva);
    
    // Enviar WhatsApp
    enviarWhatsAppSimple(reserva);
    
    // Mostrar confirmación
    mostrarConfirmacionSimple(reserva);
}

function guardarReservaSimple(reserva) {
    let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    reservas.push(reserva);
    localStorage.setItem('reservasJordy', JSON.stringify(reservas));
    console.log('Reserva guardada en Netlify:', reserva);
}

function enviarWhatsAppSimple(reserva) {
    const mensaje = `📅 *NUEVA RESERVA - Jordy Barber*%0A%0A` +
                   `👤 *Cliente:* ${reserva.nombre}%0A` +
                   `📞 *Teléfono:* ${reserva.telefono}%0A` +
                   `✂️ *Servicio:* ${reserva.servicio}%0A` +
                   `💰 *Precio:* $${reserva.precio.toLocaleString()}%0A` +
                   `📅 *Fecha:* ${formatearFechaSimple(reserva.fecha)}%0A` +
                   `⏰ *Hora:* ${formatearHoraSimple(reserva.hora)}%0A` +
                   `🆔 *Código:* ${reserva.codigo}`;
    
    const url = `https://api.whatsapp.com/send?phone=573004513605&text=${mensaje}`;
    window.open(url, '_blank');
}

function mostrarConfirmacionSimple(reserva) {
    // Crear mensaje de confirmación
    const mensaje = `✅ ¡Reserva Confirmada!\n\n` +
                   `Servicio: ${reserva.servicio}\n` +
                   `Fecha: ${formatearFechaSimple(reserva.fecha)}\n` +
                   `Hora: ${formatearHoraSimple(reserva.hora)}\n` +
                   `Total: $${reserva.precio.toLocaleString()}\n` +
                   `Código: ${reserva.codigo}\n\n` +
                   `Se ha enviado un mensaje a Jordy.\n` +
                   `Llega 5 minutos antes.`;
    
    alert(mensaje);
    
    // Redirigir al inicio después de 3 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Funciones auxiliares simplificadas
function formatearFechaSimple(fechaStr) {
    try {
        const fecha = new Date(fechaStr + 'T00:00:00');
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    } catch (e) {
        return fechaStr;
    }
}

function formatearHoraSimple(horaStr) {
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

// Hacer funciones disponibles globalmente
window.loginJordy = loginJordy;
window.logoutJordy = logoutJordy;
window.estaAutenticado = estaAutenticado;