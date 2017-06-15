import { createStore, applyMiddleware } from 'redux';
import { connect, Provider }  from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import { d$referencer } from './json-deref-util.js';
import RandArrayProto from './array-random.js';
import rawSentences from './raw-sentences';
import queryString from 'query-string';
import clone from 'clone';
import Promise from 'es6-promise';

/*
Ugh, browserify doesn't play nice with isomorphic-fetch
when run in node
*/

const isNode = (typeof module !== 'undefined' && module.exports);
if (!isNode) {
	require('isomorphic-fetch');
}

RandArrayProto(Array);

let HappyRedux = {};

HappyRedux.connectScore = (Score) => connect(
	({score} = {score : 0}) => ({
		value : score,
	}),
	() => ({}),
)(Score);

HappyRedux.TICK_INTERVAL = 25; // ms

class DefaultSentenceGenerator {
	constructor({sentenceData}) {
		this.sentenceData = sentenceData;
	}

	// in this case {sentenceData} is almost always {}, but want to be consistent
	static initSentenceData({initDataKey = 'DEFAULT'})  {
		const sentencesRaw = rawSentences[initDataKey];
		const availableSentences = sentencesRaw.map(sentenceRaw =>
			sentenceRaw.map(clauseChoiceRaw =>
				clauseChoiceRaw.map((clauseRaw, i) => ({
					isCorrect : i === 0,
					text : clauseRaw,
				}))
			)
		)

		return {
			gameConfigKey : 'default-' + initDataKey, // used to store and look up high scores
			availableSentences,
			activeSentence : null,
			activeSentenceCorrect : [],
			activeClauseChoice : null,
			clauseChoiceCountInSentence : 0,
		}
	}

	getGameConfigKey() {
		// might be more complicated than this some day

		return this.sentenceData.gameConfigKey;
	}

	getNextSentenceData() {
		let {sentenceData} = this;
		let {availableSentences} = sentenceData;
		let activeSentence = availableSentences.randomElement();
		let activeClauseChoice = activeSentence[0].shuffle();
		let clauseChoiceCountInSentence = 0;
		let activeSentenceCorrect = [];
		
		return {
			...sentenceData,
			availableSentences,
			activeSentence,
			activeClauseChoice,
			clauseChoiceCountInSentence,
			activeSentenceCorrect
		};
	}

	getActiveSentenceDisplay() {
		let {sentenceData} = this;
		let {activeSentence, activeSentenceCorrect} = sentenceData;

		return activeSentence.map((_, i) => 
			i < activeSentenceCorrect.length ?
				activeSentenceCorrect[i]
				: '____'
		);
	}

	getActiveClauseChoice() {
		return this.sentenceData.activeClauseChoice;
	}
	
	getSentenceDataCorrectChoice({text}) {
		let {sentenceData} = this;

		let {activeSentence, clauseChoiceCountInSentence, activeSentenceCorrect} = sentenceData;

		clauseChoiceCountInSentence++;
		activeSentenceCorrect = [
			...activeSentenceCorrect,
			text,
		];

		let activeClauseChoice = null;
		if (clauseChoiceCountInSentence < activeSentence.length) {
			activeClauseChoice = activeSentence[clauseChoiceCountInSentence].shuffle();
		}

		return {
			...sentenceData,
			clauseChoiceCountInSentence,
			activeClauseChoice,
			activeSentenceCorrect,
		};
	}

	isSentenceDone() {
		return this.sentenceData.activeClauseChoice === null;
	}
};



const getInitialState = ({initDataKey}) => {
	// not using initKey yet
	let sentenceData = HappyRedux.SentenceGenerator.initSentenceData({
		initDataKey,
	});

	return {
		sentenceData,
		score : 0,
		activeSentenceDisplay : null,
		activeClauseChoice : null,
		pastSentences : [],
		started : false,
		done : false,
		streak : 0,
		timer : {
			startTime : null,
			ticks : 0,
			barRemaining : 1.0,
			intervalId : null,
		},
		highScores : {
			loaded : false,
		},
	};
};

export const actions = {
	INIT : 'action_INIT',
	CORRECT_CHOICE : 'action_CORRECT_CHOICE',
	WRONG_CHOICE : 'action_WRONG_CHOICE',	
	START : 'action_START',
	TICK : 'action_TICK',
	END : 'actions_END',
	SCORES_LOADED : 'action_SCORES_LOADED',
};

