// see express-server.js for how to start servers

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore } from 'redux';
import { connect, Provider }  from 'react-redux';
import * as queryString from 'query-string';

// import { d$referencer } from './lib/json-deref-util.js';
import {shuffle, randomElement} from '../lib/array-random.js';
import HappyRedux from '../lib/happy-redux';
import {TClauseChoice} from '../server-lib/isomporphic-types';


class PAR extends React.Component<{value : string}> {
	render() {
		return <div className="happy-par">PAR: {this.props.value} </div>;
	}
}

class _Score extends React.Component<{value : string}> {
	render() {
		const {value} = this.props;

		return <div className="happy-score" id="happy-score">
			<div className="happy-score-label">Score:</div>
			<div className="happy-score" id="happy-score-value">{value}</div>
		</div>;
	}
}

const Score = HappyRedux.connectScore(_Score);

class _TimerBar extends React.Component<{barRemaining : number}> {
	render () {
		const {barRemaining} = this.props;

		let initialWidth = 300;
		let currentWidth = initialWidth * barRemaining;
		
		return <div className="happy-timer-bar" id="happy-timer-bar" style={{width: currentWidth + 'px'}}></div>;
	}
};

const TimerBar = HappyRedux.connectTimerBar(_TimerBar);

class GameStatus extends React.Component {
	render() {
		return <div className="happy-header">
			<PAR value="7500"/><Score/>
			<TimerBar/>
		</div>;
	}
}

class Clause extends React.Component<{text : string}> {
	render() {
		const {text} = this.props;

		return <div className="happy-blank">{text}</div>;
	}
}

class Sentence extends React.Component<{clauses : string[]}> {
	render() {
		const {clauses} = this.props;

		const clauseComponents = clauses.map((clause, i) => {return <Clause text={clause} key={i}/>});
		return <div className="happy-sentence">{clauseComponents}</div>;
	}
}

let store = HappyRedux.createHappyStore();

// document.store = store;
// document.tryClause = tryClause;

class _ActiveClause extends React.Component<{
	text : string,
	isCorrect : boolean,
	clickedWrong : boolean,
	activeClauseIndex : number,
	onClickCorrect : HappyRedux.OnClickCorrectI,
	onClickWrong : HappyRedux.OnClickWrongI,
}> {
	render() {
		const {
			onClickCorrect,
			onClickWrong,
			text,
			isCorrect,
			clickedWrong = false,
			activeClauseIndex,
		} = this.props;

		const onClick = isCorrect ?
			() => onClickCorrect({text})
			: () => onClickWrong({activeClauseIndex});

		let classes = ! clickedWrong ? 'happy-click-word' : 'happy-click-word happy-word-wrong';

		return <div className={classes} onClick={onClick}>{text}</div>;
	}
}
// ActiveClause.propTypes = {
// 	clauseI : PropTypes.number.isRequired,
// 	text : PropTypes.string.isRequired,
// 	onClick : PropTypes.func
// };

const ActiveClause = HappyRedux.connectActiveClause(_ActiveClause);

class _ActiveClauseChoice extends React.Component<{activeClauseChoice : TClauseChoice}> {
	render() {
		const {activeClauseChoice} = this.props;

		const clauses = activeClauseChoice.map(({text, isCorrect, clickedWrong}, i) => 
			<ActiveClause
				key={i}
				activeClauseIndex={i}
				text={text}
				isCorrect={isCorrect}
				clickedWrong={clickedWrong}
			/>
		);

		return <div id="happy-current-word-group" className="happy-current-word-group"><div className="happy-word-group">
			{ clauses }
		</div></div>
	}
}

class _PastSentences extends React.Component<{pastSentences : string[][]}> {
	render () {
		const {pastSentences} = this.props;

		const sentences = pastSentences.map((clauses, i) => 
			<Sentence key={i} clauses={clauses}/>
		);

		return <div id="happy-all-sentences" className="happy-all-sentences">
			{ sentences }
		</div>;
	}
}


const PastSentences = HappyRedux.connectPastSentences(_PastSentences);

const ActiveClauseChoice = HappyRedux.connectActiveClauseChoice(_ActiveClauseChoice);

class _StartButton extends React.Component<{started : boolean, startGame : () => void}> {
	render() {
		const {started, startGame} = this.props;

		const display = started ? 'none' : 'inline';

		return <div
				id="happy-start-button"
				className="happy-start-button"
				style={{display}}
				onClick={startGame}
			>Start!</div>;
	}
};

const StartButton = HappyRedux.connectStartButton(_StartButton);


