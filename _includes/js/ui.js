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
                        verdict.add(sass, message);
                    } else {
                        speech.addToFront(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"))
                        verdict.miscall("sass", message);
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
        const award = document.createElement("input");
        const awardLabel = document.createElement("label");
        const awardAmount = document.createElement("input");
        const submit = document.createElement("button");

        const claimPlural = function(num) {
            if (num > 1) {
                return "these claims";
            }
            return "this claim";
        };

        div.appendChild(h1);
        
        for (let i = 0; i < data.current.coas.length; i++) {
            const subDiv = document.createElement("div");
            const p = document.createElement("p");
            const labelDiv = document.createElement("div");
            const switchSpan = document.createElement("span");
            const liableInput = document.createElement("input")
            const liableLabel = document.createElement("label");
            const xliableInput = document.createElement("input")
            const xliableLabel = document.createElement("label");

            h1.innerHTML = "Judge's Ruling";
            liableInput.type = "radio";
            liableInput.id = `findLiable${i}`
            liableInput.classList.add("liable");
            liableInput.name = `verdict${i}`
            liableLabel.htmlFor = `findLiable${i}`
            liableLabel.innerHTML = "Liable";
            liableLabel.classList.add("liableLabel");
            labelDiv.classList.add("liableSwitch");

            liableInput.onclick = function() {
                ruling.coa[data.current.coas[i]] = true;
            }

            xliableInput.type = "radio";
            xliableInput.id = `findNotLiable${i}`
            xliableInput.classList.add("notLiable");
            xliableInput.name = `verdict${i}`
            xliableLabel.htmlFor = `findNotLiable${i}`
            xliableLabel.innerHTML = "Not Liable";
            xliableLabel.classList.add("notLiableLabel");

            xliableInput.onclick = function() {
                ruling.coa[data.current.coas[i]] = false;
            }

            p.innerHTML = `On the claim of ${tools.capitalize(data.current.coas[i].replace(/_/g, " "))}, I find that the Defendant is:`

            submitChecklist.push(liableInput, xliableInput)

            subDiv.appendChild(p);
            subDiv.appendChild(liableInput);
            subDiv.appendChild(xliableInput);
            labelDiv.appendChild(liableLabel);
            labelDiv.appendChild(xliableLabel);
            labelDiv.appendChild(switchSpan);
            subDiv.appendChild(labelDiv);
            div.appendChild(subDiv);
        }

        submit.innerHTML = "Render Verdict";
        submit.onclick = function() {
            for (let i = 0; i < data.current.coas.length; i++) {
                if (!submitChecklist[i * 2].checked && !submitChecklist[i * 2 + 1].checked){
                    return;
                }
            }
            
            ui.divs.blocker.style.opacity = 1;
            ui.divs.blocker.style.pointerEvents = null;
            ui.divs.backdrop.style.pointerEvents = "none"
            desk.items.verdict.div.style.top = "-100%";

            ruling.award = award.value;
            verdict.submit(ruling);
        }

        award.type = "range";
        award.value = 0;
        award.min = 0;
        award.max = 5000;
        award.step = 5;
        award.id = `awardAmount`
        awardLabel.htmlFor = `awardAmount`
        awardLabel.innerHTML = `On ${claimPlural(data.current.coas.length)}, I award the Plaintiff:`;
        awardAmount.type = "number";
        awardAmount.value = 0;
        awardAmount.min = 0;
        awardAmount.max = 5000;

        award.oninput = function() {
            awardAmount.value = award.value;
        }

        awardAmount.oninput = function() {
            if (awardAmount.value !== "" && (!Number.isInteger(parseInt(awardAmount.value)) || awardAmount.value < 0 || awardAmount.value > 5000)) {
                awardAmount.value = award.value;
                return;
            }
            award.value = awardAmount.value;
        }

        div.appendChild(awardLabel);
        div.appendChild(awardAmount);
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