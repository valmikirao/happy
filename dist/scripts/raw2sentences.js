"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var raw_sentences_1 = require("../lib/raw-sentences");
var fs = require("fs");
fs.readFile(process.argv[2], function (err, text) {
    if (!err) {
        var happy = {};
        eval(text.toString());
        console.log(JSON.stringify(raw_sentences_1.rawToSentences(happy.sentenceSpecs), null, 2));
    }
    else {
        console.error(err);
    }
}); // first argument
//# sourceMappingURL=raw2sentences.js.map