// @ts-check
const { strictEqual } = require('assert');
const { BddSpec } = require('@wellers/bdd');
const { addOne } = require('../lib/index.js');

BddSpec
	.create()
	.given('num is a string', 'Hello, World')
	.when('addOne is called with num', num => addOne(num))
	.shouldThrow('num must be of type number.')
	.run();

BddSpec
	.create()
	.given('num is 1', 1)
	.when('addOne is called with num', num => addOne(num))
	.should('return 2', actual => strictEqual(actual, 2))
	.run();

BddSpec
	.create()
	.given('num is 2', 2)
	.when('addOne is called with num', num => addOne(num))
	.should('return 3', actual => strictEqual(actual, 3))
	.run();

BddSpec
	.create()
	.given('num is 3', 3)
	.when('addOne is called with num', num => addOne(num))
	.should('return 4', actual => strictEqual(actual, 4))
	.run();