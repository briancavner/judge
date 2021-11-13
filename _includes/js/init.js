const init = function() {
    ui.init();
    audio.init();
    data.loadCase(1);
};

window.addEventListener("load", init);