const happyGameApp = (state, action) => {
	const {SentenceGenerator} = HappyRedux;

	switch (action.type) {
		case actions.INIT : {
			let {initDataKey} = action;

			return getInitialState({initDataKey});
		}
		case actions.START : {
			let {sentenceData} = state;
			let {startTime, intervalId} = action;

			let sentenceGenerator = new SentenceGenerator({sentenceData});

			sentenceData = sentenceGenerator.getNextSentenceData();
			sentenceGenerator = new SentenceGenerator({sentenceData});

			let activeSentenceDisplay = sentenceGenerator.getActiveSentenceDisplay();
			let activeClauseChoice = sentenceGenerator.getActiveClauseChoice();

			return {
				...state,
				sentenceData,
				activeSentenceDisplay,
				activeClauseChoice,
				started : true,
				done : false,
				score : 0,
				streak : 0,
				timer : {
					startTime,
					intervalId,
					ticks : 0,
					barRemaining : 1.0,
				},
			};
		}

		case actions.END : {
			return {
				...state,
				done : true,
			};
		}

		case actions.CORRECT_CHOICE : {
			let {sentenceData} = state;
			let {activeSentenceDisplay,	activeClauseChoice, done} = state;
			let {score, streak, pastSentences, timer} = state;

			if (done) {
				// this shouldn't happen, just in case
				return happyGameApp(state, {type : actions.END});
			}

			let {text} = action;

			score += 5 + streak;
			streak++;

			let sentenceGenerator = new SentenceGenerator({sentenceData});
			sentenceData = sentenceGenerator.getSentenceDataCorrectChoice({text});
			sentenceGenerator = new SentenceGenerator({sentenceData});

			if (sentenceGenerator.isSentenceDone()) {
				pastSentences = [
					...pastSentences,
					sentenceGenerator.getActiveSentenceDisplay(),
				];

				sentenceData = sentenceGenerator.getNextSentenceData();
				sentenceGenerator = new SentenceGenerator({sentenceData});
			}

			activeSentenceDisplay = sentenceGenerator.getActiveSentenceDisplay();
			activeClauseChoice = sentenceGenerator.getActiveClauseChoice();

			let {barRemaining} = timer;
			barRemaining += .1;
			timer = {...timer, barRemaining};

			return {
				...state,
				sentenceData,
				activeSentenceDisplay,
				activeClauseChoice,
				score,
				pastSentences,
				streak,
				timer,
			};
		}

		case actions.WRONG_CHOICE : {
			let {done} = state;
			if (done) {
				// this shouldn't happen, just in case
				return happyGameApp(state, {type : actions.END});
			}

			let {activeClauseChoice} = state;
			let i = action.activeClauseIndex;

			activeClauseChoice = clone(activeClauseChoice);
			activeClauseChoice[i].clickedWrong = true;

			return {
				...state,
				activeClauseChoice,
				streak : 0,
			};
		}

		case actions.TICK : {
			let {done} = state;
			if (done) {
				// this shouldn't happen, just in case
				return happyGameApp(state, {type : actions.END});
			}

			// we want to make sure
			// that we really tick ever TICK_INTERVAL, and only that often
			// which is why this gets a little convoluted

			const {currentTime} = action;
			let {startTime, ticks : ticksState, barRemaining} = state.timer;
			const {TICK_INTERVAL} = HappyRedux;
			
			// how many ticks have we missed
			const timeFromStart = currentTime - startTime;
			const ticksFromStart = Math.floor(timeFromStart / TICK_INTERVAL);
			const ticksToProcess = ticksFromStart - ticksState;

			// ok, now tick them off
			// and devcrement the barRemaining, so the display
			// bar goes down the right amount
			for(let i = 0; i < ticksToProcess; i++) {
				ticksState++;

				let barDecrement = TICK_INTERVAL / 15000 * (
					1 +  ticksState / (ticksState + 100)
				);
				barRemaining -= barDecrement;

				barRemaining = Math.max(barRemaining, 0);
			}

			return {
				...state,
				timer : {
					...state.timer,
					ticks : ticksState,
					barRemaining,
				},
			};
		}

		case actions.SCORES_LOADED : {
			const {highScores} = action;

			return {
				...state,
				highScores : {
					...highScores,
					loaded : true,
				},
			};
		}

		default :
			return state;
	}
}

HappyRedux.createStore = () => createStore(
	happyGameApp,
	applyMiddleware(thunkMiddleware),
)

HappyRedux.connectHappyGame = (HappyGame) => connect(
	({started, done} = {started : false, done : false}) => ({started, done}),
	(dispatch) => ({}),
)(HappyGame);

HappyRedux.connectActiveClause = (ActiveClause) => connect(
	(state, ownProps) => ownProps,
	(dispatch) => ({
		onClickCorrect : ({text}) => {
			dispatch({
				type : actions.CORRECT_CHOICE,
				text,
			});
		},
		onClickWrong : ({activeClauseIndex}) => {
			dispatch({
				type : actions.WRONG_CHOICE,
				activeClauseIndex,
			});
		},
	})
)(ActiveClause);

