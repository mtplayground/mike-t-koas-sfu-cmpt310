import { buildPresetNetwork } from "./preset";
import type {
  ParameterId,
  ParameterUpdate,
  PresetNetworkValues,
  StepDescriptor,
} from "./types";

export interface StepControllerOptions {
  learningRate?: number;
}

export interface StepControllerState {
  currentIndex: number;
  currentStep: StepDescriptor;
  canGoNext: boolean;
  canGoPrevious: boolean;
  steps: readonly StepDescriptor[];
  network: PresetNetworkValues;
  updates: readonly ParameterUpdate[];
}

export class StepController {
  readonly learningRate: number;
  readonly network: PresetNetworkValues;
  readonly steps: readonly StepDescriptor[];
  readonly updates: readonly ParameterUpdate[];

  private currentIndex = 0;

  constructor(options: StepControllerOptions = {}) {
    this.learningRate = options.learningRate ?? 0.1;
    assertPositiveFiniteNumber(this.learningRate, "learningRate");

    this.network = buildPresetNetwork();
    this.network.loss.backward();
    this.updates = buildParameterUpdates(this.network, this.learningRate);
    this.steps = buildStepDescriptors(this.network, this.updates);
  }

  getState(): StepControllerState {
    return {
      currentIndex: this.currentIndex,
      currentStep: this.steps[this.currentIndex],
      canGoNext: this.currentIndex < this.steps.length - 1,
      canGoPrevious: this.currentIndex > 0,
      steps: this.steps,
      network: this.network,
      updates: this.updates,
    };
  }

  next(): StepControllerState {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex += 1;
    }

    return this.getState();
  }

  previous(): StepControllerState {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    }

    return this.getState();
  }

  reset(): StepControllerState {
    this.currentIndex = 0;

    return this.getState();
  }
}

export function createStepController(options?: StepControllerOptions): StepController {
  return new StepController(options);
}

function buildStepDescriptors(
  network: PresetNetworkValues,
  updates: readonly ParameterUpdate[],
): readonly StepDescriptor[] {
  return [
    {
      id: "forward:x1",
      phase: "forward",
      title: "Read x1",
      activeNodeId: "x1",
      value: network.inputs.x1.data,
    },
    {
      id: "forward:x2",
      phase: "forward",
      title: "Read x2",
      activeNodeId: "x2",
      value: network.inputs.x2.data,
    },
    {
      id: "forward:z_h1",
      phase: "forward",
      title: "Compute h1 pre-activation",
      activeNodeId: "z_h1",
      activeEdgeId: "x1->h1",
      value: network.hiddenPreActivations.h1.data,
    },
    {
      id: "forward:h1",
      phase: "forward",
      title: "Activate h1",
      activeNodeId: "h1",
      activeEdgeId: "z_h1->h1",
      value: network.hiddenActivations.h1.data,
    },
    {
      id: "forward:z_h2",
      phase: "forward",
      title: "Compute h2 pre-activation",
      activeNodeId: "z_h2",
      activeEdgeId: "x2->h2",
      value: network.hiddenPreActivations.h2.data,
    },
    {
      id: "forward:h2",
      phase: "forward",
      title: "Activate h2",
      activeNodeId: "h2",
      activeEdgeId: "z_h2->h2",
      value: network.hiddenActivations.h2.data,
    },
    {
      id: "forward:z_y",
      phase: "forward",
      title: "Compute output pre-activation",
      activeNodeId: "z_y",
      activeEdgeId: "h1->yHat",
      value: network.outputPreActivation.data,
    },
    {
      id: "forward:yHat",
      phase: "forward",
      title: "Compute prediction",
      activeNodeId: "yHat",
      activeEdgeId: "z_y->yHat",
      value: network.prediction.data,
    },
    {
      id: "loss:mse",
      phase: "loss",
      title: "Compute mean squared error",
      activeNodeId: "loss",
      activeEdgeId: "yHat->loss",
      value: network.loss.data,
    },
    {
      id: "backward:loss",
      phase: "backward",
      title: "Seed loss gradient",
      activeNodeId: "loss",
      gradient: network.loss.grad,
    },
    {
      id: "backward:yHat",
      phase: "backward",
      title: "Backpropagate to prediction",
      activeNodeId: "yHat",
      activeEdgeId: "loss->yHat",
      gradient: network.prediction.grad,
    },
    {
      id: "backward:z_y",
      phase: "backward",
      title: "Backpropagate through output activation",
      activeNodeId: "z_y",
      activeEdgeId: "yHat->z_y",
      gradient: network.outputPreActivation.grad,
    },
    {
      id: "backward:h1",
      phase: "backward",
      title: "Backpropagate to h1",
      activeNodeId: "h1",
      activeEdgeId: "z_y->h1",
      gradient: network.hiddenActivations.h1.grad,
    },
    {
      id: "backward:h2",
      phase: "backward",
      title: "Backpropagate to h2",
      activeNodeId: "h2",
      activeEdgeId: "z_y->h2",
      gradient: network.hiddenActivations.h2.grad,
    },
    {
      id: "backward:parameters",
      phase: "backward",
      title: "Accumulate parameter gradients",
      activeNodeId: updates[0]?.parameterId,
      activeEdgeId: "gradients->parameters",
      gradient: updates[0]?.gradient,
    },
    {
      id: "update:gradient-descent",
      phase: "update",
      title: "Apply one gradient descent update",
      activeNodeId: updates[0]?.parameterId,
      activeEdgeId: "parameters->updated-parameters",
      value: updates[0]?.after,
      gradient: updates[0]?.gradient,
    },
  ];
}

function buildParameterUpdates(
  network: PresetNetworkValues,
  learningRate: number,
): readonly ParameterUpdate[] {
  return network.parameters.map((parameter) => {
    const parameterId = toParameterId(parameter.label);

    return {
      parameterId,
      before: parameter.data,
      gradient: parameter.grad,
      after: parameter.data - learningRate * parameter.grad,
      learningRate,
    };
  });
}

function toParameterId(label: string | undefined): ParameterId {
  if (!label || !isParameterId(label)) {
    throw new Error(
      `Expected preset parameter label. Received: ${label ?? "<missing>"}`,
    );
  }

  return label;
}

function isParameterId(label: string): label is ParameterId {
  return (
    label === "w_x1_h1" ||
    label === "w_x2_h1" ||
    label === "w_x1_h2" ||
    label === "w_x2_h2" ||
    label === "w_h1_y" ||
    label === "w_h2_y" ||
    label === "b_h1" ||
    label === "b_h2" ||
    label === "b_y"
  );
}

function assertPositiveFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive finite number. Received: ${value}`);
  }
}
