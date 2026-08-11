import { describe, expect, it } from "vitest";
import { shouldShieldDataviewInlineCode } from "../src/dataviewCoexist";

describe("Dataview coexistence", () => {
	const prefix = "q=";

	it("shields lone equals-sign inline code", () => {
		expect(shouldShieldDataviewInlineCode("==", prefix)).toBe(true);
		expect(shouldShieldDataviewInlineCode("=", prefix)).toBe(true);
		expect(shouldShieldDataviewInlineCode("===", prefix)).toBe(true);
	});

	it("does not shield property query expressions", () => {
		expect(shouldShieldDataviewInlineCode('q= choice(numA == 10, "ten", "not ten")', prefix)).toBe(
			false,
		);
	});

	it("does not shield valid Dataview inline queries", () => {
		expect(shouldShieldDataviewInlineCode("this.file.name", prefix)).toBe(false);
		expect(shouldShieldDataviewInlineCode("= this.file.name", prefix)).toBe(false);
	});

	it("does not shield Dataview JS inline queries", () => {
		expect(shouldShieldDataviewInlineCode("$= dv.current().file.name", prefix)).toBe(false);
	});
});
