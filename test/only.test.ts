import { strictEqual } from 'assert';
import { BddSpec } from '../src/index.js';

type TestArguments = {
	someArg: string
};

new BddSpec()
	.given('only is not set', () => {
		throw new Error("This is an error!");
	})
	.when('test is run', () => {})
	.should('not run this test.', () => { })
	.run();

new BddSpec({ only: true })
	.given('only is true', {
		someArg: 'someValue'
	})
	.when('test is run', context => context)
	.should('only run this test.', (actual: TestArguments) => {
		strictEqual(actual.someArg, "someValue");
	})
	.run();