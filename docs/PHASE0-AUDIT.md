# Phase 0 — Dataview usage audit

Scanned all markdown under `/media/carl-heinz/REMOTE-A/Obsidian/` (Command Centre, World-Building, EIA, etc.) on 2026-08-10.

## Volume summary

| Pattern | Approx. count | Notes |
|---------|---------------|-------|
| Inline `` `= ...` `` | ~6,711 backtick spans | Includes non-DV backticks; see function breakdown |
| `default(...)` inlines | **5,217** | Dominant pattern — placeholder fields in templates |
| `choice(...)` inlines | **409** | Conditional HTML / section visibility |
| Direct `` `= this.*` `` | **281** | Property display |
| `$=` inline JS | **2** | Stay on Dataview (non-goal for v1) |
| Files with ` ```dataview` | **349** | Keep on Dataview |
| Files with ` ```dataviewjs` | **305** | Keep on Dataview |

## Primary vaults

| Vault | Inline DQL usage | Block queries |
|-------|------------------|---------------|
| **World-Building** | Heavy (templates + entity notes) | Yes (`dataview` + `dataviewjs`) |
| **EIA** | Moderate (mask stats `this.MG`, etc.) | Some ` ```dataview` |
| **Command Centre** | Minimal (NaviNote refresh test only) | None |

## Top expression patterns (required for v1)

| Pattern | Example | v1 priority |
|---------|---------|-------------|
| `default(field, placeholder)` | `` `= default(this.title, "<font>...</font>")` `` | **P0** |
| `choice(cond, a, b)` | `` `= choice(any(this.parent), "**Parent:** " + this.parent, "")` `` | **P0** |
| `this.<field>` | `` `= this.description` `` | **P0** |
| `any(value)` | Empty-check for lists / optional fields | **P0** |
| String `+` | HTML placeholder concatenation | **P0** |
| `contains(a, b)` | Tag / list checks in `choice` | **P1** |
| `econtains(a, b)` | Exact list/string match in epoch templates | **P1** |
| `slice(list, start, end)` | Epoch title/name slots | **P1** |
| `dateformat(date, fmt)` | `` `= dateformat(this.file.mtime, "...")` `` | **P1** |
| `None` literal | `choice(..., None, ...)` display | **P1** |

## Explicitly out of v1 scope

- `$=` / `dataviewjs` inline
- All ` ```dataview` / ` ```dataviewjs` block queries
- Cross-note `[[Note]].field` (Phase 2)
- Live Preview CM6 widget (Phase 1b)
- `dv.pages()`, FLATTEN, GROUP BY, task aggregation

## Acceptance fixtures (from real templates)

1. World-Building Character Template — `default` + `choice` + `any` relationship block
2. World-Building Mask Template — `slice` + `econtains` + `choice` epoch rows
3. Command Centre NaviNote Test 06 — `this.refreshMarker` + `dateformat(this.file.mtime, ...)`
