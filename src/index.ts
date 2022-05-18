// @ts-ignore
import test from 'node:test';
import { strictEqual } from 'assert';
import Validator from 'fastest-validator';

/**
 * BDD Specification options
 * @interface BddSpecOptions
 * @prop {number} [timeout] - Timeout in ms for this specific test.
 * @prop {number} [concurrency] - The number of tests that can be run at the same time. Default: 1.
 * @prop {boolean} [only] - Only execute this test. `--test-only` command-line option is required when running tests to use this option.
 * @prop {boolean} [skip] - Skip this test.
 * @prop {boolean|string} [todo] - If truthy, the test marked as TODO. If a string is provided, that string is displayed in the test results as the reason why the test is TODO.
 */
interface BddSpecOptions {
	timeout?: number
	concurrency?: number,
	only?: boolean,
	skip?: boolean,
	todo?: boolean | string
}

type TestOptions = Omit<BddSpecOptions, 'timeout'>;

const optionsSchema = {
	timeout: { type: "number", optional: true },
	concurrency: { type: "number", optional: true },
	only: { type: "boolean", default: false },
	skip: { type: "boolean", default: false },
	todo: { type: "any", optional: true }
};

const validator = new Validator();
const validateOptions = validator.compile(optionsSchema);

type EstablishContext = Promise<Function> | {};

type Observe = (context: any) => any;

type Assert = (assert: any) => void;

type Specification = {
	name: string;
	setup?: Function;
	establishContext: EstablishContext;
	observe: Observe;
	assert: Assert;
	timeout?: number;
	teardown?: Function;
	options?: TestOptions;
}

interface Before {
	/**
	* Optional set-up function.	
	* @param {function} setup - Execute a function prior to execution of the test.	
	*/
	before(setup: Function): Given;
}

interface Given {
	/**
	* Set-up context for test.
	* @param {string} message - Message that is prefixed with "given ".
	* @param {function} establishContext - Sets the context for the test.
	*/
	given(message: string, establishContext: Function | {}): When
}

interface When {
	/**
	* Set-up what to observe.
	* @param {string} message - Message that is prefixed with "when ".
	* @param {function} observe - The observation. Returns actual. Errors are caught and returned as actual.
	*/
	when(message: string, observe: Observe): Should;
}

interface Should {
	/**
	* Assert the result of the observation.
	* @param {string} message - Message that is prefixed with "should ".
	* @param {function} assert - Assertion to perform on the return value of the observation.
	*/
	should(message: string, assert: Assert): Then & Run;

	/**
	* Assert the result of the observation throws an Error.
	* @param {string} [errorMessage] - Error message that should be thrown by the observation.	
	*/
	shouldThrow(errorMessage?: string): Then & Run;
}

interface Then {
	/**
	* Optional teardown function.
	* @param {function} teardown - Execute a function after the execution of the test.
	*/
	then(teardown: Function): Run;
}

interface Run {	

	/**
	* Execute the test.	
	*/
	run(): Promise<void>;
}

class BddSpecification implements Before, Given, Given, When, Should, Then, Run {
	private constructor(
		private specification: Specification
	) { }

	static create(options?: BddSpecOptions): Before & Given {
		const specification: Specification = {
			name: '',
			establishContext: {},
			observe: () => { throw Error('observe must be set') },
			assert: () => { throw Error('assert must be set') }
		};

		if (options) {
			const results = validateOptions(options);

			if (Array.isArray(results)) {
				const message = results.map(result => result.message).join('\r\n');

				throw Error(message);
			}

			const { timeout } = options;
			delete options.timeout;

			specification.timeout = timeout;
			specification.options = <TestOptions>options;
		}

		return new BddSpecification(specification);
	}

	before(setup: Function): Given {
		if (typeof setup !== 'function') {
			throw Error('setup must be of type function.');
		}

		this.specification.setup = setup;

		return this;
	}

	given(message: string, establishContext: Function | {}): When {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (!establishContext) {
			throw Error('establishContext is required.');
		}

		this.specification.name = `given ${message}, `;
		this.specification.establishContext = (async () => establishContext instanceof Function
			? await establishContext()
			: establishContext
		)();

		return this;
	}

	when(message: string, observe: Observe): Should {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.specification.name += `when ${message}, `;
		this.specification.observe = observe;

		return this;
	}

	should(message: string, assert: Assert): Then & Run {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof assert !== 'function') {
			throw Error('assert must be of type function.');
		}

		this.specification.name += `should ${message}`;
		this.specification.assert = assert;

		return this;
	}

	shouldThrow(errorMessage: string): Then & Run {
		if (!errorMessage) {
			this.specification.name += 'should throw error';
			this.specification.assert = (err) => err instanceof Error;

			return this;
		}

		if (typeof errorMessage !== 'string') {
			throw Error('errorMessage must be of type string.');
		}

		this.specification.name += `should throw ${errorMessage}`;
		this.specification.assert = ({ message }) => strictEqual(message, errorMessage);

		return this;
	}

	then(teardown: Function): Run {
		if (typeof teardown !== 'function') {
			throw Error('teardown must be of type function.');
		}

		this.specification.teardown = teardown;

		return this;
	}

	async run(): Promise<void> {
		const {
			name,
			options,
			timeout,
			establishContext,
			setup,
			observe,
			assert,
			teardown
		} = this.specification;

		test(name, options, async () => {
			if (timeout !== undefined) {
				return new Promise(resolve => setTimeout(resolve, timeout));
			}

			const context = await establishContext;

			if (setup !== undefined) {
				await setup(context);
			}

			let actual;
			try {
				actual = await observe(context);
			} catch (err) {
				actual = err;
			}

			await assert(actual);

			if (teardown !== undefined) {
				await teardown(context);
			}
		});
	}
}

/**
 * Initialise a new BDD Specification.
 * @param {BddSpecOptions} [options] - Optional BDD Specification options.
 */
const BddSpec = (options?: BddSpecOptions): Before & Given => BddSpecification.create(options);

export { BddSpec, BddSpecOptions }