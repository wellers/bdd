import { BddSpec } from "../src/index.js";

new BddSpec()
	.given('a timeout within the test', () => ({
		x: setTimeout(() => { }, 5000)
	}))
	.should('clear timeout after test.', () => { })
	.then((test: any) => {
		clearTimeout(test.x);
	})
	.run();