import { describe, expect, it } from "vitest";
import { classifyOutput, valueToStyleItems } from "../src/coerce";

describe("classifyOutput", () => {
	it("classifies plain text", () => {
		expect(classifyOutput("hello")).toBe("text");
		expect(classifyOutput(42)).toBe("text");
	});

	it("classifies markdown markers", () => {
		expect(classifyOutput("**Parent:** note")).toBe("markdown");
		expect(classifyOutput("[[Wiki]]")).toBe("markdown");
	});

	it("classifies pure HTML without markdown as html", () => {
		expect(classifyOutput("<em>Placeholder</em>")).toBe("html");
		expect(classifyOutput("line<br>break")).toBe("html");
	});

	it("prefers markdown when markdown and HTML are mixed", () => {
		expect(classifyOutput("**Parent:** x<br>")).toBe("markdown");
		expect(classifyOutput("**Parent:** [[Someone]]<br>")).toBe("markdown");
		expect(classifyOutput("![img](x.png)<br>caption")).toBe("markdown");
	});

	it("treats empty as empty", () => {
		expect(classifyOutput(null)).toBe("empty");
		expect(classifyOutput("")).toBe("empty");
	});
});

describe("valueToStyleItems", () => {
	it("wraps a single string as one item", () => {
		expect(valueToStyleItems('Alive, Dead, Undead.')).toEqual(["Alive, Dead, Undead."]);
	});

	it("expands arrays one item per element", () => {
		expect(valueToStyleItems(["a", "b"])).toEqual(["a", "b"]);
	});

	it("drops null and empty strings", () => {
		expect(valueToStyleItems(null)).toEqual([]);
		expect(valueToStyleItems(["", "keep", null])).toEqual(["keep"]);
	});
});
