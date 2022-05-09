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

export class BddSpec {	
	private timeout: number | undefined;
	private options: TestOptions | {} = {};
	private name: string = "";	
	private setup: Function = () => {};
	private establishContext: Function | {} = {};
	private observe: Function = () => {};
	private teardown: Function = () => {};	

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

	given(message: String, establishContext: Function | {}): this {
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		this.name = `given ${message}, `;
		this.establishContext = establishContext;

		return this;
	}

	should(message: String, observe: (context: any) => void): this {
		if (this.name === "") {
			throw Error('given() must be called with a message before should().');
		}
		
		if (typeof message !== 'string') {
			throw Error('message must be of type string.');
		}

		if (typeof observe !== 'function') {
			throw Error('observe must be of type function.');
		}

		this.name = `${this.name}should ${message}`;		
		this.observe = observe;

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

			const context = this.establishContext instanceof Function
				? await this.establishContext()
				: this.establishContext;

			if (this.setup !== undefined) {
				await this.setup(context);
			}

			await this.observe(context);

			if (this.teardown !== undefined) {
				await this.teardown(context);
			}
		});		
	}
}