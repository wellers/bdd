import { BddSpec } from "../src/index.js";

BddSpec({ todo: true })
	.given('todo is true', {
		arg: 'someValue'
	})
	.when('test is run', args => args)
	.should('return todo.', () => { })
	.run();

BddSpec({ todo: 'this is todo' })
	.given('todo is a string', {
		arg: 'someValue'
	})
	.when('test is run', args => args)
	.should('return todo.', () => { })
	.run();