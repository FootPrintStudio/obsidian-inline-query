# Inline Query v1 — syntax decision

## Prefix: `q=` (configurable in settings)

**Why not `=`:** Dataview uses `=` today; both plugins can run during migration.

**Migration path:** Phase 3 command converts `` `= expr` `` → `` `q= expr` `` where expression is in v1 subset.

## v1 expression subset

### Context

- `this` — current note: YAML frontmatter fields + `this.file.*`
- `this.file.name`, `path`, `folder`, `mtime`, `ctime`, `size`, `tags`

### Literals

- Strings `"..."`, numbers, `true` / `false`, `null`, `None` (alias for null)

### Operators

- `+` `-` `*` `/` (strings: `+` concat)
- `==` `!=` `<` `>` `<=` `>=`
- `and` / `or` (also `&&` / `||`)

### Functions (v1)

| Function | Purpose |
|----------|---------|
| `default(value, fallback)` | Return value if truthy/non-empty, else fallback |
| `choice(cond, ifTrue, ifFalse)` | Conditional |
| `any(value)` | True if value exists and non-empty list/string |
| `contains(hay, needle)` | Substring / list contains |
| `econtains(hay, needle)` | Exact element match in lists |
| `slice(list, start, end?)` | List slice |
| `dateformat(date, format)` | Format date (Luxon-style tokens subset) |
| `length(value)` | String or list length |

### Output rendering

- Strings containing HTML tags render as HTML (same as Dataview templates)
- Other values render as plain text
- Errors render inline in red monospace

## Non-goals (v1)

See [PHASE0-AUDIT.md](./PHASE0-AUDIT.md).
