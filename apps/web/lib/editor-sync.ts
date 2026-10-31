export type EditorSync = "keep" | "echo" | "replace";

/**
 * Decides whether Monaco should follow the React value.
 * Rewriting the model with setValue always parks the caret at the top left,
 * so text the editor already emitted has to win over a stale parent value.
 * A revision change is an intentional replace, such as reset or a new draft.
 */
export const planEditorSync = ({
  modelValue,
  propValue,
  emittedValue,
  revision,
  appliedRevision,
}: {
  readonly modelValue: string;
  readonly propValue: string;
  readonly emittedValue: string;
  readonly revision: number;
  readonly appliedRevision: number;
}): EditorSync => {
  if (modelValue === propValue) {
    return "keep";
  }
  if (revision !== appliedRevision) {
    return "replace";
  }
  if (modelValue === emittedValue) {
    return "echo";
  }
  return "replace";
};
