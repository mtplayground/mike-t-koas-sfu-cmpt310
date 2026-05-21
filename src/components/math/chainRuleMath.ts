import type {
  ParameterId,
  ParameterUpdate,
  PresetNetworkValues,
  StepDescriptor,
} from "../../lib/network";

export interface ChainRuleMath {
  latex: string;
  ariaLabel: string;
}

export interface ChainRuleMathInput {
  step: StepDescriptor;
  network: PresetNetworkValues;
  updates: readonly ParameterUpdate[];
}

export function buildChainRuleMath({
  step,
  network,
  updates,
}: ChainRuleMathInput): ChainRuleMath {
  switch (step.id) {
    case "forward:x1":
      return expression(`x_1 = ${n(network.inputs.x1.data)}`, "current input x 1");
    case "forward:x2":
      return expression(`x_2 = ${n(network.inputs.x2.data)}`, "current input x 2");
    case "forward:z_h1":
      return expression(
        [
          "z_{h1}=x_1w_{x1,h1}+x_2w_{x2,h1}+b_{h1}",
          `=(${n(network.inputs.x1.data)})(${n(network.weights.inputHidden.h1.x1.data)})+(${n(network.inputs.x2.data)})(${n(network.weights.inputHidden.h1.x2.data)})+${n(network.biases.hidden.h1.data)}`,
          `=${n(network.hiddenPreActivations.h1.data)}`,
        ].join(" "),
        "hidden neuron h1 pre-activation",
      );
    case "forward:h1":
      return expression(
        `h_1=\\tanh(z_{h1})=\\tanh(${n(network.hiddenPreActivations.h1.data)})=${n(network.hiddenActivations.h1.data)}`,
        "hidden neuron h1 activation",
      );
    case "forward:z_h2":
      return expression(
        [
          "z_{h2}=x_1w_{x1,h2}+x_2w_{x2,h2}+b_{h2}",
          `=(${n(network.inputs.x1.data)})(${n(network.weights.inputHidden.h2.x1.data)})+(${n(network.inputs.x2.data)})(${n(network.weights.inputHidden.h2.x2.data)})+${n(network.biases.hidden.h2.data)}`,
          `=${n(network.hiddenPreActivations.h2.data)}`,
        ].join(" "),
        "hidden neuron h2 pre-activation",
      );
    case "forward:h2":
      return expression(
        `h_2=\\tanh(z_{h2})=\\tanh(${n(network.hiddenPreActivations.h2.data)})=${n(network.hiddenActivations.h2.data)}`,
        "hidden neuron h2 activation",
      );
    case "forward:z_y":
      return expression(
        [
          "z_y=h_1w_{h1,y}+h_2w_{h2,y}+b_y",
          `=(${n(network.hiddenActivations.h1.data)})(${n(network.weights.hiddenOutput.h1.data)})+(${n(network.hiddenActivations.h2.data)})(${n(network.weights.hiddenOutput.h2.data)})+${n(network.biases.output.data)}`,
          `=${n(network.outputPreActivation.data)}`,
        ].join(" "),
        "output pre-activation",
      );
    case "forward:yHat":
      return expression(
        `\\hat{y}=\\sigma(z_y)=\\sigma(${n(network.outputPreActivation.data)})=${n(network.prediction.data)}`,
        "prediction activation",
      );
    case "loss:mse":
      return expression(
        `L=(\\hat{y}-y)^2=(${n(network.prediction.data)}-${n(network.target.data)})^2=${n(network.loss.data)}`,
        "mean squared error loss",
      );
    case "backward:loss":
      return expression(
        `\\frac{\\partial L}{\\partial L}=1.0000`,
        "seed loss gradient",
      );
    case "backward:yHat":
      return expression(
        [
          "\\frac{\\partial L}{\\partial \\hat{y}}=2(\\hat{y}-y)",
          `=2(${n(network.prediction.data)}-${n(network.target.data)})`,
          `=${n(network.prediction.grad)}`,
        ].join(" "),
        "loss gradient with respect to prediction",
      );
    case "backward:z_y":
      return expression(
        [
          "\\frac{\\partial L}{\\partial z_y}=\\frac{\\partial L}{\\partial \\hat{y}}\\hat{y}(1-\\hat{y})",
          `=(${n(network.prediction.grad)})(${n(network.prediction.data)})(1-${n(network.prediction.data)})`,
          `=${n(network.outputPreActivation.grad)}`,
        ].join(" "),
        "loss gradient through output sigmoid",
      );
    case "backward:h1":
      return expression(
        [
          "\\frac{\\partial L}{\\partial h_1}=\\frac{\\partial L}{\\partial z_y}w_{h1,y}",
          `=(${n(network.outputPreActivation.grad)})(${n(network.weights.hiddenOutput.h1.data)})`,
          `=${n(network.hiddenActivations.h1.grad)}`,
        ].join(" "),
        "loss gradient with respect to hidden neuron h1",
      );
    case "backward:h2":
      return expression(
        [
          "\\frac{\\partial L}{\\partial h_2}=\\frac{\\partial L}{\\partial z_y}w_{h2,y}",
          `=(${n(network.outputPreActivation.grad)})(${n(network.weights.hiddenOutput.h2.data)})`,
          `=${n(network.hiddenActivations.h2.grad)}`,
        ].join(" "),
        "loss gradient with respect to hidden neuron h2",
      );
    case "backward:parameters":
      return parameterGradientExpression(step.activeNodeId, network, updates);
    case "update:gradient-descent":
      return updateExpression(step.activeNodeId, updates);
    default:
      return fallbackExpression(step);
  }
}

