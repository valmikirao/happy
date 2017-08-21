import * as redux from 'redux';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider }  from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import * as queryString from 'query-string';
import * as clone from 'clone';
import * as Promise from 'promise';

import {shuffle, randomElement} from './array-random';
import {IScoreHistory, IScoreHistoryData, TAllHighScores} from '../server-lib/isomporphic-types';
import {TSentence, TClauseChoice, TClause, ISentenceSetData} from '../server-lib/isomporphic-types';

require('isomorphic-fetch');

namespace HappyRedux {
	export const connectScore = connect(
		({score} = {score : 0}) => ({
			value : score,
		}),
		() => ({}),
	);

	export const TICK_INTERVAL = 25; // ms

	export interface IAllSentenceData {
		gameConfigKey : string, // used to store and look up high scores
		availableSentences : TSentence[],
		activeSentence : TSentence | null,
		activeSentencesCorrect : string[],
		activeClauseChoice : TClauseChoice | null,
		clauseChoiceCountInSentence : number,
	}

	interface SentenceGeneratorInstanceI<T> {
		getGameConfigKey() : string;
		getNextSentenceData() : T;
		getActiveSentenceDisplay() : string[];
		getActiveClauseChoice() : TClause[];
		getSentenceDataCorrectChoice(args : {text: string}) : T;
		isSentenceDone() : boolean;
	}

	interface SentenceGeneratorI<T> {
		initSentenceData(sentenceData : any) : IAllSentenceData;
		getInstance(args : {sentenceData}) : SentenceGeneratorInstanceI<T>;
	}


	const DefaultSentenceGenerator : SentenceGeneratorI<IAllSentenceData> = class {
		/*
			I would prefer not to have different instance and static classes,
			but typescript is weird about static methods for interfaces.  There is
			probably a way to do it, but I already spent too much time trying
			to figure it out
		*/
		public static getInstance({sentenceData}) {
			return new DefaultSentenceGeneratorIntance({sentenceData});
		}

		public static initSentenceData(sentenceSetData : ISentenceSetData) : IAllSentenceData {

			return {
				gameConfigKey : sentenceSetData.gameConfigKey, // used to store and look up high scores
				availableSentences : sentenceSetData.sentences,
				activeSentence : null,
				activeSentencesCorrect : [],
				activeClauseChoice : null,
				clauseChoiceCountInSentence : 0,
			}
		}

	}
	
	function isClauseChoiceMulti(clauseChoice : TClauseChoice) {
		return ! (clauseChoice.length === 1 && clauseChoice[0].isCorrect);
	}

	class DefaultSentenceGeneratorIntance implements SentenceGeneratorInstanceI<IAllSentenceData> {

		private sentenceData: IAllSentenceData;
		
		constructor({sentenceData}) {
			this.sentenceData = sentenceData;
		}


		getGameConfigKey() : string {
			// might be more complicated than this some day

			return this.sentenceData.gameConfigKey;
		}

		getNextSentenceData() : IAllSentenceData {
			let {sentenceData} = this;
			let {availableSentences} = sentenceData;
			let activeSentence = randomElement(availableSentences);
			let clauseChoiceCountInSentence = activeSentence.findIndex(clauseChoice => isClauseChoiceMulti(clauseChoice)) 
			let activeClauseChoice = shuffle(activeSentence[clauseChoiceCountInSentence]);
			let activeSentencesCorrect = activeSentence.map(clauseChoice =>
				! isClauseChoiceMulti(clauseChoice) ? // if there is only one choice, just display the text
					clauseChoice[0].text
					: null
			);
			
			return {
				...sentenceData,
				availableSentences,
				activeSentence,
				activeClauseChoice,
				clauseChoiceCountInSentence,
				activeSentencesCorrect
			};
		}

		getActiveSentenceDisplay() : string[] {
			let {sentenceData} = this;
			let {activeSentence, activeSentencesCorrect} = sentenceData;

			return activeSentencesCorrect.map(sentenceCorrect => 
				sentenceCorrect !== null ?
					sentenceCorrect
					: '____'
			);
		}

		getActiveClauseChoice() : TClause[] {
			return this.sentenceData.activeClauseChoice;
		}
		
