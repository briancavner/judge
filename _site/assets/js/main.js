
    const tester = function(caseNum) {
    const testCase = tools.deepCopy(data.cases[`${caseNum}`]);
    
    const testDict = function() {
        console.log("Dictionary test");
        for (let i = 0; i < testCase.dictionary.length; i++) {
            if (!data.dictionary[testCase.dictionary[i]]) {
                console.warn(`${testCase.dictionary[i]} is not in dictionary`)
            }
        }
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
        console.log("Statement tag test");
        for (let i = 0; i < pUsedTags.length; i++) {
            if (pAvailableTags.indexOf(pUsedTags[i]) === -1) {
                console.warn(`Tag ${pUsedTags[i]} from complaint does not have a conversation`)
            }
        }
        for (let i = 0; i < pAvailableTags.length; i++) {
            if (pUsedTags.indexOf(pAvailableTags[i]) === -1) {
                console.warn(`Tag ${pAvailableTags[i]} has a conversation but is missing from complaint`)
            }
        }
        for (let i = 0; i < dUsedTags.length; i++) {
            if (dAvailableTags.indexOf(dUsedTags[i]) === -1) {
                console.warn(`Tag ${dUsedTags[i]} from response does not have a conversation`)
            }
        }
        for (let i = 0; i < dAvailableTags.length; i++) {
            if (dUsedTags.indexOf(dAvailableTags[i]) === -1) {
                console.warn(`Tag ${dAvailableTags[i]} has a conversation but is missing from response`)
            }
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
                    score.subtract(inadmissible, message);
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
                        score.add(inadmissible, message);
                    } else {
                        speech.speak(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"));
                        if (admissible) {
                            score.miscall("inadmissible", message, admissible.note)
                        } else {
                            score.miscall("inadmissible", message);
                        }
                    }
                }
                sassy.onclick = function() {
                    ui.divs.respond.innerHTML = "";
                    if (sass) {
                        speech.addToFront(data.noButtons(sass.convo));
                        score.add(sass, message);
                    } else {
                        speech.addToFront(data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished"))
                        score.miscall("sass", message);
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

            if (type === "transcript") {
                ui.divs.contradiction = document.createElement("div");
                ui.divs.contradiction.classList.add("content2");
                ui.divs.transcript = contentDiv;
                div.appendChild(ui.divs.contradiction);
            }

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

    const score = {
    log: [],
    contradictions: [],

    add: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        score.log.push(entry);
    },

    subtract: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.weight *= -1;
        entry.line = line;
        score.log.push(entry);
    },

    miscall: function(reason, line, note = "") {
        score.log.push({type: reason, line: line, note:note})
    },

    contradiction: {
        add: function(tag) {
            score.contradictions.push(tag)
        },

        found: function(tag) {
            if (score.contradictions.indexOf(tag) === -1) {
                return false;
            }

            return true;
        },
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
            if (nextLine.unlock.addendum) {
                const type = nextLine.unlock.addendum.replace(/[0-9]/g, '')
                desk.items[type].addendum(data.current.addendums[nextLine.unlock.addendum]);
            }
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
        } else if (score.contradiction.found(contradiction)) {
            console.log("found already")
        } else {
            ui.divs.blocker.onclick(); // This is two times I've done this, it feels not good
            speech.speak(data.noButtons(data.current.contradictions[contradiction]));
            score.contradiction.add(contradiction)
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

    Icon: function(parent, type) {
        const self = this;

        self.div = ui.makeDesk.icon(type);
        self.div.onclick = function() {
            parent.open();
        }
    },

    Item: function(type) {
        const self = this;
        const writer = {
            complaint: "plaintiff",
            response: "defendant",
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
            const dictName = function(tag) {
                tag = tag.replace(/_/g, " ");
                return tools.capitalize(tag);
            };

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
        self.icon = new desk.Icon(self, type);
        self.content = makeContent();
        self.div = ui.makeDesk.item(type, self.content);
    },


    addItem: function(item) {
        const newItem = new desk.Item(item);
        desk.items[item] = newItem
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
    },
};

    const data = {
    cases: {
        
            1: ["1",{"title":"A Petition Pursuant to a Pulverized Pig Pen","summary":["Plaintiff <<pname>> says that defendant <<dname>> broke her manure grate during an important social gathering at her pen, leading to embarassment and financial loss. She is suing for $260, the cost to replace her grate.","<<dtlname>> says that many people had used the manure grate that night, and that she was not the one to break it."],"plaintiff":{"name":"Sally Swineman","title":"Ms.","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Heiferson","title":"Ms.","appearance":{"head":6,"body":2}},"dictionary":["cause_of_action","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a long-time resident of Flourishing Fields, and a respected member of the community. The defendant, <<dtlname>>, is my neighbor and former friend.","On the evening of October 11, I invited <<dtlname>> and several other community members to a [[social gathering|gathering]] at my pen. The farm was going to elect a new livestock representative, and I wanted to run, so I was having a little campaign party to get the support of my friends.","About two hours into the event, we had just had dinner, and <<dtlname>> went to the [[manure grate|grate]]. She was in there for [[twenty minutes|time]], and I heard a loud crack while she was using it. When she came out I asked if everything was alright, and she said yes but she looked guilty. I [[discovered later|later]] when another guest tried to use the grate that it had been broken.","I confronted <<dtlname>> about it and she denied breaking my grate. I told her I didn't believe her, and she starting making a scene. When I asked her to leave, she said some very nasty things to me and stormed out.","The evening at that point was pretty much ruined and everyone left shortly after her. I was so embarassed.","I got an estimate to fix my manure grate the next day. It cost $260, and I believe <<dtlname>> is responsible because she is the one who broke the grate."],"response":["My neighbor, <<ptlname>>, invited me and some other neighbors over for dinner and to chit-chat. I had been over [[several times|several]] and considered her a good friend.","<<ptlname>> started talking about some kind of election she was running in, and I left to use the grate. There wasn't any problem with it when I got in there.","After about [[twenty minutes|minutes]] I came back, and very shortly afterward, <<ptlname>> started interrogating me. I didn't know what it was about at first, but then she said I had broken her grate and wanted me to pay for it."],"addendums":{"response1":["I was too embarassed to admit it, which is why I initially lied and pretended that I didn't know what happened to the manure grate.","When I was [[using it|using]], I [[heard a sort of pop|pop]], and then when I checked the grate, I saw that it had broken. I tried to clean up the mess as best as I could while I was trying to think of what to say to <<ptlname>>.","I decided I wanted to tell her the truth privately, but when I saw how upset she was, and that she expected me to pay for it, I was too nervous to say anything at all. It was an accident, and [[I didn't think I should be responsible|responsible]] for fixing her grate.","I hoped she would eventually get less angry so I could admit things to her then, but then I found out she was suing me and never got the chance."]},"questioning":{"plaintiff":{"gathering":[{"j":"Was this the first time you hosted a social gathering?"},{"p":"No, I have had them all over before, multiple times &mdash; <<dtlname>> included."},{"p":"There had never been an issue before. We had always gotten along fine."}],"grate":[{"j":"Tell me about your manure grate."},{"p":"It's a typical manure grate, same as the ones in all the other pens in the farm."},{"p":"I never had an issue with it before. <<dtlname>> has even used it."},{"p":"But I guess that was before she put on some weight.","sass":{"convo":[{"j":"Let me tell you something, madam, you are no petite piglet yourself, so I don't want to hear your comments about her weight."},{"d":"Thank you, Your Honor."}]},"admissible":{"note":"Even though the plaintiff said this as a rude personal attack, the fact that the defendant gained weight might be relevant in determining how and why the grate broke. Ironically, the plaintiff's insult ends up being evidence against her case; if the grate broke as a result of the defendant's weight, it suggests that she did not intentionally or negligently break it."}}],"time":[{"j":"Did you keep a stopwatch running while she was using your manure grate, <<ptlname>>?"},{"p":"No, nothing like that, Your Honor."},{"p":"But I heard the crack right after she went in there, so I was waiting for her to come out, and I happened to notice how long she took."}],"later":[{"j":"If you thought <<dtlname>> had broken your manure grate, why didn't you check it right away?"},{"p":"I wanted to, but I was busy hosting the party, Your Honor. Cooking and entertaining at the same time."},{"p":"I planned to check as soon as I could pull myself away, but another guest went to the grate about 10 minutes later and then came right out and got me."},{"p":"She said that my manure grate was broken, and that she thought it looked like someone had smashed it.","inadmissible":{"type":"hearsay","convo":[{"j":"Don't tell me what she thought or what she said unless she's here to speak for herself."},{"j":"Tell me what you did, and what you saw."},{"p":"I went to look at the manure grate and saw that it was broken. No one else had used it after <<dtlname>>."}],"note":"Hearsay is problematic because it is unreliable. There is no way to examine the truth of the claim \"it looked like someone had smashed it\" unless the person who said that is in court."}},{"p":"So I went in and checked, and sure enough, it was broken. No one had used it after <<dtlname>>."}]},"defendant":{"several":[{"j":"When you had gone to <<ptlname>>'s residence in the past, had you used her manure grate?"},{"d":"Yes, Your Honor. Several times. I never had an issue with it before.","contradiction":"unused"},{"d":"I'm not sure why <<ptlname>> would think I would break her grate. I had no reason at all to do that."}],"minutes":[{"j":"Is 20 minutes at the manure grate a typical amount of time for you?"},{"d":"Oh, no Your Honor, but it wasn't like I was using that time to break the grate, or anything."},{"d":"It was just hard for me to figure out how to use the grate. It took me several minutes to figure out.","contradiction":"unused","sass":{"convo":[{"j":"You don't strike me as that dumb of a woman, <<dtlname>>."},{"d":"Thank you, Your Honor."},{"d":"...I think?"}]}}],"pop":[{"j":"Describe the pop you heard and what you were doing at the time, <<dtlname>>."},{"d":"It was just a \"pop\". It sounded like something came loose or maybe cracked below me."},{"d":"I wasn't doing anything out of the ordinary, Your Honor. Just standing there."},{"d":"I hadn't started, you know, \"going\" yet. It was only a few seconds after I put my weight on the grate."}],"using":[{"j":"Were you doing anything unusual with or on the manure grate?"},{"d":"No, Your Honor, just using it normally."},{"p":"It didn't break when everyone else was using it normally.","sass":{"convo":[{"j":"Did I look like I needed any input from you, <<ptlname>>?"},{"d":"No Your Honor, I apologize."}]}}],"responsible":[{"j":"Tell me why you don't think you should be responsible, <<dtlname>>."},{"d":"Because it was an accident, Your Honor. I didn't do anything to her grate. I was gentle and didn't mean for it to break."},{"p":"Hey, \"you break it, you buy it\", <<dfname>>. Same thing. If you break it, you pay for it.","sass":{"convo":[{"j":"If I want you to speak, <<ptlname>>, I will ask you a question. Until then, I want you to be quiet."}]}}]}},"contradictions":{"unused":[{"j":"You say you have used <<ptlname>>'s manure grate on several occassions, <<dtlname>>?"},{"d":"Yes, that's right."},{"p":"That's true, Your Honor."},{"j":"But this time it took 20 minutes to figure out?"},{"d":"..."},{"j":"Had you suffered from any brain trauma since the last time you used her grate, <<dtlname>>?"},{"d":"No, Your Honor."},{"d":"The truth is I did see the grate break, and I was trying to clean it up so no one would notice. I know that was wrong, but I was so embarassed about it, Your Honor."},{"d":"But I didn't break it on purpose, I promise!"},{"j":"I want you to submit an addendum to your Response, <<dtlname>>. And I want the truth this time.","unlock":{"addendum":"response1"}}]}}][1],
        
            2: ["old_1",{"title":"A Petition Pursuant to a Pulverized Pig Pen","summary":["Plaintiff Sally Swineman says that defendant Hailey Heiferson damaged her feeding trough, and is suing for $160, the cost to replace it.","Ms. Heiferson says that she has no proof for her accusations, and that it could have been anyone in the barnyard due to Ms. Swineman's borish attitude."],"plaintiff":{"name":"Paula Piglet","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Cowson","appearance":{"head":6,"body":2}},"dictionary":["cause_of_action","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a [[long-time resident|resident]] of [[Flourishing Fields|flourishing]], and a [[respected member|respected]] of the community. The defendant, Ms. Heiferson, is my [[neighbor]], and she is someone with whom I have [[never been able to get along|get_along]] despite my [[best efforts|best_efforts]].","On the night of October 11, I was taking my piglets for an evening walk. We came home, and I put my piglets to bed. I felt a craving for a snack before bed, as is common for anyone, and went out to the trough. I found it smashed in multiple places, clearly intentionally.","I [[knew right away|knew]] that Ms. Heiferson had done it. She's jealous of me, and told me that she would do something like this. When I confronted her, she lied about it.","In her rampage, she not only destroyed the trough itself, but also the housing it sits in. I'm suing for a replacement trough and to have the housing repaired, which costs $160 in total."],"response":["I recently moved next door to the plaintiff, Ms. Swineman, at the Flourishing Fields Farm. She was immediately a headache, constantly complaining about noise, or that we would leave things leaning against the fence. She has a bit of a reputation.","So then on October 11, I'm in my yard enjoying a milkshake when Ms. Swineman comes up and says the nastiest things to me. Not unusual, but not something I feel like hearing that day, so I go back inside.","The next time I saw her was that night when she came over and said I had broken her feeding trough, as if I would ever want to touch that disgusting thing. So I told her that I wouldn't do something like that, and she just told me that she'd see me in court, and now here we are.","I have no interest in breaking any of Ms. Swineman's things. I'd prefer she just leave me alone."],"questioning":{"plaintiff":{"resident":[{"j":"2, 4, 6, 8, who do we appreciate?"},{"p":"Pigs"},{"d":"No we don't","noButtons":true},{"p":"Oh, sorry"}],"flourishing":["poo"],"respected":["poo"],"neighbor":["poo"],"get_along":["poo"],"best_efforts":["poo"],"knew":[{"j":"What makes you so confident that Ms. Heiferson was responsible for damaging your trough?"},{"p":"I know she did it, Your Honor. I don't have any doubt.","inadmissible":{"type":"relevance","weight":3,"convo":[{"j":"You can't tell me that, you psycho moron, I wish you were dead!"},{"p":"That's way harsh."}],"catch":"Correct, that was irrelevant","miss":"You missed an irrelevant thing"}},{"j":"Don't tell me what you \"know\". Tell me what you saw or what you heard that makes you believe Ms. Heiferson was responsible."},{"p":"She told me she did it."},{"d":"This isn't true, Your Honor!"}]}}}][1],
        
    },

    dictionary: {"cause_of_action":"The grounds on which the Plaintiff is suing the Defendant. A Plaintiff will win their lawsuit if they can satisfactorily prove all of the elements of their chosen cause of action.","character_propensity":"Evidence or testimony about a person's character or personality traits is inadmissible when used to suggest that the person has a greater propensity or is more likely to have done something they are accused of.","hearsay":"Generally, a statement is inadmissible if it is both a) made outside of the courtroom, and b) offered as evidence to prove that the content of the statement is true (e.g. offering the out-of-court statement, \"it's raining\" to prove that it was raining). There are many exceptions to the general rule of hearsay.","relevance":"Testimony must be relevant to proving or disproving the Cause of Action to be admissible.","standard_of_evidence":"In civil court, cases are decided \"by a preponderance of the evidence\". This is a lesser standard than \"beyond a reasonable doubt\", which is used in criminal court. The Plaintiff has the burden of proof, and prevails if you rule that it is more likely than not &mdash; in other words, that there is a greater than 50% chance &mdash; that their story is true.","statement_by_party_opponent":"An exception to the rule of hearsay. Statements made by the opposing party are not hearsay, and are admissible as evidence."},

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
        const selectedCase = tools.deepCopy(data.cases[`${caseNum}`]);
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
    data.loadCase(1);
};

window.addEventListener("load", init);
