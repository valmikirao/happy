'use strict';

const dateUtils = require('date-fns');

const Persistence = require('./persistence');
// const assert = require('assert');

const main = function () {
    Persistence.init();

    // let pastDate = new Date();
    // pastDate.setHours(2);

    Persistence
        .getAllHighScores({
            latestScore : 130,
            gameConfigKey : '_test_',
        })
        .then(function (allHighScores) {
            console.log('Success:', allHighScores);
            Persistence.disconnect();
        })
        .catch(function (error) {
            console.error('Failure:', error);
        });

    // Persistence
    //     .getHighScores({since : pastDate})
    //     .then(function (value) {
    //         console.log('Found:', value);
    //         Persistence.disconnect();
    //     })
    //     .catch(function (error) {
    //         console.error('error:', error);
    //     });
        
    // let now = new Date();
    // let daysInPastArray = [2, 5, 15, 45, 100, 1000];
    // let recordScorePromises = daysInPastArray
    //     .map(function (daysInPast) {
    //         let date = dateUtils.addDays(now, -daysInPast);
    //         let score = daysInPast * 10;

    //         let recordScorePromise = Persistence.recordScore({
    //             gameConfigKey : '_test_',
    //             score,
    //             date, 
    //         });

    //         return recordScorePromise;
    //     });

    // Promise
    //     .all(recordScorePromises)
    //     .then(function (docs) {
    //         console.log('Success', docs);
    //         Persistence.disconnect();
    //     })
    //     .catch(function (error) {
    //         console.error('error:', error);
    //     });
    
    // pastDate = dateUtils.addDays(pastDate, -2);

    // let persistencePromise = Persistence
    //     .recordScore({
    //         score : 120,
    //         date : pastDate,
    //     })
    //     .then(function (value) {
    //         console.log('Success', value);
            
    //         return Persistence.disconnect();
    //     })
    //     .then(function () {
    //         console.log('Disconnected');
    //     })
    //     .catch(function (value) {
    //         console.log('Failure', value);
    //     });
    
};

main();