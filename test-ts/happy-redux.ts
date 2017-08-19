import HappyRedux from '../lib/happy-redux';
import {expect} from 'chai';
import * as randomSeed from 'seed-random';
import * as Promise from 'promise';
import {ISentenceSetData} from '../server-lib/isomporphic-types';

import 'mocha';

const {actions} = HappyRedux;

type ItEquals = <T>(string, value : T, match : T) => void;
const itEquals : ItEquals = (description, value, match) =>
    it(`${description} === ${match}`, () => expect(value).to.deep.equal(match)) 

const initDataTest : ISentenceSetData = {
    gameConfigKey : '_testing_',
    sentences : [
        [
            [
                {isCorrect : true, text : "A:A - Right"},
                {isCorrect : false, text : "A:A - Wrong"},
            ],
            [
                {isCorrect : true, text : "A:B - Right"},
                {isCorrect : false, text : "A:B - Wrong"},
                {isCorrect : false, text : "A:B - Wrong.2"},
            ]
        ],
        [
            [
                {isCorrect : true, text : "B:A - Right"},
                {isCorrect : false, text : "B:A - Wrong"}
            ],
            [
                {isCorrect : true, text : "B:B - Right"},
                {isCorrect : false, text : "B:B - Wrong"},
                {isCorrect : false, text : "B:B - Wrong.2"}
            ],
            [
                {isCorrect : true, text : "B:C - Right"},
                {isCorrect : false, text : "B:C - Wrong"},
                {isCorrect : false, text : "B:C - Wrong.2"},
                {isCorrect : false, text : "B:C - Wrong.3"},
                {isCorrect : false, text : "B:C - Wrong.4"},
            ]
        ],
        [
            [
                {isCorrect : true, text : "C:A - Right"},
                {isCorrect : false, text : "C:A - Wrong"},
            ],
            [
                {isCorrect : true, text : "C:B - Right"},
                {isCorrect : false, text : "C:B - Wrong"},
                {isCorrect : false, text : "C:B - Wrong.2"},
            ],
            [
                {isCorrect : true, text : "C:C - Right"},
                {isCorrect : false, text : "C:C - Wrong"},
            ],
            [
                {isCorrect : true, text : "C:D - Right"},
                {isCorrect : false, text : "C:D - Wrong"},
                {isCorrect : false, text : "C:D - Wrong.2"},
            ],
            [
                {isCorrect : true, text : "C:E - Right"},
                {isCorrect : false, text : "C:E - Wrong"}
            ],
            [
                {isCorrect : true, text : "C:F - Right"},
                {isCorrect : false, text : "C:F - Wrong"},
                {isCorrect : false, text : "C:F - Wrong.2"},
            ],
            [
                {isCorrect : true, text : "C:G - Right"},
                {isCorrect : false, text : "C:G - Wrong"},
            ],
            [
                {isCorrect : true, text : "C:H - Right"},
                {isCorrect : false, text : "C:H - Wrong"},
                {isCorrect : false, text : "C:H - Wrong.2"},
            ],
        ]
    ]
};

const initDataTestYn : ISentenceSetData = {
    "gameConfigKey" : "_yn_test_",
    "sentences" : [
        [
            [
                {
                    text : "Is this true?",
                    isCorrect : true,
                },
            ],
            [
                {
                    text : "Yes",
                    isCorrect : true,
                },
                {
                    text : "No",
                    isCorrect : false,
                },
            ],
            [
                {
                    text : "!",
                    isCorrect : true,
                },
                {
                    text : ".",
                    isCorrect : false,
                },
            ],
        ],
        [
            [
                {
                    text : "WRONG",
                    isCorrect : false,
                },
                {
                    text : "RIGHT",
                    isCorrect : true,
                },
            ],
            [
                {
                    text : "NO CHOICE",
                    isCorrect : true,
                },
            ],
            [
                {
                    text : "WRONG",
                    isCorrect : false,
                },
                {
                    text : "RIGHT",
                    isCorrect : true,
                },
            ],
        ],
    ],
};

