import { BddSpec } from "../src/index.js";

BddSpec
	.create()
	.given('a timeout within the test', () => ({
		x: setTimeout(() => { }, 5000)
	}))
	.when('test is run', () => {})
	.should('clear timeout after test.', () => { })
	.then((test: any) => {
		clearTimeout(test.x);
	})
	.run();