import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NetworkDiagram } from "./NetworkDiagram";

describe("NetworkDiagram", () => {
  it("renders the preset network nodes and weight labels as SVG", () => {
    const markup = renderToStaticMarkup(<NetworkDiagram />);

    expect(markup).toContain("<svg");
    expect(markup).toContain("x1");
    expect(markup).toContain("x2");
    expect(markup).toContain("h1");
    expect(markup).toContain("h2");
    expect(markup).toContain("yHat");
    expect(markup).toContain("w_x1_h1 = 0.80");
    expect(markup).toContain("w_x2_h1 = -0.35");
    expect(markup).toContain("w_x1_h2 = -0.60");
    expect(markup).toContain("w_x2_h2 = 0.90");
    expect(markup).toContain("w_h1_y = 1.10");
    expect(markup).toContain("w_h2_y = -0.70");
  });
});
