/// <reference path="types.d.ts"/>

import Promise = require('promise');
import * as mongoose from 'mongoose';

export interface IScoreHistoryData {
    gameConfigKey : string,
    score : number,
    date : Date,
}

export interface IScoreHistory extends mongoose.Document, IScoreHistoryData {};

export interface ISentenceSetData {
    gameConfigKey : string,
    sentences : TSentence[],
};

export interface ISentenceSet extends mongoose.Document, ISentenceSetData {};

export type TUserArg = {user : string};

export interface TAllHighScores {
    allTimeHigh : number,
    dayHigh : number,
    weekHigh : number,
    monthHigh : number,
    yearHigh : number,
}

export type TSentence = TClauseChoice[];
export type TClauseChoice = TClause[];
export type TClause = {
    isCorrect : boolean,
    text : string,
    clickedWrong? : boolean,
};