function parameterGradientExpression(
  activeNodeId: string | undefined,
  network: PresetNetworkValues,
  updates: readonly ParameterUpdate[],
) {
  const update = findUpdate(activeNodeId, updates);

  if (!update) {
    return fallbackExpression({
      id: "backward:parameters",
      phase: "backward",
      title: "",
    });
  }

  const chain = parameterChain(update.parameterId, network);

  return expression(
    [
      `\\frac{\\partial L}{\\partial ${parameterLatex(update.parameterId)}}=${chain.symbolic}`,
      `=${chain.numeric}`,
      `=${n(update.gradient)}`,
    ].join(" "),
    `loss gradient with respect to ${update.parameterId}`,
  );
}

function updateExpression(
  activeNodeId: string | undefined,
  updates: readonly ParameterUpdate[],
) {
  const update = findUpdate(activeNodeId, updates);

  if (!update) {
    return fallbackExpression({
      id: "update:gradient-descent",
      phase: "update",
      title: "",
    });
  }

  return expression(
    [
      `${parameterLatex(update.parameterId)}'=${parameterLatex(update.parameterId)}-\\eta\\frac{\\partial L}{\\partial ${parameterLatex(update.parameterId)}}`,
      `=${n(update.before)}-${n(update.learningRate)}(${n(update.gradient)})`,
      `=${n(update.after)}`,
    ].join(" "),
    `gradient descent update for ${update.parameterId}`,
  );
}

function parameterChain(parameterId: ParameterId, network: PresetNetworkValues) {
  switch (parameterId) {
    case "w_x1_h1":
      return hiddenWeightChain(
        "h_1",
        "x_1",
        network.hiddenActivations.h1.data,
        network.hiddenActivations.h1.grad,
        network.inputs.x1.data,
      );
    case "w_x2_h1":
      return hiddenWeightChain(
        "h_1",
        "x_2",
        network.hiddenActivations.h1.data,
        network.hiddenActivations.h1.grad,
        network.inputs.x2.data,
      );
    case "w_x1_h2":
      return hiddenWeightChain(
        "h_2",
        "x_1",
        network.hiddenActivations.h2.data,
        network.hiddenActivations.h2.grad,
        network.inputs.x1.data,
      );
    case "w_x2_h2":
      return hiddenWeightChain(
        "h_2",
        "x_2",
        network.hiddenActivations.h2.data,
        network.hiddenActivations.h2.grad,
        network.inputs.x2.data,
      );
    case "b_h1":
      return hiddenBiasChain(
        "h_1",
        network.hiddenActivations.h1.data,
        network.hiddenActivations.h1.grad,
      );
    case "b_h2":
      return hiddenBiasChain(
        "h_2",
        network.hiddenActivations.h2.data,
        network.hiddenActivations.h2.grad,
      );
    case "w_h1_y":
      return outputWeightChain(
        "h_1",
        network.outputPreActivation.grad,
        network.hiddenActivations.h1.data,
      );
    case "w_h2_y":
      return outputWeightChain(
        "h_2",
        network.outputPreActivation.grad,
        network.hiddenActivations.h2.data,
      );
    case "b_y":
      return {
        symbolic: "\\frac{\\partial L}{\\partial z_y}",
        numeric: n(network.outputPreActivation.grad),
      };
  }
}

function hiddenWeightChain(
  hiddenSymbol: "h_1" | "h_2",
  inputSymbol: "x_1" | "x_2",
  hiddenValue: number,
  hiddenGradient: number,
  inputValue: number,
) {
  return {
    symbolic: `\\frac{\\partial L}{\\partial ${hiddenSymbol}}(1-${hiddenSymbol}^2)${inputSymbol}`,
    numeric: `(${n(hiddenGradient)})(1-${n(hiddenValue)}^2)(${n(inputValue)})`,
  };
}

function hiddenBiasChain(
  hiddenSymbol: "h_1" | "h_2",
  hiddenValue: number,
  hiddenGradient: number,
) {
  return {
    symbolic: `\\frac{\\partial L}{\\partial ${hiddenSymbol}}(1-${hiddenSymbol}^2)`,
    numeric: `(${n(hiddenGradient)})(1-${n(hiddenValue)}^2)`,
  };
}

function outputWeightChain(
  hiddenSymbol: "h_1" | "h_2",
  outputGradient: number,
  hiddenValue: number,
) {
  return {
    symbolic: `\\frac{\\partial L}{\\partial z_y}${hiddenSymbol}`,
    numeric: `(${n(outputGradient)})(${n(hiddenValue)})`,
  };
}

function findUpdate(
  activeNodeId: string | undefined,
  updates: readonly ParameterUpdate[],
) {
  return updates.find((update) => update.parameterId === activeNodeId) ?? updates[0];
}

function fallbackExpression(step: StepDescriptor): ChainRuleMath {
  if (step.gradient !== undefined) {
    return expression(`\\nabla=${n(step.gradient)}`, `${step.title} gradient`);
  }

  if (step.value !== undefined) {
    return expression(`v=${n(step.value)}`, `${step.title} value`);
  }

  return expression("\\text{No numeric value for this step}", step.title);
}

function parameterLatex(parameterId: ParameterId) {
  switch (parameterId) {
    case "w_x1_h1":
      return "w_{x1,h1}";
    case "w_x2_h1":
      return "w_{x2,h1}";
    case "w_x1_h2":
      return "w_{x1,h2}";
    case "w_x2_h2":
      return "w_{x2,h2}";
    case "w_h1_y":
      return "w_{h1,y}";
    case "w_h2_y":
      return "w_{h2,y}";
    case "b_h1":
      return "b_{h1}";
    case "b_h2":
      return "b_{h2}";
    case "b_y":
      return "b_y";
  }
}

function expression(latex: string, ariaLabel: string): ChainRuleMath {
  return { latex, ariaLabel };
}

function n(value: number) {
  return value.toFixed(4);
}
