// TODOS los botones (efecto normal)
const botones = document.querySelectorAll("button");

botones.forEach(btn => {
    btn.addEventListener("click", () => {
        anime({
            targets: btn,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: "easeOutQuad"
        });
    });
});

// BOTONES ESPECIALES (más animación)
const botonesEspeciales = document.querySelectorAll("#skip-btn, #btn-siguiente");

botonesEspeciales.forEach(btn => {
    btn.addEventListener("click", () => {
        anime({
            targets: btn,
            scale: [1, 0.9, 1.05, 1],
            duration: 300,
            easing: "easeOutQuad"
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const btnSiguiente = document.getElementById("btn-siguiente");

    // TODOS los radios
    const radios = document.querySelectorAll('input[type="radio"]');

    function verificarFormulario() {
        const genero = document.querySelector('input[name="genero"]:checked');
        const tono = document.querySelector('input[name="tonoPiel"]:checked');
        const ojos = document.querySelector('input[name="formaOjos"]:checked');
        const color = document.querySelector('input[name="colorOjos"]:checked');

        if (genero && tono && ojos && color) {
            btnSiguiente.classList.add("active");
        } else {
            btnSiguiente.classList.remove("active");
        }
    }

    // Escuchar cambios en TODOS los radios
    radios.forEach(radio => {
        radio.addEventListener("change", verificarFormulario);
    });

});