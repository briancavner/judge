
    const tools = {
    rand: function(a, b) {
        return Math.floor(Math.random() * (b - a + 1) + a);
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
        const makeContent = function(array) {
            const Keyword = function(keyword, displayText) {
                const self = this;

                self.div = document.createElement("span");
                self.div.classList.add("tag")
                self.div.innerHTML = displayText;
                self.div.onclick = function() {
                    ui.divs.blocker.onclick(); // Triggers closing the open Item
                    ui.speechQueue = data.current.questioning[writer[type]][keyword].slice();
                    ui.speak();
                }

                return self.div;
            }
            const div = document.createElement("div");
            if (array) {
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
        self.content = makeContent(data.current[type])
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
        
            1: ["1",{"title":"A Petition Pursuant to a Pulverized Pig Pen","summary":["Plaintiff Sally Swineman says that defendant Hailey Heiferson damaged her feeding trough, and is suing for $160, the cost to replace it.","Ms. Heiferson says that she has no proof for her accusations, and that it could have been anyone in the barnyard due to Ms. Swineman's borish attitude."],"plaintiff":{"name":"Paula Piglet","appearance":{"head":3,"body":6}},"defendant":{"name":"Carla Cowson","appearance":{"head":6,"body":2}},"complaint":["I am a [[long-time resident|resident]] of [[Flourishing Fields|flourishing]], and a [[respected member|respected]] of the community. The defendant, Ms. Heiferson, is my [[neighbor]], and she is someone with whom I have [[never been able to get along|get_along]] despite my [[best efforts|best_efforts]].","On the night of October 11, I was taking my piglets for an evening walk. We came home, and I put my piglets to bed. I felt a craving for a snack before bed, as is common for anyone, and went out to the trough. I found it smashed in multiple places, clearly intentionally.","I knew right away that Ms. Heiferson had done it. She's jealous of me, and told me that she would do something like this. When I confronted her, she lied about it.","In her rampage, she not only destroyed the trough itself, but also the housing it sits in. I'm suing for a replacement trough and to have the housing repaired, which costs $160 in total."],"response":["I recently moved next door to the plaintiff, Ms. Swineman, at the Flourishing Fields Farm. She was immediately a headache, constantly complaining about noise, or that we would leave things leaning against the fence. She has a bit of a reputation.","So then on October 11, I'm in my yard enjoying a milkshake when Ms. Swineman comes up and says the nastiest things to me. Not unusual, but not something I feel like hearing that day, so I go back inside.","The next time I saw her was that night when she came over and said I had broken her feeding trough, as if I would ever want to touch that disgusting thing. So I told her that I wouldn't do something like that, and she just told me that she'd see me in court, and now here we are.","I have no interest in breaking any of Ms. Swineman's things. I'd prefer she just leave me alone."],"questioning":{"plaintiff":{"resident":[{"j":"2, 4, 6, 8, who do we appreciate?"},{"p":"Pigs"},{"d":"No we don't"},{"p":"Oh, sorry"}],"flourishing":["poo"],"respected":["poo"],"neighbor":["poo"],"get_along":["poo"],"best_efforts":["poo"]}}}][1],
        
            2: ["2",{"summary":["Summary"],"complaint":["Complaint"],"response":["Response"]}][1],
        
            3: ["3",{"summary":["Summary"],"complaint":["Complaint"],"response":["Response"]}][1],
        
    },

    loadCase: function(caseNum) {
        data.current = data.cases[`${caseNum}`];
        desk.make();
        ui.makeLitigants();
    },
};

    const init = function() {
    ui.init();
    data.loadCase(1);
};

window.addEventListener("load", init);
