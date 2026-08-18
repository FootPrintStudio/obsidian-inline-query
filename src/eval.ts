import {
	coerceForConcat,
	isWildcardKey,
	valueToPlainString,
	valuesEqual,
} from "./coerce";
import {
	addDateDuration,
	addDurations,
	compareValues,
	dateformat,
	durationformat,
	fnDate,
	fnDur,
	isPqDate,
	isPqDuration,
	pqDate,
	resolveDateKeyword,
	scaleDuration,
	subtractDateDuration,
	subtractDates,
	subtractDurations,
	toPqDate,
	toPqDuration,
} from "./dates";
import { getMemberValue, getFileField, resolveIdent } from "./context";
import { parseExpression, parseQuery } from "./parse";
import type { RenderStyle } from "./renderStyle";
import type { AstNode, FileMeta, QueryContext, Value } from "./types";

function isTruthy(value: Value): boolean {
	if (value === null || value === undefined || value === false) return false;
	if (value === "") return false;
	if (Array.isArray(value)) return value.length > 0;
	return true;
}

function fnDefault(value: Value, fallback: Value): Value {
	if (!isTruthy(value)) return fallback;
	if (Array.isArray(value) && value.length === 0) return fallback;
	return value;
}

function fnChoice(cond: Value, ifTrue: Value, ifFalse: Value): Value {
	return isTruthy(cond) ? ifTrue : ifFalse;
}

function fnAny(...args: Value[]): boolean {
	if (args.length === 0) return false;
	if (args.length === 1) return isTruthy(args[0]);
	const hay = args[0]!;
	const needles = args.slice(1);
	return needles.some((needle) => fnEcontains(hay, needle));
}

function fnContains(hay: Value, needle: Value): boolean {
	if (hay === null || needle === null) return false;
	if (typeof hay === "string" && typeof needle === "string") return hay.includes(needle);
	if (Array.isArray(hay)) {
		return hay.some((item) => {
			if (typeof item === "string" && typeof needle === "string") return item.includes(needle);
			return valuesEqual(item, needle);
		});
	}
	return false;
}

function fnEcontains(hay: Value, needle: Value): boolean {
	if (hay === null || needle === null) return false;
	if (typeof hay === "string" && typeof needle === "string") return hay.includes(needle);
	if (Array.isArray(hay)) return hay.some((item) => valuesEqual(item, needle));
	if (typeof hay === "object" && !isPqDate(hay) && !isPqDuration(hay) && typeof needle === "string") {
		return Object.prototype.hasOwnProperty.call(hay, needle);
	}
	return false;
}

function fnSlice(list: Value, start: Value, end?: Value): Value {
	if (!Array.isArray(list)) return [];
	const s = Number(start);
	const e = end === undefined ? list.length : Number(end);
	return list.slice(s, e);
}

function fnLength(value: Value): number {
	if (value === null) return 0;
	if (typeof value === "string" || Array.isArray(value)) return value.length;
	return 0;
}

function fnCoalesce(...args: Value[]): Value {
	for (const arg of args) {
		if (isTruthy(arg)) return arg;
	}
	return null;
}

function fnJoin(list: Value, sep: Value): string {
	if (!Array.isArray(list)) return valueToPlainString(list);
	return list.map((v) => coerceForConcat(v)).join(String(sep ?? ", "));
}

function evalSelect(args: AstNode[], ctx: QueryContext): Value {
	if (args.length < 2) throw new Error("select() requires a key and at least one {key, value} pair");
	const lookup = evalNode(args[0]!, ctx);
	let fallback: Value | null = null;

	for (let i = 1; i < args.length; i++) {
		const arg = args[i]!;
		if (arg.kind !== "pair") {
			throw new Error("select() arguments after the key must be {key, value} pairs");
		}
		const pairKey = evalNode(arg.key, ctx);
		const pairValue = evalNode(arg.value, ctx);
		if (isWildcardKey(pairKey)) {
			fallback = pairValue;
			continue;
		}
		if (valuesEqual(pairKey, lookup)) return pairValue;
	}
	return fallback;
}

function resolveMemberNode(node: AstNode, ctx: QueryContext): Value {
	if (node.kind === "ident") {
		if (node.name === "file") return ctx.file as unknown as Value;
		return resolveIdent(node.name, ctx);
	}
	if (node.kind === "member") {
		if (node.object.kind === "ident" && node.object.name === "this" && node.property === "file") {
			return ctx.file as unknown as Value;
		}
		if (node.object.kind === "ident" && node.object.name === "file") {
			return getFileField(ctx.file, node.property);
		}
		if (node.object.kind === "member" && node.object.object.kind === "ident" && node.object.object.name === "this" && node.object.property === "file") {
			return getFileField(ctx.file, node.property);
		}
		const base = evalNode(node.object, ctx);
		return getMemberValue(base, node.property);
	}
	return evalNode(node, ctx);
}

function addValues(a: Value, b: Value): Value {
	const da = toPqDate(a);
	const db = toPqDate(b);
	const dura = toPqDuration(a);
	const durb = toPqDuration(b);

	if (da && durb) return addDateDuration(da, durb);
	if (dura && durb) return addDurations(dura, durb);
	if (typeof a === "string" || typeof b === "string") {
		return coerceForConcat(a) + coerceForConcat(b);
	}
	if (typeof a === "number" && typeof b === "number") return a + b;
	return coerceForConcat(a) + coerceForConcat(b);
}

