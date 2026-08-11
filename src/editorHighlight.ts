import { syntaxTree, tokenClassNodeProp } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { getExpressionDecorations, splitPrefixExpression } from "./highlight";
import type { PropertyQuerySettings } from "./types";

/** Match Obsidian markdown inline-code content nodes (same approach as Dataview). */
function isInlineCodeContentNode(type: { prop: (prop: unknown) => string | undefined }): boolean {
	const tokenProps = type.prop(tokenClassNodeProp);
	if (!tokenProps) return false;
	const props = new Set(tokenProps.split(" "));
	return props.has("inline-code") && !props.has("formatting");
}

function buildDecorations(view: EditorView, getSettings: () => PropertyQuerySettings): DecorationSet {
	const settings = getSettings();
	if (!settings.enableSyntaxHighlight) return Decoration.none;

	const prefix = settings.inlinePrefix;
	const builder = new RangeSetBuilder<Decoration>();

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (!isInlineCodeContentNode(node.type)) return;

				const nodeFrom = node.from;
				const nodeTo = node.to;
				const codeText = view.state.doc.sliceString(nodeFrom, nodeTo);
				const split = splitPrefixExpression(codeText, prefix);
				if (!split) return;

				const prefixStart = nodeFrom + (codeText.length - codeText.trimStart().length);
				builder.add(
					prefixStart,
					prefixStart + prefix.length,
					Decoration.mark({ class: "pq-hl-prefix" }),
				);

				const exprBase = nodeFrom + split.exprStart;
				for (const dec of getExpressionDecorations(split.expr, exprBase)) {
					builder.add(dec.from, dec.to, Decoration.mark({ class: dec.className }));
				}
			},
		});
	}

	return builder.finish();
}

export function pqEditorHighlightExtension(getSettings: () => PropertyQuerySettings) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, getSettings);
			}

			update(update: ViewUpdate): void {
				// Rebuild every update so highlights appear once the syntax tree is ready.
				this.decorations = buildDecorations(update.view, getSettings);
			}
		},
		{ decorations: (v) => v.decorations },
	);
}
