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