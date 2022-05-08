import { strictEqual } from 'assert';
import { BddTest } from '../src/index.js';

new BddTest()
.given('an object as args', { arg: 'someValue' })
.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))	
.run();

new BddTest()
.given('a function as context', () => ({
	arg: 'someValue'
}))
.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest()
.given('an asynchronous function as context', async () => ({
	arg: 'someValue'
}))
.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest()
.given('a promise that defers the event loop', () => {
	const promise = new Promise(resolve => {
		setImmediate(() => resolve({ arg: 'someValue' }));
	})

	return promise;
})
.should('return true.', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest()
.before((test: any) => {
	test.arg = 'someValue';
})
.given('a before function', () => ({}))
.should('return the function before the test.', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest()
.before(async (test: any) => {
	test.arg = 'someValue';
})
.given('an asynchronous before function', () => ({}))
.should('return the function before the test.', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest({ timeout: 3000 })
.given('a timeout', async () => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({ arg: 'someValue' });
		}, 100)
	})
})
.should('pause for set timeout', ({ arg }) => strictEqual(arg, 'someValue'))
.run();

new BddTest({ skip: true })
.given('skip is true', () => {
	throw Error("This is an error!");
})
.should('skip test', ({ arg }) => strictEqual(arg, 'someValue'))
.run();