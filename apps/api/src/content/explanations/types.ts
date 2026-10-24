export type SolutionBlock =
  | { readonly kind: "heading"; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "list"; readonly items: readonly string[] }
  | { readonly kind: "diagram"; readonly chart: string }
  | { readonly kind: "code" };

export interface LessonSolution {
  readonly slug: string;
  readonly blocks: readonly SolutionBlock[];
}
