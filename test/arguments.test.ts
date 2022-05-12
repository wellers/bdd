import { strictEqual } from 'assert';
import { BddSpec } from '../src/index.js';

BddSpec()
	.given('an object as args', { arg: 'someValue' })
	.when('test is run', args => args)
	.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec()
	.given('a function as context', () => ({
		arg: 'someValue'
	}))
	.when('test is run', args => args)
	.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec()
	.given('an asynchronous function as context', async () => ({
		arg: 'someValue'
	}))
	.when('test is run', args => args)
	.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec()
	.given('a promise that defers the event loop', () => {
		const promise = new Promise(resolve => {
			setImmediate(() => resolve({ arg: 'someValue' }));
		})

		return promise;
	})
	.when('test is run', args => args)
	.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec()
	.before((test: any) => {
		test.arg = 'someValue';
	})
	.given('a before function', () => ({}))
	.when('test is run', args => args)
	.should('return the function before the test.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec()
	.before(async (test: any) => {
		test.arg = 'someValue';
	})
	.given('an asynchronous before function', () => ({}))
	.when('test is run', args => args)
	.should('return the function before the test.', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec({ timeout: 3000 })
	.given('a timeout', async () => {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve({ arg: 'someValue' });
			}, 100)
		})
	})
	.when('test is run', args => args)
	.should('pause for set timeout', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();

BddSpec({ skip: true })
	.given('skip is true', () => {
		throw Error("This is an error!");
	})
	.when('test is run', args => args)
	.should('skip test', ({ arg }) => strictEqual(arg, 'someValue'))
	.run();