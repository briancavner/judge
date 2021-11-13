const audio = {
    musicList: ["groove", "antigua"],

    playMusic: function() {
        audio.music.src = "/assets/audio/music/groove.mp3";
        audio.music.play();
    },

    sfx: function(file) {

    },

    init: function() {
        window.onkeydown = function(key) {
            if (key.keyCode === 77) {
                if (!audio.music.paused) {
                    audio.music.pause();
                } else {
                    audio.playMusic();
                }
            }
        }

        const audioDiv = document.createElement("div");

        tools.shuffle(audio.musicList);

        audio.music = document.createElement("audio");
        audio.music.volume = 0.4;
        audio.music.style.display = "none";
        document.body.appendChild(audio.music);
    },
};