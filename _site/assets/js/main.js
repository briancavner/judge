
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

    const tools = {
    rand: function(a, b) {
        return Math.floor(Math.random() * (b - a + 1) + a);
    },

    capitalize: function(string) {
        return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    },

    pickOne: function(array) {
        return array[tools.rand(0, array.length - 1)];
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
};

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
                    verdict.subtract(inadmissible, message);
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
                        verdict.add(inadmissible, message);
                    } else {
                        speech.speak(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"));
                        if (admissible) {
                            verdict.miscall("inadmissible", message, admissible.note)
                        } else {
                            verdict.miscall("inadmissible", message);
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

            div.classList.add("icon", type);
            ui.makeDesk.tweak(div);

            if (type === "evidence") {
                div.classList.add(`slot${extra.slot}`, extra.type)
            }

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
        const howTo = document.createElement("button");
        const start = document.createElement("button");
        menuDiv.id = "mainMenu";
        caseDesc.classList.add("caseDesc");
        h1.innerHTML = "Judge Shrewdy";
        h2.innerHTML = `It's <span class="i">your</span> courtroom`
        howTo.innerHTML = "How to Play";
        start.innerHTML = "Start Case";
        start.disabled = true;

        howTo.onclick = function() {
            return;
        }

        start.onclick = function() {
            for (let i = 1; i <= Object.keys(data.cases).length; i++) {
                if (document.getElementById(`caseSelect${i}`).checked) {
                    data.loadCase(i);
                    menuDiv.remove();
                    ui.divs.blocker.style.opacity = 0;
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
            input.value = i;
            input.name = "caseSelect"
            h3.innerHTML = i;
            label.htmlFor = `caseSelect${i}`
            input.onclick = function() {
                caseDesc.innerHTML = `<span class="b">${data.cases[`case${i}`].title}</span><br>${data.cases[`case${i}`].shortSum}`;
                start.disabled = false;
            }

            label.appendChild(h3);
            menuDiv.appendChild(input);
            menuDiv.appendChild(label);
        }

        menuDiv.appendChild(howTo);
        menuDiv.appendChild(start);

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

    const verdict = {
    log: [],
    contradictions: [],

    add: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        verdict.log.push(entry);
    },

    subtract: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.weight *= -1;
        entry.line = line;
        verdict.log.push(entry);
    },

    miscall: function(reason, line, note = "") {
        verdict.log.push({type: reason, line: line, note:note})
    },

    contradiction: {
        add: function(tag) {
            verdict.contradictions.push(tag)
        },

        found: function(tag) {
            if (verdict.contradictions.indexOf(tag) === -1) {
                return false;
            }

            return true;
        },
    },

    submit: function(results) {
        console.log(results);
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
        } else if (verdict.contradiction.found(contradiction)) {
            console.log("found already")
        } else {
            ui.divs.blocker.onclick(); // This is two times I've done this, it feels not good
            speech.speak(data.noButtons(data.current.contradictions[contradiction]));
            verdict.contradiction.add(contradiction)
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
                    speech.speak(data.current.questioning[writer[type]][keyword].slice());
                    self.div.classList.remove("tag");
                    self.div.classList.add("strikeTag");
                    self.div.onclick = null;
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
                    const array = data.current[type];
                    for (let i = 0; i < array.length; i++) {
                        const p = tagize(array[i]);
                        div.appendChild(p);
                    }
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

                    for (let i = 0; i < data.current.coa.length; i++) {
                        const p = document.createElement("p");
                        const name = data.current.coa[i];
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
                    const h1 = document.createElement("h1");
                    const submit = document.createElement("button");
                    const results = {};
                    h1.innerHTML = "Verdict Content"
                    submit.innerHTML = "Render Verdict";
                    submit.onclick = function() {
                        ui.divs.blocker.style.opacity = 1;
                        ui.divs.blocker.style.pointerEvents = null;
                        ui.divs.backdrop.style.pointerEvents = "none"
                        desk.items.verdict.div.style.top = "-100%";
                        verdict.submit(results);
                    }
                    div.appendChild(h1);
                    div.appendChild(submit);
                    break;
            }


            return div;
        };

        self.open = function() {
            ui.hideIcon(self.icon.div);
            ui.showItem(self.div, self.close);
        };

        self.close = function() {
            ui.showIcon(self.icon.div);
            ui.hideItem(self.div);
        };

        self.addendum = function(array) {
            const h2 = document.createElement("h2");
            h2.innerHTML = "Addendum";

            self.content.appendChild(h2);

            for (let i = 0; i < array.length; i++) {
                const p = tagize(array[i])
                self.content.appendChild(p);
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
    cases: {"case1":{"title":"A Petition Pursuant to a Pulverized Pig Pen","coa":["trespass_to_chattel","negligence"],"summary":["Plaintiff <<pname>> says that defendant <<dname>> broke her manure grate during an important social gathering at her pen, leading to embarassment and financial loss. She is suing for $260, the cost to replace her grate.","<<dtlname>> says that many people had used the manure grate that night, and that she was not the one to break it."],"shortSum":"A manure grate broken during a barnyard shindig can be fixed, but the friendship it also broke could never be repaired.","plaintiff":{"name":"Sally Swineman","title":"Ms.","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Heiferson","title":"Ms.","appearance":{"head":6,"body":2}},"dictionary":["comparative_fault","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a [[long-time resident|long]] of Flourishing Fields, and a respected member of the community. The defendant, <<dtlname>>, is my neighbor and former friend.","On the evening of October 11, I invited <<dtlname>> and several other community members to a [[social gathering|gathering]] at my pen. The farm was going to elect a [[new livestock representative|rep]], and I wanted to run, so I was having a little campaign party to get the support of my friends.","About two hours into the event, we had just had dinner, and <<dtlname>> went to the [[manure grate|grate]]. She was in there for [[twenty minutes|time]], and I heard a loud crack while she was using it. When she came out I asked if everything was alright, and she said yes but she [[looked guilty|guilty]]. I [[discovered later|later]] when another guest tried to use the grate that it had been broken.","I [[confronted]] <<dtlname>> about it and she denied breaking my grate. I told her [[I didn't believe her|believe]], and she starting [[making a scene|scene]]. When I asked her to leave, she said some very nasty things to me and stormed out.","The evening at that point was pretty much ruined and everyone left shortly after her. I was so embarassed.","I got [[an estimate|estimate]] to fix my manure grate the next day. It cost $260, and I believe <<dtlname>> is [[responsible]] because she is the one who broke the grate."],"response":["My neighbor, <<ptlname>>, invited me and some other neighbors over for dinner and to chit-chat. I had been over [[several times|several]] and considered her a good friend.","<<ptlname>> started talking about some kind of election she was running in, and I left to use the grate. There wasn't any problem with it when I got in there.","After about [[twenty minutes|minutes]] I came back, and very shortly afterward, <<ptlname>> started interrogating me. I didn't know what it was about at first, but then she said I had broken her grate and wanted me to pay for it."],"addendums":{"response1":["I was too embarassed to admit it, which is why I initially lied and pretended that I didn't know what happened to the manure grate.","When I was [[using it|using]], I [[heard a sort of pop|pop]], and then when I checked the grate, I saw that it had broken. I tried to clean up the mess as best as I could while I was trying to think of what to say to <<ptlname>>.","I decided I wanted to tell her the truth privately, but when I saw how upset she was, and that she expected me to pay for it, I was too nervous to say anything at all. It was an accident, and [[I didn't think I should be responsible|responsible]] for fixing her grate.","I hoped she would eventually get less angry so I could admit things to her then, but then I found out she was suing me and never got the chance."]},"evidence":{"estimate":{"type":"invoice","slot":1,"content":["<h3>Gilbert Goat's Grates and Gutters</h3>","To: <<pname>>, 14 Flourishing Fields","Dated: October 12","&nbsp;",{"line":"<span style=\"float:left;\">Manure Grate</span> [[$190|price]]","style":"text-align:right;display:list-item;margin-left:3em;padding-right:1em;"},{"line":"Warrantee, 5 years<span style=\"float:right;\">$0</span>","style":"display:list-item;margin-left:3em;padding-right:1em;"},{"line":"Installation (2 hours)<span style=\"float:right;\">$70</span>","style":"display:list-item;margin-left:3em;padding-right:1em;"},"&nbsp;",{"line":"Total<span style=\"float:right;\">$260</span>","style":"padding-left:4em;padding-right:4em;"},"&nbsp;","Thank you for choosing Gilbert Goat's Grates and Gutters. Our Prices Won't Be Bleat!&trade; Please send payment within thirty (30) days of receiving this invoice."]}},"questioning":{"plaintiff":{"believe":[{"j":"Why didn't you believe <<dtlname>> when she said she hadn't broken the grate?"},{"p":"I was actually a little afraid it might happen when I saw her go in there, Your Honor."},{"p":"Everyone knows about <<dtlname>>'s weight issue, it's not a secret around the farm.","sass":{"type":"rude","convo":[{"j":"Don't tell me \"what everyone knows\", just tell me why you say were afraid it might happen."}]}},{"p":"My good girlfriend Lana Lamb had told me that she saw <<dtlname>> nearly knock over a fence when she leaned on it.","inadmissible":{"type":"hearsay","convo":[{"j":"I'm not interested in what your good girlfriend told you. If you were so concerned about <<dtlname>>'s weight, why did you invite her over?"},{"p":"I didn't know she would break anything, Your Honor. I trusted her to be more careful."}]}},{"p":"I value my stuff, and I didn't want it bent or broken. So I was listening while she was in there and heard the crack, and knew right away what happened."}],"confronted":[{"j":"When you spoke with <<dtlname>> after discovering your grate had broken, what did you say?"},{"p":"I said, \"<<dfname>>, is there anything you want to tell me about my manure grate?\"","sass":{"type":"lie","convo":[{"j":"Do you really expect me to believe from the tone of your complaint that <span class=\"i\">that</span> is how you asked her?"}]}},{"d":"That is so not true, <<pfname>>, and you know it. You came at me yelling right from the beginning.","sass":{"type":"crosstalk","convo":[{"j":"Hey, hey <<dtlname>>, do I look like I'm in need of help from you?"},{"d":"I'm sorry, Your Honor."}]}},{"p":"I did not, <<dfname>>, I was not angry until you started denying it.","sass":{"type":"crosstalk","convo":[{"j":"Stop talking to each other. When you're here, talk to me. Answer my question."}]}},{"p":"I guess I was a little upset at first, but I said, \"<<dfname>>, I know you broke my grate and I want you to pay for it\""},{"j":"And what did she say?"},{"p":"She just denied it! I told her that she was the only one who was using the grate, so it had to have been her, but she just denied it."}],"estimate":[{"j":"I'd like to see the estimate to have your grate fixed."},{"p":"Yes, Your Honor, here it is.","noButtons":true,"unlock":{"evidence":"estimate"}}],"gathering":[{"j":"Was this the first time you hosted a social gathering?"},{"p":"No, I have had them all over before, multiple times &mdash; <<dtlname>> included."},{"p":"There had never been an issue before. We had always gotten along fine."}],"grate":[{"j":"Tell me about your manure grate."},{"p":"It's a typical manure grate, same as the ones in all the other pens in the farm."},{"p":"I never had an issue with it before. <<dtlname>> has even used it."},{"p":"But I guess that was before she put on some weight.","sass":{"type":"rude","convo":[{"j":"Let me tell you something, madam, you are no petite piglet yourself, so I don't want to hear your comments about her weight."},{"d":"Thank you, Your Honor."}]},"admissible":{"note":"Even though the plaintiff said this as a rude personal attack, the fact that the defendant gained weight might be relevant in determining how and why the grate broke. Ironically, the plaintiff's insult ends up being evidence against her case; if the grate broke as a result of the defendant's weight, it suggests that she did not intentionally or negligently break it."}}],"guilty":[{"j":"Why do you say that <<dtlname>> \"looked guilty\"? What was she doing?"},{"p":"She wouldn't make eye contact, she seemed nervous, her face was flushed pink, she was jittering..."},{"p":"If you ask me, those are all telltale signs of a liar who is feeling guilty about <span class=\"i\">something</span>.","inadmissible":{"convo":[{"j":"I didn't ask you, <<ptlname>>, because you're not an expert in psychiatry. Unless you have a diploma you'd like you show me?"},{"p":"No, Your Honor."},{"j":"I asked you how she looked and what she was doing. Don't speculate about her state of mind unless you're an expert, got it?"},{"p":"Yes, Your Honor."}]}},{"p":"I found out later that it was the manure grate."}],"later":[{"j":"If you thought <<dtlname>> had broken your manure grate, why didn't you check it right away?"},{"p":"I wanted to, but I was busy hosting the party, Your Honor. Cooking and entertaining at the same time."},{"p":"I planned to check as soon as I could pull myself away, but another guest went to the grate about 10 minutes later and then came right out and got me."},{"p":"She said that my manure grate was broken, and that she thought it looked like someone had smashed it.","inadmissible":{"type":"hearsay","convo":[{"j":"Don't tell me what she thought or what she said unless she's here to speak for herself."},{"j":"Tell me what you did, and what you saw."},{"p":"I went to look at the manure grate and saw that it was broken. No one else had used it after <<dtlname>>."}],"note":"Hearsay is problematic because it is unreliable. There is no way to examine the truth of the claim \"it looked like someone had smashed it\" unless the person who said that is in court."}},{"p":"So I went in and checked, and sure enough, it was broken. No one had used it after <<dtlname>>."}],"long":[{"j":"How long have you been a resident at Flourishing Fields, <<ptlname>>?"},{"p":"About 8 years, Your Honor. I moved there after Truffle School."},{"j":"Have you repaired or replaced your manure grate in that time?"},{"p":"No, it's been the same one since I moved in. No prior problems with it."}],"responsible":[{"j":"Tell me why you believe the defendant is responsible for the damage to your grate."},{"p":"It's just common sense, Your Honor. \"You break it, you buy it.\""},{"p":"If you break something that belongs to someone, you have to pay to fix it."},{"p":"I don't want <<dfname>> to prison or nothing. I just want her to pay for what she broke."}],"rep":[{"j":"What is involved in being the livestock representative?"},{"p":"Chairing the monthly meeting, bringing community concerns to Farmer O'dell, supervising the recreation budget, that sort of thing."},{"j":"And was there anyone present that evening who seemed opposed to your candidacy, <<ptlname>>?"},{"p":"No, Your Honor. Everyone was really supportative and nice.","contradiction":"intentional"}],"scene":[{"j":"In what way did the defendant \"make a scene\", <<ptlname>>?"},{"p":"She just kept denying breaking the grate, which was getting me frustrated, so I was insisting to her that I knew she did and I expected her to pay to fix it."}],"time":[{"j":"Did you keep a stopwatch running while she was using your manure grate, <<ptlname>>?"},{"p":"No, nothing like that, Your Honor."},{"p":"But I heard the crack right after she went in there, so I was waiting for her to come out, and I happened to notice how long she took."}]},"defendant":{"several":[{"j":"When you had gone to <<ptlname>>'s residence in the past, had you used her manure grate?"},{"d":"Yes, Your Honor. Several times. I never had an issue with it before.","contradiction":"unused"},{"d":"I'm not sure why <<ptlname>> would think I would break her grate. I had no reason at all to do that."}],"minutes":[{"j":"Is 20 minutes at the manure grate a typical amount of time for you?"},{"d":"Oh, no Your Honor, but it wasn't like I was using that time to break the grate, or anything."},{"d":"It was just hard for me to figure out how to use the grate. It took me several minutes to figure out.","contradiction":"unused","sass":{"type":"lie","convo":[{"j":"You don't strike me as that dumb of a woman, <<dtlname>>."},{"d":"Thank you, Your Honor."},{"d":"...I think?"}]}}],"pop":[{"j":"Describe the pop you heard and what you were doing at the time, <<dtlname>>."},{"d":"It was just a \"pop\". It sounded like something came loose or maybe cracked below me."},{"d":"I wasn't doing anything out of the ordinary, Your Honor. Just standing there."},{"d":"I hadn't started, you know, \"going\" yet. It was only a few seconds after I put my weight on the grate."}],"using":[{"j":"Were you doing anything unusual with or on the manure grate?"},{"d":"No, Your Honor, just using it normally."},{"p":"It didn't break when everyone else was using it normally.","sass":{"type":"rude","convo":[{"j":"I didn't ask for your input, <<ptlname>>."},{"d":"I apologize, Your Honor."}]}}],"responsible":[{"j":"Tell me why you don't think you should be responsible, <<dtlname>>."},{"d":"Because it was an accident, Your Honor. I didn't do anything to her grate. I was gentle and didn't mean for it to break."},{"p":"Hey, \"you break it, you buy it\", <<dfname>>. Same thing. If you break it, you pay for it.","sass":{"type":"crosstalk","convo":[{"j":"If I want you to speak, <<ptlname>>, I will ask you a question. Until then, I want you to be quiet."}]}}]},"evidence":{"price":[{"j":"Yowch, this is a pricy meatball."},{"p":"You suck!"},{"d":"SUUUUCK!"},{"j":"Bailiff, clear the courtroom!"}]}},"contradictions":{"unused":[{"j":"You say you have used <<ptlname>>'s manure grate on several occassions, <<dtlname>>?"},{"d":"Yes, that's right."},{"p":"That's true, Your Honor."},{"j":"But this time it took 20 minutes to figure out?"},{"d":"..."},{"j":"Had you suffered from any brain trauma since the last time you used her grate, <<dtlname>>?"},{"d":"No, Your Honor."},{"d":"The truth is I did see the grate break, and I was trying to clean it up so no one would notice. I know that was wrong, but I was so embarassed about it, Your Honor."},{"d":"But I didn't break it on purpose, I promise!"},{"j":"I want you to submit an addendum to your Response, <<dtlname>>. And I want the truth this time.","unlock":{"addendum":"response1"}}]}}},

    dictionary: {"cause_of_action":"The grounds on which the Plaintiff is suing the Defendant. A Plaintiff will win their lawsuit if they can satisfactorily prove all of the elements of their chosen cause of action.","chattel":"Personal property, which is everyone someone owns except for cash, real property (like land or houses), and intellectual property (like patents and trademarks).","comparative_fault":"In lawsuits for neglient actions, you may consider to what degree you believe the plaintiff is responsible, and adjust your award proportionally. For instance, you may award $70 on a $100 claim if you believe the defendant was 70% responsible and the plaintiff was 30% responsible.","conversion":["The plaintiff owned or had the right to possess the property;","The defendant substantially interfered, took possession, prevented access, destroyed, or refused to return the property;","The defendant's actions were intentional and authorized; and","The act indefinitely deprived the plaintiff of their property."],"character_propensity":"Evidence or testimony about a person's character or personality traits is inadmissible when used to suggest that the person has a greater propensity or is more likely to have done something they are accused of.","hearsay":"Generally, a statement is inadmissible if it is both a) made outside of the courtroom, and b) offered as evidence to prove that the content of the statement is true (e.g. offering the out-of-court statement, \"it's raining\" to prove that it was raining). There are many exceptions to the general rule of hearsay.","negligence":["The defendant should have, and failed to, exercise reasonable care toward the plaintiff or their property;","The plaintiff suffered recognizable damages from personal injury or impairment to their property; and","The damages were a reasonably forseeable outcome of the defendant's actions."],"opinion":"Speculation, such as  is usually iadmissible,","relevance":"Testimony must be relevant to proving or disproving the Cause of Action to be admissible. The threshold for relevance is lenient; as long as a statement is reasonably probative of a consequential fact, it can be admitted.","standard_of_evidence":"In civil court, cases are decided \"by a preponderance of the evidence\". This is a lesser standard than \"beyond a reasonable doubt\", which is used in criminal court. The Plaintiff has the burden of proof, and prevails if you rule that it is more likely than not &mdash; in other words, that there is a greater than 50% chance &mdash; that their story is true.","statement_by_party_opponent":"(Hearsay Exception) Statements made by the opposing party are not hearsay, and are admissible as evidence.","trespass_to_chattel":["The plaintiff owned or had the right to possess the property;","The defendant damaged the property, or interfered with its ownership or enjoyment;","The damage or interference was intentional and unauthorized; and","The plaintiff suffered damages from the property's impairment or loss of use."]},

    genericLines: {"admonish":["I'm a rodent. Do you think they put me up here because I'm pretty or because I'm smart?","If you lived to be 60, you wouldn't be as smart as I am in one whisker.","This is my animal kingdom, sweet cheeks, not yours.","Did you come here just to humiliate yourself in front of ten million animals watching at home?","Don't paint stripes on a horse and try to tell me it's a zebra.","You need a therapist, not a judge."],"admonished":["Sorry, Your Honor.","Pssh, screw that.","Wow, that was way harsh.","..."]},

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
