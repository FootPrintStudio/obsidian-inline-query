import { describe, expect, it } from "vitest";
import { parseExpression } from "../src/parse";

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
