const verdict = {
    log: {
        inadmissible: {
            found: [],
            missed: [],
            wrong: [],
        }
    },
    contradictions: [],

    findInadmissible: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        verdict.log.inadmissible.found.push(entry);
    },

    missInadmissible: function(input, line) {
        const entry = Object.assign({}, input); // Clone without altering original
        entry.line = line;
        verdict.log.inadmissible.missed.push(entry);
    },

    wrongInadmissible: function(line, note = tools.pickOne(data.genericLines.admissible)) {
        verdict.log.inadmissible.wrong.push({line: line, note:note})
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
        ruling.contradiction = {};
        ruling.inadmissible = verdict.log.inadmissible;
        for (contradiction in data.current.contradictions) {
            ruling.contradiction[contradiction] = {};
            if (verdict.contradictions.indexOf(contradiction) !== -1 ) {
                ruling.contradiction[contradiction].found = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].found
            } else {
                ruling.contradiction[contradiction].found = false;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].missed
            }
        }
        console.log(ruling);
        console.log(verdict.log);
    },
};