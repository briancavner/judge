const ui = {
    divs: {},
    animations: {},
    speechQueue: [],

    clearSpeak: function() {
        if (ui.divs.bubble) {
            ui.divs.bubble.remove();
            ui.divs.bubble = null;
        }
    },

    speak: function(speaker, message) {
        document.body.onclick = null;
        if (arguments.length === 0) {
            if (ui.speechQueue.length === 0) {
                ui.clearSpeak();
                return;
            }

            const nextLine = ui.speechQueue.splice(0, 1)[0];
            speaker = Object.keys(nextLine)[0];
            message = nextLine[speaker];
        }

        const bubble = document.createElement("div");

        bubble.classList.add(`${speaker}Speech`, "speech")
        bubble.innerHTML = message;

        ui.clearSpeak();
        ui.divs.bubble = bubble;
        ui.divs.speech.appendChild(bubble);
        setTimeout(function() {
            document.body.onclick = function() {
                ui.speak();
            }
        }, 600)
    },

    makeLitigants: function() {
        const litigants = ["plaintiff", "defendant"];
        const Litigant = function(litigant) {
            const self = this;
            const headDiv = document.createElement("div");
            const bodyDiv = document.createElement("div");
            const lecternDiv = document.createElement("div");
            const headAnimation = function(head) {
                let rand = tools.rand(0, 200) / 10;
                
                if (!head.style.transform) {
                    rand *= tools.rand(-1, 1);
                } else if(parseInt(head.style.transform.split("rotate(")[1].split("deg)")[0]) > 0) {
                    rand *= -1;
                }

                head.style.transform = `rotate(${rand}deg)`;

                ui.animations[litigant] = setTimeout(function() {headAnimation(head)}, tools.rand(7000, 18000));
            }

            self.div = document.createElement("div");

            headDiv.classList.add("litHead");
            bodyDiv.classList.add("litBody");
            lecternDiv.classList.add("lectern");

            headDiv.style.backgroundImage = `url("/assets/img/heads/${data.current[litigant].appearance.head}.png")`
            bodyDiv.style.backgroundImage = `url("/assets/img/bodies/${data.current[litigant].appearance.body}.png")`
            lecternDiv.style.backgroundImage = `url("/assets/img/lectern.png")`

            headAnimation(headDiv);

            self.div.appendChild(bodyDiv);
            self.div.appendChild(headDiv);
            self.div.appendChild(lecternDiv);
        };

        for (let i = 0; i < litigants.length; i++) {
            ui.divs[litigants[i]].innerHTML = "";
            clearTimeout(ui.animations[litigants[i]]);
            
            const newLitigant = new Litigant(litigants[i]);
            ui.divs[litigants[i]].appendChild(newLitigant.div);
        }
    },

    makeDesk: {
        tweak: function(div) {
            div.style.marginTop = `${tools.rand(-30, 30) / 100}%`;
            div.style.marginLeft = `${tools.rand(-30, 30) / 100}%`;
            div.style.transform = `rotate(${tools.rand(-40, 40) / 10}deg)`;
        },

        icon: function(type) {
            const div = document.createElement("div");

            div.classList.add("icon", type);
            ui.makeDesk.tweak(div);

            return div;
        },

        item: function(type, content) {
            const div = document.createElement("div");
            const contentDiv = document.createElement("div");

            contentDiv.classList.add("content");
            contentDiv.appendChild(content)
            
            div.classList.add("item", type);
            div.appendChild(contentDiv);

            return div;
        },
    },

    addToDesk: function(item) {
        ui.divs.desk.appendChild(item.icon.div);
        ui.divs.items.appendChild(item.div);
    },

    showIcon: function(div) {
        div.style.top = null;
        ui.makeDesk.tweak(div);
    },

    hideIcon: function(div) {
        div.style.top = "150%";
    },

    showItem: function(div, closeFunc) {
        div.style.marginTop = 0;
        ui.divs.blocker.style.opacity = ".7";
        ui.divs.blocker.style.pointerEvents = "auto";
        ui.divs.blocker.onclick = function() {
            closeFunc();
        }
        ui.divs.backdrop.onclick = function() {
            closeFunc();
        }
    },

    hideItem: function(div) {
        div.style.marginTop = null;
        ui.divs.blocker.style.opacity = null;
        ui.divs.blocker.style.pointerEvents = null;
        ui.divs.blocker.onclick = null;
        ui.divs.backdrop.onclick = null;
    },

    init: function() {
        ui.divs.backdrop = document.createElement("div");
        ui.divs.canvas = document.createElement("div");
        ui.divs.items = document.createElement("div");
        ui.divs.desk = document.createElement("div");
        ui.divs.plaintiff = document.createElement("div");
        ui.divs.defendant = document.createElement("div");
        ui.divs.blocker = document.createElement("div");
        ui.divs.speech = document.createElement("div");
        
        ui.divs.backdrop.id = "backdrop";
        ui.divs.canvas.id = "canvas";
        ui.divs.items.id = "items";
        ui.divs.desk.id = "desk";
        ui.divs.plaintiff.id = "plaintiff";
        ui.divs.defendant.id = "defendant";
        ui.divs.blocker.id = "blocker";

        ui.divs.plaintiff.classList.add("litigant");
        ui.divs.defendant.classList.add("litigant");

        ui.divs.canvas.appendChild(ui.divs.desk);
        ui.divs.canvas.appendChild(ui.divs.plaintiff);
        ui.divs.canvas.appendChild(ui.divs.defendant);
        ui.divs.canvas.appendChild(ui.divs.speech);
        ui.divs.canvas.appendChild(ui.divs.blocker);
        ui.divs.canvas.appendChild(ui.divs.items);
        document.body.appendChild(ui.divs.backdrop);
        document.body.appendChild(ui.divs.canvas);
    },
};