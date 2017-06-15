'use strict';

let mongoose = require('mongoose');
const Promise = require('promise');
const clone = require('clone');
const dateUtils = require('date-fns');

let initialized = false;

const initDb = function () {
    mongoose.connect('mongodb://localhost:27017/db');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function() {
        console.log('Connected to MongoDB');
    });

    initialized = true;
};

const scoreHistorySchema = new mongoose.Schema({
    score : Number,
    date : {type : Date, default : Date.now},
});

const ScoreHistory = mongoose.model('scoreHistory', scoreHistorySchema);

const recordScore = function(args)  {
    if (!initialized) thow('mongo not initialized');

    // {score, date = new Date()} = {}
    const score = args.score;
    const date = args.date;
    assert(score, 'score required');

    let scoreHistory = new ScoreHistory({score, date});
    let scoreHistorySavePromise = new Promise(function (resolve, reject) {
        scoreHistory.save(function (error, scoreHistorySaved) {
            if (error) {
                reject(error);
            }
            else {
                resolve(scoreHistorySaved);
            }
        })
    });
    
    return scoreHistorySavePromise;
};

const getHighScores = function(args) {
    if (!initialized) thow('mongo not initialized');

    const latestScore = args.latestScore;
    const date = args.date;

    const day = dateUtils.startOfDay(date);

    // NOW: need to remember how to get aggregated values from mongo
}

// const utils = {
//     truncToDay : function (date) {
//         let day = clone(date);

//         day.setMilliseconds(0);
//         day.setSeconds(0);
//         day.setMinutes(0);
//         day.setHours(0);

//         return day; 
//     },
//     truncToWeek : function (date) {
//         let day = clone(date);

//         day.setMilliseconds(0);
//         day.setSeconds(0);
//         day.setMinutes(0);
//         day.setHours(0);
//         new Date().s

//         return day; 
        
//     }
// };

const Persistence = module.exports = exports = {
    recordScore,
    $testing : {utils},
};

