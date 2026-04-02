const form = document.getElementById("player-form");
const skipBtn = document.getElementById("skip-btn");

/* ===== OMITIR ===== */
skipBtn.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que quieres omitir?");

    if (!confirmar) return;

    const playerData = {
        genero: "default",
        tonoPiel: "default",
        formaOjos: "default",
        colorOjos: "default",
        cabello: "default",
        rasgosPiel: "default",
        accesorioCabeza: "default",
        ropa: "default",
        otro: "default"
    };


    localStorage.setItem("playerData", JSON.stringify(playerData));

    window.location.href = "/WorldHack-Perception-frontend/cargando.html";
});

/* ===== GUARDAR FORM ===== */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const playerData = {
        genero: formData.get("genero"),
        tonoPiel: formData.get("tonoPiel"),
        formaOjos: formData.get("formaOjos"),
        colorOjos: formData.get("colorOjos")
    }

    if (!playerData.genero || !playerData.tonoPiel || !playerData.formaOjos || !playerData.colorOjos) {
        alert("Completa todos los campos");
        return;
    }
    localStorage.setItem("playerData", JSON.stringify(playerData));

    window.location.href = "/WorldHack-Perception-frontend/form2.html"


});
