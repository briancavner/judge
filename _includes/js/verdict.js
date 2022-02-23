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

    process: function(ruling) {
        const categories = ["coa", "award", "sass"];
        const text = {
            coa: [],
            award: [],
            sass: [],
        };

        const score = tools.deepCopy(text);

        const allFalse = function(obj) {
            const keys = Object.keys(obj);

            for (let i = 0; i < keys.length; i++) {
                if (obj[keys[i]] === true) {
                    return false;
                }
            }

            return true;
        };

        const scoreCalculation = function() {
            const subtotals = [];

            const avgArray = function(array) {
                let subtotal = 0;

                for (let i = 0; i < array.length; i++) {
                    subtotal += array[i];
                }

                return Math.round(2 * subtotal / tools.greater(1, array.length)) / 2;
            }
            
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                subtotals.push(avgArray(score[category]))
            }

            return avgArray(subtotals);
        }
        
        // Causes of Action
        for (let i = 0; i < data.current.coas.length; i++) {
            const coa = data.current.coas[i];
            
            if (ruling.coa[coa] !== data.current.coa[coa].liable) {
                text.coa.push(data.current.coa[coa].note)
                score.coa.push(1);
            } else {
                score.coa.push(5);
            }
        };

        if (text.coa.length === 0) {
            text.coa.push(data.current.verdictRight);
        } else {
            text.coa.unshift(data.current.verdictWrong);
        }

        // Verdict award

        if (allFalse(ruling.coa) && ruling.award > 0) {
        // If no liability is found, but money is awarded
            text.award.push(tools.pickOne(data.genericLines.notLiableMoney));
            score.award.push(0);
        } else if (Math.abs(ruling.award - data.current.awardRight) <= 10) {
        // If the amount awarded is right
            text.award.push(data.current.awardLines.right);
            score.award.push(5);
        } else {
        // If the amount awarded is wrong
            const wrongAwards = Object.keys(data.current.awardWrong);
            
            const checkWrongAwards = function() {
            // If the wrong amount is one of the predicted amounts
                for (let i = 0; i < wrongAwards.length; i++) {
                    if (Math.abs(ruling.award - wrongAwards[i]) <= 10) {
                        return {text: obj.line, score: obj.score};
                    }
                }

                if (ruling.award > data.current.awardRight) {
                // If the award is too high
                    return {text: data.current.awardLines.wrongHigh, score: 1};
                }

                // If the award is too low
                return {text: data.current.awardLines.wrongLow, score: 1};
            }
            
            let returnResults = checkWrongAwards() 
            score.award.push(returnResults.score)
            text.award.push(returnResults.text);
        }

        // Inadmissible

        if (ruling.inadmissible.found.length > 0) {

        }

        if (ruling.inadmissible.missed.length > 0) {
            
        }

        for (let i = 0; i < ruling.inadmissible.wrong.length; i++) {
            // .line and .note 
        }

        // Sass

        for (let i = 0; i < 2; i++) {
            const litigant = ["plaintiff", "defendant"][i]
            const sasses = ruling.sass[litigant[0]]
            
            if (sasses.missed + data.current[litigant].sass > sasses.deserved + sasses.extra) {
                text.sass.push(data.current.sassLines[litigant].tooSoft)
                score.sass.push(1);
            } else if (sasses.extra > data.current[litigant].sass) {
                text.sass.push(data.current.sassLines[litigant].tooHard)
                score.sass.push(2);
            } else {
                text.sass.push(data.current.sassLines[litigant].justRight)
                score.sass.push(5);
            }
        }

        console.log(score);
        return {text: text, categories: categories, score: scoreCalculation()};
    },

    submit: function(ruling) {
        let results = {};

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


        results = verdict.process(ruling)
        
        console.log(ruling);
        console.log(results);
        
        // save results.score
        ui.finalScreen(results.text, results.categories, results.score);
    },
};