"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Compartment, EditorState } from "@codemirror/state";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  toggleComment,
} from "@codemirror/commands";
import {
  HighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from "@codemirror/search";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { tags as t } from "@lezer/highlight";
import type { FileKind } from "@/lib/types";

export interface CursorInfo {
  line: number;
  column: number;
}

export interface CodeEditorHandle {
  focus: () => void;
  openSearch: () => void;
  getSelection: () => string;
}

interface CodeEditorProps {
  value: string;
  kind: FileKind;
  isDark: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  onChange: (value: string) => void;
  onCursor?: (cursor: CursorInfo) => void;
}

function languageFor(kind: FileKind) {
  switch (kind) {
    case "html":
      return html({ autoCloseTags: true, matchClosingTags: true });
    case "css":
      return css();
    case "js":
      return javascript({ jsx: true, typescript: false });
    case "json":
      return json();
    case "markdown":
      return markdown();
    default:
      return [];
  }
}

const darkHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword], color: "#c792ea" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#a5e075" },
  { tag: [t.number, t.bool, t.null], color: "#f78c6c" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#5f6b85", fontStyle: "italic" },
  { tag: [t.variableName, t.propertyName], color: "#82aaff" },
  { tag: [t.typeName, t.className, t.namespace], color: "#ffcb6b" },
  { tag: [t.tagName], color: "#f07178" },
  { tag: [t.attributeName], color: "#ffcb6b" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#82aaff" },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: "#e7eaf4" },
  { tag: [t.operator, t.operatorKeyword], color: "#89ddff" },
  { tag: [t.punctuation, t.bracket, t.separator], color: "#8b94ac" },
  { tag: [t.heading], color: "#82aaff", fontWeight: "700" },
  { tag: [t.link, t.url], color: "#82aaff", textDecoration: "underline" },
  { tag: [t.emphasis], fontStyle: "italic" },
  { tag: [t.strong], fontWeight: "700" },
  { tag: [t.invalid], color: "#ff5370" },
  { tag: [t.meta, t.annotation], color: "#89ddff" },
]);

const lightHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword], color: "#7c3aed" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#047857" },
  { tag: [t.number, t.bool, t.null], color: "#b45309" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#94a3b8", fontStyle: "italic" },
  { tag: [t.variableName, t.propertyName], color: "#2563eb" },
  { tag: [t.typeName, t.className, t.namespace], color: "#b45309" },
  { tag: [t.tagName], color: "#dc2626" },
  { tag: [t.attributeName], color: "#b45309" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#2563eb" },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: "#0f172a" },
  { tag: [t.operator, t.operatorKeyword], color: "#0891b2" },
  { tag: [t.punctuation, t.bracket, t.separator], color: "#64748b" },
  { tag: [t.heading], color: "#1d4ed8", fontWeight: "700" },
  { tag: [t.link, t.url], color: "#2563eb", textDecoration: "underline" },
  { tag: [t.emphasis], fontStyle: "italic" },
  { tag: [t.strong], fontWeight: "700" },
  { tag: [t.invalid], color: "#dc2626" },
  { tag: [t.meta, t.annotation], color: "#0891b2" },
]);

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--ink)",
  },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
  ".cm-gutters": {
    backgroundColor: "var(--panel)",
    color: "var(--muted-2)",
    border: "none",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--muted)",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--panel-2)",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    borderRadius: "4px",
    padding: "0 4px",
  },
  ".cm-panels": {
    backgroundColor: "var(--elevated)",
    color: "var(--ink)",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid var(--border)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--elevated)",
    border: "1px solid var(--border)",
    color: "var(--ink)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "#fff",
  },
  ".cm-searchMatch": {
    backgroundColor: "rgba(251, 191, 36, 0.25)",
    outline: "1px solid rgba(251, 191, 36, 0.5)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(251, 191, 36, 0.5)",
  },
  ".cm-selectionMatch": {
    backgroundColor: "var(--accent-soft)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--accent-soft)",
    outline: "1px solid var(--accent-line)",
  },
});

