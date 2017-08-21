"use strict";
// $    
// $ /c/Program\ Files\ \(x86\)/MongoDB/Server/3.2/bin/mongod --dbpath mongo-dir/ --port 27017 --storageEngine=mmapv1 --journal
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var basicAuth = require("express-basic-auth");
var yargs = require("yargs");
var _a = yargs.argv.port, port = _a === void 0 ? 8000 : _a;
var app = express();
var Persistence = require("../persistence");
Persistence.init();
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// })
app.use(bodyParser.json());
app.use(function (request, response, next) {
    console.log('%s %s %s %s %s', new Date(), request.method, request.url, JSON.stringify(request.query), JSON.stringify(request.body));
    next();
});
app.use(basicAuth({
    users: { 'miki': 'Lyanna123' },
    challenge: true,
    realm: 'default',
}));
console.log(process.cwd());
app.use('/static', express.static('.'));
app.post('/rest/recordScore', function (request, response, next) {
    var score = parseInt(request.body.score);
    var date = request.body.date;
    var gameConfigKey = request.body.gameConfigKey;
    var user = request.auth.user;
    if (date !== void (0)) {
        date = new Date(date);
    }
    Persistence
        .recordScore({
        user: user,
        gameConfigKey: gameConfigKey,
        score: score,
        date: date,
    })
        .then(function (doc) {
        response.json(doc);
    })
        .catch(next);
});
app.get('/rest/getAllHighScores', function (request, response, next) {
    var latestScore = parseInt(request.query.latestScore);
    var gameConfigKey = request.query.gameConfigKey;
    var user = request.auth.user;
    Persistence
        .getAllHighScores({
        user: user,
        latestScore: latestScore,
        gameConfigKey: gameConfigKey,
    })
        .then(function (scores) {
        response.json(scores);
    })
        .catch(next);
});
var respondWithSentenceSet = function (response) { return function (sentenceSet) { return response.json({
    gameConfigKey: sentenceSet.gameConfigKey,
    sentences: sentenceSet.sentences,
}); }; };
app.put('/rest/sentenceSet/:gameConfigKey', function (request, response, next) {
    var gameConfigKey = request.params.gameConfigKey;
    var _a = request.body, sentences = _a.sentences, name = _a.name;
    Persistence
        .putSentenceSet({ gameConfigKey: gameConfigKey, sentences: sentences, name: name })
        .then(respondWithSentenceSet(response))
        .catch(next);
});
app.get('/rest/sentenceSet/:gameConfigKey', function (request, response, next) {
    var gameConfigKey = request.params.gameConfigKey;
    Persistence
        .getSentenceSet({ gameConfigKey: gameConfigKey })
        .then(respondWithSentenceSet(response))
        .catch(next);
});
app.get('/rest/sentenceSetList', function (request, response, next) {
    var user = request.body.user;
    Persistence
        .getSentenceSetList()
        .then(function (list) { return response.json(list); });
});
app.use(function (error, request, response, next) {
    console.error(error.stack);
    response.status(500);
    response.json({
        error: true,
        errorMessage: error.toString(),
        errorStack: error.stack,
    });
});
app.listen(port, function () {
    console.log("Example app listening on port " + port + " in " + __dirname);
});
//# sourceMappingURL=express-server.js.map