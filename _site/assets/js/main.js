
    const tester = function(caseNum) {
    const testCase = tools.deepCopy(data.cases[`${caseNum}`]);
    
    const testDict = function() {
        console.log("-- Dictionary test");
        for (let i = 0; i < testCase.dictionary.length; i++) {
            if (!data.dictionary[testCase.dictionary[i]]) {
                console.warn(`${testCase.dictionary[i]} is not in dictionary`)
            }
        }
        for (let i = 0; i < testCase.coa.length; i++) {
            if (!data.dictionary[testCase.coa[i]]) {
                console.warn(`Cause of Action "${testCase.coa[i]}" is not in dictionary`)
            }
        }
        console.log(`Dictionary test complete: ${testCase.dictionary.length} entries and ${testCase.coa.length} CoAs found`);
    };

    const getAllTags = function(array) {
        const tags = [];
        const looper = function(string) {
            const index = string.indexOf("[[")

            if (index === -1) {
                return;
            }

            const endIndex = string.indexOf("]]");
            let tag = string.substr(index + 2, endIndex - index - 2);
            if (tag.indexOf("|") !== -1) {
                tag = tag.substr(tag.indexOf("|") + 1)
            }

            tags.push(tag);
            looper(string.substr(endIndex + 2));
        }

        for (let i = 0; i < array.length; i++) {
            looper(array[i]);
        }

        return tags;
    };

    checkTags = function(pUsedTags, dUsedTags, pAvailableTags, dAvailableTags) {
        let errors = 0;
        console.log("-- Statement tag test");
        for (let i = 0; i < pUsedTags.length; i++) {
            if (pAvailableTags.indexOf(pUsedTags[i]) === -1) {
                console.warn(`Tag ${pUsedTags[i]} from complaint does not have a conversation`)
                errors += 1;
            }
        }
        for (let i = 0; i < pAvailableTags.length; i++) {
            if (pUsedTags.indexOf(pAvailableTags[i]) === -1) {
                console.warn(`Tag ${pAvailableTags[i]} has a conversation but is missing from complaint`)
                errors += 1;
            }
        }
        for (let i = 0; i < dUsedTags.length; i++) {
            if (dAvailableTags.indexOf(dUsedTags[i]) === -1) {
                console.warn(`Tag ${dUsedTags[i]} from response does not have a conversation`)
                errors += 1;
            }
        }
        for (let i = 0; i < dAvailableTags.length; i++) {
            if (dUsedTags.indexOf(dAvailableTags[i]) === -1) {
                console.warn(`Tag ${dAvailableTags[i]} has a conversation but is missing from response`)
                errors += 1;
            }
        }
        if (errors > 0) {
            console.log(`Statement tag test complete: ${errors} errors found`);
        } else {
            console.log(`Statement tag test complete: ${pUsedTags.length} plaintiff tags and ${pUsedTags.length} defendant tags`);
        }
    };

    addAddendums = function(source) {
        const addendums = Object.keys(testCase.addendums);
        let array = testCase[source];
        for (let i = 0; i < addendums.length; i++) {
            if (addendums[i].indexOf(source) !== -1) {
                array = array.concat(testCase.addendums[addendums[i]])
            }
        }
        return array;
    }

    testDict();
    checkTags(getAllTags(addAddendums("complaint")), getAllTags(addAddendums("response")), Object.keys(testCase.questioning.plaintiff), Object.keys(testCase.questioning.defendant));
};

