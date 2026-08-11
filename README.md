# Property Query

FootPrintStudio plugin: **Property Query Language (PQL)** — inline metadata expressions for Obsidian notes.

Repository: [FootPrintStudio/obsidian-inline-query](https://github.com/FootPrintStudio/obsidian-inline-query)

## Quick start

Write expressions in inline code with the **`q=`** prefix (configurable):

```markdown
`q= title`
`q= default(description, "No description yet.")`
`q= select(2, {1, "Red"}, {2, "Green"}, {3, pageColour})`
`q= dateformat(file.mtime, "yyyy-MM-dd HH:mm:ss")`
```

Open the note in **Reading view** with **Enable in Reading view** on (default) to see evaluated results.

See **Settings → Guide** in Obsidian (or [docs/GUIDE.md](docs/GUIDE.md)) for the full language reference.

## Where PQL runs

| View / mode | Evaluation | Syntax highlighting |
|-------------|--------------|---------------------|
| **Reading view** (eval on) | Replaces `` `q= …` `` with the result | No (result is shown instead) |
| **Reading view** (eval off) | Skipped | Colored query source in `<code>` |
| **Source mode** | Not evaluated | Colored tokens in inline code |
| **Live Preview** | Same as Reading view when eval on | Colored tokens in the editable source |

Syntax highlighting is controlled by **Syntax highlight inline queries** (on by default). Toggling settings re-renders open markdown previews automatically.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Inline prefix** | `q=` | Marker at the start of inline code that identifies a PQL expression |
| **Enable in Reading view** | on | Evaluate expressions when notes render in Reading view (and Live Preview preview DOM) |
| **Syntax highlight inline queries** | on | Colorize `` `q= …` `` in the editor and in Reading view when evaluation is off |
| **Refresh on metadata change** | off | Re-render Reading views when frontmatter or embedded metadata changes (may reset scroll) |
| **Debug mode** | off | Show full parse/evaluation errors inline instead of a generic message |

The settings UI includes **README** and **Guide** tabs with in-app documentation.

## v0.2.0 features

- Reading view inline evaluation via configurable `q=` prefix
- **Syntax highlighting** in Source mode, Live Preview, and Reading view (highlight-only path)
- Bare frontmatter fields + reserved `file.*` metadata namespace
- Optional `this.` alias for frontmatter
- Functions: `default`, `choice`, `select`, `any`, `contains`, `econtains`, `slice`, `dateformat`, `dur`, `durationformat`, `date`, `length`, `coalesce`, `join`
- Date/duration arithmetic with calendar units (`date + dur(25, "years")`, …)
- Markdown, HTML, and plain output rendering
- Dataview coexistence: shields lone `` `==` `` inline code; runs before Dataview's post-processor
- Optional live refresh when metadata changes
- Unit test suite (`bash test.sh`)

## Coexistence with Dataview

| Syntax | Handled by |
|--------|------------|
| `` `q= ...` `` | **Property Query** |
| `` `= ...` `` | **Dataview** (inline DQL) |
| `` `$= ...` `` | **Dataview** (inline JS) |
| ` ```dataview` blocks | **Dataview** |

Both plugins can stay enabled. Property Query registers its Reading view processor **before** Dataview and shields standalone `` `=` `` / `` `==` `` snippets that Dataview mis-parses. Valid Dataview inline queries are left alone.

Do not set the PQL prefix to `"="` — that would intercept Dataview inline syntax.

## Build & test

```bash
cd .obsidian/plugins/property-query
bash build.sh      # writes main.js
bash test.sh       # unit tests in /tmp (39 tests)
```

Enable **Property Query** under Community plugins, then reload the plugin after rebuilding.

Manual smoke test: open `Property Query Test/00 Smoke Test.md` in Reading view. See [TESTING.md](TESTING.md).

## Documentation

| File | Purpose |
|------|---------|
| [docs/GUIDE.md](docs/GUIDE.md) | Full language reference (shown in Settings → Guide) |
| [docs/PQL-SPEC.md](docs/PQL-SPEC.md) | Formal spec notes |
| [TESTING.md](TESTING.md) | Manual and automated test checklist |

## License

MIT — see [LICENSE](LICENSE).
