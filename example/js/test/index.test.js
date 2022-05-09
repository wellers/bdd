// @ts-check
const { strictEqual } = require('assert');
const { BddSpec } = require('@wellers/bdd');
const { addOne } = require('../lib/index.js');

new BddSpec()
	.given('num is a string', () => ({ num: 'Hello, World', error: 'num must be of type number.' }))
	.should('throw an error', ({ num, result, error }) => {
		let actual;

		try {
			actual = addOne(num);
		}
		catch ({ message }) {
			strictEqual(message, error);
		}

		strictEqual(actual, result);
	})
	.run();

new BddSpec()
	.given('num is 1', () => ({ num: 1, result: 2 }))
	.should('return 2', ({ num, result }) => strictEqual(addOne(num), result))
	.run();

new BddSpec()
	.given('num is 2', () => ({ num: 2, result: 3 }))
	.should('return 3', ({ num, result }) => strictEqual(addOne(num), result))
	.run();

new BddSpec()
	.given('num is 3', () => ({ num: 3, result: 4 }))
	.should('return 4', ({ num, result }) => strictEqual(addOne(num), result))
	.run();