'use strict';

const dateUtils = require('date-fns');
const expect = require('chai').expect;

const child_process = require('child_process');
const Promise = require('promise');
const tmp = require('tmp');
// const Mockgoose = require('mockgoose').Mockgoose;

const Persistence = require('../server-lib/persistence');

// const assert = require('assert');

const timeout = function (milliseconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, milliseconds);
    })
}

const startTmpMongoDb = function() {
    let tmpDir = tmp.dirSync().name;

    const port = 27018;

    let returnPromise = timeout(1000)
        .then(function () {
            let tmpMongoDbProcess = child_process.spawn('mongod', [
                '--dbpath', tmpDir,
                '--port', port,
                '--journal',
            ], {stdio : 'inherit'});

            // there is probably a more complete way to make sure the server is ready,
            // but waiting 1 second is good enough
            return timeout(1000).then(function () {
                return {
                    process : tmpMongoDbProcess,
                    url : 'mongodb://localhost:' + port + '/db',
                }
            });
        });
    
    return returnPromise;
};

const ItPromise = function (promise) {
    this.promise = promise;
}

ItPromise.prototype = {
    succeeds : function () {
        let promise = this.promise;

        it('succeeds', function () {return promise});
    },
    equals : function(name, match, transform) {
        let promise = this.promise;

        transform = transform || function (value) {return value};
        it(name + ' === ' + match, function () {
            return promise.then(function (rawValue) {
                let value = transform(rawValue);

                expect(value).to.equal(match);
            });
        })
    }
};
    // it('allTime === 130', function () {return itPromise.then(function (all) {expect(all.allTimeHigh).to.equal(140)})});
    // itPromise.equals('allTime', 130, function (all) {return all.allTimeHigh})
    // itPromise.equals({name : 'allTime', value : 130, from : function (all) {return all.allTimeHigh}})
// }

const main = function () {
    let mongoProcess;

    before(done => {
        startTmpMongoDb()
            .then(function (mongoInfo) {
                mongoProcess = mongoInfo.process;

                return Persistence.init({url : mongoInfo.url});
            })
            .then(() => {done()})
            .catch(done);

        // let mockgoose = new Mockgoose(Persistence._test.mongoose);

        // mockgoose.prepareStorage()
        //     .then(function () {
        //         return Persistence.init();
        //     })
        //     .then(function () {
        //         done();
        //     })
        //     .catch(function (error) {
        //         done(error);
        //     })
    });


    describe('persistence.js', function () {
        describe('#getAllHighScores(130)', function () {
            let itPromise = new ItPromise(
                Persistence
                    .getAllHighScores({
                        latestScore : 130,
                        gameConfigKey : '_test_',
                    })
            );

            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 130, function (all) {return all.allTimeHigh});
            itPromise.equals('weekHigh', 130, function (all) {return all.weekHigh});
            itPromise.equals('dayHigh', 130, function (all) {return all.dayHigh});
        });

        describe('#recordScord(135) -> getAllHighScores(130)', function () {
            let now = new Date();
            let yesterday = dateUtils.addDays(now, -1);

            let itPromise = new ItPromise(
                Persistence
                    .recordScore({
                        gameConfigKey : '_test_',
                        score: 135,
                        date : yesterday,
                    })
                    .then(function () {
                        return Persistence
                            .getAllHighScores({
                                latestScore : 130,
                                gameConfigKey : '_test_',
                            })
                    })
            );

            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 135, function (all) {return all.allTimeHigh});
            itPromise.equals('weekHigh', 135, function (all) {return all.weekHigh});
            itPromise.equals('dayHigh', 130, function (all) {return all.dayHigh});
        });
    });

    after(function () {
        Persistence
            .disconnect()
            .then(() => mongoProcess.kill());
    });

    // let pastDate = new Date();
    // pastDate.setHours(2);

    // Persistence
    //     .getAllHighScores({
    //         latestScore : 130,
    //         gameConfigKey : '_test_',
    //     })
    //     .then(function (allHighScores) {
    //         // console.log('Success:', allHighScores);
    //         expect(allHighScores.allTimeHigh).to.equal(130);
    //         Persistence.disconnect();
    //     })
    //     .catch(function (error) {
    //         console.error('Failure:', error);
    //     });

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