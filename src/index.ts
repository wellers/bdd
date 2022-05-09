// @ts-ignore
import test from 'node:test';
import Validator from 'fastest-validator';

export type BddSpecOptions = {
	timeout?: number,
	concurrency?: number,
	only?: boolean,
	skip?: boolean,	
	todo?: boolean | string
}

export type TestOptions = {
	concurrency?: number,
	only?: boolean,
	skip?: boolean,	
	todo?: boolean | string
}

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

export class BddSpec {
	private name: string = '';
	private setup: Function = () => {};
	private establishContext: EstablishContext = () => { throw Error('context must be defined.'); };
	private observe: Function = () => { throw Error('observe must be defined.'); };
	private timeout?: number;			
	private check: Function = () => { throw Error('check must be defined.'); };
	private teardown: Function = () => {};
	private options: TestOptions | {} = {};	
	
	constructor(options?: BddSpecOptions) {
		if (options) {
			const results = validateOptions(options);
			
			if (Array.isArray(results)) {			
				const message = results.map(result => result.message).join('\r\n');
				
				throw Error(message);
			}

			const { timeout, concurrency, only, skip, todo } = options;

			this.timeout = timeout;
			this.options = {
				concurrency,
				only,
				skip,
				todo				
			};
		}
	}

	before(setup: Function): this {
		if (typeof setup !== 'function') {
			throw Error('setup must be of type function.');
		}

		this.setup = setup;		

		return this;
	}

	given(message: string, establishContext: Function | {}): this {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		this.name = `given ${message}, `;
		this.establishContext = (async () => establishContext instanceof Function
			? await establishContext()
			: establishContext)();

		return this;
	}

	when(message: string, observe: (context: any) => any): this {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}
		if (this.name === '') {
			throw Error('given must be called before when.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.name = `${this.name}when ${message}, `;		
		this.observe = observe;

		return this;
	}

	should(message: string, check: (actual: any) => void): this {
		this.name = `${this.name}should ${message}`;
		this.check = check;

		return this;
	}

	then(teardown: Function): this {
		if (this.name === "") {
			throw Error('both given() and should() must be called with a message before then().');
		}

		if (typeof teardown !== 'function') {
			throw Error('teardown must be of type function.');
		}

		this.teardown = teardown;

		return this;
	}

	async run(): Promise<void> {		
		test(this.name, this.options, async () => {
			if (this.timeout !== undefined) {
				return new Promise(resolve => setTimeout(resolve, this.timeout));
			}			
			
			const context = await this.establishContext;

			if (this.setup !== undefined) {
				await this.setup(context);
			}
			
			const result = await this.observe(context);

			await this.check(result);

			if (this.teardown !== undefined) {
				await this.teardown(context);
			}
		});		
	}
}