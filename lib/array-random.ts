export const shuffle = <T>(array : T[]) : T[] => {
	var arrayClone = [...array];

	return array.map(() => {
		var i = Math.floor(Math.random() * arrayClone.length);

		return arrayClone.splice(i, 1)[0];
	});
};

export const randomElement = <T>(array : T[]) : T => {
    var i = Math.floor(Math.random() * array.length);
    return array[i];
};
