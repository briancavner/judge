const tools = {
    rand: function(a, b) {
        return Math.floor(Math.random() * (b - a + 1) + a);
    },

    capitalize: function(string) {
        return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    },

    pickOne: function(array) {
        return array[tools.rand(0, array.length - 1)];
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const hold = array[i];
            array[i] = array[j];
            array[j] = hold;
        }
    },

    testQuestioning: function(caseNum) {
        const testCase = data.cases[`${caseNum}`];
        const pKeywords = Object.keys(testCase.questioning.plaintiff);
        const cKeywords = [];
        const complaint = testCase.complaint.join(" ")
        const stack = [];
        for (let i = 0; i < complaint.length; i++) {
            if (complaint[i] === "[" && complaint[i - 1] === "[")
            {
                stack.push(i);
            } else if (complaint[i] === "]" && complaint[i + 1] === "]") {
                let pos = stack[stack.length - 1];
                let len = i - 1 - pos;
                let ans;
 
                ans = complaint.substring(pos + 1, len + pos + 1);

                cKeywords.push(ans);
            }
        }

        console.log(pKeywords.sort())
        console.log(cKeywords)
    },

    // This needs to get added elsewhere, but I just copied it here

    processTags: function(string, source) {
        const tagCount = string.split("[").length - 1;
        for (let i = 0; i < tagCount; i++) {
            const tag = string.substring(
                string.lastIndexOf("[") + 1, 
                string.lastIndexOf("]")
            );
            const array = tag.split("|");
            array.push(array[0]); // Making the tag equal the tag name if no tag name is defined
            string = string.replace(`[${tag}]`, `<span onclick="chat.newInterrogation('${array[1]}', '${source}')">${array[0]}</span>`);

        }
        return string;
    },
};