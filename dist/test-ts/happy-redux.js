"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var happy_redux_1 = require("../lib/happy-redux");
var chai_1 = require("chai");
var randomSeed = require("seed-random");
require("mocha");
var actions = happy_redux_1.default.actions;
var itEquals = function (description, value, match) {
    return it(description + " === " + match, function () { return chai_1.expect(value).to.deep.equal(match); });
};
var initDataTest = {
    gameConfigKey: '_testing_',
    name: 'Testing',
    sentences: [
        [
            [
                { isCorrect: true, text: "A:A - Right" },
                { isCorrect: false, text: "A:A - Wrong" },
            ],
            [
                { isCorrect: true, text: "A:B - Right" },
                { isCorrect: false, text: "A:B - Wrong" },
                { isCorrect: false, text: "A:B - Wrong.2" },
            ]
        ],
        [
            [
                { isCorrect: true, text: "B:A - Right" },
                { isCorrect: false, text: "B:A - Wrong" }
            ],
            [
                { isCorrect: true, text: "B:B - Right" },
                { isCorrect: false, text: "B:B - Wrong" },
                { isCorrect: false, text: "B:B - Wrong.2" }
            ],
            [
                { isCorrect: true, text: "B:C - Right" },
                { isCorrect: false, text: "B:C - Wrong" },
                { isCorrect: false, text: "B:C - Wrong.2" },
                { isCorrect: false, text: "B:C - Wrong.3" },
                { isCorrect: false, text: "B:C - Wrong.4" },
            ]
        ],
        [
            [
                { isCorrect: true, text: "C:A - Right" },
                { isCorrect: false, text: "C:A - Wrong" },
            ],
            [
                { isCorrect: true, text: "C:B - Right" },
                { isCorrect: false, text: "C:B - Wrong" },
                { isCorrect: false, text: "C:B - Wrong.2" },
            ],
            [
                { isCorrect: true, text: "C:C - Right" },
                { isCorrect: false, text: "C:C - Wrong" },
            ],
            [
                { isCorrect: true, text: "C:D - Right" },
                { isCorrect: false, text: "C:D - Wrong" },
                { isCorrect: false, text: "C:D - Wrong.2" },
            ],
            [
                { isCorrect: true, text: "C:E - Right" },
                { isCorrect: false, text: "C:E - Wrong" }
            ],
            [
                { isCorrect: true, text: "C:F - Right" },
                { isCorrect: false, text: "C:F - Wrong" },
                { isCorrect: false, text: "C:F - Wrong.2" },
            ],
            [
                { isCorrect: true, text: "C:G - Right" },
                { isCorrect: false, text: "C:G - Wrong" },
            ],
            [
                { isCorrect: true, text: "C:H - Right" },
                { isCorrect: false, text: "C:H - Wrong" },
                { isCorrect: false, text: "C:H - Wrong.2" },
            ],
        ]
    ]
};
var initDataTestYn = {
    gameConfigKey: "_yn_test_",
    name: "Testing YN",
    sentences: [
        [
            [
                {
                    text: "Is this true?",
                    isCorrect: true,
                },
            ],
            [
                {
                    text: "Yes",
                    isCorrect: true,
                },
                {
                    text: "No",
                    isCorrect: false,
                },
            ],
            [
                {
                    text: "!",
                    isCorrect: true,
                },
                {
                    text: ".",
                    isCorrect: false,
                },
            ],
        ],
        [
            [
                {
                    text: "WRONG",
                    isCorrect: false,
                },
                {
                    text: "RIGHT",
                    isCorrect: true,
                },
            ],
            [
                {
                    text: "NO CHOICE",
                    isCorrect: true,
                },
            ],
            [
                {
                    text: "WRONG",
                    isCorrect: false,
                },
                {
                    text: "RIGHT",
                    isCorrect: true,
                },
            ],
        ],
    ],
};
var main = function () {
    randomSeed('Something totally random!!!', { global: true });
    describe('main test', function () {
        var store = happy_redux_1.default.createHappyStore();
        store.dispatch({
            type: actions.INIT,
        });
        store.dispatch({
            type: actions.GAME_LOADED,
            initData: initDataTest,
        });
        {
            var sentenceData_1 = store.getState().sentenceData;
            describe('init()', function () {
                itEquals('# sentences right', sentenceData_1.availableSentences.length, 3);
                itEquals('[0][0][0].isCorrect', sentenceData_1.availableSentences[0][0][0].isCorrect, true);
                itEquals('[1][1][1].isCorrect', sentenceData_1.availableSentences[1][1][1].isCorrect, false);
                itEquals('[1][1][1].text', sentenceData_1.availableSentences[1][1][1].text, 'B:B - Wrong');
                itEquals('gameConfigKey', sentenceData_1.gameConfigKey, '_testing_');
            });
        }
        store.dispatch({
            type: actions.START,
            startTime: 1000,
            intervalId: 22,
        });
        {
            var timer_1 = store.getState().timer;
            describe('START', function () {
                itEquals('barRemaining', timer_1.barRemaining, 1.0);
                itEquals('startTime', timer_1.startTime, 1000);
                itEquals('ticks', timer_1.ticks, 0);
                itEquals('intervalId', timer_1.intervalId, 22);
            });
        }
        store.dispatch({
            type: actions.TICK,
            currentTime: 1024,
        });
        {
            var timer_2 = store.getState().timer;
            describe('TICK', function () {
                itEquals('barRemaining', timer_2.barRemaining, 1.0);
                itEquals('startTime', timer_2.startTime, 1000);
                itEquals('ticks', timer_2.ticks, 0);
            });
        }
        store.dispatch({
            type: actions.TICK,
            currentTime: 1026,
        });
        var previousBarRemaining;
        {
            var timer_3 = store.getState().timer;
            describe('TICK 2', function () {
                it('barRemaining <= 1.0', function () { chai_1.expect(timer_3.barRemaining).to.be.lessThan(1.0); });
                itEquals('ticks', timer_3.ticks, 1);
            });
            previousBarRemaining = timer_3.barRemaining;
        }
        store.dispatch({
            type: actions.TICK,
            currentTime: 1076,
        });
        var previousBarRemaining2;
        {
            var state_1 = store.getState();
            describe('TICK 3', function () {
                it('barRemaining <= previous', function () { return chai_1.expect(state_1.timer.barRemaining).to.be.lessThan(previousBarRemaining); });
                itEquals('ticks', state_1.timer.ticks, 3);
                itEquals('activeSentenceDisplay', state_1.activeSentenceDisplay, ['____', '____']);
                itEquals('activeClauseChoice[0]', state_1.activeClauseChoice[0], {
                    isCorrect: false,
                    text: 'A:A - Wrong',
                });
            });
            previousBarRemaining2 = state_1.timer.barRemaining;
        }
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'A:A - Right',
        });
        {
            var state_2 = store.getState();
            describe('CORRECT_CHOICE', function () {
                itEquals('activeSentenceDisplay', state_2.activeSentenceDisplay, ['A:A - Right', '____']);
                itEquals('activeClauseChoice[0]', state_2.activeClauseChoice[0], {
                    isCorrect: false,
                    text: 'A:B - Wrong.2',
                });
                itEquals('activeClauseChoice[2]', state_2.activeClauseChoice[2], {
                    isCorrect: true,
                    text: 'A:B - Right',
                });
                it('barRemaining > previous', function () { return chai_1.expect(state_2.timer.barRemaining).to.be.greaterThan(previousBarRemaining); });
            });
        }
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'A:B - Right',
        });
        {
            var state_3 = store.getState();
            describe('CORRECT_CHOICE 2', function () {
                itEquals('pastSentences', state_3.pastSentences, [['A:A - Right', 'A:B - Right']]);
                itEquals('score', state_3.score, 11);
                itEquals('activeSentenceDisplay', state_3.activeSentenceDisplay, [
                    '____',
                    '____',
                    '____',
                    '____',
                    '____',
                    '____',
                    '____',
                    '____',
                ]);
                itEquals('length', state_3.activeClauseChoice.length, 2);
                // console.log(JSON.stringify(state.activeClauseChoice, null, "    "));
                {
                    var _a = state_3.activeClauseChoice[0].clickedWrong, clickedWrong = _a === void 0 ? false : _a;
                    itEquals('clickedWrong', clickedWrong, false);
                }
            });
        }
        store.dispatch({
            type: actions.WRONG_CHOICE,
            activeClauseIndex: 0,
        });
        {
            var state_4 = store.getState();
            describe('WRONG_CHOICE', function () {
                itEquals('score', state_4.score, 11);
                {
                    var _a = state_4.activeClauseChoice[0].clickedWrong, clickedWrong = _a === void 0 ? false : _a;
                    itEquals('clickedWrong', clickedWrong, true);
                }
            });
        }
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'C:A - Right',
        });
        {
            var state_5 = store.getState();
            describe('CORRECT_CHOICE 3', function () {
                itEquals('score', state_5.score, 16);
                itEquals('done', state_5.done, false);
            });
        }
        store.dispatch({ type: actions.END });
        {
            var state_6 = store.getState();
            describe('END', function () {
                itEquals('done', state_6.done, true);
                itEquals('highScores', state_6.highScores, { loaded: false });
                // make sure gameConfigKey is still legit
                itEquals('gameConfigKey', state_6.sentenceData.gameConfigKey, '_testing_');
            });
        }
        store.dispatch({
            type: actions.SCORES_LOADED,
            highScores: {
                allTimeHigh: 1000,
                yearHigh: 1000,
                monthHigh: 1000,
                weekHigh: 1000,
                dayHigh: 1000,
                currentScore: 1000,
            },
        });
        {
            describe('SCORES_LOADED', function () {
                var state = store.getState();
                itEquals('highScores', state.highScores, {
                    loaded: true,
                    allTimeHigh: 1000,
                    yearHigh: 1000,
                    monthHigh: 1000,
                    weekHigh: 1000,
                    dayHigh: 1000,
                    currentScore: 1000,
                });
            });
        }
    });
    describe('yn test', function () {
        var store = happy_redux_1.default.createHappyStore();
        store.dispatch({
            type: actions.INIT,
        });
        store.dispatch({
            type: actions.GAME_LOADED,
            initData: initDataTestYn,
        });
        store.dispatch({
            type: actions.START,
            startTime: 1000,
            intervalId: 22,
        });
        describe('GAME_LOADED', function () {
            var state = store.getState();
            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['Is this true?', '____', '____']);
        });
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'Yes',
        });
        describe('CORRECT_CHOICE', function () {
            var state = store.getState();
            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['Is this true?', 'Yes', '____']);
        });
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: '!',
        });
        describe('CORRECT_CHOICE 2', function () {
            var state = store.getState();
            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['____', 'NO CHOICE', '____']);
            itEquals('pastSentences', state.pastSentences, [['Is this true?', 'Yes', '!']]);
        });
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'RIGHT',
        });
        describe('CORRECT_CHOICE 3', function () {
            var state = store.getState();
            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['RIGHT', 'NO CHOICE', '____']);
        });
        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text: 'RIGHT',
        });
        describe('CORRECT_CHOICE 3', function () {
            var state = store.getState();
            itEquals('pastSentences[1]', state.pastSentences[1], ['RIGHT', 'NO CHOICE', 'RIGHT']);
        });
    });
};
main();
//# sourceMappingURL=happy-redux.js.map