import assert from "node:assert/strict";
import test from "node:test";
import { diagramDocument, readDiagramMessage, type DiagramDocumentInput } from "./mermaid-document.ts";

const input: DiagramDocumentInput = {
  chart: "flowchart LR\n  A --> B",
  theme: "neutral",
  background: "#ffffff",
  foreground: "#0a0a0a",
};

test("a measured diagram reports its pixel size", () => {
  assert.deepEqual(readDiagramMessage('{"ok":true,"width":640.2,"height":180.1}'), {
    ok: true,
    width: 641,
    height: 181,
  });
});

test("a failed diagram is reported without a size", () => {
  assert.deepEqual(readDiagramMessage('{"ok":false}'), { ok: false });
});

test("malformed diagram messages are ignored or refused", () => {
  assert.equal(readDiagramMessage("not-json"), null);
  assert.equal(readDiagramMessage("null"), null);
  assert.deepEqual(readDiagramMessage('{"ok":true}'), { ok: false });
  assert.deepEqual(readDiagramMessage('{"ok":true,"width":0,"height":40}'), { ok: false });
  assert.equal(readDiagramMessage('{"width":10,"height":10}'), null);
});

test("the diagram document keeps the intrinsic size and the lesson theme", () => {
  const html = diagramDocument(input);
  assert.equal(html.includes("max-width: 100%"), false);
  assert.equal(html.includes("max-width: none !important"), true);
  assert.equal(html.includes("useMaxWidth: false"), true);
  assert.equal(html.includes("htmlLabels: false"), true);
  assert.equal(html.includes("mermaid@12.2.0"), true);
  assert.equal(html.includes('"neutral"'), true);
  assert.equal(html.includes("background: #ffffff;"), true);
  assert.equal(html.includes("color: #0a0a0a;"), true);
  assert.equal(html.includes("flowchart LR"), true);
});

test("diagram source cannot close the script element", () => {
  const html = diagramDocument({
    ...input,
    chart: "</script><img src=x onerror=alert(1)>",
  });
  assert.equal(html.includes("</script><img"), false);
  assert.equal(html.includes("\\u003c/script>"), true);
});

test("dark diagrams use the dark mermaid theme and card background", () => {
  const html = diagramDocument({
    chart: "flowchart TD\n  A --> B",
    theme: "dark",
    background: "#171717",
    foreground: "#fafafa",
  });
  assert.equal(html.includes('"dark"'), true);
  assert.equal(html.includes("background: #171717;"), true);
  assert.equal(html.includes("color: #fafafa;"), true);
  assert.equal(html.includes("color-scheme: dark"), true);
});
