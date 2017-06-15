(function () {
	happy.sentenceSpecs = [];

	var _randomElement = function (array) {
		var i = Math.floor(Math.random() * array.length);
		return array[i];
	}

	var affirmativeBeginnings = [
		['Can I'],
		['How can I'],
		['What does it mean to'],
	];

	var affirmativeEndings = [
		[['have lots of energy', 'have no energy', 'feel fatigued'], ['?', '.']],
		[['remember to stay curious', 'forget to stay curious', 'not care'], ['?', '.']]
	];

	var negativeBeginnings = [
		['Can I'],
		['How can I'],
		['What does it mean to'],
	];

	var negativeEndings = [
		[['have lots of energy', 'have no energy', 'feel fatigued'], ['?', '.']],
		[['remember to stay curious', 'forget to stay curious', 'not care'], ['?', '.']]
	];

	affirmativeEndings.forEach(function (affirmativeEnding) {
		var affirmativeBeginning = _randomElement(affirmativeBeginnings);
		sentenceSpec = affirmativeBeginning.concat(affirmativeEnding);

		return happy.sentenceSpecs.push(sentenceSpec);
	});

	negativeEndings.forEach(function (negativeEnding) {
		var negativeBeginning = _randomElement(negativeBeginnings);
		sentenceSpec = negativeBeginning.concat(negativeEnding);

		return happy.sentenceSpecs.push(sentenceSpec);
	});

})()
