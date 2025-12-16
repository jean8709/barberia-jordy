// frontend/js/supabase-config.js
const SUPABASE_URL = 'https://owimgqvbybwzylszlomo.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93aW1ncXZieWJ3enlsc3psb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTQ0NTgsImV4cCI6MjA4MTQ3MDQ1OH0.lCBNgE3zOG3qJNkX-ls9n11vEHtGD719QeKrnu9Tvak'

console.log('⚙️ Configurando Supabase...');

// Crear cliente
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Hacer disponible globalmente
window.supabaseClient = supabase;
window.supa = supabase; // Alias corto

// Verificar conexión inmediatamente
supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
        console.log('✅ Supabase configurado - Sesión activa:', data.session.user.email);
    } else {
        console.log('✅ Supabase configurado - Sin sesión activa');
    }
}).catch(error => {
    console.error('❌ Error Supabase:', error.message);
});

// Función helper para saber si estamos en desarrollo
window.esDesarrollo = () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('netlify');
};