const testAll = function() {
    for (testCase in data.cases) {
        console.log(`Testing ${testCase}`);
        tester(testCase);
    }
}

    const tools = {
    rand: function(a, b) {
        return Math.floor(Math.random() * (b - a + 1) + a);
    },

    greater: function(a, b) {
        if (a > b) {
            return a;
        }

        return b;
    },

    capitalize: function(string) {
        return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    },

    pickOne: function(array) {
        return array[tools.rand(0, array.length - 1)];
    },

    avgArray: function(array) {
        let subtotal = 0;

        for (let i = 0; i < array.length; i++) {
            subtotal += array[i];
        }

        return subtotal / tools.greater(1, array.length);
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const hold = array[i];
            array[i] = array[j];
            array[j] = hold;
        }
    },

    getAllKeys: function(obj) {
        let keys = [];
        for (let key in obj) {
            keys.push(key);
            if (typeof obj[key] === "object") {
                const subkeys = tools.getAllKeys(obj[key]);
                keys = keys.concat(subkeys.map(function(subkey) {
                    return key + "." + subkey;
                }));
            }
        }
        return keys;
    },

    deepCopy: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    padNumber: function(num, length) {
        let prefix = "";

        if (num < 0) {
            num *= -1;
            prefix = "-";
        }
        
        let str = `${num}`;
        while (str.length < length) {
            str = `0${str}`;
        }

        return `${prefix}${str}`;
    },
};

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

                ui.animations[litigant] = setTimeout(function() {headAnimation(head)}, tools.rand(5000, 13000));
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

    finalScreen: function(text, categories, score) {
        const div = document.createElement("div");
        const content = document.createElement("content");
        const h1 = document.createElement("h1");
        const finalScore = document.createElement("h2");
        const scoreComment = document.createElement("h3");
        const reset = document.createElement("button");

        const starify = function(num) {
            let str = "";
            
            for (let i = 0; i < 5; i++) {
                if (num >= 1) {
                    num -= 1;
                    str += `<span class="star gold"></span>`;
                } else if (num > 0) {
                    num = 0;
                    str += `<span class="star half"></span>`;
                } else {
                    str += `<span class="star"></span>`;
                }
            }

            return str;
        }
        
        div.id = "finalScreen";
        content.classList.add("content");
        h1.innerHTML = "Audience Feedback";

        content.appendChild(h1);

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];

            for (let j = 0; j < text[category].length; j++) {
                const p = document.createElement("p");
                p.innerHTML += `${text[category][j]} `;
                content.appendChild(p);
            }

            if (category === "inadmissible") {
                content.appendChild(text.inadmissibleCollapse)
            }
        }

        finalScore.innerHTML = starify(score);
        scoreComment.innerHTML = data.genericLines.finalScores[score];

        reset.innerHTML = "Back to Main Menu";
        reset.onclick = function() {
            ui.reset(div);
        }

        content.appendChild(finalScore);
        content.appendChild(scoreComment);
        content.appendChild(reset);

        div.appendChild(content);

        ui.divs.canvas.appendChild(div);
        setTimeout(function() {
            div.style.opacity = 1;
        }, 1300)
    },

    reset: function(finalScreen) {
        finalScreen.remove();
        desk.clear();
        ui.divs.blocker.style = null;
        ui.divs.plaintiff.innerHTML = "";
        ui.divs.defendant.innerHTML = "";

        ui.showMenu("start");
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

    const verdict = {
    log: {
        inadmissible: {
            found: [],
            missed: [],
            wrong: [],
        },
        sass: {
            p: {
                deserved: 0,
                extra: 0,
                missed: 0,
            },
            d: {
                deserved: 0,
                extra: 0,
                missed: 0,
            },
        },
        contradiction: {
            seenOnce: {},
            seenTwice: [],
            found: [],
        }
    },

    findInadmissible: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        verdict.log.inadmissible.found.push(entry);
    },

    missInadmissible: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        verdict.log.inadmissible.missed.push(entry);
    },

    wrongInadmissible: function(line, note = tools.pickOne(data.genericLines.admissible)) {
        verdict.log.inadmissible.wrong.push({line: line, note:note})
    },

    findSass: function(speaker) {
        verdict.log.sass[speaker].deserved += 1;
    },

    missSass: function(speaker) {
        verdict.log.sass[speaker].missed += 1;
    },

    wrongSass: function(speaker) {
        verdict.log.sass[speaker].extra += 1;
    },

    findContradiction: function(tag) {
        verdict.log.contradiction.seenTwice.splice(verdict.log.contradiction.seenTwice.indexOf(tag), 1)
        verdict.log.contradiction.found.push(tag);
    },

    process: function(ruling) {
        const categories = ["coa", "award", "contradiction", "inadmissible", "sass"];
        const text = {};
        const score = {};

        const allFalse = function(obj) {
            const keys = Object.keys(obj);

            for (let i = 0; i < keys.length; i++) {
                if (obj[keys[i]] === true) {
                    return false;
                }
            }

            return true;
        };

        const scoreCalculation = function() {
            const subtotals = [];

            const round = function(int) {
                return Math.round(2 * int) / 2;
            }
            
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                subtotals.push(round(tools.avgArray(score[category])))
            }

            return round(tools.avgArray(subtotals));
        }

        for (let i = 0; i < categories.length; i++) {
            text[categories[i]] = [];
            score[categories[i]] = [];
        }
        
        // Causes of Action
        if (transcript.log.length < 10) {
            score.coa.push(0);
            text.coa.push(data.genericLines.noQuestions);
        } else {
            for (let i = 0; i < data.current.coas.length; i++) {
                const coa = data.current.coas[i];
                
                if (ruling.coa[coa] !== data.current.coa[coa].liable) {
                    text.coa.push(data.current.coa[coa].note)
                    score.coa.push(1);
                } else {
                    score.coa.push(5);
                }
            };

            if (text.coa.length === 0) {
                text.coa.push(data.current.verdictRight);
            } else {
                text.coa.unshift(data.current.verdictWrong);
            }
        }

        // Verdict award

        if (allFalse(ruling.coa) && ruling.award > 0) {
        // If no liability is found, but money is awarded
            text.award.push(tools.pickOne(data.genericLines.notLiableMoney));
            score.award.push(0);
        } else if (Math.abs(ruling.award - data.current.awardRight) <= 10) {
        // If the amount awarded is right
            text.award.push(data.current.awardLines.right);
            score.award.push(5);
        } else {
        // If the amount awarded is wrong
            const wrongAwards = Object.keys(data.current.awardWrong);
            
            const checkWrongAwards = function() {
            // If the wrong amount is one of the predicted amounts
                for (let i = 0; i < wrongAwards.length; i++) {
                    if (Math.abs(ruling.award - wrongAwards[i]) <= 10) {
                        return {text: obj.line, score: obj.score};
                    }
                }

                if (ruling.award > data.current.awardRight) {
                // If the award is too high
                    return {text: data.current.awardLines.wrongHigh, score: 1};
                }

                // If the award is too low
                return {text: data.current.awardLines.wrongLow, score: 1};
            }
            
            let returnResults = checkWrongAwards() 
            score.award.push(returnResults.score)
            text.award.push(returnResults.text);
        }

        // Contradiction

        for (key in ruling.contradiction) {
            const contradiction = ruling.contradiction[key]
            text.contradiction.push(contradiction.note);

            if (contradiction.found) {
                score.contradiction.push(5)
            } else if (contradiction.seenTwice) {
                score.contradiction.push(3)
            } else if (contradiction.seenOnce) {
                score.contradiction.push(1.5)
            } else {
                score.contradiction.push(0)
            }
        }

        // Inadmissible

        const scoreToLine = function(int) {
            // That math is just to get -1, 0, 1, and 2 out of specific ranges (0, 0.5-2, 2.5-3.5, 4-5)
            const nonZero = tools.greater(int, 0.1);
            return Math.floor((nonZero - (1 / (10 * nonZero))) / 2 + 0.02);
        }

        const inadmissibleCollapse = document.createElement("div");
        inadmissibleCollapse.classList.add("collapse");

        for (let i = 0; i < 3; i++) {
            const loopList = ["found", "missed", "wrong"];
            const loopScores = [5, 1, 2];
            
            const inadmissibles = ruling.inadmissible[loopList[i]];

            console.log(inadmissibles)

            if (inadmissibles.length > 0) {
                const h4 = document.createElement("h4");
                h4.innerHTML = data.genericLines.inadmissibleHeader[loopList[i]]

                inadmissibleCollapse.appendChild(h4);
            }

            for (let j = 0; j < inadmissibles.length; j++) {
                const quote = document.createElement("p");
                const note = document.createElement("p");

                score.inadmissible.push(loopScores[i])
                
                quote.innerHTML = inadmissibles[j].line;
                note.innerHTML = inadmissibles[j].note;

                inadmissibleCollapse.appendChild(quote);
                inadmissibleCollapse.appendChild(note);
            }
        }

        if (score.inadmissible.length === 0) {
            score.inadmissible.push(0);
        }

        text.inadmissible.push(data.current.inadmissibleLines[scoreToLine(tools.avgArray(score.inadmissible))]);
        text.inadmissibleCollapse = inadmissibleCollapse;

        // Sass

        for (let i = 0; i < 2; i++) {
            const litigant = ["plaintiff", "defendant"][i]
            const sasses = ruling.sass[litigant[0]]
            
            if (sasses.deserved + sasses.extra === 0 && data.current[litigant].sass > 0) {
                text.sass.push(data.current.sassLines[litigant].tooSoft)
                score.sass.push(0);
            } else if (sasses.missed + data.current[litigant].sass > sasses.deserved + sasses.extra) {
                text.sass.push(data.current.sassLines[litigant].tooSoft)
                score.sass.push(1);
            } else if (sasses.extra > data.current[litigant].sass) {
                text.sass.push(data.current.sassLines[litigant].tooHard)
                score.sass.push(2);
            } else {
                text.sass.push(data.current.sassLines[litigant].justRight)
                score.sass.push(5);
            }
        }

        if (tools.avgArray(score.sass) <= 1) {
            text.sass.push(data.genericLines.doSass);
        }

        console.log(score);
        return {text: text, categories: categories, score: scoreCalculation()};
    },

    submit: function(ruling) {
        let results = {};

        ruling.contradiction = {};
        ruling.inadmissible = verdict.log.inadmissible;
        ruling.sass = verdict.log.sass;
        for (contradiction in data.current.contradictions) {
            ruling.contradiction[contradiction] = {};
            if (verdict.log.contradiction.found.includes(contradiction)) {
                ruling.contradiction[contradiction].found = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].found
            } else if (verdict.log.contradiction.seenTwice.includes(contradiction)) {
                ruling.contradiction[contradiction].seenTwice = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].missed
            } else if (Object.keys(verdict.log.contradiction.seenOnce).includes(contradiction)) {
                ruling.contradiction[contradiction].seenOnce = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].unseen
            } else {
                ruling.contradiction[contradiction].unseen = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].unseen
            }
        }


        results = verdict.process(ruling)
        
        console.log(ruling);
        console.log(results);
        
        // save results.score
        ui.finalScreen(results.text, results.categories, results.score);
    },
};

    const speech = {
    queue: [],

    tools: {
        process: function(input) {
            let array = [];

            if (Array.isArray(input[0])) {
                array = input[0];
            } else {
                for (let i = 0; i < input.length; i++) {
                    array.push(input[i])
                }
            };

            return array;
        }
    },

    add: function() {
        const array = speech.tools.process(arguments);

        for (let i = 0; i < array.length; i++) {
            speech.queue.push(array[i]);
        }
    },

    addToFront: function() {
        const array = speech.tools.process(arguments);

        speech.queue = array.concat(speech.queue);
    },

    empty: function() {
        speech.queue.splice(0, speech.queue.length);
    },

    speak: function() {
        if (arguments.length > 0) {
            speech.add(speech.tools.process(arguments));
        } else if (speech.queue.length === 0) {
            if (speech.endFunction) {
                speech.endFunction();
            }
            ui.speech.close(true);
            return;
        }

        const nextLine = speech.queue.splice(0, 1)[0];
        let speaker;
        let message;

        // Is there a better way than this?
        if (nextLine.j) {
            speaker = "j";
        } else if (nextLine.p) {
            speaker = "p";
        } else {
            speaker = "d";
        }
        message = nextLine[speaker];

        ui.speech.speak(speaker, message);
        transcript.add(speaker, message, nextLine.contradiction);

        if (nextLine.contradiction && 
            !verdict.log.contradiction.seenTwice.includes(nextLine.contradiction) &&
            !verdict.log.contradiction.found.includes(nextLine.contradiction)) {
                if (!Object.keys(verdict.log.contradiction.seenOnce).includes(nextLine.contradiction)) {
                    verdict.log.contradiction.seenOnce[nextLine.contradiction] = message;
                } else if (verdict.log.contradiction.seenOnce[nextLine.contradiction] !== message) {
                    delete verdict.log.contradiction.seenOnce[nextLine.contradiction];
                    verdict.log.contradiction.seenTwice.push(nextLine.contradiction);
                }
                const seens = Object.keys(verdict.log.contradiction.seenOnce)
                verdict.log.contradiction
        }

        if (nextLine.unlock) {
            desk.unlock(nextLine.unlock);
        }

        setTimeout(function() {
            ui.speech.respond(speaker, message, nextLine.noButtons, nextLine.inadmissible, nextLine.admissible, nextLine.sass)
        }, 600)
    },
};

