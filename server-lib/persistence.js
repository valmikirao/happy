"use strict";
/// <reference path="types.d.ts"/>
exports.__esModule = true;
var Promise = require("promise");
var dateUtils = require("date-fns");
var assert = require("assert");
var mongoose = require("mongoose");
mongoose.Promise = Promise;
var scoreHistorySchema = new mongoose.Schema({
    user: { type: String, required: true },
    gameConfigKey: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, "default": Date.now }
});
var ScoreHistory = mongoose.model('scoreHistory', scoreHistorySchema);
var sentenceSetSchema = new mongoose.Schema({
    gameConfigKey: { type: String, required: true, unique: true },
    sentences: [[[{
                    text: { type: String, required: true },
                    isCorrect: { type: Boolean, required: true }
                }]]]
});
var SentenceSet = mongoose.model('sentenceSet', sentenceSetSchema);
var init = function (_a) {
    var _b = (_a === void 0 ? {} : _a).url, url = _b === void 0 ? 'mongodb://localhost:27017/db' : _b;
    mongoose.connect(url, {
        useMongoClient: true
    });
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    var returnPromise = new Promise(function (resolve, reject) {
        mongoose.connection.once('open', function () {
            console.log('Connected to MongoDB');
            resolve(mongoose.connection);
        });
        mongoose.connection.on('error', reject);
    });
    return returnPromise;
};
exports.init = init;
var recordScore = function (_a) {
    var score = _a.score, _b = _a.date, date = _b === void 0 ? undefined : _b, gameConfigKey = _a.gameConfigKey, user = _a.user;
    var scoreHistory = new ScoreHistory({ score: score, date: date, gameConfigKey: gameConfigKey, user: user });
    // types force us to be convoluted here,
    // I have a feeling mong
    var promise = scoreHistory.save();
    // let promise  = new Promise<IScoreHistoryModel>((resolve) => {
    //     scoreHistory.save(resolve)
    // });
    return promise;
};
exports.recordScore = recordScore;
var getHighScore = function (_a) {
    var _b = _a.latestScore, latestScore = _b === void 0 ? null : _b, _c = _a.since, since = _c === void 0 ? null : _c, gameConfigKey = _a.gameConfigKey;
    var query = { gameConfigKey: gameConfigKey };
    if (since !== null) {
        query.date = { $gt: since };
    }
    var promise = ScoreHistory
        .findOne(query)
        .sort({ score: -1 })
        .exec()
        .then(function (doc) {
        var score = doc !== null ? doc.score : 0;
        if (latestScore !== null) {
            score = latestScore > score ? latestScore : score;
        }
        return score;
    });
    return promise;
};
exports.getHighScore = getHighScore;
var getAllHighScores = function (args) {
    var latestScore = args.latestScore, gameConfigKey = args.gameConfigKey, user = args.user;
    var _a = args.date, date = _a === void 0 ? new Date() : _a; // date defaults to now
    assert(gameConfigKey, 'gameConfigKey is required');
    var allTimePromise = getHighScore({
        user: user,
        gameConfigKey: gameConfigKey,
        latestScore: latestScore
    });
    var dayPromise = getHighScore({
        user: user,
        gameConfigKey: gameConfigKey,
        latestScore: latestScore,
        since: dateUtils.startOfDay(date)
    });
    var weekPromise = getHighScore({
        user: user,
        gameConfigKey: gameConfigKey,
        latestScore: latestScore,
        since: dateUtils.startOfWeek(date)
    });
    var monthPromise = getHighScore({
        user: user,
        gameConfigKey: gameConfigKey,
        latestScore: latestScore,
        since: dateUtils.startOfMonth(date)
    });
    var yearPromise = getHighScore({
        user: user,
        gameConfigKey: gameConfigKey,
        latestScore: latestScore,
        since: dateUtils.startOfYear(date)
    });
    var promises = [
        allTimePromise,
        dayPromise,
        weekPromise,
        monthPromise,
        yearPromise,
    ];
    var allPromise = Promise
        .all(promises)
        .then(function (results) {
        return {
            allTimeHigh: results.shift(),
            dayHigh: results.shift(),
            weekHigh: results.shift(),
            monthHigh: results.shift(),
            yearHigh: results.shift()
        };
    });
    return allPromise;
};
exports.getAllHighScores = getAllHighScores;
var getSentenceSet = function (_a) {
    var gameConfigKey = _a.gameConfigKey;
    return SentenceSet
        .findOne({ gameConfigKey: gameConfigKey })
        .exec();
};
exports.getSentenceSet = getSentenceSet;
var putSentenceSet = function (sentenceData) { return new SentenceSet(sentenceData).save(); };
exports.putSentenceSet = putSentenceSet;
var disconnect = function () {
    return mongoose.disconnect();
};
exports.disconnect = disconnect;
