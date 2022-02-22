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