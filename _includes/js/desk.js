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
                    const h1 = document.createElement("h1");
                    h1.innerHTML = "Verdict Content"
                    div.appendChild(h1);
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