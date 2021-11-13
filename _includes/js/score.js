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