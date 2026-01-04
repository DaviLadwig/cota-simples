document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash");
    if (!splash) return;

    const jaEntrou = sessionStorage.getItem("splash_exibido");

    if (jaEntrou) {
        splash.remove();
        return;
    }

    setTimeout(() => {
        splash.style.opacity = "0";
        splash.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
            splash.remove();
            sessionStorage.setItem("splash_exibido", "true");
        }, 500);
    }, 1200);
});
