// ============================================
// SCRIPT: NANO BANANA PRO + GUARDADO EN AZURE SQL
// ============================================
const FAL_API_KEY = '3fe7224f-2f1c-4a4c-8518-737b6ded3289:4916afbe09bcf1649eb38f45787ef870';
const MODELO_IMAGEN = 'fal-ai/nano-banana-pro';
const MODELO_REMBG = 'fal-ai/birefnet/v2';

// URL del backend (server.js corriendo en localhost:3000)
const API_BACKEND = 'http://localhost:3000';

const PLANTILLA_IMAGEN = `A stylized original character inspired by the visual style of Persona 5 Royal (original design, not based on any existing character).

Bold thick black ink outlines, flat cel-shaded colors, strong hard shadows with high contrast. Sharp angular facial features, graphic novel aesthetic. Strictly 2D illustration, no soft shading, no gradients, no 3D rendering.

A [GENERO] character, front view, framed from head to upper torso, like an official character card portrait, centered composition, square format.

Skin tone: [TONO_DE_PIEL].
Eyes: sharp [FORMA_DE_OJOS], [COLOR_DE_OJOS] irises, intense and confident gaze.
Hair: [CABELLO], drawn with clean stylized ink lines.
Distinct features: [RASGOS_DISTINTIVOS].
Outfit: [ROPA].
Head accessory: [ACCESORIO_CABEZA].
Additional details: [OTRO].

Colors must strictly match the described attributes.
Plain solid white background, clean, no decorations, no patterns, no environment.
Dramatic side lighting, strong hard shadows, high contrast.
Clean linework, sharp composition, professional character design.`;

// ============================================
// ESTADO
// ============================================
let playerData = {};
let debugMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('playerData');
    if (savedData) { playerData = JSON.parse(savedData); log('Datos cargados:', playerData); }
    if (!FAL_API_KEY) { actualizarDialogo('Error', 'Falta API Key'); return; }
    setTimeout(iniciarGeneracion, 500);
});

function log(...args) { if (debugMode) console.log('[DEBUG NanaBanana]', ...args); }

function getAvatarImg() { return document.querySelector('.avatar-main'); }
function getDialogTitle() { return document.querySelector('.dialog-box .title'); }
function getDialogText() { return document.querySelector('.dialog-box p'); }
function getSkipBtn() { return document.getElementById('skip-btn'); }

const skipButton = getSkipBtn();
if (skipButton) { skipButton.addEventListener('click', () => { window.location.href = '../index.html'; }); }

function iniciarGeneracion() {
    const avatarImg = getAvatarImg();
    actualizarDialogo('WorldHack', 'Creando tu avatar...');
    if (avatarImg) {
        avatarImg.style.width = '400px'; avatarImg.style.height = '400px';
        avatarImg.style.objectFit = 'contain'; avatarImg.style.opacity = '0.3';
        avatarImg.style.filter = 'grayscale(1)'; avatarImg.style.transition = 'all 0.5s';
    }
    generarImagen();
}

function generarPrompt() {
    const d = playerData;
    const valid = d && Object.keys(d).length > 0 && d.genero !== 'default';

    return PLANTILLA_IMAGEN
        .replace('[GENERO]', valid ? d.genero || 'Masculino' : 'Masculino')
        .replace('[TONO_DE_PIEL]', valid ? d.tonoPiel || 'Pale' : 'Pale')
        .replace('[FORMA_DE_OJOS]', valid ? d.formaOjos || 'Large' : 'Large')
        .replace('[COLOR_DE_OJOS]', valid ? d.colorOjos || 'Blue' : 'Blue')
        .replace('[CABELLO]', valid ? d.cabello || 'Short black' : 'Short black')
        .replace('[RASGOS_DISTINTIVOS]', valid && d.rasgosPiel !== 'default' ? d.rasgosPiel : 'None')
        .replace('[ACCESORIO_CABEZA]', valid && d.accesorioCabeza !== 'default' ? d.accesorioCabeza : 'None')
        .replace('[ROPA]', valid ? d.ropa || 'School uniform' : 'School uniform')
        .replace('[OTRO]', valid && d.otro !== 'default' ? d.otro : '');
}

// Agrega esta pequeña utilidad al inicio de script.js
function moverBarra(porcentaje) {
    const barra = document.querySelector(".progress-bar");
    if (barra) {
        barra.style.width = porcentaje + "%";
        barra.textContent = porcentaje + "%";
    }
}

