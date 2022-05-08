function addOne(num) {
	if (typeof num !== 'number') {
		throw new Error('num must be of type number.');
	}

	return num + 1;
}

module.exports = { addOne }