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