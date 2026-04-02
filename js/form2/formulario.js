const form = document.getElementById("player-form");
const btn = document.querySelector(".btn-create");


/* ===== GUARDAR FORM ===== */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    anime({
        targets: btn,
        scale: [1, 0.85, 1.05, 1],
        duration: 400,
        easing: "easeOutElastic(1, .6)",
        complete: () => {

            const formData = new FormData(form);

            // Obtener datos anteriores
            const existingData = JSON.parse(localStorage.getItem("playerData")) || {};

            // Nuevos datos
            const newData = {
                cabello: formData.get("cabello") || "default",
                rasgosPiel: formData.get("rasgosPiel") || "default",
                accesorioCabeza: formData.get("accesorioCabeza") || "default",
                ropa: formData.get("ropa") || "default",
                otro: formData.get("otro") || "default"
            };

            const playerData = {
                ...existingData,
                ...newData
            };

            // Guardar todo junto
            localStorage.setItem("playerData", JSON.stringify(playerData));

            localStorage.setItem("playerData", JSON.stringify(playerData));


            window.location.href = "/WorldHack-Perception-frontend/cargando.html"
            
        }

    });
});

//cambiar de colores los rectangulos input
const inputs = document.querySelectorAll(".input-group input");

inputs.forEach(input => {

    // Estado inicial
    if (!input.value) {
        input.classList.add("empty");
    }

    // Cuando escribe
    input.addEventListener("input", () => {
        if (input.value.trim() === "") {
            input.classList.add("empty");
            input.classList.remove("filled");
        } else {
            input.classList.remove("empty");
            input.classList.add("filled");
        }
    });

});