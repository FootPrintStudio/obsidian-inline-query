# Inline Query

FootPrintStudio plugin: lightweight **inline** expression evaluation for note metadata. Designed as a migration path away from Dataview inlines (`= ...`) without replacing ` ```dataview` block queries.

Repository: [FootPrintStudio/obsidian-inline-query](https://github.com/FootPrintStudio/obsidian-inline-query) (after first push)

## Syntax

Use inline code with the **`q=`** prefix (configurable):

```markdown
`q= this.title`
`q= default(this.description, "No description yet.")`
`q= choice(any(this.tags), this.tags, "none")`
`q= dateformat(this.file.mtime, "yyyy-MM-dd HH:mm:ss")`
```

See [docs/SYNTAX-v1.md](docs/SYNTAX-v1.md) and [docs/PHASE0-AUDIT.md](docs/PHASE0-AUDIT.md).

## v0.1.0 scope

- Reading view inline evaluation
- `this` + frontmatter fields + `this.file.*`
- Functions: `default`, `choice`, `any`, `contains`, `econtains`, `slice`, `dateformat`, `length`
- HTML placeholder strings (World-Building template pattern)
- Refresh on metadata cache changes for active note

## Not in v0.1.0

- Live Preview CM6 widget
- ` ```dataview` / `$=` / cross-note `[[Note]].field`
- Full DQL parity

## Build

```bash
cd .obsidian/plugins/inline-query
bash build.sh
```

Enable **Inline Query** under Community plugins. Keep **Dataview** enabled for block queries until migration is complete.

## Coexistence with Dataview

| Feature | Inline Query | Dataview |
|---------|--------------|----------|
| `` `q= ...` `` | Yes | — |
| `` `= ...` `` | — (migrate to q=) | Yes |
| ` ```dataview` | No | Yes |

## License

MIT — see [LICENSE](LICENSE).
