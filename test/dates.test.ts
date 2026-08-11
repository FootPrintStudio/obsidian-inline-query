import { describe, expect, it } from "vitest";
import { moment } from "obsidian";
import { addDateDuration, addDurations, dateformat, fnDate, fnDur, resolveDateKeyword } from "../src/dates";

describe("calendar date arithmetic", () => {
	it("adds dur(n, years) as calendar years not fixed milliseconds", () => {
		const birth = fnDate("2000-01-01")!;
		const twentyFiveYears = fnDur([25, "years"])!;
		expect(twentyFiveYears.calendar).toEqual([{ amount: 25, unit: "years" }]);
		const result = addDateDuration(birth, twentyFiveYears);
		expect(dateformat(result, "yyyy")).toBe("2025");
		expect(dateformat(result, "yyyy-MM-dd")).toBe("2025-01-01");
	});

	it("merges calendar parts when adding durations", () => {
		const merged = addDurations(fnDur([1, "year"])!, fnDur([10, "days"])!);
		const result = addDateDuration(fnDate("2000-01-01")!, merged);
		expect(dateformat(result, "yyyy-MM-dd")).toBe("2001-01-11");
	});
});

describe("date keywords", () => {
	it("resolves now and today keywords", () => {
		const now = resolveDateKeyword("now")!;
		const today = resolveDateKeyword("today")!;
		expect(dateformat(now, "yyyy-MM-dd")).toBe(moment().format("YYYY-MM-DD"));
		expect(dateformat(today, "yyyy-MM-dd")).toBe(moment().startOf("day").format("YYYY-MM-DD"));
	});

	it("parses quoted keywords via fnDate", () => {
		expect(dateformat(fnDate("today")!, "yyyy-MM-dd")).toBe(moment().startOf("day").format("YYYY-MM-DD"));
		expect(dateformat(fnDate("now")!, "yyyy-MM-dd")).toBe(moment().format("YYYY-MM-DD"));
	});
});
