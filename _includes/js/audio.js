const audio = {
    soundChannels: [],
    activeChannel: 0,
    musicList: ["groove", "antigua"],

    playMusic: function() {
        audio.music.src = "/assets/audio/music/groove.mp3";
        audio.music.play();
    },

    playSound: function(sound) {
        const options = {
            paperUp: 2,
            paperDown: 2,
            gavel: 3,
        }
        let num = "";
        
        if (audio.activeChannel + 1 === audio.soundChannels.length) {
            audio.activeChannel = 0;
        } else {
            audio.activeChannel += 1;
        }

        if (sound in options) {
            num = `${tools.rand(1, options[sound])}`;
        }

        audio.soundChannels[audio.activeChannel].play(`${sound}${num}`);
    },

    init: function() {
        const audioDiv = document.createElement("div");
        const SoundChannel = function () {
            const div = document.createElement("audio");
            const self = this;
            div.style.display = "none";

            audioDiv.appendChild(div);

            self.play = function(filename) {
                div.pause();
                div.src = `/assets/audio/sound/${filename}.wav`;
                div.play();
            }
        };

        for (let i = 0; i < 3; i++) {
            audio.soundChannels[i] = new SoundChannel();
        }

        audioDiv.id = "audio";
        document.body.appendChild(audioDiv);

        //delow this is the old stuff

        window.onkeydown = function(key) {
            if (key.keyCode === 77) {
                if (!audio.music.paused) {
                    audio.music.pause();
                } else {
                    audio.playMusic();
                }
            }
        }


        tools.shuffle(audio.musicList);

        audio.music = document.createElement("audio");
        audio.music.volume = 0.4;
        audio.music.style.display = "none";
        document.body.appendChild(audio.music);
    },

    desk: function(type, direction) {
        switch (type) {
            case "verdict":
                if (direction === "up") {
                    audio.playSound("gavel");
                }
                break;
            default:
                audio.playSound(`paper${tools.capitalize(direction)}`);
        };
    },
};