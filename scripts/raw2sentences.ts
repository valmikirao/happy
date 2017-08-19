import * as fs from 'fs';

import {TSentence} from '../server-lib/isomporphic-types';

type TClauseChoiceRaw = string | string[];
type TSentenceRaw = TClauseChoiceRaw[];
type IAllSentencesRaw = {[key : string] : TSentenceRaw[]} 

// const allSentencesRaw : IAllSentencesRaw = {
//     DEFAULT : defaultSentences,
//     FEARLESS : fearless,
//     TESTING : testing,
// };

function rawToSentences(raw : TSentenceRaw[]) : TSentence[] {
    return raw.map(sentenceRaw => 
        sentenceRaw.map(clauseChoiceRaw => {
            if (clauseChoiceRaw instanceof Array) {
                return clauseChoiceRaw.map((clauseRaw, i) => ({
                    isCorrect : i === 0,
                    text : clauseRaw,
                }));
            }
            else if (typeof clauseChoiceRaw === 'string') {
                return [{
                    isCorrect : true,
                    text : clauseChoiceRaw,
                }];
            }
        })
    );
}

fs.readFile(process.argv[2], (err, text) => {
    if (!err) {
        let happy : any = {};
        eval(text.toString());
        console.log(JSON.stringify(rawToSentences(happy.sentenceSpecs), null, 2));
    }
    else {
        console.error(err);
    }
}); // first argument
