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

    speak: function() {
        let speaker;
        let message;

        ui.clearSpeak();

        if (ui.speechQueue.length === 0) {
            ui.divs.respond.style.display = null;
            return;
        }

        const nextLine = ui.speechQueue.splice(0, 1)[0];

        // Is there a better way than this?
        if (nextLine.j) {
            speaker = "j";
        } else if (nextLine.p) {
            speaker = "p";
        } else {
            speaker = "d";
        }
        message = nextLine[speaker];

        const bubble = document.createElement("div");

        bubble.classList.add(`${speaker}Speech`, "speech")
        bubble.innerHTML = message;

        ui.divs.bubble = bubble;
        ui.divs.speech.appendChild(bubble);
        setTimeout(function() {
            ui.respond(speaker, message, nextLine.noButtons, nextLine.inadmissible)
        }, 600)
    },

    respond: function(speaker, message, noButtons, inadmissible) {
        const cont = document.createElement("button");
        cont.innerHTML = "Continue";
        cont.onclick = function() {
            if (inadmissible) {
                score.subtract(inadmissible, message);
            }
            ui.divs.respond.innerHTML = "";
            ui.speak();
        }
        ui.divs.respond.appendChild(cont);

        if (speaker !== "j" && !noButtons) {
            const inad = document.createElement("button");
            inad.innerHTML = "Inadmissible";
            inad.onclick = function() {
                ui.divs.respond.innerHTML = "";
                ui.speechQueue.splice(0, ui.speechQueue.length);
                if (inadmissible) {
                    ui.speechQueue = data.noButtons(inadmissible.convo);
                    score.add(inadmissible, message);
                } else {
                    ui.speechQueue.push(data.randomLine("j", "inadmissible"));
                    ui.speechQueue.push(data.randomLine(speaker, "admonished"));
                    score.miscall("inadmissible", message);
                }
                ui.speak();
            }
            ui.divs.respond.appendChild(inad)
        }

        ui.divs.respond.style.display = "block";
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
        const divs = {
            body: ["backdrop", "canvas"],
            canvas: ["desk", "plaintiff", "defendant", "speech", "respond", "blocker", "items"]
        };

        for (let i = 0; i < divs.body.length; i++) {
            const id = divs.body[i];
            
            ui.divs[id] = document.createElement("div");
            ui.divs[id].id = id;
            document.body.appendChild(ui.divs[id]);
        }

        for (let i = 0; i < divs.canvas.length; i++) {
            const id = divs.canvas[i];
            ui.divs[id] = document.createElement("div");
            ui.divs[id].id = id;
            ui.divs.canvas.appendChild(ui.divs[id]);
        }

        ui.divs.plaintiff.classList.add("litigant");
        ui.divs.defendant.classList.add("litigant");
    },
};