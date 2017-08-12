"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const allSentencesRaw : IAllSentencesRaw = {
//     DEFAULT : defaultSentences,
//     FEARLESS : fearless,
//     TESTING : testing,
// };
function rawToSentences(raw) {
    return raw.map(function (sentenceRaw) {
        return sentenceRaw.map(function (clauseChoiceRaw) {
            return clauseChoiceRaw.map(function (clauseRaw, i) { return ({
                isCorrect: i === 0,
                text: clauseRaw,
            }); });
        });
    });
}
exports.rawToSentences = rawToSentences;
// export default allSentencesRaw; 
//# sourceMappingURL=index.js.map