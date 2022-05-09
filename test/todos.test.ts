import { BddSpec } from "../src/index.js";

new BddSpec({ todo: true })
	.given('todo is true', {
		arg: 'someValue'
	})
	.should('return todo.', () => { })
	.run();

new BddSpec({ todo: 'this is todo' })
	.given('todo is a string', {
		arg: 'someValue'
	})
	.should('return todo.', () => { })
	.run();