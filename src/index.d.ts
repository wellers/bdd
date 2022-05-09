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
		private name;
		private setup;
		private establishContext;
		private observe;
		private timeout?;
		private check;
		private teardown;
		private options;
		constructor(options?: BddSpecOptions);
		before(setup: Function): this;
		given(message: string, establishContext: () => {}): this;
		when(message: string, observe: (context: any) => any): this;
		should(message: string, check: (actual: any) => void): this;
		then(teardown: Function): this;
		run(): Promise<void>;
	}
}