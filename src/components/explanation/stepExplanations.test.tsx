import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStepController } from "../../lib/network";
import { StepExplanationPanel } from "./StepExplanationPanel";
import { buildStepExplanation } from "./stepExplanations";

function stateForStep(stepId: string) {
  const controller = createStepController();
  const state = controller.getState();
  const step = state.steps.find((candidate) => candidate.id === stepId);

  if (!step) {
    throw new Error(`Missing step: ${stepId}`);
  }

  return { ...state, currentStep: step };
}

describe("buildStepExplanation", () => {
  it("describes a forward step with the current computed value", () => {
    const state = stateForStep("forward:z_h1");
    const explanation = buildStepExplanation({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(explanation.heading).toBe("Compute h1 pre-activation");
    expect(explanation.body).toContain("0.9375");
    expect(explanation.detail).toContain("before the tanh activation");
  });

  it("describes a backward step with the current gradient", () => {
    const state = stateForStep("backward:h2");
    const explanation = buildStepExplanation({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(explanation.body).toContain("-0.0142");
    expect(explanation.detail).toContain("opposite sign");
  });

  it("describes the gradient descent update", () => {
    const state = stateForStep("update:gradient-descent");
    const explanation = buildStepExplanation({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(explanation.body).toContain("w_x1_h1");
    expect(explanation.body).toContain("0.7995");
    expect(explanation.detail).toContain("w_new = w - learning_rate * gradient");
  });
});

describe("StepExplanationPanel", () => {
  it("renders the active step narration", () => {
    const state = stateForStep("loss:mse");
    const markup = renderToStaticMarkup(<StepExplanationPanel state={state} />);

    expect(markup).toContain('data-explanation-step="loss:mse"');
    expect(markup).toContain("Compute mean squared error");
    expect(markup).toContain("0.0047");
  });
});
