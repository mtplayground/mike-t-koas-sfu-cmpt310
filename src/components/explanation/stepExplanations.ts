import type {
  ParameterUpdate,
  PresetNetworkValues,
  StepDescriptor,
} from "../../lib/network";

export interface StepExplanation {
  heading: string;
  body: string;
  detail: string;
}

export interface StepExplanationInput {
  step: StepDescriptor;
  network: PresetNetworkValues;
  updates: readonly ParameterUpdate[];
}

export function buildStepExplanation({
  step,
  network,
  updates,
}: StepExplanationInput): StepExplanation {
  switch (step.id) {
    case "forward:x1":
      return explanation(
        step.title,
        `The first input is fixed at ${n(network.inputs.x1.data)} for this walkthrough.`,
        "The value enters the graph unchanged, so no operation has been applied yet.",
      );
    case "forward:x2":
      return explanation(
        step.title,
        `The second input is fixed at ${n(network.inputs.x2.data)}.`,
        "Together, x1 and x2 provide the two signals used by both hidden neurons.",
      );
    case "forward:z_h1":
      return explanation(
        step.title,
        `The h1 neuron forms a weighted sum of both inputs and adds bias b_h1, producing ${n(network.hiddenPreActivations.h1.data)}.`,
        "This is the raw score before the tanh activation compresses it.",
      );
    case "forward:h1":
      return explanation(
        step.title,
        `The tanh activation turns z_h1 into h1 = ${n(network.hiddenActivations.h1.data)}.`,
        "The activation keeps the hidden signal bounded while preserving the sign of the pre-activation.",
      );
    case "forward:z_h2":
      return explanation(
        step.title,
        `The h2 neuron uses its own weights and bias to produce z_h2 = ${n(network.hiddenPreActivations.h2.data)}.`,
        "This gives the second hidden neuron a separate view of the same input pair.",
      );
    case "forward:h2":
      return explanation(
        step.title,
        `The tanh activation turns z_h2 into h2 = ${n(network.hiddenActivations.h2.data)}.`,
        "This hidden activation will contribute to the final output with its own output weight.",
      );
    case "forward:z_y":
      return explanation(
        step.title,
        `The output neuron combines h1 and h2, then adds b_y to get z_y = ${n(network.outputPreActivation.data)}.`,
        "This pre-activation is the final linear score before prediction.",
      );
    case "forward:yHat":
      return explanation(
        step.title,
        `The sigmoid activation converts z_y into the prediction y_hat = ${n(network.prediction.data)}.`,
        "The prediction is now in the 0 to 1 range and can be compared with the target.",
      );
    case "loss:mse":
      return explanation(
        step.title,
        `The target is ${n(network.target.data)}, so the squared error is L = ${n(network.loss.data)}.`,
        "This loss is the scalar objective that backpropagation differentiates.",
      );
    case "backward:loss":
      return explanation(
        step.title,
        "Backpropagation starts by setting the loss gradient to 1.0000.",
        "That seed means changes to L are measured directly against L itself.",
      );
    case "backward:yHat":
      return explanation(
        step.title,
        `The loss sends gradient ${n(network.prediction.grad)} back to the prediction.`,
        "Because the prediction is above the target, this gradient pushes the next prediction downward.",
      );
    case "backward:z_y":
      return explanation(
        step.title,
        `The sigmoid local derivative scales the prediction gradient into dz_y = ${n(network.outputPreActivation.grad)}.`,
        "This is the gradient that reaches the output neuron's weighted sum.",
      );
    case "backward:h1":
      return explanation(
        step.title,
        `The h1 path receives gradient ${n(network.hiddenActivations.h1.grad)} through weight w_h1_y.`,
        "That value measures how much the loss changes when h1 changes.",
      );
    case "backward:h2":
      return explanation(
        step.title,
        `The h2 path receives gradient ${n(network.hiddenActivations.h2.grad)} through weight w_h2_y.`,
        "The sign differs from h1 because w_h2_y has the opposite sign.",
      );
    case "backward:parameters": {
      const update = findActiveUpdate(step.activeNodeId, updates);

      return explanation(
        step.title,
        `The first highlighted parameter is ${update.parameterId}, with gradient ${n(update.gradient)}.`,
        "The controller records this gradient so the update step can adjust the parameter.",
      );
    }
    case "update:gradient-descent": {
      const update = findActiveUpdate(step.activeNodeId, updates);

      return explanation(
        step.title,
        `${update.parameterId} moves from ${n(update.before)} to ${n(update.after)} using learning rate ${n(update.learningRate)}.`,
        "The update follows w_new = w - learning_rate * gradient.",
      );
    }
    default:
      return explanation(
        step.title,
        valueSummary(step),
        "The controller keeps the diagram, math, and narration aligned to this step.",
      );
  }
}

function findActiveUpdate(
  activeNodeId: string | undefined,
  updates: readonly ParameterUpdate[],
) {
  const update = updates.find((candidate) => candidate.parameterId === activeNodeId);

  if (!update) {
    const firstUpdate = updates[0];

    if (!firstUpdate) {
      throw new Error("Expected at least one parameter update for explanations.");
    }

    return firstUpdate;
  }

  return update;
}

function valueSummary(step: StepDescriptor) {
  if (step.gradient !== undefined) {
    return `The active gradient is ${n(step.gradient)}.`;
  }

  if (step.value !== undefined) {
    return `The active value is ${n(step.value)}.`;
  }

  return "This step does not expose a numeric value.";
}

function explanation(heading: string, body: string, detail: string): StepExplanation {
  return { heading, body, detail };
}

function n(value: number) {
  return value.toFixed(4);
}
