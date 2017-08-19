"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dateUtils = require("date-fns");
var child_process = require("child_process");
var Promise = require("promise");
var tmp = require("tmp");
var Persistence = require("../server-lib/persistence");
// const assert = require('assert');
var timeout = function (milliseconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, milliseconds);
    });
};
;
var startTmpMongoDb = function () {
    var tmpDir = tmp.dirSync().name;
    var port = 27018;
    var tmpMongoDbProcess = child_process.spawn('mongod', [
        '--dbpath', tmpDir,
        '--port', "" + port,
        '--journal',
    ], { stdio: 'ignore' });
    // {stdio : 'inherit'});
    // Wait at least 1 second before trying to connect
    return timeout(1000).then(function () {
        return {
            process: tmpMongoDbProcess,
            url: 'mongodb://localhost:' + port + '/db',
        };
    });
};
var ItPromise = (function () {
    function ItPromise(promise) {
        this.promise = promise;
    }
    ItPromise.prototype.succeeds = function () {
        var _this = this;
        it('succeeds', function () { return _this.promise; });
    };
    // private identityTransform(value : T) : T {return value}
    ItPromise.prototype.equals = function (name, match, transform) {
        var _this = this;
        it(name + ' === ' + match, function () {
            return _this.promise.then(function (rawValue) {
                var value = transform(rawValue);
                chai_1.expect(value).to.equal(match);
            });
        });
    };
    return ItPromise;
}());
var tryPersistInit = function (_a) {
    var url = _a.url, triesRemaing = _a.triesRemaing;
    return Persistence
        .init({ url: url, silent: true }) // silent to avoid stack traces for each attempt
        .catch(function (err) {
        if (err.name = 'MongoError' && triesRemaing > 1) {
            return timeout(500) // wait before trying again
                .then(function () {
                return tryPersistInit({ url: url, triesRemaing: triesRemaing - 1 });
            });
        }
        else {
            throw err;
        }
    });
};
var main = function () {
    var mongoProcess;
    var user = '_test_user_';
    before(function () {
        startTmpMongoDb()
            .then(function (mongoInfo) {
            mongoProcess = mongoInfo.process;
            return tryPersistInit({ url: mongoInfo.url, triesRemaing: 10 });
        });
    });
    describe('persistence.js', function () {
        describe('#putSentenceSet -> #getSentenceSet', function () {
            var itPromise = new ItPromise(Persistence
                .putSentenceSet({
                gameConfigKey: '__test__',
                sentences: [[[{
                                text: 'text',
                                isCorrect: true,
                            }]]],
            })
                .then(function () {
                return Persistence
                    .getSentenceSet({ gameConfigKey: '__test__' });
            }));
            itPromise.equals('sentences[0][0][0].text', 'text', function (sentenceSet) {
                return sentenceSet.sentences[0][0][0].text;
            });
        });
        describe('#getAllHighScores(130)', function () {
            var itPromise = new ItPromise(Persistence
                .getAllHighScores({
                user: user,
                latestScore: 130,
                gameConfigKey: '_test_',
            }));
            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 130, function (all) { return all.allTimeHigh; });
            itPromise.equals('weekHigh', 130, function (all) { return all.weekHigh; });
            itPromise.equals('dayHigh', 130, function (all) { return all.dayHigh; });
        });
        describe('#recordScore(135) -> getAllHighScores(130)', function () {
            var testDate = new Date('2017-07-19T11:45:50.241Z');
            var yesterday = dateUtils.addDays(testDate, -1);
            var itPromise = new ItPromise(Persistence
                .recordScore({
                user: user,
                gameConfigKey: '_test_',
                score: 135,
                date: yesterday,
            })
                .then(function () {
                return Persistence
                    .getAllHighScores({
                    user: user,
                    latestScore: 130,
                    gameConfigKey: '_test_',
                    date: testDate,
                });
            }));
            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 135, function (all) { return all.allTimeHigh; });
            itPromise.equals('weekHigh', 135, function (all) { return all.weekHigh; });
            itPromise.equals('dayHigh', 130, function (all) { return all.dayHigh; });
        });
        describe('#recordScore(2000, _new_test_user_) -> getAllHighScores(130, _test_user_)', function () {
            var testDate = new Date('2017-07-19T11:45:50.241Z');
            var yesterday = dateUtils.addDays(testDate, -1);
            var user2 = '_new_test_user_';
            var itPromise = new ItPromise(Persistence
                .recordScore({
                user: user2,
                gameConfigKey: '_test_',
                score: 2000,
                date: yesterday,
            })
                .then(function () {
                return Promise
                    .all([
                    Persistence
                        .getAllHighScores({
                        user: user,
                        latestScore: 130,
                        gameConfigKey: '_test_',
                        date: testDate,
                    }),
                    Persistence
                        .getAllHighScores({
                        user: user2,
                        latestScore: 130,
                        gameConfigKey: '_test_',
                        date: testDate,
                    }),
                ]);
            }));
            itPromise.succeeds();
            itPromise.equals('allTimeHigh', 135, function (all) { return all[0].allTimeHigh; });
            itPromise.equals('weekHigh', 135, function (all) { return all[0].weekHigh; });
            itPromise.equals('dayHigh', 130, function (all) { return all[0].dayHigh; });
            itPromise.equals('allTimeHigh[user2]', 2000, function (all) { return all[1].allTimeHigh; });
            itPromise.equals('weekHigh[user2]', 2000, function (all) { return all[1].weekHigh; });
            itPromise.equals('dayHigh[user2]', 130, function (all) { return all[1].dayHigh; });
        });
    });
    after(function () {
        Persistence.disconnect();
        mongoProcess.kill();
    });
};
main();
//# sourceMappingURL=persistence.js.map