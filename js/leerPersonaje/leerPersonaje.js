// ============================================
// leerPersonaje.js
// Carga todos los datos del jugador desde el backend
// y los muestra en leerPersonaje.html
// ============================================

const API_BACKEND = 'http://localhost:3000';
const ID_JUGADOR = 1; // cambiar cuando tengan sistema de login

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosJugador();
});

async function cargarDatosJugador() {
    try {
        const response = await fetch(`${API_BACKEND}/api/jugador/${ID_JUGADOR}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: jugador no encontrado`);
        }

        const data = await response.json();
        console.log('Datos del jugador:', data);

        renderAvatar(data.avatar_url);
        //renderNombre(data.jugador.nombre);
        renderEstadisticas(data.estadisticas);
        renderTrabajos(data.trabajos);
        renderTrofeos(data.trofeos);
        renderBarra(data.trabajos);

        // Animar números después de renderizar
        animarNumeros();

    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// ============================================
// AVATAR
// ============================================
function renderAvatar(avatarUrl) {
    const img = document.querySelector('#estadisticas-avatar .avatar-main');
    if (!img) return;

    // Agregar timestamp para evitar caché del navegador
    img.src = avatarUrl + '?t=' + Date.now();
    img.alt = 'Avatar del jugador';

    // Si falla, mostrar placeholder
    img.onerror = () => {
        img.src = '../assets/img/avatar-generado-falso.png';
    };
}

// ============================================
// NOMBRE (título con efecto typed)
// ============================================
function renderNombre(nombre) {
    const titulo = document.getElementById('typed-text-estadisticas');
    if (!titulo) return;

    // Si Typed.js ya está cargado, usarlo
    if (typeof Typed !== 'undefined') {
        new Typed('#typed-text-estadisticas', {
            strings: [nombre.toUpperCase()],
            typeSpeed: 80,
            showCursor: false
        });
    } else {
        titulo.textContent = nombre.toUpperCase();
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================
function renderEstadisticas(stats) {
    setTexto('stat-advertencias', stats.advertencias);
    setTexto('stat-xp', stats.xp_total);
    setTexto('stat-dinero-total', '$' + stats.dinero_total.toLocaleString());
    setTexto('stat-dinero-actual', '$' + stats.dinero_actual.toLocaleString());
}

// ============================================
// TRABAJOS
// ============================================
function renderTrabajos(trabajos) {
    setTexto('stat-negro', trabajos.negro);
    setTexto('stat-blanco', trabajos.blanco);
    setTexto('stat-trabajos-completados', trabajos.completados);
    setTexto('stat-trabajos-fallidos', trabajos.fallidos);
}

// ============================================
// TROFEOS — genera los divs dinámicamente
// ============================================
function renderTrofeos(trofeos) {
    const contenedor = document.querySelector('.d-flex.flex-wrap.gap-2');
    if (!contenedor) return;

    // Limpiar trofeos estáticos del HTML
    contenedor.innerHTML = '';

    if (trofeos.length === 0) {
        contenedor.innerHTML = '<span style="color:#888; font-family:PT Sans; font-size:0.9rem;">Sin trofeos aún</span>';
        return;
    }

    trofeos.forEach(trofeo => {
        const div = document.createElement('div');
        div.className = 'trofeo';
        div.setAttribute('data-desc', trofeo.descripcion);

        // Cargar imagen del trofeo desde el campo 'retrato' en SQL
        div.style.backgroundImage = `url(${API_BACKEND}/api/trofeo/${trofeo.id_trofeo}/imagen)`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';

        contenedor.appendChild(div);
    });
}

// ============================================
// BARRA BLANCO/NEGRO — mueve el indicador
// ============================================
function renderBarra(trabajos) {
    const indicador = document.querySelector('.indicador');
    if (!indicador) return;

    const total = trabajos.negro + trabajos.blanco;

    if (total === 0) {
        // Sin datos, centrar
        indicador.style.left = '50%';
        return;
    }

    // 0% = todo blanco (izquierda), 100% = todo negro (derecha)
    const porcentajeNegro = (trabajos.negro / total) * 100;
    indicador.style.left = porcentajeNegro + '%';
    indicador.style.transition = 'left 1s ease';
}

// ============================================
// UTILIDADES
// ============================================
function setTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

// Animación de números con anime.js
function animarNumeros() {
    document.querySelectorAll('.num-estadistica').forEach(el => {
        const texto = el.textContent;

        // Extraer número (quitar $ y comas)
        const numero = parseInt(texto.replace(/[$,]/g, ''));
        if (isNaN(numero) || numero === 0) return;

        const tienePeso = texto.includes('$');

        // Animar de 0 al valor real
        const obj = { val: 0 };
        anime({
            targets: obj,
            val: numero,
            duration: 1500,
            easing: 'easeOutExpo',
            round: 1,
            update: () => {
                el.textContent = (tienePeso ? '$' : '') + obj.val.toLocaleString();
            }
        });
    });
}