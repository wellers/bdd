import { deepStrictEqual, strictEqual } from "assert";
import { BddSpec } from "../src/index.js";

function getCharacters(movieName: string) {
	switch (movieName) {
		case 'ghostbusters': return ['peter', 'ray', 'igon', 'winston'];
		case 'alien': return ['ripley', 'cain', 'dallas', 'parker', 'brett', 'ash', 'lambert']
		default: throw Error('Unknown movie');
	}
}

BddSpec()
	.given('movie name is set', 'ghostbusters')
	.when('getCharacters is called with movie name', movieName => getCharacters(movieName))
	.should('return 4 characters', (assert: Array<string>) => strictEqual(assert.length, 4))
	.should('return valid characters', (assert: Array<string>) => deepStrictEqual(assert, ['peter', 'ray', 'igon', 'winston']))
	.run();

BddSpec()
	.given('movie name is set', 'alien')
	.when('getCharacters is called with movie name', movieName => getCharacters(movieName))
	.should('return 7 characters',
		(assert: Array<string>) => strictEqual(assert.length, 7))
	.should('return valid characters',
		(assert: Array<string>) => deepStrictEqual(assert, ['ripley', 'cain', 'dallas', 'parker', 'brett', 'ash', 'lambert']))
	.run();

BddSpec()
	.given('a movie name that is not recognised', 'predator')
	.when('getCharacters is called with movie name', movieName => getCharacters(movieName))
	.shouldThrow('Unknown movie')
	.run();