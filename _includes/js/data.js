const data = {
    cases: {
        {% for case in site.data.cases %}
            {{ forloop.index }}: {{ case | jsonify }}[1],
        {% endfor %}
    },

    loadCase: function(caseNum) {
        data.current = data.cases[`${caseNum}`];
        desk.make();
        ui.makeLitigants();
    },
};