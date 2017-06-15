'use strict';

const Promise = require('promise');
const clone = require('clone');
const dateUtils = require('date-fns');
const assert = require('assert');

let mongoose = require('mongoose');
mongoose.Promise = Promise;

const scoreHistorySchema = new mongoose.Schema({
    gameConfigKey : {type : String, required : true},
    score : {type : Number, required : true},
    date : {type : Date, default : Date.now},
});

const ScoreHistory = mongoose.model('scoreHistory', scoreHistorySchema);

const init = function() {
    mongoose.connect('mongodb://localhost:27017/db');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function() {
        console.log('Connected to MongoDB');
    });
}

const recordScore = function(args)  {
    console.log(args);
    // {score, date = new Date()} = {}
    const score = args.score;
    const date = args.date;
    const gameConfigKey = args.gameConfigKey;

    assert(score !== void(0), 'score required');
    assert(gameConfigKey, 'gameConfigKey required');

    let scoreHistory = new ScoreHistory({score, date, gameConfigKey});
    let promise = scoreHistory.save();
    
    return promise;
};

const getHighScore = function(args) {
    const latestScore = args.latestScore;
    const since = args.since;
    const gameConfigKey = args.gameConfigKey;

    assert(gameConfigKey, 'gameConfigKey required');

    let query = {gameConfigKey};
    if (typeof since !== 'undefined') {
        query.date = { $gt : since };
    }

    const promise = ScoreHistory
        .findOne(query)
        .sort({score : -1})
        // .limit(1)
        .exec()
        .then(function (doc) {
            let score = doc !== null ? doc.score : 0;
            if (typeof latestScore !== 'undefined') {
                score = latestScore > score ? latestScore : score;
            }

            return score;
        });

    return promise;
};

const getAllHighScores = function (args) {
    const latestScore = args.latestScore;
    const gameConfigKey = args.gameConfigKey;

    assert(gameConfigKey, 'gameConfigKey is required');

    const now = new Date();
    let allTimePromise = getHighScore({
        gameConfigKey,
        latestScore,
    });

    let dayPromise = getHighScore({
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfDay(now),
    });

    let weekPromise = getHighScore({
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfWeek(now),
    });

    let monthPromise = getHighScore({
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfMonth(now),
    });

    let yearPromise = getHighScore({
        gameConfigKey,
        latestScore,
        since : dateUtils.startOfYear(now),
    });
    
    let promises = [
        allTimePromise,
        dayPromise,
        weekPromise,
        monthPromise,
        yearPromise,
    ];

    let allPromise = Promise
        .all(promises)
        .then(function (results) {
            return {
                allTimeHigh : results.shift(),
                dayHigh : results.shift(),
                weekHigh : results.shift(),
                monthHigh : results.shift(),
                yearHigh : results.shift(),
            };
        });

    return allPromise;
}

const disconnect = function () {
    return mongoose.disconnect();
}

const Persistence = module.exports = exports = {
    recordScore,
    getHighScore,
    getAllHighScores,
    init,
    disconnect,
    _test : {
        mongoose,
        ScoreHistory,
    },
};
