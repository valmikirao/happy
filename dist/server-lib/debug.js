"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var dateUtils = require("date-fns");
var Persistence = require("../server-lib/persistence");
var it = function (_, call) { return call(); };
var ItPromise = (function () {
    function ItPromise(promise) {
        this.promise = promise;
    }
    ItPromise.prototype.succeeds = function () {
        var _this = this;
        it('succeeds', function () { return _this.promise; });
    };
    ItPromise.prototype.identityTransform = function (value) { return value; };
    ItPromise.prototype.equals = function (name, match, transform) {
        var _this = this;
        if (transform === void 0) { transform = this.identityTransform; }
        it(name + ' === ' + match, function () {
            return _this.promise.then(function (rawValue) {
                var value = transform(rawValue);
                chai_1.expect(1).to.equal(2);
                chai_1.expect(value).to.equal(match);
            });
        });
    };
    return ItPromise;
}());
var testDate = new Date('2017-07-19T11:45:50.241Z');
var yesterday = dateUtils.addDays(testDate, -1);
var itPromise = new ItPromise(Persistence
    .recordScore({
    gameConfigKey: '_test_',
    score: 135,
    date: yesterday,
})
    .then(function () {
    return Persistence
        .getAllHighScores({
        latestScore: 130,
        gameConfigKey: '_test_',
        date: testDate,
    });
}));
itPromise.succeeds();
itPromise.equals('allTimeHigh', 135, function (all) { return all.allTimeHigh; });
itPromise.equals('weekHigh', 135, function (all) { return all.weekHigh; });
itPromise.equals('dayHigh', 130, function (all) { return all.dayHigh; });
//# sourceMappingURL=debug.js.map