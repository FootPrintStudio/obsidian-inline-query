import { describe, expect, it } from "vitest";
import { parseExpression, parseQuery } from "../src/parse";
import { parseRenderStyleName } from "../src/renderStyle";

describe("parse logical operators", () => {
	it("parses or as a keyword", () => {
		const ast = parseExpression("false or true");
		expect(ast.kind).toBe("binary");
		if (ast.kind === "binary") {
			expect(ast.op).toBe("or");
		}
	});

	it("parses and as a keyword", () => {
		const ast = parseExpression("false and true");
		expect(ast.kind).toBe("binary");
		if (ast.kind === "binary") {
			expect(ast.op).toBe("and");
		}
	});

	it("parses || as an operator token", () => {
		const ast = parseExpression("false || true");
		expect(ast.kind).toBe("binary");
		if (ast.kind === "binary") {
			expect(ast.op).toBe("or");
		}
	});
});

describe("parseQuery AS style", () => {
	it("returns null style when AS is omitted", () => {
		const q = parseQuery("title");
		expect(q.ast.kind).toBe("ident");
		expect(q.style).toBeNull();
	});

	it("parses AS card after an expression", () => {
		const q = parseQuery(
			'default(characterStatus, "<font color=\\"#595959\\">Alive, Dead, Undead.</font>") AS card',
		);
		expect(q.ast.kind).toBe("call");
		expect(q.style).toBe("cards");
	});

	it("accepts cards, button, hyphenated cards-code, inline, and list", () => {
		expect(parseQuery("tags AS cards").style).toBe("cards");
		expect(parseQuery("parent AS button").style).toBe("button");
		expect(parseQuery("cssclasses AS cards-code").style).toBe("cards-code");
		expect(parseQuery("tags AS code").style).toBe("cards-code");
		expect(parseQuery("tags AS inline").style).toBe("inline");
		expect(parseQuery("bodyParts AS list").style).toBe("list");
	});

	it("treats as as an identifier when followed by AS card", () => {
		const q = parseQuery("as AS card");
		expect(q.ast.kind).toBe("ident");
		if (q.ast.kind === "ident") expect(q.ast.name).toBe("as");
		expect(q.style).toBe("cards");
	});

	it("is case-insensitive for AS", () => {
		expect(parseQuery("title as CARD").style).toBe("cards");
	});

	it("rejects unknown styles and leftover tokens", () => {
		expect(() => parseQuery("title AS banana")).toThrow(/Unknown style/);
		expect(() => parseQuery("title extra")).toThrow(/Unexpected token/);
		expect(() => parseQuery("title AS")).toThrow(/Expected identifier/);
	});
});

describe("parseRenderStyleName", () => {
	it("maps aliases", () => {
		expect(parseRenderStyleName("card")).toBe("cards");
		expect(parseRenderStyleName("buttons")).toBe("button");
		expect(parseRenderStyleName("codecard")).toBe("cards-code");
	});
});
