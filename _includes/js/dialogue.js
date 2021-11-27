const speech = {
    queue: [],

    tools: {
        process: function(input) {
            let array = [];

            if (Array.isArray(input[0])) {
                array = input[0];
            } else {
                for (let i = 0; i < input.length; i++) {
                    array.push(input[i])
                }
            };

            return array;
        }
    },

    add: function() {
        const array = speech.tools.process(arguments);

        for (let i = 0; i < array.length; i++) {
            speech.queue.push(array[i]);
        }
    },

    addToFront: function() {
        const array = speech.tools.process(arguments);

        speech.queue = array.concat(speech.queue);
    },

    empty: function() {
        speech.queue.splice(0, speech.queue.length);
    },

    speak: function() {
        if (arguments.length > 0) {
            speech.add(speech.tools.process(arguments));
        } else if (speech.queue.length === 0) {
            ui.speech.close(true);
            return;
        }

        const nextLine = speech.queue.splice(0, 1)[0];
        let speaker;
        let message;

        // Is there a better way than this?
        if (nextLine.j) {
            speaker = "j";
        } else if (nextLine.p) {
            speaker = "p";
        } else {
            speaker = "d";
        }
        message = nextLine[speaker];

        ui.speech.speak(speaker, message);
        transcript.add(speaker, message, nextLine.contradiction);

        if (nextLine.unlock) {
            if (nextLine.unlock.addendum) {
                const type = nextLine.unlock.addendum.replace(/[0-9]/g, '')
                desk.items[type].addendum(data.current.addendums[nextLine.unlock.addendum]);
            }
        }

        setTimeout(function() {
            ui.speech.respond(speaker, message, nextLine.noButtons, nextLine.inadmissible, nextLine.admissible, nextLine.sass)
        }, 600)
    },
};

const transcript = {
    log: [],

    check: function(speaker, message, contradiction) {
        if (!transcript.contradiction) {
            if (speaker === "j") {
                // send the message to a ui.error() function
                console.log("judge??");
            } else {
                transcript.contradiction = {
                    speaker: speaker,
                    message: message,
                    contradiction: contradiction,
                };
                ui.contradiction(speaker, message);
                console.log("contradiction stored");
            }
            return;
        }

        if (transcript.contradiction.speaker !== speaker) {
            // send the message to a ui.error() function
            console.log("different speaker!")
        } else if (transcript.contradiction.message === message) {
            console.log("same message!");
        } else if (!transcript.contradiction.contradiction || !contradiction || 
                transcript.contradiction.contradiction !== contradiction) {
            ui.contradiction(speaker, transcript.contradiction.message, message);
            console.log("not contradictory")
        } else if (score.contradiction.found(contradiction)) {
            console.log("found already")
        } else {
            ui.divs.blocker.onclick(); // This is two times I've done this, it feels not good
            speech.speak(data.noButtons(data.current.contradictions[contradiction]));
            score.contradiction.add(contradiction)
        }

        transcript.contradiction = null;
    },

    add: function(speaker, message, contradiction) {
        const lastline = transcript.log[transcript.log.length - 1];
        let newline = true;

        if (lastline && speaker === lastline.speaker) {
            newline = false;
        }
        ui.speech.transcribe(speaker, message, newline, contradiction);
        transcript.log.push({speaker: speaker, message: message, contradiction: contradiction})
    },
};