const main = () => {
    randomSeed('Something totally random!', {global : true});

    describe('main test', () => {
        let store = HappyRedux.createHappyStore();
        store.dispatch({
            type : actions.INIT,
        });

        store.dispatch({
            type: actions.GAME_LOADED,
            initData : initDataTest,
        });

        {
            const {sentenceData} = store.getState();

            describe('init()', () => {
                itEquals('# sentences right', sentenceData.availableSentences.length, 3);
                itEquals('[0][0][0].isCorrect', sentenceData.availableSentences[0][0][0].isCorrect, true);
                itEquals('[1][1][1].isCorrect', sentenceData.availableSentences[1][1][1].isCorrect, false);
                itEquals('[1][1][1].text', sentenceData.availableSentences[1][1][1].text, 'B:B - Wrong');
                itEquals('gameConfigKey', sentenceData.gameConfigKey, '_testing_');
            });
        }

        store.dispatch({
            type : actions.START,
            startTime : 1000,
            intervalId : 22, // some random number
        });

        {
            const {timer} = store.getState();

            describe('START', () => {
                itEquals('barRemaining', timer.barRemaining, 1.0);
                itEquals('startTime', timer.startTime, 1000);
                itEquals('ticks', timer.ticks, 0);
                itEquals('intervalId', timer.intervalId, 22);
            });
        }

        store.dispatch({
            type : actions.TICK,
            currentTime : 1024,
        });
        
        {
            const timer = store.getState().timer;
            
            describe('TICK', () => {
                itEquals('barRemaining', timer.barRemaining, 1.0);
                itEquals('startTime', timer.startTime, 1000);
                itEquals('ticks', timer.ticks, 0);
            });
        }

        store.dispatch({
            type : actions.TICK,
            currentTime : 1026,
        });

        let previousBarRemaining;
        {
            const timer = store.getState().timer;

            describe('TICK 2', () => {
                it('barRemaining <= 1.0', () => {expect(timer.barRemaining).to.be.lessThan(1.0)});
                itEquals('ticks', timer.ticks, 1);
            } );

            previousBarRemaining = timer.barRemaining;
        }

            store.dispatch({
            type : actions.TICK,
            currentTime : 1076,
        });
        
        let previousBarRemaining2;
        {
            const state = store.getState();

            describe('TICK 3', () => {
                it('barRemaining <= previous', () => expect(state.timer.barRemaining).to.be.lessThan(previousBarRemaining));
                itEquals('ticks', state.timer.ticks, 3);

                itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['____', '____']);
                itEquals('activeClauseChoice[0]', state.activeClauseChoice[0], {
                    isCorrect : false,
                    text : 'A:A - Wrong',
                });
            });
        
            previousBarRemaining2 = state.timer.barRemaining;
        }

        store.dispatch({
            type : actions.CORRECT_CHOICE,
            text : 'A:A - Right',
        });

        {
            const state = store.getState();

            describe('CORRECT_CHOICE', () => {
                itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['A:A - Right', '____']);
                itEquals('activeClauseChoice[0]', state.activeClauseChoice[0], {
                    isCorrect : false,
                    text : 'A:B - Wrong.2',
                });
                itEquals('activeClauseChoice[2]', state.activeClauseChoice[2], {
                    isCorrect: true,
                    text: 'A:B - Right',
                });

                it('barRemaining > previous', () => expect(state.timer.barRemaining).to.be.greaterThan(previousBarRemaining));
            });
        }

        store.dispatch({
            type : actions.CORRECT_CHOICE,
            text : 'A:B - Right',
        });

        {
            const state = store.getState();
            
            describe('CORRECT_CHOICE 2', () => {
                itEquals('pastSentences', state.pastSentences, [['A:A - Right', 'A:B - Right']]);
                itEquals('score', state.score, 11);
                itEquals('activeSentenceDisplay', state.activeSentenceDisplay, [
                    '____',
                    '____',
                    '____',
                    '____',
                    '____', 
                    '____',
                    '____',
                    '____',
                ]);
                itEquals('length', state.activeClauseChoice.length, 2);
                // console.log(JSON.stringify(state.activeClauseChoice, null, "    "));

                {
                    let {clickedWrong = false} = state.activeClauseChoice[0];
                    itEquals('clickedWrong', clickedWrong, false);
                }
            });
        }

        
        store.dispatch({
            type : actions.WRONG_CHOICE,
            activeClauseIndex : 0,
        });

        {
            const state = store.getState();
        
            describe('WRONG_CHOICE', () => {
                itEquals('score', state.score, 11);

                {
                    let {clickedWrong = false} = state.activeClauseChoice[0];
                    itEquals('clickedWrong', clickedWrong, true);
                }

            });
        }

        store.dispatch({
            type : actions.CORRECT_CHOICE,
            text : 'C:A - Right',
        });

        {
            const state = store.getState();

            describe('CORRECT_CHOICE 3', () => {
                itEquals('score', state.score, 16);
                itEquals('done', state.done, false);
            });
        }


        store.dispatch({type : actions.END});

        {
            const state = store.getState();

            describe('END', () => {
                itEquals('done', state.done, true);

                itEquals('highScores', state.highScores, {loaded : false});
                // make sure gameConfigKey is still legit
                itEquals('gameConfigKey', state.sentenceData.gameConfigKey, '_testing_');
            });
        }

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

        {
            describe('SCORES_LOADED', () => {
                const state = store.getState();
                itEquals('highScores', state.highScores, {
                    loaded : true,
                    allTimeHigh : 1000,
                    yearHigh : 1000,
                    monthHigh : 1000,
                    weekHigh : 1000,
                    dayHigh : 1000,
                    currentScore : 1000,
                });
            });
        }
    });

    describe.only('yn test', () => {
        let store = HappyRedux.createHappyStore();
        store.dispatch({
            type : actions.INIT,
        });

        store.dispatch({
            type: actions.GAME_LOADED,
            initData : initDataTestYn,
        });

        store.dispatch({
            type : actions.START,
            startTime : 1000,
            intervalId : 22, // some random number
        });

        describe('GAME_LOADED', () => {
            const state = store.getState();

            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['Is this true?', '____', '____']);
        });

        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text : 'Yes',
        });

        describe('CORRECT_CHOICE', () => {
            const state = store.getState();

            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['Is this true?', 'Yes', '____']);
        });

        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text : '!',
        });

        describe('CORRECT_CHOICE 2', () => {
            const state = store.getState();

            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['____', 'NO CHOICE', '____']);
            itEquals('pastSentences', state.pastSentences, [['Is this true?', 'Yes', '!']]);
        });

        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text : 'RIGHT',
        });

        describe('CORRECT_CHOICE 3', () => {
            const state = store.getState();

            itEquals('activeSentenceDisplay', state.activeSentenceDisplay, ['RIGHT', 'NO CHOICE', '____']);
        });

        store.dispatch({
            type: actions.CORRECT_CHOICE,
            text : 'RIGHT',
        });

        describe('CORRECT_CHOICE 3', () => {
            const state = store.getState();

            itEquals('pastSentences[1]', state.pastSentences[1], ['RIGHT', 'NO CHOICE', 'RIGHT']);
        });
    })
};

main();