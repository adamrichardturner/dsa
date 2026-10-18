"use client";

export function StuckPrompt({ onOpen }: { readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      className="animate-in fade-in-0 slide-in-from-bottom-2 text-left text-sm underline decoration-current/40 underline-offset-4 duration-500 hover:decoration-current"
      onClick={onOpen}
    >
      Stuck? Click for Solution Explanation
    </button>
  );
}
