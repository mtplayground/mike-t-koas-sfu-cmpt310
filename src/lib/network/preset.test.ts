import { describe, expect, it } from "vitest";
import {
  PRESET_NETWORK_TOPOLOGY,
  PRESET_TRAINING_EXAMPLE,
  PRESET_WEIGHTS,
  buildPresetNetwork,
} from "./index";

const TOLERANCE = 1e-8;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function scalarPresetPrediction() {
  const { x1, x2 } = PRESET_TRAINING_EXAMPLE.inputs;
  const h1Pre =
    x1 * PRESET_WEIGHTS.inputHidden.h1.x1 +
    x2 * PRESET_WEIGHTS.inputHidden.h1.x2 +
    PRESET_WEIGHTS.hiddenBias.h1;
  const h2Pre =
    x1 * PRESET_WEIGHTS.inputHidden.h2.x1 +
    x2 * PRESET_WEIGHTS.inputHidden.h2.x2 +
    PRESET_WEIGHTS.hiddenBias.h2;
  const h1 = Math.tanh(h1Pre);
  const h2 = Math.tanh(h2Pre);
  const outputPre =
    h1 * PRESET_WEIGHTS.hiddenOutput.h1 +
    h2 * PRESET_WEIGHTS.hiddenOutput.h2 +
    PRESET_WEIGHTS.outputBias;

  return sigmoid(outputPre);
}

function scalarPresetLoss() {
  return (scalarPresetPrediction() - PRESET_TRAINING_EXAMPLE.target) ** 2;
}

describe("preset network", () => {
  it("defines a fixed two-input, two-hidden, one-output topology", () => {
    expect(PRESET_NETWORK_TOPOLOGY).toEqual({
      inputs: ["x1", "x2"],
      hidden: ["h1", "h2"],
      output: "yHat",
    });
  });

  it("exposes the fixed training example and initial weights", () => {
    expect(PRESET_TRAINING_EXAMPLE).toEqual({
      inputs: {
        x1: 0.5,
        x2: -1.25,
      },
      target: 0.75,
    });
    expect(PRESET_WEIGHTS.hiddenOutput.h1).toBe(1.1);
    expect(PRESET_WEIGHTS.outputBias).toBe(0.05);
  });

  it("builds the preset MLP as an autograd graph", () => {
    const network = buildPresetNetwork();

    expect(network.inputs.x1.label).toBe("x1");
    expect(network.weights.inputHidden.h1.x1.label).toBe("w_x1_h1");
    expect(network.biases.output.label).toBe("b_y");
    expect(network.hiddenPreActivations.h1.label).toBe("z_h1");
    expect(network.hiddenActivations.h1.op).toBe("tanh");
    expect(network.outputPreActivation.label).toBe("z_y");
    expect(network.prediction.label).toBe("yHat");
    expect(network.prediction.op).toBe("sigmoid");
    expect(network.target.data).toBe(PRESET_TRAINING_EXAMPLE.target);
    expect(network.loss.label).toBe("loss");
    expect(network.loss.op).toBe("multiply");
    expect(network.parameters).toHaveLength(9);
  });

  it("matches the hand-computed forward prediction and loss", () => {
    const network = buildPresetNetwork();

    expectClose(network.prediction.data, scalarPresetPrediction());
    expectClose(network.loss.data, scalarPresetLoss());
  });

  it("backpropagates the MSE gradient to prediction and target", () => {
    const network = buildPresetNetwork();
    const residual = network.prediction.data - network.target.data;

    network.loss.backward();

    expectClose(network.loss.grad, 1);
    expectClose(network.prediction.grad, 2 * residual);
    expectClose(network.target.grad, -2 * residual);
  });
});
