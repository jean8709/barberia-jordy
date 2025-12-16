// admin-jordy.js - Panel de administración para Jordy

// Variables globales
let chartIngresos = null;
let chartServicios = null;
let chartHorarios = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de Administración Jordy - Cargado');
    
    // Verificar autenticación de admin
    verificarAdmin();
    
    // Inicializar panel
    inicializarPanel();
    
    // Configurar navegación
    configurarNavegacionAdmin();
    
    // Configurar eventos
    configurarEventosAdmin();
    
    // Cargar datos iniciales
    cargarDatosDashboard();
    cargarReservasAdmin();
    cargarClientesAdmin();
    cargarServiciosAdmin();
    cargarConfiguracion();
    
    // Inicializar gráficos
    setTimeout(inicializarGraficosAdmin, 500);
});

function verificarAdmin() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActualJordy'));
    
    if (!usuarioActual || usuarioActual.rol !== 'admin') {
        alert('Acceso denegado. Solo administradores pueden acceder a esta sección.');
        window.location.href = 'login.html';
        return false;
    }
    
    // Mostrar información del admin
    document.getElementById('adminName').textContent = usuarioActual.nombre;
    document.getElementById('adminRole').textContent = usuarioActual.rol.toUpperCase();
    
    return true;
}

function inicializarPanel() {
    // Configurar fecha y hora actual
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 60000); // Actualizar cada minuto
    
    // Configurar menú toggle para móviles
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutAdmin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesionAdmin();
        });
    }
}

function actualizarFechaHora() {
    const ahora = new Date();
    
    // Fecha
    const fechaElement = document.getElementById('currentDate');
    if (fechaElement) {
        fechaElement.textContent = ahora.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Hora
    const horaElement = document.getElementById('currentTime');
    if (horaElement) {
        horaElement.textContent = ahora.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function configurarNavegacionAdmin() {
    // Navegación entre secciones
    document.querySelectorAll('.sidebar-link').forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar sección seleccionada
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                document.getElementById('pageTitle').textContent = targetSection.querySelector('h2')?.textContent || 'Dashboard';
            }
            
            // Actualizar menú activo
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Cerrar sidebar en móviles
            const sidebar = document.querySelector('.admin-sidebar');
            if (window.innerWidth <= 1024 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
}

function configurarEventosAdmin() {
    // Botones de acciones rápidas
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            console.log('Acción rápida:', action);
            
            switch(action) {
                case 'Nueva Reserva':
                    nuevaReservaManual();
                    break;
                case 'Ver Hoy':
                    filtrarReservasPorFecha(new Date().toISOString().split('T')[0]);
                    break;
                case 'Recordatorios':
                    enviarRecordatorios();
                    break;
                case 'Reporte PDF':
                    generarReportePDF();
                    break;
            }
        });
    });
    
    // Filtros de reservas
    const aplicarFiltrosBtn = document.querySelector('.btn-secondary');
    if (aplicarFiltrosBtn) {
        aplicarFiltrosBtn.addEventListener('click', filtrarReservas);
    }
    
    const limpiarFiltrosBtn = document.querySelector('.btn-outline');
    if (limpiarFiltrosBtn) {
        limpiarFiltrosBtn.addEventListener('click', limpiarFiltros);
    }
    
    // Búsqueda de clientes
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', buscarClientes);
    }
    
    // Guardar configuración
    const guardarHorariosBtn = document.querySelector('[onclick="guardarHorarios()"]');
    if (guardarHorariosBtn) {
        guardarHorariosBtn.onclick = guardarHorarios;
    }
    
    const guardarNotifBtn = document.querySelector('[onclick="guardarNotificaciones()"]');
    if (guardarNotifBtn) {
        guardarNotifBtn.onclick = guardarNotificaciones;
    }
    
    const guardarConfigBtn = document.querySelector('[onclick="guardarConfigSistema()"]');
    if (guardarConfigBtn) {
        guardarConfigBtn.onclick = guardarConfigSistema;
    }
}

