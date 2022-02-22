const verdict = {
    log: {
        inadmissible: {
            found: [],
            missed: [],
            wrong: [],
        },
        sass: {
            p: {
                deserved: 0,
                extra: 0,
                missed: 0,
            },
            d: {
                deserved: 0,
                extra: 0,
                missed: 0,
            },
        },
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

    findSass: function(speaker) {
        verdict.log.sass[speaker].deserved += 1;
    },

    missSass: function(speaker) {
        verdict.log.sass[speaker].missed += 1;
    },

    wrongSass: function(speaker) {
        verdict.log.sass[speaker].extra += 1;
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

    textualize: function(ruling) {
        const text = {
            coa: [],
            award: [],
        };
        
        // Causes of Action
        for (let i = 0; i < data.current.coas.length; i++) {
            const coa = data.current.coas[i];
            
            if (ruling.coa[coa] !== data.current.coa[coa].liable) {
                text.coa.push(data.current.coa[coa].note)
            }
        };

        if (text.coa.length === 0) {
            text.coa.push(data.current.verdictRight);
        } else {
            text.coa.unshift(data.current.verdictWrong);
        }

        // Verdict award

        if (Math.abs(ruling.award - data.current.awardRight) <= 10) {
            text.award.push(data.current.awardLines.right);
        } else {
            const wrongAwards = Object.keys(data.current.awardWrong);
            const checkWrongAwards = function() {
                for (let i = 0; i < wrongAwards.length; i++) {
                    if (Math.abs(ruling.award - wrongAwards[i]) <= 10) {
                        return data.current.awardWrong[wrongAwards[i]].line;
                    }
                }

                if (ruling.award > data.current.awardRight) {
                    return data.current.awardLines.wrongHigh;
                }

                return data.current.awardLines.wrongLow;
            }
            
            text.award.push(checkWrongAwards());
        }
        
        return text;

        // Inadmissibles

        if (ruling.inadmissible.found.length > 0) {

        }

        if (ruling.inadmissible.missed.length > 0) {
            
        }

        for (let i = 0; i < ruling.inadmissible.wrong.length; i++) {
            // .line and .note 
        }
    },

    submit: function(ruling) {
        ruling.contradiction = {};
        ruling.inadmissible = verdict.log.inadmissible;
        ruling.sass = verdict.log.sass;
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
        ui.finalScreen(verdict.textualize(ruling));
    },
};