		getSentenceDataCorrectChoice(args : {text: string}) : IAllSentenceData {
			let {text} = args;
			let {sentenceData} = this;

			let {activeSentence, clauseChoiceCountInSentence, activeSentencesCorrect} = sentenceData;

			activeSentencesCorrect = clone(activeSentencesCorrect);
			activeSentencesCorrect[clauseChoiceCountInSentence] = text;

			let activeClauseChoice = null;
			while(true) {
				clauseChoiceCountInSentence++;
				if (clauseChoiceCountInSentence >= activeSentence.length) break;

				let candidateClauseChoice = activeSentence[clauseChoiceCountInSentence];
				if (isClauseChoiceMulti(candidateClauseChoice)) {
					activeClauseChoice = shuffle(candidateClauseChoice);
					break;
				}
			}

			return {
				...sentenceData,
				clauseChoiceCountInSentence,
				activeClauseChoice,
				activeSentencesCorrect,
			};
		}

		isSentenceDone() {
			return this.sentenceData.activeClauseChoice === null;
		}
	};

	let SentenceGenerator = DefaultSentenceGenerator;

	type HighScoresNotLoadedT = {loaded : false};
	type HighScoresLoadedT = {
		loaded : true,
		currentScore : number,
	} & TAllHighScores;
	type HighScoresT = HighScoresNotLoadedT | HighScoresLoadedT;


	interface AppStateI {
		sentenceData : IAllSentenceData,
		score : number,
		activeSentenceDisplay : string[],
		activeClauseChoice : TClauseChoice,
		pastSentences : string[][],
		started : boolean,
		loaded : boolean,
		done : boolean,
		streak : number,
		timer : {
			startTime : number,
			ticks : number,
			barRemaining : number,
			intervalId : number,
		},
		highScores : HighScoresT,
	};

