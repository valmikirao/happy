import * as fs from 'fs';
import * as yargs from 'yargs';

import {TSentence, ISentenceSetData} from '../server-lib/isomporphic-types';

type TClauseChoiceRaw = string | string[];
type TSentenceRaw = TClauseChoiceRaw[];
type IAllSentencesRaw = {[key : string] : TSentenceRaw[]} 


const {name, out} = yargs.argv;
const gameConfigKey = yargs.argv.gamekey;

// const allSentencesRaw : IAllSentencesRaw = {
//     DEFAULT : defaultSentences,
//     FEARLESS : fearless,
//     TESTING : testing,
// };

function rawToSentences(raw : TSentenceRaw[]) : ISentenceSetData {
    const sentences : TSentence[] =  raw.map(sentenceRaw => 
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

    return {
        name,
        gameConfigKey,
        sentences
    };
}

fs.readFile(process.argv[2], (err, text) => {
    if (!err) {
        let happy : any = {};
        eval(text.toString());

        const outString = JSON.stringify(rawToSentences(happy.sentenceSpecs), null, 2);

        if (out) {
            fs.writeFileSync(out, outString);
        }
        else {
            console.log(outString);
        }
    }
    else {
        console.error(err);
    }
}); // first argument
