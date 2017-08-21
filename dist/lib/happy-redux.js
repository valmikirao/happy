"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var react_redux_1 = require("react-redux");
var redux_thunk_1 = require("redux-thunk");
var queryString = require("query-string");
var clone = require("clone");
var array_random_1 = require("./array-random");
require('isomorphic-fetch');
var HappyRedux;
(function (HappyRedux) {
    HappyRedux.connectScore = react_redux_1.connect(function (_a) {
        var score = (_a === void 0 ? { score: 0 } : _a).score;
        return ({
            value: score,
        });
    }, function () { return ({}); });
    HappyRedux.TICK_INTERVAL = 25; // ms
    var DefaultSentenceGenerator = (function () {
        function class_1() {
        }
        /*
            I would prefer not to have different instance and static classes,
            but typescript is weird about static methods for interfaces.  There is
            probably a way to do it, but I already spent too much time trying
            to figure it out
        */
        class_1.getInstance = function (_a) {
            var sentenceData = _a.sentenceData;
            return new DefaultSentenceGeneratorIntance({ sentenceData: sentenceData });
        };
        class_1.initSentenceData = function (sentenceSetData) {
            return {
                gameConfigKey: sentenceSetData.gameConfigKey,
                availableSentences: sentenceSetData.sentences,
                activeSentence: null,
                activeSentencesCorrect: [],
                activeClauseChoice: null,
                clauseChoiceCountInSentence: 0,
            };
        };
        return class_1;
    }());
    function isClauseChoiceMulti(clauseChoice) {
        return !(clauseChoice.length === 1 && clauseChoice[0].isCorrect);
    }
    var DefaultSentenceGeneratorIntance = (function () {
        function DefaultSentenceGeneratorIntance(_a) {
            var sentenceData = _a.sentenceData;
            this.sentenceData = sentenceData;
        }
        DefaultSentenceGeneratorIntance.prototype.getGameConfigKey = function () {
            // might be more complicated than this some day
            return this.sentenceData.gameConfigKey;
        };
        DefaultSentenceGeneratorIntance.prototype.getNextSentenceData = function () {
            var sentenceData = this.sentenceData;
            var availableSentences = sentenceData.availableSentences;
            var activeSentence = array_random_1.randomElement(availableSentences);
            var clauseChoiceCountInSentence = activeSentence.findIndex(function (clauseChoice) { return isClauseChoiceMulti(clauseChoice); });
            var activeClauseChoice = array_random_1.shuffle(activeSentence[clauseChoiceCountInSentence]);
            var activeSentencesCorrect = activeSentence.map(function (clauseChoice) {
                return !isClauseChoiceMulti(clauseChoice) ?
                    clauseChoice[0].text
                    : null;
            });
            return __assign({}, sentenceData, { availableSentences: availableSentences,
                activeSentence: activeSentence,
                activeClauseChoice: activeClauseChoice,
                clauseChoiceCountInSentence: clauseChoiceCountInSentence,
                activeSentencesCorrect: activeSentencesCorrect });
        };
        DefaultSentenceGeneratorIntance.prototype.getActiveSentenceDisplay = function () {
            var sentenceData = this.sentenceData;
            var activeSentence = sentenceData.activeSentence, activeSentencesCorrect = sentenceData.activeSentencesCorrect;
            return activeSentencesCorrect.map(function (sentenceCorrect) {
                return sentenceCorrect !== null ?
                    sentenceCorrect
                    : '____';
            });
        };
        DefaultSentenceGeneratorIntance.prototype.getActiveClauseChoice = function () {
            return this.sentenceData.activeClauseChoice;
        };
        DefaultSentenceGeneratorIntance.prototype.getSentenceDataCorrectChoice = function (args) {
            var text = args.text;
            var sentenceData = this.sentenceData;
            var activeSentence = sentenceData.activeSentence, clauseChoiceCountInSentence = sentenceData.clauseChoiceCountInSentence, activeSentencesCorrect = sentenceData.activeSentencesCorrect;
            activeSentencesCorrect = clone(activeSentencesCorrect);
            activeSentencesCorrect[clauseChoiceCountInSentence] = text;
            var activeClauseChoice = null;
            while (true) {
                clauseChoiceCountInSentence++;
                if (clauseChoiceCountInSentence >= activeSentence.length)
                    break;
                var candidateClauseChoice = activeSentence[clauseChoiceCountInSentence];
                if (isClauseChoiceMulti(candidateClauseChoice)) {
                    activeClauseChoice = array_random_1.shuffle(candidateClauseChoice);
                    break;
                }
            }
            return __assign({}, sentenceData, { clauseChoiceCountInSentence: clauseChoiceCountInSentence,
                activeClauseChoice: activeClauseChoice,
                activeSentencesCorrect: activeSentencesCorrect });
        };
        DefaultSentenceGeneratorIntance.prototype.isSentenceDone = function () {
            return this.sentenceData.activeClauseChoice === null;
        };
        return DefaultSentenceGeneratorIntance;
    }());
    ;
    var SentenceGenerator = DefaultSentenceGenerator;
    ;
    var getInitialState = function () {
        return {
            sentenceData: null,
            score: 0,
            activeSentenceDisplay: null,
            activeClauseChoice: null,
            pastSentences: [],
            started: false,
            loaded: false,
            done: false,
            streak: 0,
            timer: {
                startTime: null,
                ticks: 0,
                barRemaining: 1.0,
                intervalId: null,
            },
            highScores: {
                loaded: false,
            },
        };
    };
    HappyRedux.actions = {
        INIT: 'action_INIT',
        CORRECT_CHOICE: 'action_CORRECT_CHOICE',
        WRONG_CHOICE: 'action_WRONG_CHOICE',
        START: 'action_START',
        TICK: 'action_TICK',
        END: 'actions_END',
        SCORES_LOADED: 'action_SCORES_LOADED',
        GAME_LOADED: 'action_GAME_LOADED',
    };
    var happyGameApp = function (state, action) {
        // const {SentenceGenerator} = HappyRedux;
        switch (action.type) {
            case HappyRedux.actions.INIT: {
                return getInitialState();
            }
            case HappyRedux.actions.GAME_LOADED: {
                var initData = action.initData;
                var sentenceData = SentenceGenerator.initSentenceData(initData);
                return __assign({}, state, { sentenceData: sentenceData, loaded: true });
            }
            case HappyRedux.actions.START: {
                var sentenceData = state.sentenceData;
                var startTime = action.startTime, intervalId = action.intervalId;
                var sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
                sentenceData = sentenceGenerator.getNextSentenceData();
                sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
                var activeSentenceDisplay = sentenceGenerator.getActiveSentenceDisplay();
                var activeClauseChoice = sentenceGenerator.getActiveClauseChoice();
                return __assign({}, state, { sentenceData: sentenceData,
                    activeSentenceDisplay: activeSentenceDisplay,
                    activeClauseChoice: activeClauseChoice, started: true, done: false, score: 0, streak: 0, timer: {
                        startTime: startTime,
                        intervalId: intervalId,
                        ticks: 0,
                        barRemaining: 1.0,
                    } });
            }
            case HappyRedux.actions.END: {
                return __assign({}, state, { done: true });
            }
            case HappyRedux.actions.CORRECT_CHOICE: {
                var sentenceData = state.sentenceData;
                var activeSentenceDisplay = state.activeSentenceDisplay, activeClauseChoice = state.activeClauseChoice, done = state.done;
                var score = state.score, streak = state.streak, pastSentences = state.pastSentences, timer = state.timer;
                if (done) {
                    // this shouldn't happen, just in case
                    return happyGameApp(state, { type: HappyRedux.actions.END });
                }
                var text = action.text;
                score += 5 + streak;
                streak++;
                var sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
                sentenceData = sentenceGenerator.getSentenceDataCorrectChoice({ text: text });
                sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
                if (sentenceGenerator.isSentenceDone()) {
                    pastSentences = pastSentences.concat([
                        sentenceGenerator.getActiveSentenceDisplay(),
                    ]);
                    sentenceData = sentenceGenerator.getNextSentenceData();
                    sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
                }
                activeSentenceDisplay = sentenceGenerator.getActiveSentenceDisplay();
                activeClauseChoice = sentenceGenerator.getActiveClauseChoice();
                var barRemaining = timer.barRemaining;
                barRemaining += .1;
                timer = __assign({}, timer, { barRemaining: barRemaining });
                return __assign({}, state, { sentenceData: sentenceData,
                    activeSentenceDisplay: activeSentenceDisplay,
                    activeClauseChoice: activeClauseChoice,
                    score: score,
                    pastSentences: pastSentences,
                    streak: streak,
                    timer: timer });
            }
            case HappyRedux.actions.WRONG_CHOICE: {
                var done = state.done;
                if (done) {
                    // this shouldn't happen, just in case
                    return happyGameApp(state, { type: HappyRedux.actions.END });
                }
                var activeClauseChoice = state.activeClauseChoice;
                var i = action.activeClauseIndex;
                activeClauseChoice = clone(activeClauseChoice);
                activeClauseChoice[i].clickedWrong = true;
                return __assign({}, state, { activeClauseChoice: activeClauseChoice, streak: 0 });
            }
            case HappyRedux.actions.TICK: {
                var done = state.done;
                if (done) {
                    // this shouldn't happen, just in case
                    return happyGameApp(state, { type: HappyRedux.actions.END });
                }
                // we want to make sure
                // that we really tick ever TICK_INTERVAL, and only that often
                // which is why this gets a little convoluted
                var currentTime = action.currentTime;
                var _a = state.timer, startTime = _a.startTime, ticksState = _a.ticks, barRemaining = _a.barRemaining;
                // how many ticks have we missed
                var timeFromStart = currentTime - startTime;
                var ticksFromStart = Math.floor(timeFromStart / HappyRedux.TICK_INTERVAL);
                var ticksToProcess = ticksFromStart - ticksState;
                // ok, now tick them off
                // and devcrement the barRemaining, so the display
                // bar goes down the right amount
                for (var i = 0; i < ticksToProcess; i++) {
                    ticksState++;
                    var barDecrement = HappyRedux.TICK_INTERVAL / 15000 * (1 + ticksState / (ticksState + 100));
                    barRemaining -= barDecrement;
                    barRemaining = Math.max(barRemaining, 0);
                }
                return __assign({}, state, { timer: __assign({}, state.timer, { ticks: ticksState, barRemaining: barRemaining }) });
            }
            case HappyRedux.actions.SCORES_LOADED: {
                var highScores = action.highScores;
                return __assign({}, state, { highScores: __assign({}, highScores, { loaded: true }) });
            }
            default:
                return state;
        }
    };
    HappyRedux.createHappyStore = function () { return redux_1.createStore(happyGameApp, redux_1.applyMiddleware(redux_thunk_1.default)); };
    HappyRedux.connectHappyGame = function (HappyGame) { return react_redux_1.connect(function (_a) {
        var _b = _a === void 0 ? { started: false, loaded: false, done: false } : _a, started = _b.started, done = _b.done, loaded = _b.loaded;
        return ({ started: started, loaded: loaded, done: done });
    }, function (dispatch) { return ({
        loadSentenceSet: function (_a) {
            var gameConfigKey = _a.gameConfigKey;
            return HappyRedux.getSentenceSet({ gameConfigKey: gameConfigKey })
                .then(function (sentenceSet) {
                return dispatch({
                    type: HappyRedux.actions.GAME_LOADED,
                    initData: sentenceSet,
                });
            });
        }
    }); })(HappyGame); };
    var activeClauseActionConnect = function (dispatch) { return ({
        onClickCorrect: function (_a) {
            var text = _a.text;
            dispatch({
                type: HappyRedux.actions.CORRECT_CHOICE,
                text: text,
            });
        },
        onClickWrong: function (_a) {
            var activeClauseIndex = _a.activeClauseIndex;
            dispatch({
                type: HappyRedux.actions.WRONG_CHOICE,
                activeClauseIndex: activeClauseIndex,
            });
        },
    }); };
    HappyRedux.connectActiveClause = react_redux_1.connect(
    // this could be tightend up from 'any' but really, who cares?
    function (state, ownProps) { return ownProps; }, activeClauseActionConnect);
    HappyRedux.connectActiveClauseChoice = function (ActiveClauseChoice) { return react_redux_1.connect(function (_a) {
        var activeClauseChoice = _a.activeClauseChoice;
        return ({ activeClauseChoice: activeClauseChoice });
    }, function () { return ({}); })(ActiveClauseChoice); };
    HappyRedux.connectHappyCurrentSentence = function (HappyCurrentSentence) { return react_redux_1.connect(function (_a) {
        var sentenceData = _a.sentenceData;
        var sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
        var displayClauses = sentenceGenerator.getActiveSentenceDisplay();
        return { displayClauses: displayClauses };
    }, function () { return ({}); })(HappyCurrentSentence); };
    HappyRedux.connectPastSentences = function (PastSentences) { return react_redux_1.connect(function (_a) {
        var pastSentences = _a.pastSentences;
        return ({ pastSentences: pastSentences });
    }, function () { return ({}); } // dispatch
    )(PastSentences); };
    var onTimerIntervalDispatch = function (dispatch, getState) {
        var _a = getState(), timer = _a.timer, score = _a.score;
        var intervalId = timer.intervalId, barRemaining = timer.barRemaining;
        if (barRemaining > 0) {
            var currentTime = new Date().valueOf();
            dispatch({
                type: HappyRedux.actions.TICK,
                currentTime: currentTime,
            });
        }
        else {
            clearInterval(intervalId);
            dispatch({ type: HappyRedux.actions.END });
            var sentenceData = getState().sentenceData;
            var sentenceGenerator = SentenceGenerator.getInstance({ sentenceData: sentenceData });
            var gameConfigKey = sentenceGenerator.getGameConfigKey();
            var date = new Date();
            var catcher = function (error) {
                console.error(error);
                alert('oops!');
            };
            recordScore({ score: score, date: date, gameConfigKey: gameConfigKey })
                .catch(catcher);
            getAllHighScores({ latestScore: score, gameConfigKey: gameConfigKey })
                .then(function (scores) {
                dispatch({
                    type: HappyRedux.actions.SCORES_LOADED,
                    highScores: scores,
                });
            })
                .catch(catcher);
            ;
        }
    };
    var recordScore = function (_a) {
        var score = _a.score, date = _a.date, gameConfigKey = _a.gameConfigKey;
        var recordScorePromise = fetch('/rest/recordScore', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: score, date: date, gameConfigKey: gameConfigKey }),
        })
            .then(function (response) { return response.json(); })
            .then(function (result) { return ({
            score: Number(result.score),
            date: new Date(result.date),
            gameConfigKey: result.gameConfigKey,
        }); });
        return recordScorePromise;
    };
    var getAllHighScores = function (_a) {
        var latestScore = _a.latestScore, gameConfigKey = _a.gameConfigKey;
        var highScoreUrl = '/rest/getAllHighScores?'
            + queryString.stringify({ latestScore: latestScore, gameConfigKey: gameConfigKey });
        var scoresPromise = fetch(highScoreUrl, { credentials: 'include' })
            .then(function (response) {
            return response.json();
        })
            .then(function (json) {
            var allTimeHigh = json.allTimeHigh, yearHigh = json.yearHigh, monthHigh = json.monthHigh, weekHigh = json.weekHigh, dayHigh = json.dayHigh, currentScore = json.currentScore;
            return {
                allTimeHigh: Number(allTimeHigh),
                yearHigh: Number(yearHigh),
                monthHigh: Number(monthHigh),
                weekHigh: Number(weekHigh),
                dayHigh: Number(dayHigh),
                currentScore: latestScore,
            };
        });
        return scoresPromise;
    };
    HappyRedux.connectHighScores = function (HighScores) { return react_redux_1.connect(function (state) {
        var highScores = state.highScores;
        var loaded = highScores.loaded, allTimeHigh = highScores.allTimeHigh, yearHigh = highScores.yearHigh, monthHigh = highScores.monthHigh, weekHigh = highScores.weekHigh, dayHigh = highScores.dayHigh, currentScore = highScores.currentScore;
        return {
            loaded: loaded,
            allTimeHigh: allTimeHigh,
            yearHigh: yearHigh,
            monthHigh: monthHigh,
            weekHigh: weekHigh,
            dayHigh: dayHigh,
            currentScore: currentScore,
        };
    }, function () { return ({}); })(HighScores); };
    var startGameDispatched = function (dispatch) {
        var intervalId = setInterval(function () { return dispatch(onTimerIntervalDispatch); }, HappyRedux.TICK_INTERVAL);
        var startTime = new Date().valueOf();
        dispatch({
            type: HappyRedux.actions.START,
            startTime: startTime,
            intervalId: intervalId,
        });
    };
    HappyRedux.connectStartButton = function (StartButton) { return react_redux_1.connect(function (_a) {
        var started = (_a === void 0 ? { started: false } : _a).started;
        return ({ started: started });
    }, // map state to props
    function (dispatch) { return ({
        startGame: function () { return dispatch(startGameDispatched); },
    }); })(StartButton); };
    HappyRedux.connectTimerBar = function (TimerBar) { return react_redux_1.connect(function (_a) {
        var timer = (_a === void 0 ? { timer: { barRemaining: 1.0 } } : _a).timer;
        var barRemaining = timer.barRemaining;
        return { barRemaining: barRemaining };
    }, function () { return ({}); })(TimerBar); };
    HappyRedux.connectDone = function (Done) { return react_redux_1.connect(function (state, ownProps) { return ownProps; }, function (dispatch) { return ({
        startGame: function () { return dispatch(startGameDispatched); },
    }); } //dispatch
    )(Done); };
    HappyRedux.getSentenceSet = function (_a) {
        var gameConfigKey = _a.gameConfigKey;
        var sentenceSetPromise = fetch("/rest/sentenceSet/" + gameConfigKey, {
            credentials: 'include',
            method: 'GET',
        })
            .then(function (response) { return response.json(); })
            .then(function (result) { return ({
            gameConfigKey: result.gameConfigKey,
            sentences: result.sentences,
            name: result.name,
        }); });
        return sentenceSetPromise;
    };
    HappyRedux.init = function (_a) {
        // some day, there will be more than one
        // SentenceGenerator
        // HappyRedux.SentenceGenerator = sentenceGenerator;
        var store = _a.store, gameConfigKey = _a.gameConfigKey;
        store.dispatch({
            type: HappyRedux.actions.INIT,
        });
    };
})(HappyRedux || (HappyRedux = {}));
exports.default = HappyRedux;
//# sourceMappingURL=happy-redux.js.map