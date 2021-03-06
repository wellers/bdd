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
	todo: [
		{ type: "boolean", optional: true },
		{ type: "string", optional: true }
	],
	$$strict: true
};

const validator = new Validator();
const validateOptions = validator.compile(optionsSchema);

type Setup = (args: EstablishContext) => void;

type Context = () => void;

type Teardown = (args: EstablishContext) => void;

type EstablishContext = Promise<Context> | Record<never, never>;

type Observe = (context: any) => any;

type Assert = (assert: any) => void;

type Specification = {
	name: string[];
	setup?: Setup;
	establishContext: EstablishContext;
	observe: Observe;
	asserts: Assert[];
	timeout?: number;
	teardown?: Teardown;
	options?: TestOptions;
}

interface Before {
	/**
	* Optional set-up function.	
	* @param {function} setup - Execute a function prior to execution of the test.	
	*/
	before(setup: Setup): Given;
}

interface Given {
	/**
	* Set-up context for test.
	* @param {string} message - Message that is prefixed with "given ".
	* @param {function} establishContext - Sets the context for the test.
	*/
	given(message: string, establishContext: EstablishContext): When
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
	should(message: string, assert: Assert): Should & Then & Run;

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
	then(teardown: Teardown): Run;
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
			name: [],
			establishContext: {},
			observe: () => { throw Error('observe must be set') },
			asserts: []
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

	before(setup: Setup): Given {
		if (typeof setup !== 'function') {
			throw Error('setup must be of type function.');
		}

		this.specification.setup = setup;

		return this;
	}

	given(message: string, establishContext: EstablishContext): When {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (!establishContext) {
			throw Error('establishContext is required.');
		}

		this.specification.name.push(`given ${message}`);
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

		this.specification.name.push(`when ${message}`);
		this.specification.observe = observe;

		return this;
	}

	should(message: string, assert: Assert): Should & Then & Run {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof assert !== 'function') {
			throw Error('assert must be of type function.');
		}

		this.specification.name.push(`should ${message}`);
		this.specification.asserts.push(assert);

		return this;
	}

	shouldThrow(errorMessage: string): Then & Run {
		if (typeof errorMessage === 'undefined') {
			this.specification.name.push('should throw error');
			this.specification.asserts.push((err) => err instanceof Error);

			return this;
		}

		if (typeof errorMessage !== 'string') {
			throw Error('errorMessage must be of type string.');
		}

		this.specification.name.push(`should throw ${errorMessage}`);
		this.specification.asserts.push(({ message }) => strictEqual(message, errorMessage));

		return this;
	}

	then(teardown: Teardown): Run {
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
			asserts,
			teardown
		} = this.specification;

		if (asserts.length === 0) {
			throw Error('There must be at least one assertion.');
		}

		const testName = name.join(", ");

		test(testName, options, async () => {
			if (timeout !== undefined) {
				return new Promise(resolve => setTimeout(resolve, timeout));
			}

			const context = await establishContext;

			if (setup !== undefined) {
				await setup(context);
			}

			let actual: any;
			try {
				actual = await observe(context);
			} catch (err) {
				actual = err;
			}

			const assertions = asserts.map(async (assert) => assert(actual));

			await Promise.all(assertions);

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