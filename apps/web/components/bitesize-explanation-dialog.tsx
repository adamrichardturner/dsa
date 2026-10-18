"use client";

import { BookOpenText, X } from "lucide-react";
import { cn } from "cn";
import { LessonMarkdown } from "@/components/markdown";
import { SuggestedReading } from "@/components/suggested-reading";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BitesizeExplanationDialog({
  lessonTitle,
  content,
  articleSlugs,
  articleFrom,
}: {
  readonly lessonTitle: string;
  readonly content: string;
  readonly articleSlugs: readonly string[];
  readonly articleFrom?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-9 gap-2 px-3",
        )}
      >
        <BookOpenText aria-hidden="true" />
        Bitesize explanation
      </DialogTrigger>
      <DialogContent className="h-[min(88vh,920px)] max-h-[min(88vh,920px)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="space-y-1">
            <DialogTitle>Bitesize explanation</DialogTitle>
            <DialogDescription>
              A beginner-friendly guide to {lessonTitle}.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close bitesize explanation"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "shrink-0",
            )}
          >
            <X aria-hidden="true" />
          </DialogClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <LessonMarkdown content={content} articleFrom={articleFrom} />
          <div className="mt-8">
            <SuggestedReading
              slugs={articleSlugs}
              from={articleFrom}
              headingId="bitesize-suggested-reading"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
