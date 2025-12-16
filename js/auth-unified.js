// SISTEMA DE AUTENTICACIÓN UNIFICADO - Jordy Barber

// Configuración inicial
const USER_KEY = 'usuarioActualJordy';
const RESERVAS_KEY = 'reservasJordy';
const USUARIOS_KEY = 'usuariosJordy';
const ADMIN_EMAIL = 'jordy@barber.com'; // Cambiar esto por el email real de Jordy

// ===== INICIALIZACIÓN =====
function inicializarSistemaAuth() {
    console.log('🔧 Inicializando sistema de autenticación...');
    
    // 1. Crear usuarios demo si no existen
    if (!localStorage.getItem(USUARIOS_KEY)) {
        const usuariosDemo = [
            {
                id: 1,
                email: ADMIN_EMAIL,
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
        localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuariosDemo));
        console.log('✅ Usuarios demo creados');
    }
    
    // 2. Verificar sesión activa
    const usuario = obtenerUsuarioActual();
    
    // 3. Actualizar interfaz en todas las páginas
    actualizarInterfazAuth();
    
    return usuario;
}

// ===== REGISTRO =====
function registrarUsuarioAuth(email, password, nombre, telefono) {
    try {
        const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
        
        // Verificar si el usuario ya existe
        const usuarioExistente = usuarios.find(u => u.email === email);
        if (usuarioExistente) {
            return { success: false, error: 'El email ya está registrado' };
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            email: email,
            password: password,
            nombre: nombre,
            telefono: telefono,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString()
        };
        
        usuarios.push(nuevoUsuario);
        localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
        
        console.log('✅ Usuario registrado:', email);
        return { success: true, usuario: nuevoUsuario };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== LOGIN =====
function loginUsuarioAuth(email, password) {
    try {
        const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
        const usuario = usuarios.find(u => u.email === email && u.password === password);
        
        if (!usuario) {
            return { success: false, error: 'Email o contraseña incorrectos' };
        }
        
        // Guardar sesión
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        
        console.log('✅ Login exitoso:', usuario.nombre);
        return { success: true, usuario: usuario };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== LOGOUT =====
function logoutUsuarioAuth() {
    localStorage.removeItem(USER_KEY);
    console.log('✅ Sesión cerrada');
    return true;
}

// ===== OBTENER USUARIO ACTUAL =====
function obtenerUsuarioActual() {
    const usuarioStr = localStorage.getItem(USER_KEY);
    if (!usuarioStr) return null;
    
    try {
        return JSON.parse(usuarioStr);
    } catch (error) {
        return null;
    }
}

// ===== VERIFICAR SESIÓN =====
function verificarSesionActiva() {
    return obtenerUsuarioActual() !== null;
}

// ===== ES ADMIN =====
function esUsuarioAdmin() {
    const usuario = obtenerUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

// ===== ACTUALIZAR INTERFAZ =====
function actualizarInterfazAuth() {
    const usuario = obtenerUsuarioActual();
    
    // Elementos comunes en todas las páginas
    const elementos = {
        nombreUsuario: document.getElementById('nombre-usuario'),
        btnLogin: document.getElementById('btn-login'),
        btnLogout: document.getElementById('btn-logout'),
        linkReservas: document.getElementById('link-reservas'),
        userStatus: document.querySelector('.user-status')
    };
    
    if (usuario) {
        // Usuario logueado
        if (elementos.nombreUsuario) {
            elementos.nombreUsuario.textContent = usuario.nombre.split(' ')[0]; // Solo primer nombre
            elementos.nombreUsuario.style.display = 'inline';
        }
        
        if (elementos.btnLogin) elementos.btnLogin.style.display = 'none';
        if (elementos.btnLogout) elementos.btnLogout.style.display = 'inline-block';
        if (elementos.linkReservas) elementos.linkReservas.style.display = 'inline-block';
        
    } else {
        // Usuario no logueado
        if (elementos.nombreUsuario) elementos.nombreUsuario.style.display = 'none';
        if (elementos.btnLogin) elementos.btnLogin.style.display = 'inline-block';
        if (elementos.btnLogout) elementos.btnLogout.style.display = 'none';
        if (elementos.linkReservas) elementos.linkReservas.style.display = 'none';
    }
}

// ===== PROTEGER RUTAS =====
function protegerRuta(rolesPermitidos = ['cliente', 'admin']) {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        // No está logueado
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'login.html';
        return false;
    }
    
    if (!rolesPermitidos.includes(usuario.rol)) {
        // No tiene permiso
        alert('No tienes permiso para acceder a esta página');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ===== INICIALIZAR AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema
    inicializarSistemaAuth();
    
    // Configurar botón de logout si existe
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUsuarioAuth();
            window.location.href = 'index.html';
        });
    }
    
    // Configurar logout en otras páginas
    const logoutUser = document.getElementById('logoutUser');
    if (logoutUser) {
        logoutUser.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUsuarioAuth();
            window.location.href = 'index.html';
        });
    }
});

// ===== EXPORTAR FUNCIONES =====
window.registrarUsuarioAuth = registrarUsuarioAuth;
window.loginUsuarioAuth = loginUsuarioAuth;
window.logoutUsuarioAuth = logoutUsuarioAuth;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.verificarSesionActiva = verificarSesionActiva;
window.esUsuarioAdmin = esUsuarioAdmin;
window.protegerRuta = protegerRuta;
window.actualizarInterfazAuth = actualizarInterfazAuth;