function cargarDatosDashboard() {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    const hoy = new Date().toISOString().split('T')[0];
    
    // Reservas hoy
    const reservasHoy = reservas.filter(r => r.fecha === hoy && r.estado !== 'cancelada').length;
    document.getElementById('reservasHoy').textContent = reservasHoy;
    
    // Reservas esta semana
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const reservasSemana = reservas.filter(r => {
        const fechaReserva = new Date(r.fecha);
        return fechaReserva >= inicioSemana && r.estado !== 'cancelada';
    }).length;
    document.getElementById('reservasSemana').textContent = reservasSemana;
    
    // Ingresos hoy
    let ingresosHoy = 0;
    reservas.forEach(r => {
        if (r.fecha === hoy && r.estado !== 'cancelada') {
            ingresosHoy += parseInt(r.precio) || 0;
        }
    });
    document.getElementById('ingresosHoy').textContent = `$${ingresosHoy.toLocaleString()}`;
    
    // Nuevos clientes (últimos 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    const nuevosClientes = usuarios.filter(u => {
        const fechaRegistro = new Date(u.fechaRegistro);
        return fechaRegistro >= fechaLimite && u.rol === 'cliente';
    }).length;
    document.getElementById('nuevosClientes').textContent = nuevosClientes;
    
    // Actualizar badges
    const totalReservas = reservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length;
    const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;
    
    document.getElementById('badgeReservas').textContent = totalReservas;
    document.getElementById('badgeClientes').textContent = totalClientes;
    
    // Cargar próximas reservas
    cargarProximasReservas();
}

