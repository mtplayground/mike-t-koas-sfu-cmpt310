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
    expect(markup).toContain('aria-label="x1 neuron, 0.50, active step node"');
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
    expect(markup).toContain("active step connection");
  });

  it("describes forward edge animations with signed value styling", () => {
    const activeStep: StepDescriptor = {
      id: "forward:z_h2",
      phase: "forward",
      title: "Compute h2 pre-activation",
      activeNodeId: "z_h2",
      activeEdgeId: "x2->h2",
      value: -0.5,
    };

    const markup = renderToStaticMarkup(<NetworkDiagram activeStep={activeStep} />);

    expect(markup).toContain('data-animation-edge="x2-&gt;h2"');
    expect(markup).toContain('data-animation-phase="forward"');
    expect(markup).toContain('data-animation-value="-0.50"');
    expect(markup).toContain('data-animation-color="rgb(');
  });

  it("describes backward edge animations with gradient styling", () => {
    const activeStep: StepDescriptor = {
      id: "backward:h2",
      phase: "backward",
      title: "Backpropagate to h2",
      activeNodeId: "h2",
      activeEdgeId: "z_y->h2",
      gradient: 0.25,
    };

    const markup = renderToStaticMarkup(<NetworkDiagram activeStep={activeStep} />);

    expect(markup).toContain('data-animation-edge="h2-&gt;yHat"');
    expect(markup).toContain('data-animation-phase="backward"');
    expect(markup).toContain('data-animation-value="0.25"');
    expect(markup).toContain('data-animation-opacity="');
  });
});
