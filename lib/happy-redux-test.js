import HappyRedux, {actions} from './happy-redux.js';
import {expect} from 'chai';
import {d$referencer} from './json-deref-util.js';
import randomSeed from 'seed-random';

const main = () => {
    console.log('Begin testing ...');
    randomSeed('Something totally random!!!', {global : true});

    let store = HappyRedux.createStore();
    HappyRedux.init({
        store,
        initDataKey : 'TESTING',
    });

    let {sentenceData} = store.getState();

    expect(sentenceData.availableSentences).to.have.length(3);
    expect(sentenceData.availableSentences[0][0][0].isCorrect).to.equal(true);
    expect(sentenceData.availableSentences[1][1][1].isCorrect).to.equal(false);
    expect(sentenceData.availableSentences[1][1][1].text).to.equal('B:B - Wrong');
    expect(sentenceData.gameConfigKey).to.equal('default-TESTING');

    store.dispatch({
        type : actions.START,
        startTime : 1000,
        intervalId : 22, // some random number
    });

    let state = store.getState();

    expect(state.timer.barRemaining).to.equal(1.0);
    expect(state.timer.startTime).to.equal(1000);
    expect(state.timer.ticks).to.equal(0);
    expect(state.timer.intervalId).to.equal(22);

    store.dispatch({
        type : actions.TICK,
        currentTime : 1024,
    });
    state = store.getState();

    expect(state.timer.barRemaining).to.equal(1.0);
    expect(state.timer.startTime).to.equal(1000);
    expect(state.timer.ticks).to.equal(0);

    store.dispatch({
        type : actions.TICK,
        currentTime : 1026,
    });
    state = store.getState();

    expect(state.timer.barRemaining).to.be.lessThan(1.0);
    expect(state.timer.ticks).to.equal(1);

    let previousBarRemaining = state.timer.barRemaining;
    store.dispatch({
        type : actions.TICK,
        currentTime : 1076,
    });
    state = store.getState();

    expect(state.timer.barRemaining).to.be.lessThan(previousBarRemaining);
    expect(state.timer.ticks).to.equal(3);
    previousBarRemaining = state.timer.barRemaining;

    expect(state.activeSentenceDisplay).to.deep.equal(['____', '____']);
    expect(state.activeClauseChoice[0]).to.deep.equal({
        isCorrect : false,
        text : 'A:A - Wrong',
    });
    
    store.dispatch({
        type : actions.CORRECT_CHOICE,
        text : 'A:A - Right',
    });

    state = store.getState();

    expect(state.activeSentenceDisplay).to.deep.equal(['A:A - Right', '____'])
    expect(state.activeClauseChoice[0]).to.deep.equal({
        isCorrect : false,
        text : 'A:B - Wrong.2',
    });
    expect(state.activeClauseChoice[2]).to.deep.equal({
        isCorrect: true,
        text: 'A:B - Right',
    });

    expect(state.timer.barRemaining).to.be.greaterThan(previousBarRemaining);

    store.dispatch({
        type : actions.CORRECT_CHOICE,
        text : 'A:B - Right',
    });

    state = store.getState();
    
    expect(state.pastSentences).to.deep.equal([['A:A - Right', 'A:B - Right']]);
    expect(state.score).to.equal(11);
    expect(state.activeSentenceDisplay).to.deep.equal([
        '____',
        '____',
        '____',
        '____',
        '____', 
        '____',
        '____',
        '____',
    ]);
    expect(state.activeClauseChoice).has.length(2);
    // console.log(JSON.stringify(state.activeClauseChoice, null, "    "));

    {
        let {clickedWrong = false} = state.activeClauseChoice[0];
        expect(clickedWrong).to.equal(false);
    }

    store.dispatch({
        type : actions.WRONG_CHOICE,
        activeClauseIndex : 0,
    });

    state = store.getState();
    expect(state.score).to.equal(11);

    {
        let {clickedWrong = false} = state.activeClauseChoice[0];
        expect(clickedWrong).to.equal(true);
    }

    store.dispatch({
        type : actions.CORRECT_CHOICE,
        text : 'C:A - Right',
    });
    expect(store.getState().score).to.equal(16);

    expect(state.done).to.equal(false);
    store.dispatch({type : actions.END});
    state = store.getState();
    expect(state.done).to.equal(true);

    expect(state.highScores).to.deep.equal({loaded : false});
    // make sure gameConfigKey is still legit
    expect(state.sentenceData.gameConfigKey).to.equal('default-TESTING');

    store.dispatch({
        type : actions.SCORES_LOADED,
        highScores : {
            allTimeHigh : 1000,
            yearHigh : 1000,
            monthHigh : 1000,
            weekHigh : 1000,
            dayHigh : 1000,
            currentScore : 1000,
        },
    });
    state = store.getState();
    expect(state.highScores).to.deep.equal({
        loaded : true,
        allTimeHigh : 1000,
        yearHigh : 1000,
        monthHigh : 1000,
        weekHigh : 1000,
        dayHigh : 1000,
        currentScore : 1000,
    });

    console.log('Done!  I guess everything passed. :-P');
};

main();