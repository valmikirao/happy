"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// const allSentencesRaw : IAllSentencesRaw = {
//     DEFAULT : defaultSentences,
//     FEARLESS : fearless,
//     TESTING : testing,
// };
function rawToSentences(raw) {
    return raw.map(function (sentenceRaw) {
        return sentenceRaw.map(function (clauseChoiceRaw) {
            if (clauseChoiceRaw instanceof Array) {
                return clauseChoiceRaw.map(function (clauseRaw, i) { return ({
                    isCorrect: i === 0,
                    text: clauseRaw,
                }); });
            }
            else if (typeof clauseChoiceRaw === 'string') {
                return [{
                        isCorrect: true,
                        text: clauseChoiceRaw,
                    }];
            }
        });
    });
}
fs.readFile(process.argv[2], function (err, text) {
    if (!err) {
        var happy = {};
        eval(text.toString());
        console.log(JSON.stringify(rawToSentences(happy.sentenceSpecs), null, 2));
    }
    else {
        console.error(err);
    }
}); // first argument
//# sourceMappingURL=raw2sentences.js.map