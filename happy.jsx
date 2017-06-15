// see express-server.js for how to start servers

import ReactDOM from 'react-dom';
import React, { PropTypes } from 'react';
import { createStore } from 'redux';
import { connect, Provider }  from 'react-redux';

// import { d$referencer } from './lib/json-deref-util.js';
import RandArrayProto from './lib/array-random.js';
import HappyRedux, {actions} from './lib/happy-redux.js';

RandArrayProto(Array);

class PAR extends React.Component {
	render() {
		return <div className="happy-par">PAR: {this.props.value} </div>;
	}
}

class Score extends React.Component {
	render() {
		return <div className="happy-score" id="happy-score">
			<div className="happy-score-label">Score:</div>
			<div className="happy-score" id="happy-score-value">{this.props.value}</div>
		</div>;
	}
}

Score = HappyRedux.connectScore(Score);

let TimerBar = ({barRemaining}) =>{
	let initialWidth = 300;
	let currentWidth = initialWidth * barRemaining;
	
	return <div className="happy-timer-bar" id="happy-timer-bar" style={{width: currentWidth + 'px'}}></div>;
};

TimerBar = HappyRedux.connectTimerBar(TimerBar);

class GameStatus extends React.Component {
	render() {
		return <div className="happy-header">
			<PAR value="7500"/><Score/>
			<TimerBar timeLeft={5.3}/>
		</div>;
	}
}

class Clause extends React.Component {
	render() { 
		return <div className="happy-blank">{this.props.text}</div>;
	}
	
}

class Sentence extends React.Component {
	render() {
		let clauseComponents = this.props.clauses.map((clause, i) => {return <Clause text={clause} key={i}/>});
		return <div className="happy-sentence">{clauseComponents}</div>;
	}
}

let store = HappyRedux.createStore();

// document.store = store;
// document.tryClause = tryClause;

let ActiveClause = ({
	onClickCorrect,
	onClickWrong,
	text,
	isCorrect,
	clickedWrong = false,
	activeClauseIndex,
}) => {
	const onClick = isCorrect ?
		() => onClickCorrect({text})
		: () => onClickWrong({activeClauseIndex});

	let classes = ! clickedWrong ? 'happy-click-word' : 'happy-click-word happy-word-wrong';

	return <div className={classes} onClick={onClick}>{text}</div>;
}
// ActiveClause.propTypes = {
// 	clauseI : PropTypes.number.isRequired,
// 	text : PropTypes.string.isRequired,
// 	onClick : PropTypes.func
// };

ActiveClause = HappyRedux.connectActiveClause(ActiveClause);

let ActiveClauseChoice = ({activeClauseChoice}) => {
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

let PastSentences = ({pastSentences}) => {
	let sentences = pastSentences.map((clauses, i) => 
		<Sentence key={i} clauses={clauses}/>
	);

	return <div id="happy-all-sentences" className="happy-all-sentences">
		{ sentences }
	</div>;
}


PastSentences = HappyRedux.connectPastSentences(PastSentences);

ActiveClauseChoice = HappyRedux.connectActiveClauseChoice(ActiveClauseChoice);

let StartButton = ({started, startGame}) => {
	let display = started ? 'none' : 'inline';

	return <div
			id="happy-start-button"
			className="happy-start-button"
			style={{display}}
			onClick={startGame}
		>Start!</div>;
};

StartButton = HappyRedux.connectStartButton(StartButton);


let HappyCurrentSentence = ({displayClauses}) => <div id="happy-current-sentence">
		<Sentence clauses={displayClauses}/>
	</div>;

HappyCurrentSentence = HappyRedux.connectHappyCurrentSentence(HappyCurrentSentence);

let Done = ({startGame}) => <div className="happy-done">
	<div className="happy-done-text">Done!</div>
	<div><a href="#" onClick={startGame}>restart</a></div>
</div>;

Done = HappyRedux.connectDone(Done);

let HighScores = ({
	loaded,
	allTimeHigh,
	yearHigh,
	monthHigh,
	weekHigh,
	dayHigh,
	currentScore,
}) => {
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
};

HighScores = HappyRedux.connectHighScores(HighScores);

let HappyGame = ({started, done}) => {
	let innards;
	
	let key = 0;

	if (! started) {
		innards = <StartButton key={key++}/>;
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
};

HappyGame = HappyRedux.connectHappyGame(HappyGame);

ReactDOM.render(
	<Provider store={store}>
		<HappyGame/>
	</Provider>,
	// <h1>Hello World</h1>,
	document.getElementById('happy-main')
);

HappyRedux.init({
	store,
	document,
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



    