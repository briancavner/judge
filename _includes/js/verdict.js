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
        contradiction: {
            seenOnce: {},
            seenTwice: [],
            found: [],
        }
    },

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

    findContradiction: function(tag) {
        verdict.log.contradiction.seenTwice.splice(verdict.log.contradiction.seenTwice.indexOf(tag), 1)
        verdict.log.contradiction.found.push(tag);
    },

    process: function(ruling) {
        const categories = ["coa", "award", "contradiction", "inadmissible", "sass"];
        const text = {};
        const score = {};

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

            const round = function(int) {
                return Math.round(2 * int) / 2;
            }
            
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                subtotals.push(round(tools.avgArray(score[category])))
            }

            return round(tools.avgArray(subtotals));
        }

        for (let i = 0; i < categories.length; i++) {
            text[categories[i]] = [];
            score[categories[i]] = [];
        }
        
        // Causes of Action
        if (transcript.log.length < 10) {
            score.coa.push(0);
            text.coa.push(data.genericLines.noQuestions);
        } else {
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

        // Contradiction

        for (key in ruling.contradiction) {
            const contradiction = ruling.contradiction[key]
            text.contradiction.push(contradiction.note);

            if (contradiction.found) {
                score.contradiction.push(5)
            } else if (contradiction.seenTwice) {
                score.contradiction.push(3)
            } else if (contradiction.seenOnce) {
                score.contradiction.push(1.5)
            } else {
                score.contradiction.push(0)
            }
        }

        // Inadmissible

        const scoreToLine = function(int) {
            // That math is just to get -1, 0, 1, and 2 out of specific ranges (0, 0.5-2, 2.5-3.5, 4-5)
            const nonZero = tools.greater(int, 0.1);
            return Math.floor((nonZero - (1 / (10 * nonZero))) / 2 + 0.02);
        }

        const inadmissibleCollapse = document.createElement("div");
        inadmissibleCollapse.classList.add("collapse");

        for (let i = 0; i < 3; i++) {
            const loopList = ["found", "missed", "wrong"];
            const loopScores = [5, 1, 2];
            
            const inadmissibles = ruling.inadmissible[loopList[i]];

            console.log(inadmissibles)

            if (inadmissibles.length > 0) {
                const h4 = document.createElement("h4");
                h4.innerHTML = data.genericLines.inadmissibleHeader[loopList[i]]

                inadmissibleCollapse.appendChild(h4);
            }

            for (let j = 0; j < inadmissibles.length; j++) {
                const quote = document.createElement("p");
                const note = document.createElement("p");

                score.inadmissible.push(loopScores[i])
                
                quote.innerHTML = inadmissibles[j].line;
                note.innerHTML = inadmissibles[j].note;

                inadmissibleCollapse.appendChild(quote);
                inadmissibleCollapse.appendChild(note);
            }
        }

        if (score.inadmissible.length === 0) {
            score.inadmissible.push(0);
        }

        text.inadmissible.push(data.current.inadmissibleLines[scoreToLine(tools.avgArray(score.inadmissible))]);
        text.inadmissibleCollapse = inadmissibleCollapse;

        // Sass

        for (let i = 0; i < 2; i++) {
            const litigant = ["plaintiff", "defendant"][i]
            const sasses = ruling.sass[litigant[0]]
            
            if (sasses.deserved + sasses.extra === 0 && data.current[litigant].sass > 0) {
                text.sass.push(data.current.sassLines[litigant].tooSoft)
                score.sass.push(0);
            } else if (sasses.missed + data.current[litigant].sass > sasses.deserved + sasses.extra) {
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

        if (tools.avgArray(score.sass) <= 1) {
            text.sass.push(data.genericLines.doSass);
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
            if (verdict.log.contradiction.found.includes(contradiction)) {
                ruling.contradiction[contradiction].found = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].found
            } else if (verdict.log.contradiction.seenTwice.includes(contradiction)) {
                ruling.contradiction[contradiction].seenTwice = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].missed
            } else if (Object.keys(verdict.log.contradiction.seenOnce).includes(contradiction)) {
                ruling.contradiction[contradiction].seenOnce = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].unseen
            } else {
                ruling.contradiction[contradiction].unseen = true;
                ruling.contradiction[contradiction].note = data.current.contradictions[contradiction].unseen
            }
        }


        results = verdict.process(ruling)
        
        console.log(ruling);
        console.log(results);
        
        // save results.score
        ui.finalScreen(results.text, results.categories, results.score);
    },
};