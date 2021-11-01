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