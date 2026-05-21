import { constant, meanSquaredError, type Value } from "../autograd";
import type {
  HiddenNodeId,
  InputId,
  PresetNetworkTopology,
  PresetNetworkValues,
  PresetTrainingExample,
  PresetWeights,
} from "./types";

export const PRESET_NETWORK_TOPOLOGY: PresetNetworkTopology = {
  inputs: ["x1", "x2"],
  hidden: ["h1", "h2"],
  output: "yHat",
};

export const PRESET_TRAINING_EXAMPLE: PresetTrainingExample = {
  inputs: {
    x1: 0.5,
    x2: -1.25,
  },
  target: 0.75,
};

export const PRESET_WEIGHTS: PresetWeights = {
  inputHidden: {
    h1: {
      x1: 0.8,
      x2: -0.35,
    },
    h2: {
      x1: -0.6,
      x2: 0.9,
    },
  },
  hiddenBias: {
    h1: 0.1,
    h2: -0.2,
  },
  hiddenOutput: {
    h1: 1.1,
    h2: -0.7,
  },
  outputBias: 0.05,
};

export function buildPresetNetwork(): PresetNetworkValues {
  const inputs = {
    x1: constant(PRESET_TRAINING_EXAMPLE.inputs.x1, { label: "x1" }),
    x2: constant(PRESET_TRAINING_EXAMPLE.inputs.x2, { label: "x2" }),
  } satisfies Record<InputId, Value>;

  const weights = {
    inputHidden: {
      h1: {
        x1: constant(PRESET_WEIGHTS.inputHidden.h1.x1, { label: "w_x1_h1" }),
        x2: constant(PRESET_WEIGHTS.inputHidden.h1.x2, { label: "w_x2_h1" }),
      },
      h2: {
        x1: constant(PRESET_WEIGHTS.inputHidden.h2.x1, { label: "w_x1_h2" }),
        x2: constant(PRESET_WEIGHTS.inputHidden.h2.x2, { label: "w_x2_h2" }),
      },
    },
    hiddenOutput: {
      h1: constant(PRESET_WEIGHTS.hiddenOutput.h1, { label: "w_h1_y" }),
      h2: constant(PRESET_WEIGHTS.hiddenOutput.h2, { label: "w_h2_y" }),
    },
  } satisfies PresetNetworkValues["weights"];

  const biases = {
    hidden: {
      h1: constant(PRESET_WEIGHTS.hiddenBias.h1, { label: "b_h1" }),
      h2: constant(PRESET_WEIGHTS.hiddenBias.h2, { label: "b_h2" }),
    },
    output: constant(PRESET_WEIGHTS.outputBias, { label: "b_y" }),
  } satisfies PresetNetworkValues["biases"];

  const hiddenPreActivations = {
    h1: buildHiddenPreActivation(
      "h1",
      inputs,
      weights.inputHidden.h1,
      biases.hidden.h1,
    ),
    h2: buildHiddenPreActivation(
      "h2",
      inputs,
      weights.inputHidden.h2,
      biases.hidden.h2,
    ),
  } satisfies PresetNetworkValues["hiddenPreActivations"];

  const hiddenActivations = {
    h1: hiddenPreActivations.h1.tanh({ label: "h1" }),
    h2: hiddenPreActivations.h2.tanh({ label: "h2" }),
  } satisfies PresetNetworkValues["hiddenActivations"];

  const outputPreActivation = hiddenActivations.h1
    .multiply(weights.hiddenOutput.h1, { label: "h1*w_h1_y" })
    .add(hiddenActivations.h2.multiply(weights.hiddenOutput.h2, { label: "h2*w_h2_y" }))
    .add(biases.output, { label: "z_y" });

  const prediction = outputPreActivation.sigmoid({ label: "yHat" });
  const target = constant(PRESET_TRAINING_EXAMPLE.target, { label: "target" });
  const loss = meanSquaredError(prediction, target, {
    label: "loss",
    residualLabel: "prediction-target",
    negativeTargetLabel: "-target",
  });

  return {
    inputs,
    weights,
    biases,
    hiddenPreActivations,
    hiddenActivations,
    outputPreActivation,
    prediction,
    target,
    loss,
    parameters: [
      weights.inputHidden.h1.x1,
      weights.inputHidden.h1.x2,
      biases.hidden.h1,
      weights.inputHidden.h2.x1,
      weights.inputHidden.h2.x2,
      biases.hidden.h2,
      weights.hiddenOutput.h1,
      weights.hiddenOutput.h2,
      biases.output,
    ],
  };
}

function buildHiddenPreActivation(
  hiddenId: HiddenNodeId,
  inputs: Readonly<Record<InputId, Value>>,
  weights: Readonly<Record<InputId, Value>>,
  bias: Value,
): Value {
  return inputs.x1
    .multiply(weights.x1, { label: `x1*w_x1_${hiddenId}` })
    .add(inputs.x2.multiply(weights.x2, { label: `x2*w_x2_${hiddenId}` }))
    .add(bias, { label: `z_${hiddenId}` });
}