function buildTheme(isDark: boolean, fontSize: number) {
  return [
    baseTheme,
    EditorView.theme(
      {
        "&": { fontSize: `${fontSize}px` },
        ".cm-content": {
          caretColor: isDark ? "#a5b4fc" : "#4f46e5",
          padding: "12px 0 120px",
        },
        ".cm-line": { padding: "0 14px" },
        ".cm-cursor, .cm-dropCursor": {
          borderLeftColor: isDark ? "#a5b4fc" : "#4f46e5",
          borderLeftWidth: "2px",
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
          {
            backgroundColor: isDark
              ? "rgba(99, 102, 241, 0.32)"
              : "rgba(99, 102, 241, 0.18)",
          },
        ".cm-activeLine": {
          backgroundColor: isDark
            ? "rgba(99, 102, 241, 0.07)"
            : "rgba(91, 91, 214, 0.05)",
        },
        ".cm-activeLineGutter": {
          backgroundColor: isDark
            ? "rgba(99, 102, 241, 0.09)"
            : "rgba(91, 91, 214, 0.06)",
        },
      },
      { dark: isDark },
    ),
    syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
  ];
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { value, kind, isDark, fontSize, tabSize, wordWrap, onChange, onCursor },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onCursorRef = useRef(onCursor);

    onChangeRef.current = onChange;
    onCursorRef.current = onCursor;

    const languageCompartment = useRef(new Compartment());
    const themeCompartment = useRef(new Compartment());
    const wrapCompartment = useRef(new Compartment());
    const indentCompartment = useRef(new Compartment());

    useImperativeHandle(ref, () => ({
      focus: () => viewRef.current?.focus(),
      openSearch: () => {
        const view = viewRef.current;
        if (!view) return;
        view.focus();
        openSearchPanel(view);
      },
      getSelection: () => {
        const view = viewRef.current;
        if (!view) return "";
        const range = view.state.selection.main;
        return view.state.sliceDoc(range.from, range.to);
      },
    }));

    useEffect(() => {
      if (!hostRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion({ activateOnTyping: true }),
          rectangularSelection(),
          crosshairCursor(),
          highlightSelectionMatches(),
          foldGutter(),
          EditorState.tabSize.of(tabSize),
          indentCompartment.current.of(indentUnit.of(" ".repeat(tabSize))),
          wrapCompartment.current.of(wordWrap ? EditorView.lineWrapping : []),
          languageCompartment.current.of(languageFor(kind)),
          themeCompartment.current.of(buildTheme(isDark, fontSize)),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            indentWithTab,
            {
              key: "Mod-/",
              run: toggleComment,
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
            if (update.docChanged || update.selectionSet) {
              const head = update.state.selection.main.head;
              const line = update.state.doc.lineAt(head);
              onCursorRef.current?.({
                line: line.number,
                column: head - line.from + 1,
              });
            }
          }),
        ],
      });

      const view = new EditorView({ state, parent: hostRef.current });
      viewRef.current = view;
      view.focus();

      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // The editor is intentionally created once per mounted file.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: languageCompartment.current.reconfigure(languageFor(kind)),
      });
    }, [kind]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: themeCompartment.current.reconfigure(
          buildTheme(isDark, fontSize),
        ),
      });
    }, [isDark, fontSize]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: wrapCompartment.current.reconfigure(
          wordWrap ? EditorView.lineWrapping : [],
        ),
      });
    }, [wordWrap]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: indentCompartment.current.reconfigure(
          indentUnit.of(" ".repeat(tabSize)),
        ),
      });
    }, [tabSize]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const current = view.state.doc.toString();
      if (current === value) return;
      const anchor = Math.min(view.state.selection.main.anchor, value.length);
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        selection: { anchor },
      });
    }, [value]);

    return <div className="editor-host" ref={hostRef} />;
  },
);
