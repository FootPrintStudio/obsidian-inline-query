export interface PropertyQuerySettings {
	inlinePrefix: string;
	enableInReadingView: boolean;
	enableSyntaxHighlight: boolean;
	debugMode: boolean;
	refreshOnMetadataChange: boolean;
}

export const DEFAULT_SETTINGS: PropertyQuerySettings = {
	inlinePrefix: "q=",
	enableInReadingView: true,
	enableSyntaxHighlight: true,
	debugMode: false,
	refreshOnMetadataChange: false,
};

/** Branded date value (epoch ms, interpreted via Obsidian moment). */
export interface PqDate {
	readonly __pqDate: true;
	readonly ms: number;
}

/** Branded duration value (length in milliseconds). */
export interface PqDuration {
	readonly __pqDuration: true;
	readonly ms: number;
	/** When present, date +/- uses calendar units (years, months, …) not fixed ms. */
	readonly calendar?: ReadonlyArray<{ readonly amount: number; readonly unit: string }>;
}

export type Value =
	| null
	| boolean
	| number
	| string
	| PqDate
	| PqDuration
	| Value[]
	| { [key: string]: Value };

export interface FileMeta {
	name: string;
	path: string;
	folder: string;
	mtime: PqDate;
	ctime: PqDate;
	size: number;
	tags: string[];
}

/** Evaluation context: frontmatter fields + reserved file metadata. */
export interface QueryContext {
	fields: Record<string, Value>;
	file: FileMeta;
}

export type AstNode =
	| { kind: "literal"; value: Value }
	| { kind: "ident"; name: string }
	| { kind: "member"; object: AstNode; property: string }
	| { kind: "index"; object: AstNode; index: AstNode }
	| { kind: "pair"; key: AstNode; value: AstNode }
	| { kind: "unary"; op: string; arg: AstNode }
	| { kind: "binary"; op: string; left: AstNode; right: AstNode }
	| { kind: "call"; callee: string; args: AstNode[] };
