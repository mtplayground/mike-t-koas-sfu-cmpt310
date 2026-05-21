import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStepController } from "../../lib/network";
import { ChainRulePanel } from "./ChainRulePanel";
import { buildChainRuleMath } from "./chainRuleMath";

function stateForStep(stepId: string) {
  const controller = createStepController();
  const state = controller.getState();
  const step = state.steps.find((candidate) => candidate.id === stepId);

  if (!step) {
    throw new Error(`Missing step: ${stepId}`);
  }

  return { ...state, currentStep: step };
}

describe("buildChainRuleMath", () => {
  it("substitutes current values for forward pre-activation math", () => {
    const state = stateForStep("forward:z_h1");
    const math = buildChainRuleMath({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(math.latex).toContain("z_{h1}=x_1w_{x1,h1}+x_2w_{x2,h1}+b_{h1}");
    expect(math.latex).toContain("(0.5000)(0.8000)");
    expect(math.latex).toContain("=0.9375");
  });

  it("renders chain-rule derivatives for backward steps", () => {
    const state = stateForStep("backward:z_y");
    const math = buildChainRuleMath({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(math.latex).toContain("\\frac{\\partial L}{\\partial z_y}");
    expect(math.latex).toContain("\\hat{y}(1-\\hat{y})");
    expect(math.latex).toContain("=0.0203");
  });

  it("renders the active parameter update with learning rate and gradient", () => {
    const state = stateForStep("update:gradient-descent");
    const math = buildChainRuleMath({
      step: state.currentStep,
      network: state.network,
      updates: state.updates,
    });

    expect(math.latex).toContain("w_{x1,h1}'=w_{x1,h1}-\\eta");
    expect(math.latex).toContain("0.1000");
    expect(math.latex).toContain("0.7995");
  });
});

describe("ChainRulePanel", () => {
  it("renders the current step math through the Math component", () => {
    const state = stateForStep("backward:yHat");
    const markup = renderToStaticMarkup(<ChainRulePanel state={state} />);

    expect(markup).toContain('data-chain-rule-step="backward:yHat"');
    expect(markup).toContain("Backpropagate to prediction");
    expect(markup).toContain("katex");
  });
});
