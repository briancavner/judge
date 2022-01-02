const init = function() {
    ui.init();
    audio.init();
    ui.showMenu("start");
};

window.addEventListener("load", init);