function subtractValues(a: Value, b: Value): Value {
	const da = toPqDate(a);
	const db = toPqDate(b);
	const dura = toPqDuration(a);
	const durb = toPqDuration(b);

	if (da && db) return subtractDates(da, db);
	if (da && durb) return subtractDateDuration(da, durb);
	if (dura && durb) return subtractDurations(dura, durb);
	return (Number(a) || 0) - (Number(b) || 0);
}

function multiplyValues(a: Value, b: Value): Value {
	const dura = toPqDuration(a);
	const durb = toPqDuration(b);
	if (dura && typeof b === "number") return scaleDuration(dura, b);
	if (durb && typeof a === "number") return scaleDuration(durb, a);
	return (Number(a) || 0) * (Number(b) || 0);
}

function divideValues(a: Value, b: Value): Value {
	const dura = toPqDuration(a);
	if (dura && typeof b === "number" && b !== 0) return scaleDuration(dura, 1 / b);
	return (Number(a) || 0) / (Number(b) || 1);
}

function compareOp(op: string, left: Value, right: Value): Value {
	const cmp = compareValues(left, right);
	switch (op) {
		case "==":
			return valuesEqual(left, right);
		case "!=":
			return !valuesEqual(left, right);
		case "<":
			return cmp < 0;
		case ">":
			return cmp > 0;
		case "<=":
			return cmp <= 0;
		case ">=":
			return cmp >= 0;
		default:
			return false;
	}
}

function evalNode(node: AstNode, ctx: QueryContext): Value {
	switch (node.kind) {
		case "literal":
			return node.value;
		case "pair":
			return evalNode(node.value, ctx);
		case "ident":
			return resolveIdent(node.name, ctx);
		case "member":
			return resolveMemberNode(node, ctx);
		case "index": {
			const base = evalNode(node.object, ctx);
			const indexVal = evalNode(node.index, ctx);
			if (Array.isArray(base)) {
				const idx = Number(indexVal);
				return !Number.isNaN(idx) ? (base[idx] ?? null) : null;
			}
			return null;
		}
		case "unary": {
			const v = evalNode(node.arg, ctx);
			if (node.op === "not") return !isTruthy(v);
			if (node.op === "-") return -(Number(v) || 0);
			return null;
		}
		case "binary": {
			const left = evalNode(node.left, ctx);
			const right = evalNode(node.right, ctx);
			switch (node.op) {
				case "+":
					return addValues(left, right);
				case "-":
					return subtractValues(left, right);
				case "*":
					return multiplyValues(left, right);
				case "/":
					return divideValues(left, right);
				case "%":
					return (Number(left) || 0) % (Number(right) || 1);
				case "==":
				case "!=":
				case "<":
				case ">":
				case "<=":
				case ">=":
					return compareOp(node.op, left, right);
				case "and":
				case "&&":
					return isTruthy(left) && isTruthy(right);
				case "or":
				case "||":
					return isTruthy(left) || isTruthy(right);
				default:
					return null;
			}
		}
		case "call": {
			const name = node.callee.toLowerCase();
			if (name === "select") return evalSelect(node.args, ctx);
			const args = node.args.map((arg) => evalNode(arg, ctx));
			const fn = FUNCTION_MAP[name];
			if (!fn) throw new Error(`Unknown function "${node.callee}"`);
			return fn(args, node.args);
		}
		default:
			return null;
	}
}

type Fn = (args: Value[], rawArgs?: AstNode[]) => Value;

const FUNCTION_MAP: Record<string, Fn> = {
	default: ([a, b]) => fnDefault(a, b),
	choice: ([c, a, b]) => fnChoice(c, a, b),
	any: (args) => fnAny(...args),
	contains: ([a, b]) => fnContains(a, b),
	econtains: ([a, b]) => fnEcontains(a, b),
	slice: ([list, start, end]) => fnSlice(list, start, end),
	dateformat: ([d, fmt]) => dateformat(d, String(fmt ?? "")),
	durationformat: ([d, fmt]) => durationformat(d, fmt === undefined ? undefined : String(fmt)),
	length: ([v]) => fnLength(v),
	coalesce: (args) => fnCoalesce(...args),
	join: ([list, sep]) => fnJoin(list, sep),
	date: (args, rawArgs) => {
		const raw = rawArgs?.[0];
		if (raw?.kind === "ident") {
			const keyword = resolveDateKeyword(raw.name);
			if (keyword) return keyword;
		}
		return fnDate(args[0] ?? null) ?? null;
	},
	dur: (args) => fnDur(args) ?? null,
};

export function evaluateExpression(source: string, ctx: QueryContext): Value {
	return evalNode(parseExpression(source), ctx);
}

export function evaluateExpressionSafe(
	source: string,
	ctx: QueryContext,
): { ok: true; value: Value; style: RenderStyle | null } | { ok: false; error: string } {
	try {
		const { ast, style } = parseQuery(source);
		return { ok: true, value: evalNode(ast, ctx), style };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}

export function createTestContext(overrides: Partial<QueryContext> & { fields?: Record<string, Value> } = {}): QueryContext {
	const now = pqDate(Date.now());
	const file: FileMeta = {
		name: "Test",
		path: "Test.md",
		folder: "",
		mtime: now,
		ctime: now,
		size: 0,
		tags: [],
		...overrides.file,
	};
	return {
		fields: overrides.fields ?? {},
		file,
	};
}
