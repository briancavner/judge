const data = {
    cases: {{ site.data.cases | jsonify }},

    dictionary: {{ site.data.dictionary | jsonify }},

    genericLines: {{ site.data.genericLines | jsonify }},

    speakers: {
        j: "Judge",
        p: "Plaintiff",
        d: "Defendant",
    },

    processVars: function(obj) {
        const vars = {
            pname: obj.plaintiff.name,
            ptitle: obj.plaintiff.title,
            dname: obj.defendant.name,
            dtitle: obj.defendant.title,
        };

        vars.pfname = vars.pname.split(" ")[0];
        vars.plname = vars.pname.split(" ")[1];
        vars.ptlname = `${vars.ptitle} ${vars.plname}`;
        vars.dfname = vars.dname.split(" ")[0];
        vars.dlname = vars.dname.split(" ")[1];
        vars.dtlname = `${vars.dtitle} ${vars.dlname}`;

        const varReplace = function(string) {
            if (typeof string !== "string") {
                return string;
            }
            const index = string.indexOf("<<")
            
            if (index === -1) {
                return string;
            }

            const variable = string.substr(index + 2, string.indexOf(">>") - index - 2);

            return varReplace(string.replace(`<<${variable}>>`, vars[variable]))
        };

        const looper = function(subobj) {
            for (let key in subobj) {
                if (typeof subobj[key] === "object") {
                    subobj[key] = looper(subobj[key]);
                } else {
                    subobj[key] = varReplace(subobj[key]);
                }
            }
            return subobj;
        }

        looper(obj);
        return obj;
    },

    loadCase: function(caseNum) {
        const selectedCase = tools.deepCopy(data.cases[`case${caseNum}`]);
        data.current = data.processVars(selectedCase);

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