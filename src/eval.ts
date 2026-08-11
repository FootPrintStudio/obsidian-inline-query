import { getMemberValue } from "./context";
import { parseExpression } from "./parse";
import type { AstNode, ThisContext, Value } from "./types";

function isTruthy(value: Value): boolean {
	if (value === null || value === undefined || value === false) return false;
	if (value === "") return false;
	if (Array.isArray(value)) return value.length > 0;
	return true;
}

function toDate(value: Value): Date | null {
	if (value instanceof Date) return value;
	if (typeof value === "number") return new Date(value);
	if (typeof value === "string" && value) {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d;
	}
	return null;
}

function pad2(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

function dateformat(value: Value, format: string): string {
	const d = toDate(value);
	if (!d) return "";
	return format
		.replace(/yyyy/g, String(d.getFullYear()))
		.replace(/MM/g, pad2(d.getMonth() + 1))
		.replace(/dd/g, pad2(d.getDate()))
		.replace(/HH/g, pad2(d.getHours()))
		.replace(/mm/g, pad2(d.getMinutes()))
		.replace(/ss/g, pad2(d.getSeconds()));
}

function fnDefault(value: Value, fallback: Value): Value {
	if (!isTruthy(value)) return fallback;
	if (Array.isArray(value) && value.length === 0) return fallback;
	return value;
}

function fnAny(value: Value): boolean {
	return isTruthy(value);
}

function fnChoice(cond: Value, ifTrue: Value, ifFalse: Value): Value {
	return isTruthy(cond) ? ifTrue : ifFalse;
}

function fnContains(hay: Value, needle: Value): boolean {
	if (hay === null || needle === null) return false;
	if (typeof hay === "string" && typeof needle === "string") return hay.includes(needle);
	if (Array.isArray(hay)) {
		return hay.some((item) => {
			if (typeof item === "string" && typeof needle === "string") return item.includes(needle);
			return item === needle;
		});
	}
	return false;
}

function fnEcontains(hay: Value, needle: Value): boolean {
	if (hay === null || needle === null) return false;
	if (typeof hay === "string" && typeof needle === "string") return hay.includes(needle);
	if (Array.isArray(hay)) return hay.some((item) => item === needle);
	if (typeof hay === "object" && !(hay instanceof Date) && typeof needle === "string") {
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

const FUNCTIONS: Record<string, (args: Value[]) => Value> = {
	default: ([a, b]) => fnDefault(a, b),
	choice: ([c, a, b]) => fnChoice(c, a, b),
	any: ([v]) => fnAny(v),
	contains: ([a, b]) => fnContains(a, b),
	econtains: ([a, b]) => fnEcontains(a, b),
	slice: ([list, start, end]) => fnSlice(list, start, end),
	dateformat: ([d, fmt]) => dateformat(d, String(fmt ?? "")),
	length: ([v]) => fnLength(v),
};

function addValues(a: Value, b: Value): Value {
	if (typeof a === "string" || typeof b === "string") {
		return String(a ?? "") + String(b ?? "");
	}
	if (typeof a === "number" && typeof b === "number") return a + b;
	return String(a ?? "") + String(b ?? "");
}

function evalNode(node: AstNode, ctx: ThisContext): Value {
	switch (node.kind) {
		case "literal":
			return node.value;
		case "ident": {
			if (node.name === "this") return ctx;
			return ctx[node.name] ?? null;
		}
		case "member": {
			const base = evalNode(node.object, ctx);
			return getMemberValue(base, node.property);
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
					return (Number(left) || 0) - (Number(right) || 0);
				case "*":
					return (Number(left) || 0) * (Number(right) || 0);
				case "/":
					return (Number(left) || 0) / (Number(right) || 1);
				case "==":
					return left === right;
				case "!=":
					return left !== right;
				case "<":
					return (Number(left) || 0) < (Number(right) || 0);
				case ">":
					return (Number(left) || 0) > (Number(right) || 0);
				case "<=":
					return (Number(left) || 0) <= (Number(right) || 0);
				case ">=":
					return (Number(left) || 0) >= (Number(right) || 0);
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
			const fn = FUNCTIONS[node.callee.toLowerCase()];
			if (!fn) throw new Error(`Unknown function "${node.callee}"`);
			const args = node.args.map((arg) => evalNode(arg, ctx));
			return fn(args);
		}
		default:
			return null;
	}
}

export function evaluateExpression(source: string, ctx: ThisContext): Value {
	const ast = parseExpression(source);
	return evalNode(ast, ctx);
}

export function evaluateExpressionSafe(
	source: string,
	ctx: ThisContext,
): { ok: true; value: Value } | { ok: false; error: string } {
	try {
		const ast = parseExpression(source);
		return { ok: true, value: evalNode(ast, ctx) };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}
