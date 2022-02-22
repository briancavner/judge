const ui = {
    divs: {},
    animations: {},

    speech: {
        close: function(respond = false) {
            if (ui.divs.bubble) {
                ui.divs.bubble.remove();
                ui.divs.bubble = null;
            }

            if (respond) {
                ui.divs.respond.style.display = null;
            }
        },

        speak: function(speaker, message) {
            const bubble = document.createElement("div");

            bubble.classList.add(`${speaker}Speech`, "speech")
            bubble.innerHTML = message;

            ui.speech.close();
            ui.divs.bubble = bubble;
            ui.divs.speech.appendChild(bubble);
        },

        respond: function(speaker, message, noButtons, inadmissible, admissible, sass) {
            const cont = document.createElement("button");
            cont.innerHTML = "Continue";
            cont.classList.add("continue");
            cont.onclick = function() {
                if (inadmissible) {
                    verdict.missInadmissible(inadmissible.type, message);
                }
                if (sass) {
                    verdict.missSass(speaker);
                }
                ui.divs.respond.innerHTML = "";
                speech.speak();
            }
            ui.divs.respond.appendChild(cont);

            if (speaker !== "j" && !noButtons) {
                const inad = document.createElement("button");
                const sassy = document.createElement("button");
                inad.innerHTML = "Inadmissible";
                inad.classList.add("inadmissible");
                sassy.innerHTML = "Sass";
                sassy.classList.add("sass");
                inad.onclick = function() {
                    ui.divs.respond.innerHTML = "";
                    speech.empty();
                    if (inadmissible) {
                        speech.speak(data.noButtons(inadmissible.convo));
                        verdict.findInadmissible(inadmissible.type, message);
                    } else {
                        delete speech.endFunction;
                        speech.speak(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"));
                        if (admissible) {
                            verdict.wrongInadmissible(message, admissible.note)
                        } else {
                            verdict.wrongInadmissible(message);
                        }
                    }
                }
                sassy.onclick = function() {
                    ui.divs.respond.innerHTML = "";
                    if (sass) {
                        speech.addToFront(data.noButtons(sass.convo));
                        verdict.findSass(speaker);
                    } else {
                        speech.addToFront(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"))
                        verdict.wrongSass(speaker);
                    }
                    speech.speak();
                }
                ui.divs.respond.appendChild(inad)
                ui.divs.respond.appendChild(sassy)
            }

            ui.divs.respond.style.display = "block";
        },

        transcribe: function(speaker, message, newline, contradiction) {
            const span = document.createElement("span");
            span.classList.add("contradictory");
            span.innerHTML = message;
            span.onclick = function() {
                transcript.check(speaker, message, contradiction);
            }
            if (newline) {
                const p = document.createElement("p");
                p.innerHTML = `<span style="font-weight:bold">${data.speakers[speaker]}</span>: `;
                p.appendChild(span);

                ui.divs.transcript.appendChild(p);
                ui.divs.transcriptLine = p;
            } else {
                ui.divs.transcriptLine.appendChild(span);
            }
        },
    },

    contradiction: function(speaker, line1, line2) {
        const div = ui.divs.contradiction;
        const h1 = document.createElement("h1");
        const h2 = document.createElement("h2");
        const p1 = document.createElement("p");
        const p2 = document.createElement("p");
        
        h1.innerHTML = "Contradiction?";
        h2.innerHTML = data.speakers[speaker];
        p1.innerHTML = line1;
        
        div.innerHTML = "";
        div.appendChild(h1);
        div.appendChild(h2);
        div.appendChild(p1);

        if (line2) {
            p2.innerHTML = line2;
            div.appendChild(p2);
        }
    },

    verdict: function() {
        const ruling = {
            coa: {},
        };
        const submitChecklist = [];
        const div = document.createElement("div");
        const h1 = document.createElement("h1");
        const rulingContainer = document.createElement("div");
        const award = document.createElement("input");
        const awardLabel = document.createElement("label");
        const dollarSign = document.createElement("div");
        const awardAmount = document.createElement("input");
        const submit = document.createElement("button");

        const claimPlural = function(num) {
            if (num > 1) {
                return "these claims";
            }
            return "this claim";
        };

        const rulingMade = function() {
            for (let i = 0; i < data.current.coas.length; i++) {
                if (!submitChecklist[i * 2].checked && !submitChecklist[i * 2 + 1].checked){
                    return false;
                }
            }

            return true;
        }

        h1.innerHTML = "Judge's Ruling";
        rulingContainer.classList.add("rulingContainer");

        div.appendChild(h1);
        div.appendChild(rulingContainer);
        
        for (let i = 0; i < data.current.coas.length; i++) {
            const subDiv = document.createElement("div");
            const p = document.createElement("p");
            const liableBox = document.createElement("div");
            const liableInput = document.createElement("input")
            const liableLabel = document.createElement("label");
            const liableSpan = document.createElement("span");
            const liableFace = document.createElement("img");
            const xliableBox = document.createElement("div");
            const xliableInput = document.createElement("input")
            const xliableLabel = document.createElement("label");
            const xliableSpan = document.createElement("span");
            const xliableFace = document.createElement("img");

            subDiv.classList.add("subDiv");

            liableInput.type = "radio";
            liableInput.name = `verdict${i}`
            liableSpan.innerHTML = "Plaintiff";
            liableBox.classList.add("liableBox", "liablePlaintiff");
            liableFace.src = `/assets/img/heads/${data.current.plaintiff.appearance.head}.png`

            liableInput.onclick = function() {
                ruling.coa[data.current.coas[i]] = true;

                if (rulingMade()) {
                    submit.disabled = false;
                }
            }

            xliableInput.type = "radio";
            xliableInput.name = `verdict${i}`
            xliableSpan.innerHTML = "Defendant";
            xliableBox.classList.add("liableBox", "liableDefendant");
            xliableFace.src = `/assets/img/heads/${data.current.defendant.appearance.head}.png`

            xliableInput.onclick = function() {
                ruling.coa[data.current.coas[i]] = false;

                if (rulingMade()) {
                    submit.disabled = false;
                }
            }

            p.innerHTML = `On the claim of ${tools.capitalize(data.current.coas[i].replace(/_/g, " "))}, I find in favor of the:`

            submitChecklist.push(liableInput, xliableInput)

            subDiv.appendChild(p);
            subDiv.appendChild(liableLabel);
            liableLabel.appendChild(liableInput);
            liableLabel.appendChild(liableBox);
            liableBox.appendChild(liableFace);
            liableBox.appendChild(liableSpan);
            subDiv.appendChild(xliableLabel);
            xliableLabel.appendChild(xliableInput);
            xliableLabel.appendChild(xliableBox);
            xliableBox.appendChild(xliableSpan);
            xliableBox.appendChild(xliableFace);
            rulingContainer.appendChild(subDiv);
        }

        submit.innerHTML = "Render Verdict";
        submit.disabled = true;
        submit.onclick = function() {
            if (!rulingMade()) {
                return;
            }

            desk.items.verdict.div.style.marginTop = "-100%";
            ui.divs.blocker.style.opacity = 1;
            ui.divs.blocker.onclick = null;
            ui.divs.backdrop.onclick = null;

            ruling.award = award.value;
            verdict.submit(ruling);
        }

        award.type = "range";
        award.value = 0;
        award.min = 0;
        award.max = data.current.awardSought * 3;
        award.step = 1;
        award.id = `awardAmount`
        awardLabel.htmlFor = `awardAmount`
        awardLabel.innerHTML = `Plaintiff pleads relief in the sum of $${data.current.awardSought}. 
            On ${claimPlural(data.current.coas.length)}, I award the Plaintiff:`;
        dollarSign.innerHTML = "$";
        dollarSign.classList.add("dollarSign");
        awardLabel.id = "awardAmountLabel";
        awardAmount.type = "number";
        awardAmount.value = award.value;
        awardAmount.min = award.min;
        awardAmount.step = award.step;

        award.oninput = function() {
            awardAmount.value = award.value;
        }

        awardAmount.oninput = function() {
            const num = parseInt(awardAmount.value)
            if (awardAmount.value === "") {
                return;
            } else if (!Number.isInteger(num)) {
                awardAmount.value = award.value;
                return;
            } else if (num < award.min) {
                awardAmount.value = award.min;
            } else if (num > award.max) {
                awardAmount.value = award.max;
            }
            award.value = awardAmount.value;
        }

        div.appendChild(awardLabel);
        div.appendChild(awardAmount);
        div.appendChild(dollarSign);
        div.appendChild(award);
        div.appendChild(submit);

        return div;
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

        icon: function(type, extra) {
            const div = document.createElement("div");
            const img = document.createElement("img");

            div.classList.add("icon", type);
            img.src = `/assets/img/${type}.png`
            ui.makeDesk.tweak(div);

            if (type === "evidence") {
                div.classList.add(`slot${extra.slot}`, extra.type)
                img.src = `/assets/img/${extra.type}.png`
            }

            div.appendChild(img);
            
            return div;
        },

        item: function(type, content, extra) {
            const div = document.createElement("div");
            const contentDiv = document.createElement("div");

            contentDiv.classList.add("content");
            contentDiv.appendChild(content)
            
            div.classList.add("item", type);
            div.appendChild(contentDiv);

            switch (type) {
                case "evidence":
                    div.classList.add(extra.type);
                    break;
                case "transcript":
                    ui.divs.contradiction = document.createElement("div");
                    ui.divs.contradiction.classList.add("content2");
                    ui.divs.transcript = contentDiv;
                    div.appendChild(ui.divs.contradiction);
                    break;
                case "dictionary":
                    ui.divs.coa = document.createElement("div");
                    ui.divs.coa.classList.add("content2");
                    ui.divs.coa.appendChild(extra.content2);
                    div.appendChild(ui.divs.coa);
                    break;
            }

            return div;
        },
    },

    addToDesk: function(item) {
        // ui.hideIcon(item.icon.div);
        ui.divs.desk.appendChild(item.icon.div);
        ui.divs.items.appendChild(item.div);

        // setTimeout(function() {
        //     ui.showIcon(item.icon.div);
        // }, 100)
        // This would be to make it initially hidden and then come in
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
        ui.divs.blocker.style.opacity = null;
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
        ui.divs.blocker.style.opacity = 0;
        ui.divs.blocker.style.pointerEvents = null;
        ui.divs.blocker.onclick = null;
        ui.divs.backdrop.onclick = null;
    },

    showMenu: function(type) {
        const menuDiv = document.createElement("div");
        const caseDesc = document.createElement("div");
        const h1 = document.createElement("h1");
        const h2 = document.createElement("h2");
        const buttons = document.createElement("div");
        const howTo = document.createElement("button");
        const start = document.createElement("button");
        menuDiv.id = "mainMenu";
        caseDesc.classList.add("caseDesc");
        caseDesc.innerHTML = "<p>Choose a Case:</p>";
        h1.innerHTML = "Judge Shrewdy";
        h2.innerHTML = `It's <span class="i">your</span> courtroom`
        buttons.classList.add("mainMenuButtons");
        howTo.innerHTML = "How to Play";
        start.innerHTML = "Start Case";
        start.disabled = true;

        buttons.appendChild(howTo);
        buttons.appendChild(start);
        
        howTo.onclick = function() {
            const children = menuDiv.children;
            const divList = [];
            const h3 = document.createElement("h3");
            const buttonContainer = document.createElement("div");
            const backButton = document.createElement("button");

            for (let i = 0; i < children.length; i++) {
                divList.push(children[i])
            }
            
            backButton.onclick = function() {
                menuDiv.innerHTML = "";

                for (let i = 0; i < divList.length; i++) {
                    menuDiv.appendChild(divList[i]);
                }
            }


            h3.innerHTML = "How To Play";
            backButton.innerHTML = "Back";
            buttonContainer.classList.add("mainMenuButtons");

            menuDiv.innerHTML = "";
            menuDiv.appendChild(h3);

            for (let i = 0; i < data.dictionary.howToPlay.length; i++) {
                const p = document.createElement("p");
                p.innerHTML = data.dictionary.howToPlay[i];

                menuDiv.appendChild(p);
            }

            buttonContainer.appendChild(backButton);
            menuDiv.appendChild(buttonContainer);
        }

        start.onclick = function() {
            for (let i = 1; i <= Object.keys(data.cases).length; i++) {
                if (document.getElementById(`caseSelect${i}`).checked) {
                    data.loadCase(i);
                    menuDiv.remove();
                    ui.divs.blocker.style.opacity = 0;
                    audio.playSound("gavel");
                    return;
                }
            }
        }

        menuDiv.appendChild(h1);
        menuDiv.appendChild(h2);
        menuDiv.appendChild(caseDesc);

        for (let i = 1; i <= Object.keys(data.cases).length; i++) {
            const input = document.createElement("input");
            const label = document.createElement("label");
            const h3 = document.createElement("h3");
            input.type = "radio";
            input.id = `caseSelect${i}`
            // input.value = i;
            input.name = "caseSelect"
            h3.innerHTML = i;
            label.htmlFor = `caseSelect${i}`
            input.onclick = function() {
                const p = document.createElement("p");
                p.innerHTML = `<span class="b">${data.cases[`case${i}`].title}</span><br>${data.cases[`case${i}`].shortSum}`;
                caseDesc.innerHTML = "";
                caseDesc.appendChild(p);
                start.disabled = false;
            }

            label.appendChild(h3);
            menuDiv.appendChild(input);
            menuDiv.appendChild(label);
        }


        menuDiv.appendChild(buttons);

        ui.divs.canvas.appendChild(menuDiv);
    },

    finalScreen: function(text) {
        const div = document.createElement("div");
        const h1 = document.createElement("h1");
        const categories = ["coa", "award"]
        
        div.id = "finalScreen";
        h1.innerHTML = "Audience Feedback";

        div.appendChild(h1);

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];

            for (let j = 0; j < text[category].length; j++) {
                const p = document.createElement("p");
                p.innerHTML += `${text[category][j]} `;
                div.appendChild(p);
            }
        }

        ui.divs.canvas.appendChild(div);
        setTimeout(function() {
            div.style.opacity = 1;
        }, 1300)
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