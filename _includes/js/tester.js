const tester = function(caseNum) {
    const testCase = tools.deepCopy(data.cases[`${caseNum}`]);
    
    const testDict = function() {
        console.log("-- Dictionary test");
        for (let i = 0; i < testCase.dictionary.length; i++) {
            if (!data.dictionary[testCase.dictionary[i]]) {
                console.warn(`${testCase.dictionary[i]} is not in dictionary`)
            }
        }
        for (let i = 0; i < testCase.coa.length; i++) {
            if (!data.dictionary[testCase.coa[i]]) {
                console.warn(`Cause of Action "${testCase.coa[i]}" is not in dictionary`)
            }
        }
        console.log(`Dictionary test complete: ${testCase.dictionary.length} entries and ${testCase.coa.length} CoAs found`);
    };

    const getAllTags = function(array) {
        const tags = [];
        const looper = function(string) {
            const index = string.indexOf("[[")

            if (index === -1) {
                return;
            }

            const endIndex = string.indexOf("]]");
            let tag = string.substr(index + 2, endIndex - index - 2);
            if (tag.indexOf("|") !== -1) {
                tag = tag.substr(tag.indexOf("|") + 1)
            }

            tags.push(tag);
            looper(string.substr(endIndex + 2));
        }

        for (let i = 0; i < array.length; i++) {
            looper(array[i]);
        }

        return tags;
    };

    checkTags = function(pUsedTags, dUsedTags, pAvailableTags, dAvailableTags) {
        let errors = 0;
        console.log("-- Statement tag test");
        for (let i = 0; i < pUsedTags.length; i++) {
            if (pAvailableTags.indexOf(pUsedTags[i]) === -1) {
                console.warn(`Tag ${pUsedTags[i]} from complaint does not have a conversation`)
                errors += 1;
            }
        }
        for (let i = 0; i < pAvailableTags.length; i++) {
            if (pUsedTags.indexOf(pAvailableTags[i]) === -1) {
                console.warn(`Tag ${pAvailableTags[i]} has a conversation but is missing from complaint`)
                errors += 1;
            }
        }
        for (let i = 0; i < dUsedTags.length; i++) {
            if (dAvailableTags.indexOf(dUsedTags[i]) === -1) {
                console.warn(`Tag ${dUsedTags[i]} from response does not have a conversation`)
                errors += 1;
            }
        }
        for (let i = 0; i < dAvailableTags.length; i++) {
            if (dUsedTags.indexOf(dAvailableTags[i]) === -1) {
                console.warn(`Tag ${dAvailableTags[i]} has a conversation but is missing from response`)
                errors += 1;
            }
        }
        if (errors > 0) {
            console.log(`Statement tag test complete: ${errors} errors found`);
        } else {
            console.log(`Statement tag test complete: ${pUsedTags.length} plaintiff tags and ${pUsedTags.length} defendant tags`);
        }
    };

    addAddendums = function(source) {
        const addendums = Object.keys(testCase.addendums);
        let array = testCase[source];
        for (let i = 0; i < addendums.length; i++) {
            if (addendums[i].indexOf(source) !== -1) {
                array = array.concat(testCase.addendums[addendums[i]])
            }
        }
        return array;
    }

    testDict();
    checkTags(getAllTags(addAddendums("complaint")), getAllTags(addAddendums("response")), Object.keys(testCase.questioning.plaintiff), Object.keys(testCase.questioning.defendant));
};

const testAll = function() {
    for (testCase in data.cases) {
        console.log(`Testing ${testCase}`);
        tester(testCase);
    }
}