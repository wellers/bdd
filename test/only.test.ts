import { strictEqual } from 'assert';
import { BddSpec } from '../src/index.js';

type TestArguments = {
	someArg: string
};

new BddSpec()
	.given('only is not set', () => {
		throw new Error("This is an error!");
	})
	.should('not run this test.', () => { })
	.run();

new BddSpec({ only: true })
	.given('only is true', {
		someArg: 'someValue'
	})
	.should('only run this test.', (test: TestArguments) => {
		strictEqual(test.someArg, "someValue");
	})
	.run();