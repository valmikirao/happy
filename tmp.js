import { d$referencer } from './json-deref-util.js';

const getSentences = () => {
	let sentencesRaw = [
		[['Haters gonna hate.', 'Why you so mean?', 'Fuck you!'], ['I understand meanness', 'I am enraged by meanness', 'I am intimidated by meanness'], ['is just insecurity.', 'needs revenge.', 'hurts my status.']],
		[['We get it.', 'You\'re weird', 'I\'m weird.'], ['We both', 'Only you', 'Only I'], ['understand', 'are confused by', 'hate'], ['each other\'s', 'only your', 'only my'], ['experiences.', 'strangeness.']],
		[['I got game.', 'I\'m so awkward.', 'I\'m so ashamed'], ['People are at ease with,', 'People are freaked out by,', 'People make fun of,'], ['my confident,', 'my pompous,', 'my asinine,'], ['calm,', 'nervous,', 'spastic,'], ['friendly manner.', 'standoffish manner.', 'belligerent manner.']],
		[['Fun times.', 'This is serious!', 'Boring.'], ['I think of creative ways', 'I don\'t know what to do', 'I hate everyone'], ['to play,', 'to humiliate people,', 'to hurt someone,'], ['have fun,', 'work, work, work,', 'cry,'], ['and include everyone.', 'and exclude losers.', 'and leave in a huff.']],
		[['How you do\'in?', 'Wanna fuck?', 'Hey bitch!'], ['I flirt', 'I offend', 'I run away'], ['in a friendly,', 'in a creepy,', 'in an awkward,'], ['appropriate ways.', 'obnoxious ways.', 'aggressive ways.']],
		[['Friends everywhere!', 'Enemies everywhere!', 'Spies everywhere!'], ['I imagine everyone\'s', 'I know no one\'s'], ['my friend', 'my enemy', 'a serial killer'], ['and make conversation', 'and stare ahead', 'and fidget'], ['everywhere.', 'nowhere.']],
		[['That\'s cool.', 'So annoying.', 'Fuck you!'], ['I understand annoy things', 'I hate annoying things', 'I\'m made apoplectic by annoying things'], ['are just my insecurities', 'are because others are stupid'], ['which I can overcome.', 'which don\'t exist.', 'which will sink me.']],
		[['I am relaxed', 'I am nervous', 'I am agitated'], ['and confident', 'and self-conscious', 'and meek'], ['around people', 'when alone', 'around assholes'], ['including hot women.', 'including ugly women.']],
		/* get people to open up */ [['I get people to open up', 'I get people to close off', 'I force people to conceal'], ['by sharing with them', 'by bragging to them', 'by yelling at them'], ['appropriately and', 'inappropriately and', 'improperly and'], ['listening to them.',  'ignoring them.', 'rejecting them.']],
		[['I am charmed', 'I am annoyed', 'I hate'], ['by people\'s quirks.', 'by asshole\'s flaws.', 'by your stupidity.']],
		[['You\'re special.', 'Who are you?', 'Go away.'], ['I give people my attention', 'I ignore people', 'I\'m too busy for people'], ['because they are important to me.', 'to manipulate them.', 'to get them off my back.']],
	];

	let d$ref = d$referencer({
		sentences : [],
		clauseChoices : [],
		clauses : [],
	});

	sentencesRaw.forEach((sentenceRaw) => {
		let clauseChoices = sentenceRaw.map((clauseChoiceRaw) => {
			let clauses = clauseChoiceRaw.map((clauseRaw, i) => {
				let isCorrect = i === 0;
				
				return d$ref.push('clauses', {
					text : clauseRaw,
					isCorrect
				}).d$self;
			});

			return d$ref.push('clauseChoices', {clauses}).d$self;
		});

		d$ref.push('sentences', {clauseChoices});
	});

    return d$ref.data;
};

console.log(JSON.stringify(getSentences(), null, '    '));