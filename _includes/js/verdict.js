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

    submit: function(ruling) {
        const contradictions = {
            found: [],
            missed: [],
        };
        for (contradiction in data.current.contradictions) {
            if (verdict.contradictions.indexOf(contradiction) !== -1 ) {
                contradictions.found.push(contradiction);
            } else {
                contradictions.missed.push(contradiction);
            }
        }
        console.log(ruling);
        console.log(contradictions);
        console.log(verdict.log);
    },
};