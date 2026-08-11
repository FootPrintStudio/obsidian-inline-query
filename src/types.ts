export interface InlineQuerySettings {
	inlinePrefix: string;
	enableInReadingView: boolean;
}

export const DEFAULT_SETTINGS: InlineQuerySettings = {
	inlinePrefix: "q=",
	enableInReadingView: true,
};

export type Value =
	| null
	| boolean
	| number
	| string
	| Date
	| Value[]
	| { [key: string]: Value };

export type ThisContext = Record<string, Value> & {
	file: {
		name: string;
		path: string;
		folder: string;
		mtime: Date;
		ctime: Date;
		size: number;
		tags: string[];
	};
};

export type AstNode =
	| { kind: "literal"; value: Value }
	| { kind: "ident"; name: string }
	| { kind: "member"; object: AstNode; property: string }
	| { kind: "unary"; op: string; arg: AstNode }
	| { kind: "binary"; op: string; left: AstNode; right: AstNode }
	| { kind: "call"; callee: string; args: AstNode[] };
