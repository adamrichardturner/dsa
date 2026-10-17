import { Spinner } from "@/components/ui/spinner";

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-1 items-center justify-center">
      <Spinner className="size-8 text-foreground" />
    </div>
  );
}
