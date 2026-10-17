import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DesktopNotice() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 min-[1024px]:hidden">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Use a larger screen</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            This course is built for programming on a computer, not a phone. Open it on a laptop or
            desktop so the lesson and the editor have room.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
