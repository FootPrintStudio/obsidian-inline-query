# Inline Query — manual tests

Fixtures: `Inline Query Test/` in Command Centre vault.

## Prerequisites

- Build: `bash build.sh`
- Enable **Inline Query** (can run alongside Dataview)
- Open notes in **Reading view**

## Checklist

- [ ] `` `q= this.title` `` renders frontmatter title
- [ ] `` `q= default(this.missingField, "fallback")` `` shows fallback
- [ ] `` `q= choice(any(this.tags), "has tags", "no tags")` `` toggles correctly
- [ ] `` `q= dateformat(this.file.mtime, "yyyy-MM-dd")` `` formats date
- [ ] Edit frontmatter → preview refreshes inline result
- [ ] Invalid expression shows red error text
- [ ] Dataview `` `= ...` `` still works when Dataview enabled (separate prefix)
