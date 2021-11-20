
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

    testQuestioning: function(caseNum) {
        const testCase = data.cases[`${caseNum}`];
        const pKeywords = Object.keys(testCase.questioning.plaintiff);
        const cKeywords = [];
        const complaint = testCase.complaint.join(" ")
        const stack = [];
        for (let i = 0; i < complaint.length; i++) {
            if (complaint[i] === "[" && complaint[i - 1] === "[")
            {
                stack.push(i);
            } else if (complaint[i] === "]" && complaint[i + 1] === "]") {
                let pos = stack[stack.length - 1];
                let len = i - 1 - pos;
                let ans;
 
                ans = complaint.substring(pos + 1, len + pos + 1);

                cKeywords.push(ans);
            }
        }

        console.log(pKeywords.sort())
        console.log(cKeywords)
    },

    // This needs to get added elsewhere, but I just copied it here

    processTags: function(string, source) {
        const tagCount = string.split("[").length - 1;
        for (let i = 0; i < tagCount; i++) {
            const tag = string.substring(
                string.lastIndexOf("[") + 1, 
                string.lastIndexOf("]")
            );
            const array = tag.split("|");
            array.push(array[0]); // Making the tag equal the tag name if no tag name is defined
            string = string.replace(`[${tag}]`, `<span onclick="chat.newInterrogation('${array[1]}', '${source}')">${array[0]}</span>`);

        }
        return string;
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

        respond: function(speaker, message, noButtons, inadmissible, sass) {
            // This can probably be improved. Get rid of directly editing speech.queue
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
                    speech.queue.splice(0, speech.queue.length);
                    if (inadmissible) {
                        speech.queue = data.noButtons(inadmissible.convo);
                        score.add(inadmissible, message);
                    } else {
                        speech.queue.push(data.randomLine("j", "admonish"));
                        speech.queue.push(data.randomLine(speaker, "admonished"));
                        score.miscall("inadmissible", message);
                    }
                    speech.speak();
                }
                sassy.onclick = function() {
                    ui.divs.respond.innerHTML = "";
                    if (sass) {
                        speech.queue = data.noButtons(sass.convo).concat(speech.queue);
                        score.add(sass, message);
                    } else {
                        speech.queue = [data.randomLine("j", "admonish"), data.randomLine(speaker, "admonished")].concat(speech.queue)
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

    miscall: function(reason, line) {
        score.log.push({type: reason, weight: -1, line: line})
    }
};

    const speech = {
    queue: [],

    speak: function() {
        if (speech.queue.length === 0) {
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

        setTimeout(function() {
            ui.speech.respond(speaker, message, nextLine.noButtons, nextLine.inadmissible, nextLine.sass)
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
        } else if (!transcript.contradiction.contradiction || !contradiction) {
            ui.contradiction(speaker, transcript.contradiction.message, message);
            console.log("not contradictory")
        } else if (transcript.contradiction.contradiction !== contradiction) {
            ui.contradiction(speaker, transcript.contradiction.message, message);
            console.log("not contradictory 2")
        } else {
            ui.divs.blocker.onclick(); // This is two times I've done this, it feels not good
            speech.queue = data.noButtons(data.current.contradictions[contradiction]);
            speech.speak();
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
        const makeContent = function() {
            const Keyword = function(keyword, displayText) {
                const self = this;

                self.div = document.createElement("span");
                self.div.classList.add("tag")
                self.div.innerHTML = displayText;
                self.div.onclick = function() {
                    // This can be better, it's all kind of hacky. Don't edit speech.queue directly
                    ui.divs.blocker.onclick(); // Triggers closing the open Item
                    speech.queue = data.current.questioning[writer[type]][keyword].slice();
                    speech.speak();
                }

                return self.div;
            };

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
                        const p = document.createElement("p");

                        while (array[i].length > 0) {
                            const span = document.createElement("span");
                            const startIndex = array[i].indexOf("[[");
                            let substring;
                            let button;

                            if (startIndex > 0) {
                                const endIndex = array[i].indexOf("]]");
                                const tag = array[i].substring(startIndex + 2, endIndex)
                                const splitTag = tag.split("|")
                                
                                substring = array[i].substring(0, startIndex)
                                
                                button = new Keyword(splitTag[1] || splitTag[0], splitTag[0]);

                                array[i] = array[i].replace(`[[${tag}]]`, "");
                            } else {
                                substring = array[i];
                            }

                            array[i] = array[i].replace(substring, "");

                            span.innerHTML = substring;
                            p.appendChild(span);
                            if (button) {
                                p.appendChild(button);
                            }
                        }
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
        }

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
        
            1: ["1",{"title":"A Petition Pursuant to a Pulverized Pig Pen","summary":["Plaintiff Sally Swineman says that defendant Hailey Heiferson broke her manure grate during an important social gathering at her pen, leading to embarassment and financial loss. She is suing for $260, the cost to replace her grate.","Ms. Heiferson says that many people had used the manure grate that night, and that she was not the one to break it."],"plaintiff":{"name":"Paula Piglet","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Cowson","appearance":{"head":6,"body":2}},"dictionary":["cause_of_action","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a long-time [[resident]] of [[Flourishing]] Fields, and a respected member of the community. The defendant, Ms. Heiferson, is my neighbor and former friend.","On the evening of October 11, I invited Ms. Heiferson and several other community members to a [[social gathering|gathering]] at my pen. The farm was going to elect a new livestock representative, and I wanted to run, so I was having a little campaign party to get the support of my friends.","About two hours into the event, we had just had dinner, and Ms. Heiferson went to the [[manure grate|grate]]. She was in there for [[twenty minutes|time]], and I heard a loud crack while she was using it. When she came out I asked if everything was alright, and she said yes but she looked guilty. I [[discovered later|later]] when another guest tried to use the grate that it had been broken.","I confronted Ms. Heiferson about it and she denied breaking my grate. I told her I didn't believe her, and she starting making a scene. When I asked her to leave, she said some very nasty things to me and stormed out.","The evening at that point was pretty much ruined and everyone left shortly after her. I was so embarassed.","I got an estimate to fix my manure grate the next day. It cost $260, and I believe Ms. Heiferson is responsible because she is the one who broke the grate."],"response":["I recently moved next door to the plaintiff, Ms. Swineman, at the Flourishing Fields Farm. She was immediately a headache, constantly complaining about noise, or that we would leave things leaning against the fence. She has a bit of a reputation.","So then on October 11, I'm in my yard enjoying a milkshake when Ms. Swineman comes up and says the nastiest things to me. Not unusual, but not something I feel like hearing that day, so I go back inside.","The next time I saw her was that night when she came over and said I had broken her feeding trough, as if I would ever want to touch that disgusting thing. So I told her that I wouldn't do something like that, and she just told me that she'd see me in court, and now here we are.","I have no interest in breaking any of Ms. Swineman's things. I'd prefer she just leave me alone."],"questioning":{"plaintiff":{"resident":[{"j":"Do you like pie?"},{"p":"I hate pie, honestly","contradiction":"pie"},{"j":"That's weird."}],"Flourishing":[{"j":"What's your favorite dessert?"},{"p":"I friggin' love pie!","contradiction":"pie"}],"gathering":[{"j":"Was this the first time you hosted a social gathering?"},{"p":"No, I have had them all over before, multiple times &mdash; Ms. Heiferson included."},{"p":"There had never been an issue before. We had always gotten along fine."}],"grate":[{"j":"Tell me about your manure grate."},{"p":"It's a typical manure grate, same as the ones in all the other pens in the farm."},{"p":"I never had an issue with it before. Ms. Heiferson has even used it."},{"p":"But I guess that was before she put on some weight.","sass":{"convo":[{"j":"Okay, well let me tell you something, madam, you are no petite piglet yourself."}]}}],"time":[{"j":"Did you keep a stopwatch running while she was using your manure grate, Ms. Swineman?"},{"p":"No, nothing like that, Your Honor."},{"p":"But I heard the crack right after she went in there, so I was waiting for her to come out, and I happened to notice how long she took."}],"later":[{"j":"If you thought Ms. Heiferson had broken your manure grate, why didn't you check it right away?"},{"p":"I wanted to, but I was busy hosting the party, Your Honor. Cooking and entertaining at the same time."},{"p":"I planned to check as soon as I could pull myself away, but another guest went to the grate about 10 minutes later and then came right out and got me."},{"p":"She said that my manure grate was broken, and that she thought it looked like someone had smashed it.","inadmissible":{"type":"hearsay","weight":3,"convo":[{"j":"Don't tell me what she thought or what she said unless she's here to speak for herself."},{"j":"Tell me what you did, and what you saw."},{"p":"I went to look at the manure grate and saw that it was broken. No one else had used it after Ms. Heiferson."}]}},{"p":"So I went in and checked, and sure enough, it was broken. No one had used it after Ms. Heiferson."}]}},"contradictions":{"pie":[{"j":"Uh, are you a pie liar? A piar?!"},{"p":"That pun is dumb, Your Honor"},{"j":"You're literally dead to me."}]}}][1],
        
            2: ["old_1",{"title":"A Petition Pursuant to a Pulverized Pig Pen","summary":["Plaintiff Sally Swineman says that defendant Hailey Heiferson damaged her feeding trough, and is suing for $160, the cost to replace it.","Ms. Heiferson says that she has no proof for her accusations, and that it could have been anyone in the barnyard due to Ms. Swineman's borish attitude."],"plaintiff":{"name":"Paula Piglet","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Cowson","appearance":{"head":6,"body":2}},"dictionary":["cause_of_action","standard_of_evidence","relevance","hearsay","statement_by_party_opponent"],"complaint":["I am a [[long-time resident|resident]] of [[Flourishing Fields|flourishing]], and a [[respected member|respected]] of the community. The defendant, Ms. Heiferson, is my [[neighbor]], and she is someone with whom I have [[never been able to get along|get_along]] despite my [[best efforts|best_efforts]].","On the night of October 11, I was taking my piglets for an evening walk. We came home, and I put my piglets to bed. I felt a craving for a snack before bed, as is common for anyone, and went out to the trough. I found it smashed in multiple places, clearly intentionally.","I [[knew right away|knew]] that Ms. Heiferson had done it. She's jealous of me, and told me that she would do something like this. When I confronted her, she lied about it.","In her rampage, she not only destroyed the trough itself, but also the housing it sits in. I'm suing for a replacement trough and to have the housing repaired, which costs $160 in total."],"response":["I recently moved next door to the plaintiff, Ms. Swineman, at the Flourishing Fields Farm. She was immediately a headache, constantly complaining about noise, or that we would leave things leaning against the fence. She has a bit of a reputation.","So then on October 11, I'm in my yard enjoying a milkshake when Ms. Swineman comes up and says the nastiest things to me. Not unusual, but not something I feel like hearing that day, so I go back inside.","The next time I saw her was that night when she came over and said I had broken her feeding trough, as if I would ever want to touch that disgusting thing. So I told her that I wouldn't do something like that, and she just told me that she'd see me in court, and now here we are.","I have no interest in breaking any of Ms. Swineman's things. I'd prefer she just leave me alone."],"questioning":{"plaintiff":{"resident":[{"j":"2, 4, 6, 8, who do we appreciate?"},{"p":"Pigs"},{"d":"No we don't","noButtons":true},{"p":"Oh, sorry"}],"flourishing":["poo"],"respected":["poo"],"neighbor":["poo"],"get_along":["poo"],"best_efforts":["poo"],"knew":[{"j":"What makes you so confident that Ms. Heiferson was responsible for damaging your trough?"},{"p":"I know she did it, Your Honor. I don't have any doubt.","inadmissible":{"type":"relevance","weight":3,"convo":[{"j":"You can't tell me that, you psycho moron, I wish you were dead!"},{"p":"That's way harsh."}],"catch":"Correct, that was irrelevant","miss":"You missed an irrelevant thing"}},{"j":"Don't tell me what you \"know\". Tell me what you saw or what you heard that makes you believe Ms. Heiferson was responsible."},{"p":"She told me she did it."},{"d":"This isn't true, Your Honor!"}]}}}][1],
        
    },

    dictionary: {"cause_of_action":"The grounds on which the Plaintiff is suing the Defendant. A Plaintiff will win their lawsuit if they can satisfactorily prove all of the elements of their chosen cause of action.","character_propensity":"Evidence or testimony about a person's character or personality traits is inadmissible when used to suggest that the person has a greater propensity or is more likely to have done something they are accused of.","hearsay":"Generally, a statement is inadmissible if it is both a) made outside of the courtroom, and b) offered as evidence to prove that the content of the statement is true (e.g. offering the out-of-court statement, \"it's raining\" to prove that it was raining). There are many exceptions to the general rule of hearsay.","relevance":"Testimony must be relevant to proving or disproving the Cause of Action to be admissible.","standard_of_evidence":"In civil court, cases are decided \"by a preponderance of the evidence\". This is a lesser standard than \"beyond a reasonable doubt\", which is used in criminal court. The Plaintiff has the burden of proof, and prevails if you rule that it is more likely than not &mdash; in other words, that there is a greater than 50% chance &mdash; that their story is true.","statement_by_party_opponent":"An exception to the rule of hearsay. Statements made by the opposing party are not hearsay, and are admissible as evidence."},

    genericLines: {"admonish":["I'm a rodent. Do you think they put me up here because I'm pretty or because I'm smart?","If you lived to be 60, you wouldn't be as smart as I am in one whisker.","This is my animal kingdom, sweet cheeks, not yours.","Did you come here just to humiliate yourself in front of ten million animals watching at home?","Don't paint stripes on a horse and try to tell me it's a zebra.","You need a therapist, not a judge."],"admonished":["Sorry, Your Honor.","Pssh, screw that.","Wow, that was way harsh.","..."]},

    speakers: {
        j: "Judge",
        p: "Plaintiff",
        d: "Defendant",
    },

    loadCase: function(caseNum) {
        data.current = data.cases[`${caseNum}`];
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
