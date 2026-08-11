import { describe, expect, it } from "vitest";
import { moment } from "obsidian";
import { pqDate } from "../src/dates";
import { createTestContext, evaluateExpression } from "../src/eval";
import { parseExpression } from "../src/parse";

describe("parse", () => {
	it("parses braced pair literals", () => {
		const ast = parseExpression('select(1, {1, "A"}, {2, "B"})');
		expect(ast.kind).toBe("call");
		if (ast.kind === "call") {
			expect(ast.args[1]?.kind).toBe("pair");
		}
	});

	it("parses file.member access", () => {
		const ast = parseExpression("file.mtime");
		expect(ast.kind).toBe("member");
	});
});

describe("eval core functions", () => {
	const ctx = createTestContext({
		fields: {
			title: "Hello",
			tags: ["a", "b"],
			pageColour: "Blue",
			description: "",
			parent: "[[Someone]]",
		},
	});

	it("resolves bare frontmatter fields", () => {
		expect(evaluateExpression("title", ctx)).toBe("Hello");
	});

	it("resolves this alias", () => {
		expect(evaluateExpression("this.title", ctx)).toBe("Hello");
	});

	it("default uses fallback for empty string", () => {
		expect(evaluateExpression('default(description, "fallback")', ctx)).toBe("fallback");
	});

	it("choice branches on any() single arg", () => {
		expect(evaluateExpression('choice(any(tags), "yes", "no")', ctx)).toBe("yes");
		expect(evaluateExpression("any(emptyField)", createTestContext({ fields: { emptyField: "" } }))).toBe(
			false,
		);
	});

	it("any multi-arg checks containment in property", () => {
		const bodyCtx = createTestContext({
			fields: { bodyParts: ["Hand", "Feet", "Knees", "Toes"] },
		});
		expect(evaluateExpression("any(bodyParts)", bodyCtx)).toBe(true);
		expect(evaluateExpression('any(bodyParts, "Feet", "Elbows")', bodyCtx)).toBe(true);
		expect(evaluateExpression('any(bodyParts, "Nose", "Elbows", "Legs")', bodyCtx)).toBe(false);
	});

	it("select matches numeric keys", () => {
		expect(evaluateExpression('select(2, {1, "A"}, {2, "B"})', ctx)).toBe("B");
	});

	it("select resolves property values", () => {
		expect(evaluateExpression("select(3, {1, \"Red\"}, {3, pageColour})", ctx)).toBe("Blue");
	});

	it("select uses wildcard fallback", () => {
		expect(evaluateExpression('select(9, {1, "A"}, {*, "none"})', ctx)).toBe("none");
	});

	it("slice and econtains for epoch pattern", () => {
		const epochCtx = createTestContext({
			fields: { epochTitles: ["Alpha", "", "Gamma"] },
		});
		const expr =
			'choice(econtains(slice(epochTitles, 0, 1), ""), None, slice(epochTitles, 0, 1))';
		expect(evaluateExpression(expr, epochCtx)).toEqual(["Alpha"]);
	});

	it("concatenates strings with properties", () => {
		expect(evaluateExpression('"**Parent:** " + parent', ctx)).toBe("**Parent:** [[Someone]]");
	});

	it("adds numeric frontmatter fields as numbers", () => {
		const numCtx = createTestContext({ fields: { numA: 10, numB: 3 } });
		expect(evaluateExpression("numA + numB", numCtx)).toBe(13);
		expect(evaluateExpression("numA - numB", numCtx)).toBe(7);
		expect(evaluateExpression("numA * numB", numCtx)).toBe(30);
	});

	it("evaluates or and and logical operators", () => {
		expect(evaluateExpression('choice(false or true, "yes", "no")', createTestContext())).toBe("yes");
		expect(evaluateExpression('choice(false and true, "yes", "no")', createTestContext())).toBe("no");
		expect(evaluateExpression('choice(false && true, "yes", "no")', createTestContext())).toBe("no");
		expect(evaluateExpression("choice((numA == 0) or (numB == 3), \"ok\", \"fail\")", createTestContext({ fields: { numA: 10, numB: 3 } }))).toBe("ok");
	});
});

describe("date and duration", () => {
	it("formats dates with Luxon-style tokens", () => {
		const ctx = createTestContext({
			file: {
				name: "Test",
				path: "Test.md",
				folder: "",
				mtime: pqDate(new Date("2024-06-15T14:30:00").getTime()),
				ctime: pqDate(new Date("2024-06-15T14:30:00").getTime()),
				size: 1,
				tags: [],
			},
		});
		const out = evaluateExpression('dateformat(file.mtime, "yyyy-MM-dd")', ctx);
		expect(out).toBe("2024-06-15");
	});

	it("subtracts dates to duration", () => {
		const a = pqDate(new Date("2024-06-15").getTime());
		const b = pqDate(new Date("2024-06-10").getTime());
		const ctx = createTestContext({ fields: { a, b } });
		const dur = evaluateExpression("a - b", ctx);
		expect(typeof dur).toBe("object");
		if (dur && typeof dur === "object" && "__pqDuration" in dur) {
			expect(dur.ms).toBe(5 * 24 * 60 * 60 * 1000);
		}
	});

	it("adds duration to date", () => {
		const start = pqDate(new Date("2024-01-01").getTime());
		const ctx = createTestContext({ fields: { start } });
		const result = evaluateExpression('start + dur(7, "days")', ctx);
		expect(typeof result).toBe("object");
		if (result && typeof result === "object" && "__pqDate" in result) {
			expect(new Date(result.ms).toISOString().slice(0, 10)).toBe("2024-01-08");
		}
	});

	it("adds calendar years to a date", () => {
		const ctx = createTestContext({ fields: { birthDate: "2000-01-01" } });
		const out = evaluateExpression('dateformat(date(birthDate) + dur(25, "years"), "yyyy")', ctx);
		expect(out).toBe("2025");
	});

	it("parses date(now) and date(today)", () => {
		expect(evaluateExpression('dateformat(date(today), "yyyy-MM-dd")', createTestContext())).toBe(
			moment().startOf("day").format("YYYY-MM-DD"),
		);
		expect(evaluateExpression('dateformat(date("now"), "yyyy-MM-dd")', createTestContext())).toBe(
			moment().format("YYYY-MM-DD"),
		);
	});

	it("formats durations with Luxon-style tokens", () => {
		const ctx = createTestContext();
		expect(evaluateExpression('durationformat(dur(90, "minutes"), "h:mm")', ctx)).toBe("1:30");
		expect(evaluateExpression('durationformat(dur(1, "day"), "d\' days\'")', ctx)).toBe("1 days");
		expect(evaluateExpression('durationformat(dur(5, "days") - dur(2, "days"), "d")', ctx)).toBe("3");
	});

	it("formats long date differences as duration", () => {
		const birth = pqDate(new Date("2000-01-01").getTime());
		const now = pqDate(new Date("2024-06-15").getTime());
		const ageCtx = createTestContext({ fields: { birth, now } });
		const formatted = evaluateExpression('durationformat(now - birth, "y\' years\'")', ageCtx);
		expect(formatted).toMatch(/^24 years$/);
	});
});
