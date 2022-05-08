import { BddTest } from "../src/index.js";

new BddTest({ todo: true })
.given('todo is true', {
	arg: 'someValue'
})
.should('return todo.', () => {})
.run();

new BddTest({ todo: 'this is todo' })
.given('todo is a string', {
	arg: 'someValue'
})
.should('return todo.', () => {})
.run();