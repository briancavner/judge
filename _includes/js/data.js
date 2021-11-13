const data = {
    cases: {
        {% for case in site.data.cases %}
            {{ forloop.index }}: {{ case | jsonify }}[1],
        {% endfor %}
    },

    dictionary: {{ site.data.dictionary | jsonify }},

    genericLines: {{ site.data.genericLines | jsonify }},

    loadCase: function(caseNum) {
        data.current = data.cases[`${caseNum}`];
        desk.make();
        ui.makeLitigants();
    },

    noButtons: function(array) {
        for (let i = 0; i < array.length; i++) {
            array[i].noButtons = true;
        }
        return array;
    },

    randomLine: function(speaker, type) {
        const results = {};
        const line = tools.pickOne(data.genericLines[type]);
        results[speaker] = line;
        results.noButtons = true;

        return results;
    },
};