HappyRedux.connectActiveClauseChoice = (ActiveClauseChoice) => connect(
	({activeClauseChoice}) => ({activeClauseChoice}),
	() => ({})
)(ActiveClauseChoice);

HappyRedux.connectHappyCurrentSentence = (HappyCurrentSentence) => connect(
	({sentenceData}) => { // state2props

		const sentenceGenerator = new HappyRedux.SentenceGenerator({sentenceData});
		const displayClauses = sentenceGenerator.getActiveSentenceDisplay({sentenceData});

		return {displayClauses};
	},
	() => ({}), // dispatch
)(HappyCurrentSentence);

HappyRedux.connectPastSentences = (PastSentences) => connect(
    ({pastSentences}) => ({pastSentences}),
    () => ({}) // dispatch
)(PastSentences);

const onTimerIntervalDispatch = (dispatch, getState) => {
	const {timer, score} = getState();
	const {intervalId, barRemaining} = timer;
	
	if (barRemaining > 0) {
		const currentTime = new Date().valueOf();

		dispatch({
			type : actions.TICK,
			currentTime,
		});
	}
	else {
		clearInterval(intervalId);

		dispatch({type : actions.END});

		const {sentenceData} = getState();
		const sentenceGenerator = new HappyRedux.SentenceGenerator({sentenceData});
		const gameConfigKey = sentenceGenerator.getGameConfigKey();

		recordScore({score, gameConfigKey})
			.catch(function (error) {
				// can fork and forget on the success of this, but
				// if this is an error, better lay on the bad news
				console.error(error);
				alert('Score didn\'t save for some reason!!!');
			});

		loadScores({latestScore : score, gameConfigKey})
			.then(result => {
				const {scores} = result;

				dispatch({
					type : actions.SCORES_LOADED,
					highScores : scores,
				});
			});
	}
}

const recordScore = ({score, date, gameConfigKey}) => {
	let recordScorePromise = fetch('/rest/recordScore', {
		credentials : 'include',
		method : 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({score, date, gameConfigKey}),
	});

	return recordScorePromise;
};

const loadScores = ({latestScore, gameConfigKey}) => {
	const highScoreUrl = '/rest/getAllHighScores?'
		+ queryString.stringify({latestScore, gameConfigKey});

	let scoresPromise = fetch(highScoreUrl, {credentials : 'include'})
		.then(function (response) {
			return response.json()
		})
		.then(function (json) {
			const {
				allTimeHigh,
				yearHigh,
				monthHigh,
				weekHigh,
				dayHigh,
				currentScore,
			} = json;

			return {scores : {
				allTimeHigh,
				yearHigh,
				monthHigh,
				weekHigh,
				dayHigh,
				currentScore : latestScore,
			}};
		})
		.catch(function (error) {
			alert('Error!');
			console.error('Error:', error);
		})

	return scoresPromise;
};

HappyRedux.connectHighScores = (HighScores) => connect(
	(state) => {
		const {highScores} = state;
		const {
			loaded,
			allTimeHigh,
			yearHigh,
			monthHigh,
			weekHigh,
			dayHigh,
			currentScore,
		} = highScores;

		return {
			loaded,
			allTimeHigh,
			yearHigh,
			monthHigh,
			weekHigh,
			dayHigh,
			currentScore,
		};
	},
	() => ({}),
)(HighScores);

const startGame = (dispatch) => {
	const intervalId = setInterval(
		() => dispatch(onTimerIntervalDispatch),
		HappyRedux.TICK_INTERVAL,
	);

	const startTime = new Date().valueOf();

	dispatch({
		type : actions.START,
		startTime,
		intervalId,
	})
};

HappyRedux.connectStartButton = (StartButton) => connect(
	({started} = {started : false}) => ({started}), // map state to props
	(dispatch) => ({
		startGame : () => dispatch(startGame),
	}) //dispatch
)(StartButton);

HappyRedux.connectTimerBar = (TimerBar) => connect(
	({timer} = {timer : {barRemaining : 1.0}}) => {
		let {barRemaining} = timer;

		return {barRemaining};
	},
	() => ({}), 
)(TimerBar);

HappyRedux.connectDone = (Done) => connect(
	(state, ownProps) => ownProps,
	(dispatch) => ({
		startGame : () => dispatch(startGame),
	}) //dispatch
)(Done);

HappyRedux.init = ({
	store,
	document,
	initDataKey,
	sentenceGenerator = DefaultSentenceGenerator,
} = {}) => {
	// some day, there will be more than one
	// SentenceGenerator
	HappyRedux.SentenceGenerator = sentenceGenerator;

	if (document !== undefined && initDataKey === undefined) {
		initDataKey = queryString.parse(document.location.search).initDataKey;
	}

	store.dispatch({
		type : actions.INIT,
		initDataKey,
	});
};

export default HappyRedux;

