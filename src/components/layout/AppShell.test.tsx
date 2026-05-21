import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("assembles diagram, controls, math, and explanation regions", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        diagram={<div>diagram panel</div>}
        controls={<div>navigation controls</div>}
        math={<div>math panel</div>}
        explanation={<div>explanation panel</div>}
      />,
    );

    expect(markup).toContain('data-layout-region="diagram"');
    expect(markup).toContain('data-layout-region="controls"');
    expect(markup).toContain('data-layout-region="math"');
    expect(markup).toContain('data-layout-region="explanation"');
    expect(markup).toContain("diagram panel");
    expect(markup).toContain("navigation controls");
    expect(markup).toContain("math panel");
    expect(markup).toContain("explanation panel");
  });
});
