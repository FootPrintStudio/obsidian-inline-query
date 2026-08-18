# Grimoire

Inline metadata expressions for [Obsidian](https://obsidian.md). Write a `q=` query in inline code; Reading view shows the result. Append **`AS card`** (or button, list, …) to style the output.

The expression language is **PQL**. The plugin display name is **Grimoire**.

Repository: [FootPrintStudio/obsidian-inline-query](https://github.com/FootPrintStudio/obsidian-inline-query)

```markdown
`q= title`
`q= default(description, "No description yet.")`
`q= default(characterStatus, "<font color=\"#595959\">Alive, Dead, Undead.</font>") AS card`
```

See **Settings → Guide** in Obsidian (or [docs/GUIDE.md](docs/GUIDE.md)) for the full language reference.

## Install

Not in the Obsidian Community Plugins catalog.

### BRAT (recommended)

Install via [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1. Enable **BRAT** in Community Plugins.
2. **Add Beta plugin** → `FootPrintStudio/obsidian-inline-query`
3. Enable **Grimoire** and reload Obsidian.

BRAT installs from [GitHub Releases](https://github.com/FootPrintStudio/obsidian-inline-query/releases). Each release attaches `main.js`, `manifest.json`, `styles.css`, and `versions.json`.

The plugin **id** remains `property-query` (folder name and `community-plugins.json` entry). Only the display name changed to Grimoire.

### From source

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/FootPrintStudio/obsidian-inline-query.git property-query
cd property-query
bash build.sh
```

Enable **Grimoire** under Community plugins, then reload Obsidian.

## Display styles

Append **`AS <style>`** after the expression. `AS` is a trailing suffix, not an operator — a field named `as` still works (`as AS card`).

| Suffix | Result |
|--------|--------|
| `AS card` / `AS cards` | Pill chips. Arrays become one chip per item. Tag-like values are clickable. HTML inside a card is rendered. |
| `AS button` / `AS buttons` | Link buttons (`[[Note]]`, markdown links, or URLs) |
| `AS cards-code` / `AS code` | Monospace chips with a leading `.` |
| `AS inline` | Comma-separated text |
| `AS list` | Bulleted list |

This replaces Property Pretty’s `` `property.card` `` / `` `~ tags.cards` `` syntax for Grimoire queries. Pretty can stay installed for existing `~` snippets.

## Where Grimoire runs

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
| **Inline prefix** | `q=` | Marker at the start of inline code that identifies a Grimoire expression |
| **Enable in Reading view** | on | Evaluate expressions when notes render in Reading view (and Live Preview preview DOM) |
| **Syntax highlight inline queries** | on | Colorize `` `q= …` `` in the editor and in Reading view when evaluation is off |
| **Refresh on metadata change** | off | Re-render Reading views when frontmatter or embedded metadata changes (may reset scroll) |
| **Button link open** | Same as Obsidian links | Default pane for `AS button` internal links. Ctrl/Cmd and middle-click still override. |
| **Debug mode** | off | Show full parse/evaluation errors inline instead of a generic message |

The settings UI includes **README** and **Guide** tabs with in-app documentation.

## v0.3.0 features

- Plugin display name **Grimoire** (plugin id remains `property-query`)
- Trailing **`AS <style>`** display styles: card, button, cards-code, inline, list
- Button link-open setting (from Property Pretty)

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
| `` `q= ...` `` | **Grimoire** |
| `` `= ...` `` | **Dataview** (inline DQL) |
| `` `$= ...` `` | **Dataview** (inline JS) |
| ` ```dataview` blocks | **Dataview** |

Both plugins can stay enabled. Grimoire registers its Reading view processor **before** Dataview and shields standalone `` `=` `` / `` `==` `` snippets that Dataview mis-parses. Valid Dataview inline queries are left alone.

Do not set the prefix to `"="` — that would intercept Dataview inline syntax.

## Build & test

```bash
cd .obsidian/plugins/property-query
bash build.sh      # writes main.js
bash test.sh       # unit tests in /tmp
```

Reload the plugin after rebuilding.

Manual smoke test: open `Property Query Test/00 Smoke Test.md` in Reading view. See [TESTING.md](TESTING.md).

## Documentation

| File | Purpose |
|------|---------|
| [docs/GUIDE.md](docs/GUIDE.md) | Full language reference (shown in Settings → Guide) |
| [docs/PQL-SPEC.md](docs/PQL-SPEC.md) | Formal spec notes |
| [TESTING.md](TESTING.md) | Manual and automated test checklist |

## License

MIT — see [LICENSE](LICENSE).
