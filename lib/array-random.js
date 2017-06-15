export const shuffle = (array) => {
	var arrayClone = [...array];

	return array.map(() => {
		var i = Math.floor(Math.random() * arrayClone.length);

		return arrayClone.splice(i, 1)[0];
	});
};

export const randomElement = (array) => {
    var i = Math.floor(Math.random() * array.length);
    return array[i];
};

export default (ArrayParam) => {
    if (ArrayParam !== undefined) {
        ArrayParam.prototype.shuffle = function () {return shuffle(this)};
        ArrayParam.prototype.randomElement = function () {return randomElement(this)};
    }
};