	type GetInitialStateI = () => AppStateI;
	const getInitialState : GetInitialStateI = () => {

		return {
			sentenceData : null,
			score : 0,
			activeSentenceDisplay : null,
			activeClauseChoice : null,
			pastSentences : [],
			started : false,
			loaded : false,
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
		GAME_LOADED : 'action_GAME_LOADED',
	};

	const happyGameApp = (state : AppStateI, action) : AppStateI => {
		// const {SentenceGenerator} = HappyRedux;

		switch (action.type) {
			case actions.INIT : {
				return getInitialState();
			}
			case actions.GAME_LOADED : {
				const {initData} = action;

				let sentenceData = SentenceGenerator.initSentenceData(initData);

				return {
					...state,
					sentenceData,
					loaded : true,
				};
			}
			case actions.START : {
				let {sentenceData} = state;
				let {startTime, intervalId} = action;

				let sentenceGenerator = SentenceGenerator.getInstance({sentenceData});

				sentenceData = sentenceGenerator.getNextSentenceData();
				sentenceGenerator = SentenceGenerator.getInstance({sentenceData});

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

				let sentenceGenerator = SentenceGenerator.getInstance({sentenceData});
				sentenceData = sentenceGenerator.getSentenceDataCorrectChoice({text});
				sentenceGenerator = SentenceGenerator.getInstance({sentenceData});

				if (sentenceGenerator.isSentenceDone()) {
					pastSentences = [
						...pastSentences,
						sentenceGenerator.getActiveSentenceDisplay(),
					];

					sentenceData = sentenceGenerator.getNextSentenceData();
					sentenceGenerator = SentenceGenerator.getInstance({sentenceData});
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

	export const createHappyStore = () => createStore(
		happyGameApp,
		applyMiddleware(thunkMiddleware),
	)

	export const connectHappyGame = (HappyGame) => connect(
		({started, done, loaded} = {started : false, loaded : false, done : false}) => ({started, loaded, done}),
		(dispatch) => ({
			loadSentenceSet : ({gameConfigKey}) => {
				return getSentenceSet({gameConfigKey})
					.then(sentenceSet => 
						dispatch({
							type : actions.GAME_LOADED,
							initData : sentenceSet,
						})
					);
			}
		}),
	)(HappyGame);

	export interface OnClickCorrectI {
		(args : {text : string}) : void
	}

	export interface OnClickWrongI {
		(args : {activeClauseIndex : number}) : void
	}

	type ActiveClauseActionConnectT = (dispatch : redux.Dispatch<AppStateI>) => {
		onClickCorrect : OnClickCorrectI,
		onClickWrong : OnClickWrongI,
	};

	const activeClauseActionConnect : ActiveClauseActionConnectT = (dispatch) => ({
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
	});


	export const connectActiveClause = connect(
		// this could be tightend up from 'any' but really, who cares?
		(state : AppStateI, ownProps : any) => ownProps,
		activeClauseActionConnect,
	);


	export const connectActiveClauseChoice = (ActiveClauseChoice) => connect(
		({activeClauseChoice}) => ({activeClauseChoice}),
		() => ({})
	)(ActiveClauseChoice);

	export const connectHappyCurrentSentence = (HappyCurrentSentence) => connect(
		({sentenceData}) => { // state2props

			const sentenceGenerator = SentenceGenerator.getInstance({sentenceData});
			const displayClauses = sentenceGenerator.getActiveSentenceDisplay();

			return {displayClauses};
		},
		() => ({}), // dispatch
	)(HappyCurrentSentence);

	export const connectPastSentences = (PastSentences) => connect(
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
			const sentenceGenerator = SentenceGenerator.getInstance({sentenceData});
			const gameConfigKey = sentenceGenerator.getGameConfigKey();
			const date = new Date();

			const catcher = (error : any) => {
				console.error(error);
				alert('oops!');
			}

			recordScore({score, date, gameConfigKey})
				.catch(catcher);

			getAllHighScores({latestScore : score, gameConfigKey})
				.then(scores => {
					dispatch({
						type : actions.SCORES_LOADED,
						highScores : scores,
					});
				})
				.catch(catcher);
;
		}
	}

	// these types are how I can get fetch to work

    interface RequestInit {
        method?: string;
        headers?: any;
        body?: any;
        referrer?: string;
        referrerPolicy?: ReferrerPolicy;
        mode?: RequestMode;
        credentials?: RequestCredentials;
        cache?: RequestCache;
        redirect?: RequestRedirect;
        integrity?: string;
        keepalive?: boolean;
        window?: any;
    }

    
	// only way I can figure out how to get types working right with fetch
	declare function fetch(input: string, init?: RequestInit): Promise<Response>;

	export type TRecordScore = (args : IScoreHistoryData) => Promise<IScoreHistoryData>;

	const recordScore : TRecordScore = ({score, date, gameConfigKey}) => {
		let recordScorePromise =
			fetch('/rest/recordScore', {
				credentials : 'include',
				method : 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({score, date, gameConfigKey}),
			})
			.then(response => response.json())
			.then(result => ({
				score : Number(result.score),
				date : new Date(result.date),
				gameConfigKey : <string>result.gameConfigKey,
			}));

		return recordScorePromise;
	};

	export type TGetAllHighScores = (args: {
        latestScore : number,
        gameConfigKey : string,
        date? : Date,
    }) => Promise<TAllHighScores>;

	const getAllHighScores : TGetAllHighScores = ({latestScore, gameConfigKey}) => {
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

				return {
					allTimeHigh : Number(allTimeHigh),
					yearHigh : Number(yearHigh),
					monthHigh : Number(monthHigh),
					weekHigh : Number(weekHigh),
					dayHigh : Number(dayHigh),
					currentScore : latestScore,
				};
			})

		return scoresPromise;
	};

	export const connectHighScores = (HighScores) => connect(
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

	export type DispatcherT = (dispatch : redux.Dispatch<AppStateI>) => void;

	const startGameDispatched : DispatcherT = (dispatch) => {
		const intervalId = setInterval(
			() => dispatch(onTimerIntervalDispatch),
			TICK_INTERVAL,
		);

		const startTime = new Date().valueOf();

		dispatch({
			type : actions.START,
			startTime,
			intervalId,
		})
	};

	export const connectStartButton = (StartButton) => connect(
		({started} = {started : false}) => ({started}), // map state to props
		(dispatch) => ({
			startGame : () => dispatch(startGameDispatched),
		})
	)(StartButton);

	export const connectTimerBar = (TimerBar) => connect(
		({timer} = {timer : {barRemaining : 1.0}}) => {
			let {barRemaining} = timer;

			return {barRemaining};
		},
		() => ({}), 
	)(TimerBar);

	export const connectDone = (Done) => connect(
		(state, ownProps) => ownProps,
		(dispatch) => ({
			startGame : () => dispatch(startGameDispatched),
		}) //dispatch
	)(Done);

	type InitI = (args? : {
			store : redux.Store<AppStateI>,
			gameConfigKey : string,
		}) => void

	type GetSentencSetT = (args : {gameConfigKey : string}) =>
		Promise<ISentenceSetData>

	export const getSentenceSet : GetSentencSetT = ({gameConfigKey}) => {
		const sentenceSetPromise = fetch(`/rest/sentenceSet/${gameConfigKey}`, {
				credentials : 'include',
				method : 'GET',
			})
			.then(response => response.json())
			.then(result => ({
				gameConfigKey : <string>result.gameConfigKey,
				sentences : <TSentence[]>result.sentences,
				name : <string>result.name,
			}));

		return sentenceSetPromise;
	}


	export const init : InitI = ({
		store,
		gameConfigKey,
	}) => {
		// some day, there will be more than one
		// SentenceGenerator
		// HappyRedux.SentenceGenerator = sentenceGenerator;

		store.dispatch({
			type : actions.INIT,
		});
	};
}

export default HappyRedux;

