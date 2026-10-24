import type { JsonLdGraph } from "@/lib/articles/structured-data";

export function JsonLd({ data }: { readonly data: JsonLdGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