function cargarProximasReservas() {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    
    // Filtrar reservas futuras (pendientes o confirmadas)
    const ahora = new Date();
    const proximasReservas = reservas
        .filter(r => {
            const fechaReserva = new Date(r.fecha + 'T' + r.hora);
            return fechaReserva > ahora && (r.estado === 'pendiente' || r.estado === 'confirmada');
        })
        .sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora))
        .slice(0, 5); // Solo las 5 próximas
    
    const tbody = document.querySelector('#proximasReservasTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (proximasReservas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray);">
                    No hay reservas próximas
                </td>
            </tr>
        `;
        return;
    }
    
    proximasReservas.forEach(reserva => {
        const usuario = usuarios.find(u => 
            u.nombre === reserva.nombre || u.telefono === reserva.telefono
        );
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${reserva.nombre || 'Cliente'}</td>
            <td>${reserva.servicio || 'Servicio'}</td>
            <td>${formatearHora(reserva.hora)}</td>
            <td>${reserva.telefono || 'N/A'}</td>
            <td><span class="status-badge status-${reserva.estado}">${reserva.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-confirm" onclick="confirmarReservaAdmin(${reserva.id})" title="Confirmar">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-action btn-whatsapp" onclick="contactarClienteWhatsApp('${reserva.telefono}', ${reserva.id})" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editarReservaAdmin(${reserva.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}

function cargarReservasAdmin(filtroFecha = null, filtroEstado = null, filtroServicio = null) {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const tbody = document.querySelector('#reservasTable tbody');
    
    if (!tbody) return;
    
    // Aplicar filtros
    let reservasFiltradas = reservas;
    
    if (filtroFecha) {
        reservasFiltradas = reservasFiltradas.filter(r => r.fecha === filtroFecha);
    }
    
    if (filtroEstado) {
        reservasFiltradas = reservasFiltradas.filter(r => r.estado === filtroEstado);
    }
    
    if (filtroServicio) {
        reservasFiltradas = reservasFiltradas.filter(r => {
            const servicioId = r.servicio?.toLowerCase().replace(/ /g, '-');
            return servicioId === filtroServicio;
        });
    }
    
    // Ordenar por fecha (más recientes primero)
    reservasFiltradas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));
    
    tbody.innerHTML = '';
    
    if (reservasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray);">
                    No hay reservas con estos filtros
                </td>
            </tr>
        `;
        return;
    }
    
    reservasFiltradas.forEach(reserva => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${reserva.id}</td>
            <td>${reserva.nombre || 'Cliente'}</td>
            <td>${reserva.servicio || 'Servicio'}</td>
            <td>${formatearFecha(reserva.fecha)}</td>
            <td>${formatearHora(reserva.hora)}</td>
            <td>$${parseInt(reserva.precio || 0).toLocaleString()}</td>
            <td><span class="status-badge status-${reserva.estado}">${reserva.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-confirm" onclick="confirmarReservaAdmin(${reserva.id})" title="Confirmar">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-action btn-whatsapp" onclick="contactarClienteWhatsApp('${reserva.telefono}', ${reserva.id})" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editarReservaAdmin(${reserva.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="cancelarReservaAdmin(${reserva.id})" title="Cancelar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}

function cargarClientesAdmin() {
    const usuarios = JSON.parse(localStorage.getItem('usuariosJordy')) || [];
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    
    const clientes = usuarios.filter(u => u.rol === 'cliente');
    
    const tbody = document.querySelector('#clientesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const reservasCliente = reservas.filter(r => 
            r.nombre === cliente.nombre || r.telefono === cliente.telefono
        );
        
        const ultimaReserva = reservasCliente.length > 0 
            ? reservasCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
            : null;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono || 'N/A'}</td>
            <td>${reservasCliente.length}</td>
            <td>${ultimaReserva ? formatearFecha(ultimaReserva.fecha) : 'Nunca'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-whatsapp" onclick="contactarClienteWhatsApp('${cliente.telefono}')" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editarClienteAdmin(${cliente.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}

function cargarServiciosAdmin() {
    const servicios = [
        {
            id: 'corte-barba-cejas',
            nombre: 'CORTE + BARBA + CEJAS',
            descripcion: 'Completo cuidado facial',
            precio: 20000,
            duracion: 60,
            activo: true
        },
        {
            id: 'corte-nino',
            nombre: 'CORTE DE NIÑO',
            descripcion: 'Especial para los más pequeños',
            precio: 15000,
            duracion: 30,
            activo: true
        },
        {
            id: 'corte-caballero',
            nombre: 'CORTE DE CABALLERO',
            descripcion: 'Estilo clásico o moderno',
            precio: 15000,
            duracion: 45,
            activo: true
        },
        {
            id: 'corte-barba',
            nombre: 'CORTE + BARBA',
            descripcion: 'Combinación perfecta',
            precio: 18000,
            duracion: 50,
            activo: true
        },
        {
            id: 'corte-cejas',
            nombre: 'CORTE + CEJAS',
            descripcion: 'Estilo completo facial',
            precio: 17000,
            duracion: 40,
            activo: true
        }
    ];
    
    localStorage.setItem('serviciosJordy', JSON.stringify(servicios));
    
    const container = document.getElementById('serviciosAdminGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    servicios.forEach(servicio => {
        const card = document.createElement('div');
        card.className = 'servicio-admin-card';
        card.innerHTML = `
            <div class="servicio-admin-header">
                <h4>${servicio.nombre}</h4>
                <span class="servicio-precio-admin">$${servicio.precio.toLocaleString()}</span>
            </div>
            <p>${servicio.descripcion}</p>
            <div class="servicio-meta">
                <span><i class="fas fa-clock"></i> ${servicio.duracion} min</span>
                <span><i class="fas ${servicio.activo ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${servicio.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="servicio-actions">
                <button class="btn-action btn-edit" onclick="editarServicioAdmin('${servicio.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action ${servicio.activo ? 'btn-delete' : 'btn-confirm'}" 
                        onclick="toggleServicioAdmin('${servicio.id}')">
                    <i class="fas ${servicio.activo ? 'fa-times' : 'fa-check'}"></i> 
                    ${servicio.activo ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function cargarConfiguracion() {
    // Cargar configuración guardada o usar valores por defecto
    const config = JSON.parse(localStorage.getItem('configJordy')) || {
        horaApertura: '09:00',
        horaCierre: '19:00',
        notifWhatsApp: true,
        notifRecordatorio: false,
        notifConfirmacion: true,
        tiempoCita: 45,
        horasCancelacion: 2
    };
    
    // Aplicar valores a los inputs
    document.getElementById('horaApertura').value = config.horaApertura;
    document.getElementById('horaCierre').value = config.horaCierre;
    document.getElementById('notifWhatsApp').checked = config.notifWhatsApp;
    document.getElementById('notifRecordatorio').checked = config.notifRecordatorio;
    document.getElementById('notifConfirmacion').checked = config.notifConfirmacion;
    document.getElementById('tiempoCita').value = config.tiempoCita;
    document.getElementById('horasCancelacion').value = config.horasCancelacion;
}

function inicializarGraficosAdmin() {
    // Destruir gráficos anteriores si existen
    if (chartIngresos) chartIngresos.destroy();
    if (chartServicios) chartServicios.destroy();
    if (chartHorarios) chartHorarios.destroy();
    
    // Obtener contextos de canvas
    const ctxIngresos = document.getElementById('ingresosChart');
    const ctxServicios = document.getElementById('serviciosChart');
    const ctxHorarios = document.getElementById('horariosChart');
    
    if (!ctxIngresos || !ctxServicios || !ctxHorarios) {
        console.log('Canvas no encontrados para gráficos');
        return;
    }
    
    try {
        // Gráfico de ingresos (ejemplo)
        chartIngresos = new Chart(ctxIngresos, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ingresos ($)',
                    data: [120000, 150000, 180000, 200000, 220000, 300000, 250000],
                    borderColor: 'rgb(231, 76, 60)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de servicios populares
        chartServicios = new Chart(ctxServicios, {
            type: 'doughnut',
            data: {
                labels: ['Corte+Barba+Cejas', 'Corte Niño', 'Corte Caballero', 'Corte+Barba', 'Corte+Cejas'],
                datasets: [{
                    data: [35, 20, 15, 18, 12],
                    backgroundColor: [
                        'rgba(44, 62, 80, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(155, 89, 182, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Gráfico de horarios pico
        chartHorarios = new Chart(ctxHorarios, {
            type: 'bar',
            data: {
                labels: ['9 AM', '10 AM', '11 AM', '12 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
                datasets: [{
                    label: 'Reservas',
                    data: [3, 5, 8, 6, 10, 12, 9, 7],
                    backgroundColor: 'rgba(243, 156, 18, 0.7)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error al crear gráficos:', error);
    }
}

// Funciones de acciones
function nuevaReservaManual() {
    alert('Funcionalidad de nueva reserva manual - En desarrollo');
    // Aquí podrías abrir un modal para crear reserva manualmente
}

function filtrarReservas() {
    const fecha = document.getElementById('filterFecha').value;
    const estado = document.getElementById('filterEstado').value;
    const servicio = document.getElementById('filterServicio').value;
    
    cargarReservasAdmin(fecha || null, estado || null, servicio || null);
}

function filtrarReservasPorFecha(fecha) {
    document.getElementById('filterFecha').value = fecha;
    filtrarReservas();
}

function limpiarFiltros() {
    document.getElementById('filterFecha').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterServicio').value = '';
    cargarReservasAdmin();
}

function buscarClientes() {
    const termino = document.getElementById('searchClient').value.toLowerCase();
    const filas = document.querySelectorAll('#clientesTable tbody tr');
    
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(termino) ? '' : 'none';
    });
}

function confirmarReservaAdmin(idReserva) {
    let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const index = reservas.findIndex(r => r.id === idReserva);
    
    if (index !== -1) {
        reservas[index].estado = 'confirmada';
        localStorage.setItem('reservasJordy', JSON.stringify(reservas));
        
        // Recargar datos
        cargarDatosDashboard();
        cargarReservasAdmin();
        
        alert('Reserva confirmada exitosamente');
    }
}

function cancelarReservaAdmin(idReserva) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    let reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const index = reservas.findIndex(r => r.id === idReserva);
    
    if (index !== -1) {
        reservas[index].estado = 'cancelada';
        localStorage.setItem('reservasJordy', JSON.stringify(reservas));
        
        // Recargar datos
        cargarDatosDashboard();
        cargarReservasAdmin();
        
        alert('Reserva cancelada exitosamente');
    }
}

function contactarClienteWhatsApp(telefono, idReserva = null) {
    const numeroJordy = '573004513605';
    let mensaje = 'Hola, soy Jordy de Jordy Barber. ';
    
    if (idReserva) {
        mensaje += `Te contacto sobre tu reserva (ID: ${idReserva}).`;
    } else {
        mensaje += '¿Cómo estás?';
    }
    
    const url = `https://wa.me/57${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function editarReservaAdmin(idReserva) {
    alert(`Editar reserva ${idReserva} - En desarrollo`);
}

function editarClienteAdmin(idCliente) {
    alert(`Editar cliente ${idCliente} - En desarrollo`);
}

function editarServicioAdmin(idServicio) {
    alert(`Editar servicio ${idServicio} - En desarrollo`);
}

function toggleServicioAdmin(idServicio) {
    let servicios = JSON.parse(localStorage.getItem('serviciosJordy')) || [];
    const index = servicios.findIndex(s => s.id === idServicio);
    
    if (index !== -1) {
        servicios[index].activo = !servicios[index].activo;
        localStorage.setItem('serviciosJordy', JSON.stringify(servicios));
        cargarServiciosAdmin();
        
        const estado = servicios[index].activo ? 'activado' : 'desactivado';
        alert(`Servicio ${estado} exitosamente`);
    }
}

function guardarHorarios() {
    const config = JSON.parse(localStorage.getItem('configJordy')) || {};
    
    config.horaApertura = document.getElementById('horaApertura').value;
    config.horaCierre = document.getElementById('horaCierre').value;
    
    localStorage.setItem('configJordy', JSON.stringify(config));
    alert('Horarios guardados exitosamente');
}

function guardarNotificaciones() {
    const config = JSON.parse(localStorage.getItem('configJordy')) || {};
    
    config.notifWhatsApp = document.getElementById('notifWhatsApp').checked;
    config.notifRecordatorio = document.getElementById('notifRecordatorio').checked;
    config.notifConfirmacion = document.getElementById('notifConfirmacion').checked;
    
    localStorage.setItem('configJordy', JSON.stringify(config));
    alert('Configuración de notificaciones guardada');
}

function guardarConfigSistema() {
    const config = JSON.parse(localStorage.getItem('configJordy')) || {};
    
    config.tiempoCita = parseInt(document.getElementById('tiempoCita').value) || 45;
    config.horasCancelacion = parseInt(document.getElementById('horasCancelacion').value) || 2;
    
    localStorage.setItem('configJordy', JSON.stringify(config));
    alert('Configuración del sistema guardada');
}

function enviarRecordatorios() {
    const reservas = JSON.parse(localStorage.getItem('reservasJordy')) || [];
    const hoy = new Date().toISOString().split('T')[0];
    
    // Encontrar reservas para mañana
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];
    
    const reservasManana = reservas.filter(r => 
        r.fecha === fechaManana && 
        (r.estado === 'pendiente' || r.estado === 'confirmada')
    );
    
    if (reservasManana.length === 0) {
        alert('No hay reservas para mañana que necesiten recordatorio');
        return;
    }
    
    let mensaje = `📋 *RECORDATORIOS PARA MAÑANA - Jordy Barber*\n\n` +
                  `Reservas para el ${formatearFecha(fechaManana)}:\n\n`;
    
    reservasManana.forEach((reserva, index) => {
        mensaje += `${index + 1}. ${reserva.nombre} - ${formatearHora(reserva.hora)} (${reserva.servicio})\n`;
    });
    
    mensaje += `\nTotal: ${reservasManana.length} reservas`;
    
    const url = `https://wa.me/573004513605?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    alert(`Se enviará recordatorio para ${reservasManana.length} reservas de mañana`);
}

function generarReportePDF() {
    alert('Generando reporte PDF...');
    // Aquí iría la lógica para generar PDF con jsPDF o similar
}

function generarReporte() {
    const periodo = document.getElementById('periodoReporte').value;
    alert(`Generando reporte del período: ${periodo}`);
}

function cerrarSesionAdmin() {
    if (confirm('¿Estás seguro de cerrar sesión como administrador?')) {
        localStorage.removeItem('usuarioActualJordy');
        window.location.href = 'index.html';
    }
}

// Funciones auxiliares
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
window.nuevaReservaManual = nuevaReservaManual;
window.verReservasHoy = function() {
    filtrarReservasPorFecha(new Date().toISOString().split('T')[0]);
};
window.enviarRecordatorios = enviarRecordatorios;
window.generarReporte = generarReporte;
window.filtrarReservas = filtrarReservas;
window.limpiarFiltros = limpiarFiltros;
window.buscarClientes = buscarClientes;
window.nuevoServicio = function() {
    alert('Nuevo servicio - En desarrollo');
};
window.confirmarReservaAdmin = confirmarReservaAdmin;
window.cancelarReservaAdmin = cancelarReservaAdmin;
window.contactarClienteWhatsApp = contactarClienteWhatsApp;
window.editarReservaAdmin = editarReservaAdmin;
window.editarClienteAdmin = editarClienteAdmin;
window.editarServicioAdmin = editarServicioAdmin;
window.toggleServicioAdmin = toggleServicioAdmin;
window.guardarHorarios = guardarHorarios;
window.guardarNotificaciones = guardarNotificaciones;
window.guardarConfigSistema = guardarConfigSistema;
window.generarReportePDF = generarReportePDF;