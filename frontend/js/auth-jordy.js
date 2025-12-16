// auth-jordy.js - Sistema de autenticación para Jordy Barber

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de autenticación Jordy Barber cargado');
    
    // Inicializar usuarios si no existen
    inicializarUsuarios();
    
    // Configurar visibilidad de contraseñas
    configurarVisibilidadPassword();
    
    // Manejar login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarLogin();
        });
    }
    
    // Manejar registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarRegistro();
        });
    }
    
    // Verificar si hay usuario logueado
    verificarSesion();
});

function inicializarUsuarios() {
    // Crear usuarios demo si no existen
    if (!localStorage.getItem('usuariosJordy')) {
        const usuariosDemo = [
            {
                id: 1,
                email: 'jordy@barber.com',
                password: 'jordy123',
                nombre: 'Jordy Barber',
                telefono: '3004513605',
                rol: 'admin',
                fechaRegistro: new Date().toISOString(),
                reservasTotales: 0
            },
            {
                id: 2,
                email: 'cliente@ejemplo.com',
                password: 'cliente123',
                nombre: 'Cliente de Ejemplo',
                telefono: '3001234567',
                rol: 'cliente',
                fechaRegistro: new Date().toISOString(),
                reservasTotales: 0
            }
        ];
        
        localStorage.setItem('usuariosJordy', JSON.stringify(usuariosDemo));
        console.log('Usuarios demo creados');
    }
}

function configurarVisibilidadPassword() {
    // Toggle para ver contraseña en login
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Toggle para confirmar contraseña en registro
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPassword = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (confirmPassword.type === 'password') {
                confirmPassword.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                confirmPassword.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

function procesarLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;
    
    // Validaciones básicas
    if (!email || !password) {
        mostrarError('Por favor completa todos los campos');
        return;
    }
    
    // Buscar usuario
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Guardar sesión
        localStorage.setItem('usuarioActualJordy', JSON.stringify(usuario));
        
        // Guardar para "recordar sesión" si está marcado
        if (remember) {
            localStorage.setItem('recordarSesion', 'true');
        }
        
        // Mostrar mensaje de éxito
        mostrarExito(`¡Bienvenido de vuelta, ${usuario.nombre}!`);
        
        // Redirigir según rol
        setTimeout(() => {
            if (usuario.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
        
    } else {
        mostrarError('Correo o contraseña incorrectos');
    }
}

function procesarRegistro() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validaciones
    if (!nombre || !email || !telefono || !password || !confirmPassword) {
        mostrarError('Por favor completa todos los campos');
        return;
    }
    
    if (!acceptTerms) {
        mostrarError('Debes aceptar los términos y condiciones');
        return;
    }
    
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        mostrarError('Las contraseñas no coinciden');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarError('Por favor ingresa un correo electrónico válido');
        return;
    }
    
    if (!validarTelefono(telefono)) {
        mostrarError('Por favor ingresa un número de teléfono válido');
        return;
    }
    
    // Verificar si el usuario ya existe
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    const usuarioExistente = usuarios.find(u => u.email === email);
    
    if (usuarioExistente) {
        mostrarError('Ya existe un usuario con este correo electrónico');
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now(),
        email,
        password,
        nombre,
        telefono,
        rol: 'cliente',
        fechaRegistro: new Date().toISOString(),
        reservasTotales: 0,
        ultimaVisita: null
    };
    
    // Guardar usuario
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosJordy', JSON.stringify(usuarios));
    
    // Iniciar sesión automáticamente
    localStorage.setItem('usuarioActualJordy', JSON.stringify(nuevoUsuario));
    
    // Mostrar mensaje de éxito
    mostrarExito(`¡Cuenta creada exitosamente, ${nombre}!`);
    
    // Redirigir al inicio
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function loginConWhatsApp() {
    const numeroJordy = '573004513605';
    const mensaje = 'Hola Jordy, necesito ayuda para iniciar sesión en el sistema de reservas.';
    
    const url = `https://wa.me/${numeroJordy}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function registroConWhatsApp() {
    const numeroJordy = '573004513605';
    const mensaje = 'Hola Jordy, quiero registrarme en tu sistema de reservas. ¿Me puedes ayudar?';
    
    const url = `https://wa.me/${numeroJordy}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefono(telefono) {
    const regex = /^[0-9]{10}$/;
    return regex.test(telefono.replace(/\D/g, ''));
}

function mostrarError(mensaje) {
    // Remover mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje-alerta');
    mensajesAnteriores.forEach(msg => msg.remove());
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-alerta error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${mensaje}</span>
    `;
    
    // Insertar después del formulario
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.insertBefore(errorDiv, formulario.firstChild);
    }
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function mostrarExito(mensaje) {
    // Remover mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje-alerta');
    mensajesAnteriores.forEach(msg => msg.remove());
    
    // Crear mensaje de éxito
    const exitoDiv = document.createElement('div');
    exitoDiv.className = 'mensaje-alerta exito';
    exitoDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${mensaje}</span>
    `;
    
    // Insertar después del formulario
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.insertBefore(exitoDiv, formulario.firstChild);
    }
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        exitoDiv.remove();
    }, 5000);
}

function verificarSesion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    
    // Si hay usuario logueado y está en login/registro, redirigir
    if (usuarioActual && (window.location.pathname.includes('login.html') || 
                          window.location.pathname.includes('registro.html'))) {
        
        // Mostrar mensaje informativo
        if (confirm(`Ya has iniciado sesión como ${usuarioActual.nombre}. ¿Deseas ir al inicio?`)) {
            window.location.href = 'index.html';
        }
    }
}

// Hacer funciones disponibles globalmente
window.loginConWhatsApp = loginConWhatsApp;
window.registroConWhatsApp = registroConWhatsApp;