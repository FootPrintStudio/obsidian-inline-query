/** Minimal typings for Obsidian-bundled CodeMirror 6 packages (runtime external). */
declare module "@codemirror/language" {
	import type { EditorState } from "@codemirror/state";

	export const tokenClassNodeProp: unknown;

	export interface SyntaxNodeType {
		prop(prop: unknown): string | undefined;
	}

	export interface SyntaxNodeRef {
		type: SyntaxNodeType;
		from: number;
		to: number;
	}

	export interface TreeIteratorOptions {
		from: number;
		to: number;
		enter?: (node: SyntaxNodeRef) => boolean | void;
	}

	export interface SyntaxTree {
		iterate(options: TreeIteratorOptions): void;
	}

	export function syntaxTree(state: EditorState): SyntaxTree;
}

declare module "@codemirror/state" {
	export class RangeSetBuilder<T> {
		add(from: number, to: number, value: T): void;
		finish(): unknown;
	}

	export class Compartment {
		of(extension: unknown): unknown;
		reconfigure(extension: unknown): unknown;
	}

	export interface EditorState {
		doc: { sliceString(from: number, to: number): string };
	}
}

declare module "@codemirror/view" {
	import type { EditorState } from "@codemirror/state";

	export interface DecorationSpec {
		class?: string;
	}

	export class Decoration {
		static mark(spec: DecorationSpec): Decoration;
		static none: DecorationSet;
	}

	export type DecorationSet = unknown;

	export interface VisibleRange {
		from: number;
		to: number;
	}

	export class EditorView {
		state: EditorState;
		visibleRanges: readonly VisibleRange[];
	}

	export interface ViewUpdate {
		docChanged: boolean;
		viewportChanged: boolean;
		selectionSet: boolean;
		geometryChanged: boolean;
		view: EditorView;
	}

	export class ViewPlugin {
		static fromClass<V>(
			cls: new (view: EditorView) => V,
			spec?: { decorations?: (value: V) => DecorationSet },
		): unknown;
	}
}
