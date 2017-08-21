"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var ItPromise = (function (_super) {
    __extends(ItPromise, _super);
    function ItPromise() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItPromise.prototype.succeeds = function () {
        var _this = this;
        it('succeeds', function () { return _this; });
    };
    // private identityTransform(value : T) : T {return value}
    ItPromise.prototype.equals = function (name, match, transform) {
        var _this = this;
        it(name + ' === ' + match, function () {
            return _this.then(function (rawValue) {
                var value = transform(rawValue);
                chai_1.expect(value).to.equal(match);
            });
        });
    };
    return ItPromise;
}(Promise));
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
function itAsync(description, promise) {
    it(description, function () { return promise; });
}
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
        var gameConfigKey = '__test__';
        var gameConfigKey2 = '__test_2__';
        var getSetAsync = Persistence
            .putSentenceSet({
            gameConfigKey: gameConfigKey,
            name: 'Test',
            sentences: [[[{
                            text: 'text',
                            isCorrect: true,
                        }]]],
        })
            .then(function () { return Persistence
            .putSentenceSet({
            gameConfigKey: gameConfigKey2,
            name: 'Test 2',
            sentences: [[[{
                            text: 'text 2',
                            isCorrect: true,
                        }]]],
        }); })
            .then(function () {
            return Persistence
                .getSentenceSet({ gameConfigKey: gameConfigKey });
        });
        describe('#putSentenceSet -> #getSentenceSet', function () {
            itAsync('name', getSetAsync.then(function (_a) {
                var name = _a.name;
                return chai_1.expect(name).to.equal('Test');
            }));
            itAsync('sentences[0][0][0].text', getSetAsync.then(function (_a) {
                var sentences = _a.sentences;
                return chai_1.expect(sentences[0][0][0].text).to.equal('text');
            }));
        });
        var getOtherSetAsync = getSetAsync
            .then(function () { return Persistence
            .getSentenceSet({ gameConfigKey: gameConfigKey2 }); });
        describe('#putSentenceSet -> #getSentenceSet 2', function () {
            itAsync('name', getOtherSetAsync.then(function (_a) {
                var name = _a.name;
                return chai_1.expect(name).to.equal('Test 2');
            }));
            itAsync('sentences[0][0][0].text', getOtherSetAsync.then(function (_a) {
                var sentences = _a.sentences;
                return chai_1.expect(sentences[0][0][0].text).to.equal('text 2');
            }));
        });
        var getListAsync = getOtherSetAsync
            .then(function () { return Persistence
            .getSentenceSetList(); });
        describe('#getSentenceSetList', function () {
            itAsync('list is right', getListAsync.then(function (list) { return chai_1.expect(list).to.deep.equal([
                { name: 'Test', gameConfigKey: gameConfigKey },
                { name: 'Test 2', gameConfigKey: gameConfigKey2 },
            ]); }));
        });
        var getAllSameAsync = getListAsync.then(function () {
            return Persistence
                .getAllHighScores({
                user: user,
                latestScore: 130,
                gameConfigKey: gameConfigKey,
            });
        });
        describe('#getAllHighScores(130)', function () {
            itAsync('allTimeHigh', getAllSameAsync.then(function (_a) {
                var allTimeHigh = _a.allTimeHigh;
                return chai_1.expect(allTimeHigh).to.equal(130);
            }));
            itAsync('weekHigh', getAllSameAsync.then(function (_a) {
                var weekHigh = _a.weekHigh;
                return chai_1.expect(weekHigh).to.equal(130);
            }));
            itAsync('dayHigh', getAllSameAsync.then(function (_a) {
                var dayHigh = _a.dayHigh;
                return chai_1.expect(dayHigh).to.equal(130);
            }));
        });
        var testDate = new Date('2017-07-19T11:45:50.241Z');
        var yesterday = dateUtils.addDays(testDate, -1);
        var getAllDifferentAsync = getAllSameAsync
            .then(function () { return Persistence
            .recordScore({
            user: user,
            gameConfigKey: gameConfigKey,
            score: 135,
            date: yesterday,
        }); })
            .then(function () { return Persistence
            .getAllHighScores({
            user: user,
            latestScore: 130,
            gameConfigKey: gameConfigKey,
            date: testDate,
        }); });
        describe('#recordScore(135) -> getAllHighScores(130)', function () {
            itAsync('allTimeHigh', getAllDifferentAsync.then(function (_a) {
                var allTimeHigh = _a.allTimeHigh;
                return chai_1.expect(allTimeHigh).to.equal(135);
            }));
            itAsync('weekHigh', getAllDifferentAsync.then(function (_a) {
                var weekHigh = _a.weekHigh;
                return chai_1.expect(weekHigh).to.equal(135);
            }));
            itAsync('dayHigh', getAllDifferentAsync.then(function (_a) {
                var dayHigh = _a.dayHigh;
                return chai_1.expect(dayHigh).to.equal(130);
            }));
        });
        var user2 = '_test_user_2_';
        var getAllMultiUser = getAllDifferentAsync
            .then(function () { return Persistence
            .recordScore({
            user: user2,
            gameConfigKey: gameConfigKey,
            score: 2000,
            date: yesterday,
        }); })
            .then(function () { return Persistence
            .getAllHighScores({
            user: user,
            latestScore: 130,
            gameConfigKey: gameConfigKey,
            date: testDate,
        }); });
        describe('#recordScore(2000, _new_test_user_) -> getAllHighScores(130, _test_user_)', function () {
            itAsync('allTimeHigh', getAllMultiUser.then(function (_a) {
                var allTimeHigh = _a.allTimeHigh;
                return chai_1.expect(allTimeHigh).to.equal(135);
            }));
            itAsync('weekHigh', getAllMultiUser.then(function (_a) {
                var weekHigh = _a.weekHigh;
                return chai_1.expect(weekHigh).to.equal(135);
            }));
            itAsync('dayHigh', getAllMultiUser.then(function (_a) {
                var dayHigh = _a.dayHigh;
                return chai_1.expect(dayHigh).to.equal(130);
            }));
            var getAllMultiUser2 = getAllMultiUser
                .then(function () { return Persistence
                .getAllHighScores({
                user: user2,
                latestScore: 130,
                gameConfigKey: gameConfigKey,
                date: testDate,
            }); });
            itAsync('allTimeHigh[user2]', getAllMultiUser2.then(function (_a) {
                var allTimeHigh = _a.allTimeHigh;
                return chai_1.expect(allTimeHigh).to.equal(2000);
            }));
            itAsync('weekHigh[user2]', getAllMultiUser2.then(function (_a) {
                var weekHigh = _a.weekHigh;
                return chai_1.expect(weekHigh).to.equal(2000);
            }));
            itAsync('dayHigh[user2]', getAllMultiUser2.then(function (_a) {
                var dayHigh = _a.dayHigh;
                return chai_1.expect(dayHigh).to.equal(130);
            }));
        });
    });
    after(function () {
        Persistence.disconnect();
        mongoProcess.kill();
    });
};
main();
//# sourceMappingURL=persistence.js.map