class _HappyCurrentSentence extends React.Component<{displayClauses : string[]}> {
	render() {
		const {displayClauses} = this.props;

		return <div id="happy-current-sentence">
			<Sentence clauses={displayClauses}/>
		</div>;
	}
};
const HappyCurrentSentence = HappyRedux.connectHappyCurrentSentence(_HappyCurrentSentence);

class _Done extends React.Component<{startGame : () => void}> {
	render() {
		const {startGame} = this.props;

		return <div className="happy-done">
			<div className="happy-done-text">Done!</div>
			<div><a href="#" onClick={startGame}>restart</a></div>
		</div>;
	}
}

const Done = HappyRedux.connectDone(_Done);

class _HighScores extends React.Component<{
	loaded : boolean,
	allTimeHigh : number,
	yearHigh : number,
	monthHigh : number,
	weekHigh : number,
	dayHigh : number,
	currentScore : number,
}> {
	render() {
		const {
			loaded,
			allTimeHigh,
			yearHigh,
			monthHigh,
			weekHigh,
			dayHigh,
			currentScore,
		} = this.props;

		if (! loaded) {
			return <div className="happy-high-scores">Loading...</div>
		}
		else {
			return <div className="happy-high-scores">
				<div className="happy-high-score"><span className="happy-high-score-label">All Time High:</span><span className="happy-high-score-value">{allTimeHigh}</span></div>
				<div className="happy-high-score"><span className="happy-high-score-label">Yearly High:</span><span className="happy-high-score-value">{yearHigh}</span></div>
				<div className="happy-high-score"><span className="happy-high-score-label">Monthly High:</span><span className="happy-high-score-value">{monthHigh}</span></div>
				<div className="happy-high-score"><span className="happy-high-score-label">Weekly High:</span><span className="happy-high-score-value">{weekHigh}</span></div>
				<div className="happy-high-score"><span className="happy-high-score-label">Daily High:</span><span className="happy-high-score-value">{dayHigh}</span></div>
				<div className="happy-high-score"><span className="happy-high-score-label">Current Score:</span><span className="happy-high-score-value">{currentScore}</span></div>
			</div>;
		}
	}
};

const HighScores = HappyRedux.connectHighScores(_HighScores);

type THappyGameProps = {
	started : boolean,
	loaded : boolean,
	done : boolean,
	loadSentenceSet : (any) => Promise<any>, // action (Redux.Dispatch) => void, but don't want to load dispatch
};

const {gameConfigKey} = queryString.parse(document.location.search);

class _PreviewSentences extends React.Component<{sentencePreviews : HappyRedux.TSentencePreview[]}> {
	render() {
		const {sentencePreviews} = this.props;
		
		const innards = sentencePreviews.map(sentence => {
			const sentenceInnards = sentence.map(({type, text}) => {
				const clauseClass = type === 'FIXED' ? 'happy-preview-clause-fixed' : 'happy-preview-clause-chosen';

				return <div className={clauseClass}> { text } </div>;
			});

			return <div className='happy-preview-sentence'>{ sentenceInnards }</div>;
		});

		return <div className="happy-preview-sentences">{ innards }</div>;
	}
}

const PreviewSentences = HappyRedux.connectPreviewSentences(_PreviewSentences);

class _HappyGame extends React.Component<THappyGameProps> {
	render() {
		const {started, loaded, done} = this.props;
		const {loadSentenceSet} = this.props; 

		let innards : JSX.Element | JSX.Element[] = [];
		
		let key = 0;

		if (! loaded) {
			innards = <div className='happy-loading' key={key++}>Loading ...</div>

			loadSentenceSet({gameConfigKey})
				.catch((err) => alert(err));
		}
		else if (! started) {
			innards = [
				<StartButton key={key++}/>,
				<PreviewSentences/>,
			];
		}
		else if (! done) {
			innards = [
				<HappyCurrentSentence key={key++}/>,
				<ActiveClauseChoice key={key++}/>,
				<PastSentences key={key++}/>
			];
		}
		else {
			innards = [
				<HighScores key={key++}/>,
				<Done key={key++}/>
			];
		}

		return <div className="happy-main">
			<GameStatus/>
			{ innards }
		</div>;
	}
};

const HappyGame = HappyRedux.connectHappyGame(_HappyGame);


ReactDOM.render(
	<Provider store={store}>
		<HappyGame/>
	</Provider>,
	// <h1>Hello World</h1>,
	document.getElementById('happy-main'),
);

HappyRedux.init({
	store,
	gameConfigKey,
});

/*
 GameField
 	PAR
 	Score
 	TimerBar
 	Sentence [ActiveSentence]
 	ActiveClause
 	PastSentences
 		Sentence [PastSentence]
 		
*/



    