declare module '@wellers/bdd' {
	export type BddSpecOptions = {
		timeout?: number;
		concurrency?: number;
		only?: boolean;
		skip?: boolean;
		todo?: boolean | string;
	};
	export type TestOptions = {
		concurrency?: number;
		only?: boolean;
		skip?: boolean;
		todo?: boolean | string;
	};
	export class BddSpec {
		private timeout;
		private options;
		private name;
		private setup;
		private establishContext;
		private observe;
		private teardown;
		constructor(options?: BddSpecOptions);
		before(setup: Function): this;
		given(message: String, establishContext: () => any): this;
		should(message: String, observe: (context: any) => void): this;
		then(teardown: Function): this;
		run(): Promise<void>;
	}
}