const transcript = {
    log: [],

    check: function(speaker, message, contradiction) {
        if (!transcript.contradiction) {
            if (speaker === "j") {
                // send the message to a ui.error() function
                console.log("judge??");
            } else {
                transcript.contradiction = {
                    speaker: speaker,
                    message: message,
                    contradiction: contradiction,
                };
                ui.contradiction(speaker, message);
                console.log("contradiction stored");
            }
            return;
        }

        if (transcript.contradiction.speaker !== speaker) {
            // send the message to a ui.error() function
            console.log("different speaker!")
        } else if (transcript.contradiction.message === message) {
            console.log("same message!");
        } else if (!transcript.contradiction.contradiction || !contradiction || 
                transcript.contradiction.contradiction !== contradiction) {
            ui.contradiction(speaker, transcript.contradiction.message, message);
            console.log("not contradictory")
        } else if (verdict.log.contradiction.found.includes(contradiction)) {
            console.log("found already")
        } else {
            ui.divs.blocker.onclick(); // This is two times I've done this, it feels not good
            speech.speak(data.noButtons(data.current.contradictions[contradiction].convo));
            verdict.findContradiction(contradiction)
        }

        transcript.contradiction = null;
    },

    add: function(speaker, message, contradiction) {
        const lastline = transcript.log[transcript.log.length - 1];
        let newline = true;

        if (lastline && speaker === lastline.speaker) {
            newline = false;
        }
        ui.speech.transcribe(speaker, message, newline, contradiction);
        transcript.log.push({speaker: speaker, message: message, contradiction: contradiction})
    },
};

    const desk = {
    items: {},

    Icon: function(parent, type, extra) {
        const self = this;

        self.div = ui.makeDesk.icon(type, extra);
        self.div.onclick = function() {
            parent.open();
        }
    },

    Item: function(type, extra = {}) {
        const self = this;
        const writer = {
            complaint: "plaintiff",
            response: "defendant",
            evidence: "evidence",
        };

        const tagize = function(string) {
            const Keyword = function(keyword, displayText) {
                const self = this;

                self.div = document.createElement("span");
                self.div.classList.add("tag")
                self.div.innerHTML = displayText;
                self.div.onclick = function() {
                    ui.divs.blocker.onclick(); // Is there a better way to triggers closing the open Item?
                    speech.endFunction = function() {
                        self.div.classList.remove("tag");
                        self.div.classList.add("strikeTag");
                        self.div.onclick = null;
                    }
                    speech.speak(data.current.questioning[writer[type]][keyword].slice());
                }

                return self.div;
            };
            const p = document.createElement("p");

            while (string.length > 0) {
                const span = document.createElement("span");
                const startIndex = string.indexOf("[[");
                let substring;
                let button;

                if (startIndex > 0) {
                    const endIndex = string.indexOf("]]");
                    const tag = string.substring(startIndex + 2, endIndex)
                    const splitTag = tag.split("|")
                    
                    substring = string.substring(0, startIndex)
                    
                    button = new Keyword(splitTag[1] || splitTag[0], splitTag[0]);

                    string = string.replace(`[[${tag}]]`, "");
                } else {
                    substring = string;
                }

                string = string.replace(substring, "");

                span.innerHTML = substring;
                p.appendChild(span);
                if (button) {
                    p.appendChild(button);
                }
            }
            return p;
        };
        
        const makeContent = function() {

            const div = document.createElement("div");

            switch (type) {
                case "complaint":
                case "response":
                    const h1 = document.createElement("h1");
                    const h2 = document.createElement("h2");
                    const h3 = document.createElement("h3");
                    const h4 = document.createElement("h4");
                    const h5 = document.createElement("h5");
                    const attest = document.createElement("p")
                    const array = data.current[type];
                    const getFiler = function() {
                        if (type === "complaint") {
                            return "plaintiff";
                        }
                        return "defendant";
                    }

                    attest.style.marginTop = "2em";

                    h1.innerHTML = `In the matter of:</br>
                        <span style="font-style: italic">${data.current.plaintiff.name} v. ${data.current.defendant.name}</span>`;
                    h2.innerHTML = `Case Number #${data.current.caseNum}`;
                    h3.innerHTML = tools.capitalize(`${getFiler()}'s ${type}`);
                    attest.innerHTML = "I hearby attest to the truthfulness and completeness of the foregoing,"
                    h4.innerHTML = `<div class="signature">${data.current[getFiler()].name}</div>
                        ${tools.capitalize(getFiler())}`
                    h5.innerHTML = `Case Number #${data.current.caseNum}`;

                    div.appendChild(h1);
                    div.appendChild(h2);
                    div.appendChild(h3);

                    for (let i = 0; i < array.length; i++) {
                        const p = tagize(array[i]);
                        div.appendChild(p);
                    }

                    div.appendChild(attest);
                    div.appendChild(h4);
                    div.appendChild(h5);

                    break;
                case "dictionary":
                    const dictName = function(tag) {
                        tag = tag.replace(/_/g, " ");
                        return tools.capitalize(tag);
                    };
                    const navStrip = document.createElement("p");
                    navStrip.style.textAlign = "center";
                    div.appendChild(navStrip);

                    for (let i = 0; i < data.current.dictionary.length; i++) {
                        const p = document.createElement("p");
                        const name = data.current.dictionary[i];
                        const link = document.createElement("span");
                        link.innerHTML = `<span style="display:inline-block">| ${dictName(name)} |</span>`;
                        link.onclick = function() {
                            div.parentNode.scrollTop = p.offsetTop;
                        }
                        p.innerHTML = `<span style="font-weight:bold">${dictName(name)}</span>: 
                            ${data.dictionary[name]}`;

                        navStrip.appendChild(link);
                        div.appendChild(p);
                    }

                    extra.content2 = document.createElement("div");
                    extra.content2.innerHTML = `<h1>Cause(s) of Action</h2><p>${data.dictionary["cause_of_action"]}</p>`;

                    for (let i = 0; i < data.current.coas.length; i++) {
                        const p = document.createElement("p");
                        const name = data.current.coas[i];
                        const ol = document.createElement("ol");
                        
                        p.innerHTML = `<span style="font-weight:bold">${dictName(name)}</span>:`;

                        for (let j = 0; j < data.dictionary[name].length; j++) {
                            const li = document.createElement("li");
                            li.innerHTML = data.dictionary[name][j];
                            ol.appendChild(li);
                        }

                        p.appendChild(ol);
                        extra.content2.appendChild(p);
                    }
                    break;
                case "evidence":
                    const arr = extra.content;
                    const styleLine = function(line) {
                        if (typeof(line) === "string") {
                            return tagize(line);
                        }

                        const lineDiv = tagize(line.line);
                        lineDiv.style = line.style;
                        return lineDiv;
                    }
                    for (let i = 0; i < arr.length; i++) {
                        const p = styleLine(arr[i]);
                        div.appendChild(p);
                    }
                    break;
                case "verdict":
                    div.appendChild(ui.verdict());
                    break;
            }


            return div;
        };

        self.open = function() {
            ui.hideIcon(self.icon.div);
            ui.showItem(self.div, self.close);
            audio.desk(type, "up");
        };

        self.close = function() {
            ui.showIcon(self.icon.div);
            ui.hideItem(self.div);
            audio.desk(type, "down");
        };

        self.remove = function() {
            self.div.remove();
            self.icon.div.remove();
            delete desk.items[type];
        };

        self.addendum = function(array) {
            const h3 = document.createElement("h3");
            const insertBefore = self.content.childNodes[self.content.childNodes.length - 2]
            h3.innerHTML = "Amendment";

            self.content.insertBefore(h3, insertBefore);

            for (let i = 0; i < array.length; i++) {
                const p = tagize(array[i])
                self.content.insertBefore(p, insertBefore);
            }
        };

        self.type = type;
        self.icon = new desk.Icon(self, type, extra);
        self.content = makeContent();
        self.div = ui.makeDesk.item(type, self.content, extra);
    },

    unlock: function(unlock) {
        if (unlock.addendum) {
            const type = unlock.addendum.replace(/[0-9]/g, '')
            desk.items[type].addendum(data.current.addendums[unlock.addendum]);
        }
        if (unlock.evidence) {
            const evidence = data.current.evidence[unlock.evidence];
            desk.addEvidence(evidence);
        }
    },

    addItem: function(item) {
        const newItem = new desk.Item(item);
        desk.items[item] = newItem
        ui.addToDesk(newItem);
    },

    clear: function() {
        const items = Object.keys(desk.items);
        for (let i = 0; i < items.length; i++) {
            desk.items[items[i]].remove();
        }
    },

    addEvidence: function(evidence) {
        const newItem = new desk.Item("evidence", evidence);
        desk.items[`evidence${evidence.slot}`] = newItem;
        ui.addToDesk(newItem);
    },

    make: function() {
        if (!data.current) {
            console.warn("No case loaded");
            return;
        };
        desk.addItem("complaint");
        desk.addItem("response");
        desk.addItem("transcript");
        desk.addItem("dictionary");
        desk.addItem("verdict");
    },
};

    const data = {
    cases: {"case1":{"title":"A Petition Pursuant to a Pulverized Pig Pen","coa":{"trespass_to_chattel":{"liable":false,"note":"Trespass to chattel would have required the Defendant to intentionally break the maneaur grate, but it seems like it was an accident."},"negligence":{"liable":false,"note":"The Defendant's actions didn't seem negligent. It's not clear that she failed to exercise reasonable care. It seems like she was using the maneaur grate normally, and breaking it is not a reasonably foreseeable outcome of normal use."}},"summary":["Plaintiff <<pname>> says that Defendant <<dname>> broke her manure grate during an important social gathering at her pen, leading to embarassment and financial loss. She is suing for $<<awardSought>>, the cost to replace her grate.","<<dtlname>> says that many people had used the manure grate that night, and that she was not the one to break it."],"shortSum":"A manure grate broken during a barnyard shindig can be fixed, but the friendship it also broke could never be repaired.","awardSought":260,"plaintiff":{"name":"Sally Swineman","title":"Ms.","appearance":{"head":3,"body":6},"sass":2},"defendant":{"name":"Carla Heiferson","title":"Ms.","appearance":{"head":6,"body":2},"sass":1},"dictionary":["comparative_fault","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a [[long-time resident|long]] of Flourishing Fields, and a respected member of the community. The Defendant, <<dtlname>>, is my neighbor and former friend.","On the evening of October 11, I invited <<dtlname>> and several other community members to a [[social gathering|gathering]] at my pen. The farm was going to elect a [[new livestock representative|rep]], and I wanted to run, so I was having a little campaign party to get the support of my friends.","About two hours into the event, we had just had dinner, and <<dtlname>> went to the [[manure grate|grate]]. She was in there for [[twenty minutes|time]], and I heard a loud crack while she was using it. When she came out I asked if everything was alright, and she said yes but she [[looked guilty|guilty]]. I [[discovered later|later]] when another guest tried to use the grate that <<dtlname>> had [[intentionally broken it|intentional]].","I [[confronted]] <<dtlname>> about it and she denied breaking my grate. I told her [[I didn't believe her|believe]], and she starting [[making a scene|scene]]. When I asked her to leave, she said some very nasty things to me and stormed out.","The evening at that point was pretty much ruined and everyone left shortly after her. I was so embarassed.","I got [[an estimate|estimate]] to fix my manure grate the next day. It cost $<<awardSought>>, and I believe <<dtlname>> is [[responsible]] because she is the one who broke the grate."],"response":["My neighbor, <<ptlname>>, invited me and some other neighbors over for dinner and to chit-chat. I had been over [[several times|several]] and considered her a good friend.","<<ptlname>> started talking about some kind of election she was running in, and I left to use the grate. There wasn't any problem with it when I got in there.","After about [[twenty minutes|minutes]] I came back, and very shortly afterward, <<ptlname>> started interrogating me. I didn't know what it was about at first, but then she said I had broken her grate and wanted me to pay for it."],"addendums":{"response1":["I was too embarassed to admit it, which is why I initially lied and pretended that I didn't know what happened to the manure grate.","When I was [[using it|using]], I [[heard a sort of pop|pop]], and then when I checked the grate, I saw that it had broken. I tried to clean up the mess as best as I could while I was trying to think of what to say to <<ptlname>>.","I decided I wanted to tell her the truth privately, but when I saw how upset she was, and that she expected me to pay for it, I was too nervous to say anything at all. It was an accident, and [[I didn't think I should be responsible|responsible]] for fixing her grate.","I hoped she would eventually get less angry so I could admit things to her then, but then I found out she was suing me and never got the chance."]},"evidence":{"estimate":{"type":"invoice","slot":1,"content":["<h3>Gilbert Goat's Grates and Gutters</h3>","To: <<pname>>, 14 Flourishing Fields","Dated: October 12","&nbsp;",{"line":"<span style=\"float:left;\">Manure Grate</span> [[$190|price]]","style":"text-align:right;display:list-item;margin-left:3em;padding-right:1em;"},{"line":"Warrantee, 5 years<span style=\"float:right;\">$0</span>","style":"display:list-item;margin-left:3em;padding-right:1em;"},{"line":"Installation (2 hours)<span style=\"float:right;\">$70</span>","style":"display:list-item;margin-left:3em;padding-right:1em;"},"&nbsp;",{"line":"Total<span style=\"float:right;\">$260</span>","style":"padding-left:4em;padding-right:4em;"},"&nbsp;","Thank you for choosing Gilbert Goat's Grates and Gutters. Our Prices Won't Be Bleat!&trade; Please send payment within thirty (30) days of receiving this invoice."]}},"questioning":{"plaintiff":{"believe":[{"j":"Why didn't you believe <<dtlname>> when she said she hadn't broken the grate?"},{"p":"I was actually a little afraid it might happen when I saw her go in there, Your Honor."},{"p":"Everyone knows about <<dtlname>>'s weight issue, it's not a secret around the farm.","sass":{"convo":[{"j":"Don't tell me \"what everyone knows\", just tell me why you say were afraid it might happen."}]}},{"p":"My good girlfriend Lana Lamb had told me that she saw <<dtlname>> nearly knock over a fence when she leaned on it.","inadmissible":{"type":"hearsay","convo":[{"j":"I'm not interested in what your good girlfriend told you. If you were so concerned about <<dtlname>>'s weight, why did you invite her over?"},{"p":"I didn't know she would break anything, Your Honor. I trusted her to be more careful."}]}},{"p":"I value my stuff, and I didn't want it bent or broken. So I was listening while she was in there and heard the crack, and knew right away what happened."}],"confronted":[{"j":"When you spoke with <<dtlname>> after discovering your grate had broken, what did you say?"},{"p":"I said, \"<<dfname>>, is there anything you want to tell me about my manure grate?\"","sass":{"convo":[{"j":"Do you really expect me to believe from the tone of your complaint that <span class=\"i\">that</span> is how you asked her?"}]}},{"d":"That is so not true, <<pfname>>, and you know it. You came at me yelling right from the beginning.","sass":{"convo":[{"j":"Hey, hey <<dtlname>>, do I look like I'm in need of help from you?"},{"d":"I'm sorry, Your Honor."}]}},{"p":"I did not, <<dfname>>, I was not angry until you started denying it.","sass":{"convo":[{"j":"Stop talking to each other. When you're here, talk to me. Answer my question."}]}},{"p":"I guess I was a little upset at first, but I said, \"<<dfname>>, I know you broke my grate and I want you to pay for it\""},{"j":"And what did she say?"},{"p":"She just denied it! I told her that she was the only one who was using the grate, so it had to have been her, but she just denied it."}],"estimate":[{"j":"I'd like to see the estimate to have your grate fixed."},{"p":"Yes, Your Honor, here it is.","noButtons":true,"unlock":{"evidence":"estimate"}}],"gathering":[{"j":"Was this the first time you hosted a social gathering?"},{"p":"No, I have had them all over before, multiple times &mdash; <<dtlname>> included."},{"p":"There had never been an issue before. We had always gotten along fine."}],"grate":[{"j":"Tell me about your manure grate."},{"p":"It's a typical manure grate, same as the ones in all the other pens in the farm."},{"p":"I never had an issue with it before. <<dtlname>> has even used it."},{"p":"But I guess that was before she put on some weight.","sass":{"convo":[{"j":"Let me tell you something, madam, you are no petite piglet yourself, so I don't want to hear your comments about her weight."},{"d":"Thank you, Your Honor."}]},"admissible":{"note":"Even though the Plaintiff said this as a rude personal attack, the fact that the Defendant gained weight might be relevant in determining how and why the grate broke. Ironically, the Plaintiff's insult ends up being evidence against her case; if the grate broke as a result of the Defendant's weight, it suggests that she did not intentionally or negligently break it."}}],"guilty":[{"j":"Why do you say that <<dtlname>> \"looked guilty\"? What was she doing?"},{"p":"She wouldn't make eye contact, she seemed nervous, her face was flushed pink, she was jittering..."},{"p":"If you ask me, those are all telltale signs of a liar who is feeling guilty about <span class=\"i\">something</span>.","inadmissible":{"convo":[{"j":"I didn't ask you, <<ptlname>>, because you're not an expert in psychiatry. Unless you have a diploma you'd like you show me?"},{"p":"No, Your Honor."},{"j":"I asked you how she looked and what she was doing. Don't speculate about her state of mind unless you're an expert, got it?"},{"p":"Yes, Your Honor."}]}},{"p":"I found out later that it was the manure grate."}],"intentional":[{"j":"Tell me why you think <<dtlname>> broke your grate intentionally."},{"p":"I've been thinking she wanted to sabotage my dinner party and make me look bad in front of my other friends."},{"j":"Why would she want to make you look bad?"},{"p":"Probably because she's jealous of me maybe becoming livestock rep and wanted to sabotage my chances.","contradiction":"intentional"},{"d":"I never wanted to do that, <<pfname>>."}],"later":[{"j":"If you thought <<dtlname>> had broken your manure grate, why didn't you check it right away?"},{"p":"I wanted to, but I was busy hosting the party, Your Honor. Cooking and entertaining at the same time."},{"p":"I planned to check as soon as I could pull myself away, but another guest went to the grate about 10 minutes later and then came right out and got me."},{"p":"She said that my manure grate was broken, and that she thought it looked like someone had smashed it.","inadmissible":{"type":"hearsay","convo":[{"j":"Don't tell me what she thought or what she said unless she's here to speak for herself."},{"j":"Tell me what you did, and what you saw."},{"p":"I went to look at the manure grate and saw that it was broken. No one else had used it after <<dtlname>>."}],"note":"Hearsay is problematic because it is unreliable. There is no way to examine the truth of the claim \"it looked like someone had smashed it\" unless the person who said that is in court."}},{"p":"So I went in and checked, and sure enough, it was broken. No one had used it after <<dtlname>>."}],"long":[{"j":"How long have you been a resident at Flourishing Fields, <<ptlname>>?"},{"p":"About 8 years, Your Honor. I moved there after Truffle School."},{"j":"Have you repaired or replaced your manure grate in that time?"},{"p":"No, it's been the same one since I moved in. No prior problems with it."}],"responsible":[{"j":"Tell me why you believe the Defendant is responsible for the damage to your grate."},{"p":"It's just common sense, Your Honor. \"You break it, you buy it.\""},{"p":"If you break something that belongs to someone, you have to pay to fix it."},{"p":"I don't want <<dfname>> to prison or nothing. I just want her to pay for what she broke."}],"rep":[{"j":"What is involved in being the livestock representative?"},{"p":"Chairing the monthly meeting, bringing community concerns to Farmer O'dell, supervising the recreation budget, that sort of thing."},{"j":"And was there anyone present that evening who seemed opposed to your candidacy, <<ptlname>>?"},{"p":"No, Your Honor. Everyone was really supportative and nice.","contradiction":"intentional"}],"scene":[{"j":"In what way did the Defendant \"make a scene\", <<ptlname>>?"},{"p":"She just kept denying breaking the grate, which was getting me frustrated, so I was insisting to her that I knew she did and I expected her to pay to fix it."}],"time":[{"j":"Did you keep a stopwatch running while she was using your manure grate, <<ptlname>>?"},{"p":"No, nothing like that, Your Honor."},{"p":"But I heard the crack right after she went in there, so I was waiting for her to come out, and I happened to notice how long she took."}]},"defendant":{"several":[{"j":"When you had gone to <<ptlname>>'s residence in the past, had you used her manure grate?"},{"d":"Yes, Your Honor. Several times. I never had an issue with it before.","contradiction":"unused"},{"d":"I'm not sure why <<ptlname>> would think I would break her grate. I had no reason at all to do that."}],"minutes":[{"j":"Is 20 minutes at the manure grate a typical amount of time for you?"},{"d":"Oh, no Your Honor, but it wasn't like I was using that time to break the grate, or anything."},{"d":"It was just hard for me to figure out how to use the grate. It took me several minutes to figure out.","contradiction":"unused","sass":{"convo":[{"j":"You don't strike me as that dumb of a woman, <<dtlname>>."},{"d":"Thank you, Your Honor."},{"d":"...I think?"}]}}],"pop":[{"j":"Describe the pop you heard and what you were doing at the time, <<dtlname>>."},{"d":"It was just a \"pop\". It sounded like something came loose or maybe cracked below me."},{"d":"I wasn't doing anything out of the ordinary, Your Honor. Just standing there."},{"d":"I hadn't started, you know, \"going\" yet. It was only a few seconds after I put my weight on the grate."}],"using":[{"j":"Were you doing anything unusual with or on the manure grate?"},{"d":"No, Your Honor, just using it normally."},{"p":"It didn't break when everyone else was using it normally.","sass":{"convo":[{"j":"I didn't ask for your input, <<ptlname>>."},{"d":"I apologize, Your Honor."}]}}],"responsible":[{"j":"Tell me why you don't think you should be responsible, <<dtlname>>."},{"d":"Because it was an accident, Your Honor. I didn't do anything to her grate. I was gentle and didn't mean for it to break."},{"p":"Hey, \"you break it, you buy it\", <<dfname>>. Same thing. If you break it, you pay for it.","sass":{"type":"crosstalk","convo":[{"j":"If I want you to speak, <<ptlname>>, I will ask you a question. Until then, I want you to be quiet."}]}}]},"evidence":{"price":[{"j":"Yowch, this is a pricy meatball."},{"p":"You suck!"},{"d":"SUUUUCK!"},{"j":"Bailiff, clear the courtroom!"}]}},"contradictions":{"intentional":{"convo":[{"j":"I don't think you really believe that the Defendant damaged your manure grate intentionally, <<ptlname>>."},{"p":"She might have."},{"j":"Listen, I might have been a supermodel instead of a judge, but I'm smarter than I am beautiful, so I'm here."},{"d":"You know I wouldn't do that on purpose, <<pfname>>"}],"found":"You caught the Defendant in a contradiction! Sometimes litigants will lie about things they're embarassed about, even if it doesn't affect their legal liability. But catching these deceptions can help encourage them to be more honest about things that do matter, so well done on your digging!","missed":"There seemed to be something contradictory about what the Defendant was saying. She seemed to be hiding something about her trip to the maneaur grate. Maybe she was embarassed with something and concealing the truth?","unseen":"There was something untrustworthy about the Defendant that seemed unexplored. Perhaps asking more questions about a topic a litigant is trying to conceal will reveal information they would prefer you not to have?"},"unused":{"convo":[{"j":"You say you have used <<ptlname>>'s manure grate on several occassions, <<dtlname>>?"},{"d":"Yes, that's right."},{"p":"That's true, Your Honor."},{"j":"But this time it took 20 minutes to figure out?"},{"d":"..."},{"j":"Had you suffered from any brain trauma since the last time you used her grate, <<dtlname>>?"},{"d":"No, Your Honor."},{"d":"The truth is I did see the grate break, and I was trying to clean it up so no one would notice. I know that was wrong, but I was so embarassed about it, Your Honor."},{"d":"But I didn't break it on purpose, I promise!"},{"j":"I want you to submit an addendum to your Response, <<dtlname>>. And I want the truth this time.","unlock":{"addendum":"response1"}}],"found":"You caught the Defendant in a contradiction! Sometimes litigants will lie about things they're embarassed about, even if it doesn't affect their legal liability. But catching these deceptions can help encourage them to be more honest about things that do matter, so well done on your digging!","missed":"There seemed to be something contradictory about what the Defendant was saying. She seemed to be hiding something about her trip to the maneaur grate. Maybe she was embarassed with something and concealing the truth?","unseen":"There was something untrustworthy about the Defendant that seemed unexplored. Perhaps asking more questions about a topic a litigant is trying to conceal will reveal information they would prefer you not to have?"}},"verdictWrong":"The network's legal experts think you may have made a mistake in your ruling.","verdictRight":"The network's legal experts are very happy with your ruling! You seem to have understood and applied the law well, and came to the correct verdict.","awardRight":0,"awardWrong":{"70":{"line":"You seem to have awarded an amount just for the labor costs. If the Defendant were liable, she would be responsible for more than just the labor; she would have to pay for a reasonably similar gate replacement too.","score":2},"190":{"line":"You seem to have awarded an amount just for the grate costs, minus labor. If the Defendant were liable, she would be responsible for all of the fees associated with replacing the grate, which would include reasonable labor costs.","score":2},"260":{"line":"But you did award the correct amount of money, if the Defendant would have been liable. Unfortunately, it looks like this verdict is going to have to come out of your show's budget.","score":3}},"awardLines":{"right":"You were correct to award the Plaintiff no money on her claim. You may have noticed that you can award up to three times what the Plaintiff is requesting, so consider this for future cases!","wrongHigh":"Even if the Defendant were liable, the award you chose does not seem consistent with the evidence. Make sure to review everything thoroughly, otherwise your ruling may be subject to review! We will have to pay for that verdict from your show's budget.","wrongLow":"This line is unused (#102)"},"sassLines":{"plaintiff":{"tooSoft":"The audience thought the Plaintiff came off as a bit of a jerk, and that you let her off too easy. Don't let a litigant get away with being a bully.","tooHard":"Although the Plaintiff was a bit of a jerk, the audience thought you were a bit too hard on her. It's important to call out a litigant, but don't become a bully yourself.","justRight":"The audience thought the Plaintiff was a bit of a bully, and enjoyed watching you put her in her place. You controlled your courtroom well!"},"defendant":{"tooSoft":"The Defendant seemed shifty, and the audience want you to be a little rougher with her. They feel like she got away with too much, even if she wasn't responsible.","tooHard":"The Defendant came off sympathetic to the audience, and they didn't like how rough you were with her. Although you can be tough with rude litigants, make sure you ease off a bit if they only make a few mistakes.","justRight":"They thought your treatment of the Defendant was appropriate -- tough enough without becoming unnecessarily rude."}},"inadmissibleLines":{"2":"You did a great job identifying the admissibility of evidence on hearsay and relevance grounds! Litigants don't know the law, and will continue to try to get this evidence admitted in future cases, so keep your eyes sharp!","1":"Although you made a few mistakes with admissibility, hopefully this case helped you sharpen your ability to spot hearsay and irrelevance! You will continue to see these in future cases. Check the legal dictionary if you need some more help.","0":"You may want to review the legal dictionary for hearsay and relevance. Catching inadmissible statements is an important part of being a judge, but you also don't want to be overzealous and block admissable ones!","-1":"You didn't ask enough questions to determine if you could catch hearsay or irrelevant testimony."}}},

    dictionary: {"cause_of_action":"The grounds on which the Plaintiff is suing the Defendant. A Plaintiff will win their lawsuit if they can satisfactorily prove all of the elements of their chosen cause of action.","chattel":"Personal property, which is everyone someone owns except for cash, real property (like land or houses), and intellectual property (like patents and trademarks).","comparative_fault":"In lawsuits for neglient actions, you may consider to what degree you believe the plaintiff is responsible, and adjust your award proportionally. For instance, you may award $70 on a $100 claim if you believe the defendant was 70% responsible and the plaintiff was 30% responsible.","conversion":["The plaintiff owned or had the right to possess the property;","The defendant substantially interfered, took possession, prevented access, destroyed, or refused to return the property;","The defendant's actions were intentional and authorized; and","The act indefinitely deprived the plaintiff of their property."],"character_propensity":"Evidence or testimony about a person's character or personality traits is inadmissible when used to suggest that the person has a greater propensity or is more likely to have done something they are accused of.","hearsay":"Generally, a statement is inadmissible if it is both a) made outside of the courtroom, and b) offered as evidence to prove that the content of the statement is true (e.g. offering the out-of-court statement, \"it's raining\" to prove that it was raining). There are many exceptions to the general rule of hearsay.","howToPlay":["You are the newest judge of Animal Court TV. To be successful, you will have to discover the truth of the case before you, while also keeping the home audience entertained.","On your desk will be the Plaintiff's Complaint in the folder with the Pi (&pi;) symbol, and the Defendant's Response in the folder with the Delta (&Delta;) symbol. Both contain highlighted key terms that you can click to question the litigant about it.","During questioning, you have 3 options, you may allow the litigant to Continue to speak, rule that their testimony is Inadmissible, or give them a bit of Sass.","To help you find Inadmissible testimony, read the legal dictionary on your desk during the case. It will explain the types of testimony you need to look out for.","Sass will entertain the audience, but only if the litigant deserves it. Bullying a sympathetic litigant might make the audience turn against you.","Check the Transcript on your desk to identify potential contradictions. Click two contradictionary sentences to question the litigant about their error.","Try to find all of the relevant evidence. Spotting contraidctions and raising questions about claims that require additional evidence will often result in more submissions from the litigants.","When you are ready to rule, click the gavel. You will need to side with a litigant and decide an award, if any. Then afterward, you will explain your ruling, so be prepared!"],"negligence":["The defendant should have, and failed to, exercise reasonable care toward the plaintiff or their property;","The plaintiff suffered recognizable damages from personal injury or impairment to their property; and","The damages were a reasonably forseeable outcome of the defendant's actions."],"opinion":"Speculation, such as  is usually iadmissible,","relevance":"Testimony must be relevant to proving or disproving the Cause of Action to be admissible. The threshold for relevance is lenient; as long as a statement is reasonably probative of a consequential fact, it can be admitted.","standard_of_evidence":"In civil court, cases are decided \"by a preponderance of the evidence\". This is a lesser standard than \"beyond a reasonable doubt\", which is used in criminal court. The Plaintiff has the burden of proof, and prevails if you rule that it is more likely than not &mdash; in other words, that there is a greater than 50% chance &mdash; that their story is true.","statement_by_party_opponent":"(Hearsay Exception) Statements made by the opposing party are not hearsay, and are admissible as evidence.","trespass_to_chattel":["The plaintiff owned or had the right to possess the property;","The defendant damaged the property, or interfered with its ownership or enjoyment;","The damage or interference was intentional and unauthorized; and","The plaintiff suffered damages from the property's impairment or loss of use."]},

    genericLines: {"admonish":["I'm a rodent. Do you think they put me up here because I'm pretty or because I'm smart?","If you lived to be 60, you wouldn't be as smart as I am in one whisker.","This is my animal kingdom, sweet cheeks, not yours.","Did you come here just to humiliate yourself in front of ten million animals watching at home?","Don't paint stripes on a horse and try to tell me it's a zebra.","You need a therapist, not a judge."],"admonished":["Sorry, Your Honor.","Pssh, screw that.","Wow, that was way harsh.","..."],"admissible":["This line wasn't inadmissible","This line was admissible","You should have let them testify about this","This was okay to testify about","This testimony should have been permitted"],"noQuestions":"If you don't engage with the litigants enough, the audience won't believe you have enough information to make a ruling. If not only to verify your opinion, at least ask a few questions to entertain the viewers!","notLiableMoney":["However, if you do not find the Defendant liable for any of the causes of action, an award of money is not appropriate."],"inadmissibleHeader":{"found":"Inadmissible Statements Found","missed":"Inadmissible Statements Missed","wrong":"Misidentified Admissible Statements"},"finalScores":{"0":"We're doomed!","0.5":"Are you trying to make this network fail?","1":"The network won't even air this episode","1.5":"People aren't going to watch this","2":"We'll need a lot of improvement","2.5":"That was okay, but we need you to be a star!","3":"Not bad, but keep improving!","3.5":"You almost got it, just need a bit of polish","4":"That was pretty good, nicely done!","4.5":"Great job, that was amazing!","5":"Wonderfully done, you're truly a master judge!"},"doSass":"If you want the audience to stay engaged, you will have to show more sass. If the litigants aren't giving you enough to work with, ask questions that lure them into saying things you can quip about."},

    uiText: {"howToPlay":["You are the newest judge of a daytime court TV show in the animal kingdom, Judge Shrewdy! To be successful, you will have to discover the truth of the case before you, while also keeping the home audience entertained.","On your desk will be several documents that you can examine by clicking. You should start with the Plaintiff's Complaint and the Defendant's Response to get some context to the case. These are in folders marked with the &pi; and &Delta; symbols. They contain highlighted key terms that you can click to begin questioning the litigant to find more information or press them on a suspicious claim.","During questioning, you have 3 options, you may allow the litigant to Continue to speak, rule that their testimony is Inadmissible, or give them a bit of Sass.","To help you find Inadmissible testimony, read the legal dictionary on your desk during the case. It will explain the types of testimony you need to look out for.","Sass will entertain the audience, but only if the litigant deserves it. Bullying a sympathetic litigant might make the audience turn against you.","Check the Transcript on your desk to identify potential contradictions. Click two contradictionary sentences to question the litigant about their error.","Try to find all of the relevant evidence. Spotting contraidctions and raising questions about claims that require additional evidence will often result in more submissions from the litigants.","When you are ready to rule, click the gavel. You will need to side with a litigant and decide an award, if any. Then afterward, you will explain your ruling, so be prepared!"]},

    speakers: {
        j: "Judge",
        p: "Plaintiff",
        d: "Defendant",
    },

    processVars: function(obj) {
        const vars = {
            pname: obj.plaintiff.name,
            ptitle: obj.plaintiff.title,
            dname: obj.defendant.name,
            dtitle: obj.defendant.title,
            awardSought: obj.awardSought,
        };

        vars.pfname = vars.pname.split(" ")[0];
        vars.plname = vars.pname.split(" ")[1];
        vars.ptlname = `${vars.ptitle} ${vars.plname}`;
        vars.dfname = vars.dname.split(" ")[0];
        vars.dlname = vars.dname.split(" ")[1];
        vars.dtlname = `${vars.dtitle} ${vars.dlname}`;

        const varReplace = function(string) {
            if (typeof string !== "string") {
                return string;
            }
            const index = string.indexOf("<<")
            
            if (index === -1) {
                return string;
            }

            const variable = string.substr(index + 2, string.indexOf(">>") - index - 2);

            return varReplace(string.replace(`<<${variable}>>`, vars[variable]))
        };

        const looper = function(subobj) {
            for (let key in subobj) {
                if (typeof subobj[key] === "object") {
                    subobj[key] = looper(subobj[key]);
                } else {
                    subobj[key] = varReplace(subobj[key]);
                }
            }
            return subobj;
        }

        looper(obj);
        return obj;
    },

    loadCase: function(caseNum) {
        const selectedCase = tools.deepCopy(data.cases[`case${caseNum}`]);
        data.current = data.processVars(selectedCase);
        data.current.coas = Object.keys(data.current.coa);
        data.current.caseNum = `${tools.rand(100, 999)}${tools.padNumber(caseNum, 3)}`
        data.current.saveSlot = caseNum;

        desk.make();
        ui.makeLitigants();
    },

    noButtons: function(array) {
        for (let i = 0; i < array.length; i++) {
            array[i].noButtons = true;
        }
        return array;
    },

    randomLine: function(speaker, type) {
        const results = {};
        const line = tools.pickOne(data.genericLines[type]);
        results[speaker] = line;
        results.noButtons = true;

        return results;
    },
};

    const init = function() {
    ui.init();
    audio.init();
    ui.showMenu("start");
};

window.addEventListener("load", init);
