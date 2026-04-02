document.addEventListener("DOMContentLoaded", () => {
    anime({
        targets: '.bottom-ui',
        translateY: [200, 20],
        opacity: [0, 1],
        duration: 2000,
        easing: 'easeOutElastic'
    });
});