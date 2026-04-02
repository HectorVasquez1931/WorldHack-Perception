const steps = [
    { msg: "Generando avatar...", step: "1" },
    { msg: "Removiendo fondo...", step: "2" },
    { msg: "Guardando avatar...", step: "3" },
    { msg: "IMAGEN", step: "MOSTRANDO" }
];

const cyberTips = [
    "Usa contraseñas diferentes: No uses la misma contraseña para tu correo, tus redes sociales y el banco. Si los atacantes descubren una, tendrán acceso a toda tu vida digital.",
    "Verificación en dos pasos: Actívala siempre que sea posible. Es ese código extra en el celular que te piden al entrar; es tu escudo más fuerte contra intrusos, incluso si descubren tu contraseña.",
    "Cuidado con las urgencias: Si te llega un mensaje o correo diciendo que tu cuenta será bloqueada o que ganaste algo y debes hacer clic 'ya mismo', ignóralo. Los estafadores usan la prisa para que no pienses con claridad.",
    "El banco no te pedirá tus claves: Si te llaman 'del banco' por un cargo no reconocido y te piden tu NIP o los números de tu tarjeta para 'cancelarlo', cuelga de inmediato. Es un fraude.",
    "Actualiza tus equipos: Cuando tu celular o computadora te avise que hay una actualización del sistema, instálala pronto. Los fabricantes las envían para tapar agujeros de seguridad que los delincuentes ya conocen.",
    "No confíes en el Wi-Fi público: Evita entrar a tu banco o hacer compras por internet cuando estés conectado al Wi-Fi gratuito de una plaza, aeropuerto o cafetería.",
    "Respalda tu información: Guarda tus fotos y documentos importantes en la nube (como Google Drive o iCloud) por si tu teléfono o computadora se descompone o te lo roban.",
    "Ponle clave a tu celular: Usa siempre un PIN, patrón o huella dactilar. Si lo pierdes, será mucho más difícil que alguien pueda acceder a tus correos o aplicaciones bancarias.",
    "Descarga de sitios oficiales: Baja aplicaciones únicamente de las tiendas oficiales (Play Store o App Store). Las aplicaciones gratuitas de páginas dudosas suelen traer virus escondidos.",
    "Cuidado con lo que publicas: No subas a redes sociales fotos de tus tarjetas, documentos de identidad, o boletos de avión (los códigos de barras contienen mucha información personal).",
    "Lee bien los remitentes: A veces te llega un correo que parece oficial, pero si revisas con cuidado la dirección de quien lo envía, verás letras raras o dominios falsos (ej. soporte@banco-seguro-web.com).",
    "Fíjate en el candado: Cuando vayas a poner una contraseña o hacer un pago, asegúrate de que la dirección de la página tenga el símbolo de un candado cerrado al principio.",
    "Usa tarjetas digitales: Para tus compras en internet, utiliza las tarjetas virtuales que genera la aplicación de tu banco. Su código de seguridad (CVV) cambia en cada compra, haciéndolas muy seguras.",
    "Bloquea tu pantalla: Si estás en una oficina, escuela o lugar público y te levantas de tu computadora, acostúmbrate a bloquear la pantalla para que nadie pueda ver tus cosas.",
    "Usa el sentido común: Si una oferta en internet suena demasiado buena para ser verdad, o si recibes un mensaje de un familiar pidiendo dinero urgente desde un número desconocido, casi siempre es una trampa."
];

function startAnimation() {
    const segments = document.querySelectorAll('.segment-big, .segment');
    const msgEl = document.getElementById('status-msg');
    const stepContainer = document.querySelector('.step-text');
    const tipsEl = document.querySelector('.tips');

    // Función para cambiar el consejo aleatorio
    function updateTip() {
        const randomIndex = Math.floor(Math.random() * cyberTips.length);
        tipsEl.innerText = cyberTips[randomIndex];
    }

    // Iniciar el primer consejo y el intervalo de 10 segundos
    updateTip();
    setInterval(updateTip, 10000);

    // 1. Definimos la línea de tiempo sin el modo "alternate"
    let tl = anime.timeline({
        easing: 'easeInOutQuad',
        duration: 1500,
        loop: false,

        //redireccionamiendo a la pagina de generar avatar
        complete: function () {
            // pequeño delay opcional para que se vea el último estado
            setTimeout(() => {
                window.location.href = "/WorldHack-Perception-frontend/generacionAvatar.html";
            }, 1000);
        }
    });

    // 2. Antes de empezar el loop (reinicio), limpiamos los colores
    tl.add({
        targets: segments,
        backgroundColor: 'rgba(255, 255, 255, 0.5);', // Color apagado original
        boxShadow: '0 0 0px #38B000',
        duration: 500,
        delay: 1000 // Pausa al final antes de reiniciar todo
    });

    // 3. Añadimos cada paso de forma acumulativa
    segments.forEach((el, i) => {
        tl.add({
            targets: el,
            backgroundColor: '#38B000',
            boxShadow: '0 0 15px #38B000',
            begin: function () {
                const current = steps[i];

                // Actualizamos el texto sincronizado con el cuadro actual
                if (current.step === "MOSTRANDO") {
                    stepContainer.innerHTML = `<span id="step-num">${current.step}</span>`;
                } else {
                    stepContainer.innerHTML = `Paso <span id="step-num">${current.step}</span>/3`;
                }
                msgEl.innerText = current.msg;
            }
        }, "-=200"); // El "-=200" hace que la transición sea más fluida entre cuadros
    });
}

startAnimation();