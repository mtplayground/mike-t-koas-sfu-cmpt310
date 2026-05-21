import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStepController, type StepDescriptor } from "../../lib/network";
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

  it("marks the current step node as active", () => {
    const { currentStep } = createStepController().getState();
    const markup = renderToStaticMarkup(<NetworkDiagram activeStep={currentStep} />);

    expect(markup).toContain('data-node-id="x1"');
    expect(markup).toContain('data-active="true"');
    expect(markup).toContain('aria-current="step"');
  });

  it("maps step controller edge targets onto visible weighted connections", () => {
    const activeStep: StepDescriptor = {
      id: "forward:z_h1",
      phase: "forward",
      title: "Compute h1 pre-activation",
      activeNodeId: "z_h1",
      activeEdgeId: "x1->h1",
    };

    const markup = renderToStaticMarkup(<NetworkDiagram activeStep={activeStep} />);

    expect(markup).toContain('data-node-id="h1"');
    expect(markup).toContain('data-edge-id="x1-&gt;h1"');
    expect(markup).toContain('marker-end="url(#network-arrow-active)"');
  });
});
