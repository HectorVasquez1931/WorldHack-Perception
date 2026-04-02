/* ===== WEBFONT LOADER ===== */
WebFont.load({
  google: {
    families: [
      'Quantico:400,700',
      'Tomorrow:400,700',
      'PT Sans:400,700'
    ]
  },

  active: function () {
    console.log("Fuentes cargadas correctamente");
    document.body.classList.add("fonts-loaded");
  },

  inactive: function () {
    console.log("Error cargando fuentes");
  }
});

/*
 ===== Pega estos dos antes de que termine el body  ===== 
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script src="webfonts.js"></script>
*/