// ============================================
// PIPELINE: NanaBanana → BiRefNet → Guardar en SQL → Mostrar
// ============================================
async function generarImagen() {
    try {
        const prompt = generarPrompt().replace(/\n/g, ' ').trim();
        log('Prompt:', prompt.substring(0, 200) + '...');

        // ──── PASO 1: Generar imagen ────
        moverBarra(30);
        actualizarDialogo('Paso 1/3', 'Generando avatar...');

        const requestBody = {
            prompt: prompt,
            num_images: 1,
            aspect_ratio: '1:1',
            output_format: 'png',
            safety_tolerance: '5',
            resolution: '1K',
            limit_generations: true
        };

        const response = await fetch(`https://fal.run/${MODELO_IMAGEN}`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) { const err = await response.text(); log('Error:', err); throw new Error(`Error ${response.status}`); }

        const data = await response.json();
        log('Respuesta fal.ai:', data);

        const imagenUrl = data.images?.[0]?.url;
        if (!imagenUrl) throw new Error('No se recibió URL de imagen');

        // ──── PASO 2: Remover fondo ────
        moverBarra(60);
        actualizarDialogo('Paso 2/3', 'Removiendo fondo...');
        const imagenFinal = await removerFondo(imagenUrl);

        // ──── PASO 3: Guardar en Azure SQL ────
        moverBarra(90);
        actualizarDialogo('Paso 3/3', 'Guardando avatar...');
        await guardarEnSQL(imagenFinal);

        // ──── Mostrar resultado ────
        moverBarra(100);
        mostrarResultado(imagenFinal);

    } catch (error) {
        log('Error:', error);
        actualizarDialogo('Error', error.message);
        mostrarError();
    }
}

// ============================================
// REMOVER FONDO
// ============================================
async function removerFondo(imagenUrl) {
    try {
        const response = await fetch(`https://fal.run/${MODELO_REMBG}`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imagenUrl, model: 'Portrait', operating_resolution: '1024x1024' })
        });
        if (!response.ok) return imagenUrl;
        const data = await response.json();
        return data.image?.url || imagenUrl;
    } catch (e) { return imagenUrl; }
}

// ============================================
// GUARDAR IMAGEN EN AZURE SQL
// Descarga la imagen, la convierte a base64 y la envía al backend
// ============================================
async function guardarEnSQL(imagenUrl) {
    try {
        // Obtener id_jugador de localStorage (lo puede setear el login o el form)
        const idJugador = obtenerIdJugador();

        log(`Descargando imagen para guardar (jugador ${idJugador})...`);

        // Descargar la imagen como blob
        const imgResponse = await fetch(imagenUrl);
        if (!imgResponse.ok) throw new Error('No se pudo descargar la imagen');

        const blob = await imgResponse.blob();

        // Convertir blob a base64
        const base64 = await blobToBase64(blob);

        log(`Imagen convertida a base64 (${(base64.length / 1024).toFixed(1)} KB)`);

        // Enviar al backend
        const saveResponse = await fetch(`${API_BACKEND}/api/avatar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_jugador: idJugador,
                avatar_base64: base64
            })
        });

        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.error || 'Error al guardar');
        }

        const result = await saveResponse.json();
        log('Avatar guardado en SQL:', result);

        // Guardar también el id en localStorage para referencia
        localStorage.setItem('avatarGuardado', 'true');
        localStorage.setItem('idJugador', idJugador.toString());

    } catch (error) {
        // Si falla el guardado, no bloquear al usuario — solo logear
        log('Error al guardar en SQL (no crítico):', error.message);
        console.warn('El avatar se generó pero no se pudo guardar en la base de datos:', error.message);
    }
}

// ============================================
// UTILIDADES
// ============================================

// Obtener o generar id_jugador
function obtenerIdJugador() {
    return 1;
}

// Convertir Blob a base64 string
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // incluye el prefijo data:image/...
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// UI
// ============================================
function mostrarResultado(url) {
    const img = getAvatarImg(); if (!img) return;
    img.src = url; img.alt = 'Avatar generado';
    img.style.opacity = '1'; img.style.filter = 'none';
    img.style.width = '300px'; img.style.height = '300px';
    img.style.objectFit = 'contain'; img.style.backgroundColor = 'transparent';
    actualizarDialogo('WorldHack', '¡Te quedó muy chido tu personaje!');
    const btn = getSkipBtn();
    if (btn) { btn.textContent = 'JUGAR'; btn.style.background = '#149414'; }
}

function mostrarError() {
    const img = getAvatarImg();
    if (img) { img.src = '../assets/img/avatar-generado-falso.png'; img.style.opacity = '1'; img.style.filter = 'none'; }
    actualizarDialogo('Error', 'No se pudo generar el avatar.');
}

function actualizarDialogo(titulo, mensaje) {
    const t = getDialogTitle(), p = getDialogText();
    if (t) t.textContent = titulo; if (p) p.textContent = mensaje;
    log(`[${titulo}] ${mensaje}`);
}
