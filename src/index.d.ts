declare module '@wellers/bdd' {
	export declare type BddOptions = {
		timeout?: number;
		concurrency?: number;
		only?: boolean;
		skip?: boolean;
		todo?: boolean | string;
	};
	export declare type TestOptions = {
		concurrency?: number;
		only?: boolean;
		skip?: boolean;
		todo?: boolean | string;
	};
	export declare class BddTest {
		private timeout;
		private options;
		private name;
		private setup;
		private establishContext;
		private observe;
		private teardown;
		constructor(options?: BddOptions);
		before(setup: Function): this;
		given(message: String, establishContext: () => any): this;
		should(message: String, observe: (context: any) => void): this;
		then(teardown: Function): this;
		run(): Promise<void>;
	}
}