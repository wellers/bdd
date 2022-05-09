import { strictEqual } from "assert";
import { BddSpec } from "../src/index.js";

new BddSpec()
	.given('', () => ({
		error: 'given() must be called with a message before should().'
	}))
	.when('test is run', args => args)
	.should('throw error', ({ error }) => strictEqual(error, 'given() must be called with a message before should().'))
	.run();

new BddSpec()
	.given('message is passed', () => ({
		error: 'both given() and should() must be called with a message before then().'
	}))
	.when('test is run', args => args)
	.should('', ({ error }) => strictEqual(error, 'both given() and should() must be called with a message before then().'))
	.then(() => { })
	.run();