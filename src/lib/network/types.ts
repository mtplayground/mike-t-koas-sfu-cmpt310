import type { Value } from "../autograd";

export type InputId = "x1" | "x2";
export type HiddenNodeId = "h1" | "h2";
export type OutputNodeId = "yHat";
export type WeightId =
  | "w_x1_h1"
  | "w_x2_h1"
  | "w_x1_h2"
  | "w_x2_h2"
  | "w_h1_y"
  | "w_h2_y";
export type BiasId = "b_h1" | "b_h2" | "b_y";
export type ParameterId = WeightId | BiasId;
export type StepPhase = "forward" | "loss" | "backward" | "update";

export interface PresetTrainingExample {
  inputs: Readonly<Record<InputId, number>>;
  target: number;
}

export interface PresetWeights {
  inputHidden: Readonly<Record<HiddenNodeId, Readonly<Record<InputId, number>>>>;
  hiddenBias: Readonly<Record<HiddenNodeId, number>>;
  hiddenOutput: Readonly<Record<HiddenNodeId, number>>;
  outputBias: number;
}

export interface PresetNetworkTopology {
  inputs: readonly InputId[];
  hidden: readonly HiddenNodeId[];
  output: OutputNodeId;
}

export interface PresetNetworkValues {
  inputs: Readonly<Record<InputId, Value>>;
  weights: {
    inputHidden: Readonly<Record<HiddenNodeId, Readonly<Record<InputId, Value>>>>;
    hiddenOutput: Readonly<Record<HiddenNodeId, Value>>;
  };
  biases: {
    hidden: Readonly<Record<HiddenNodeId, Value>>;
    output: Value;
  };
  hiddenPreActivations: Readonly<Record<HiddenNodeId, Value>>;
  hiddenActivations: Readonly<Record<HiddenNodeId, Value>>;
  outputPreActivation: Value;
  prediction: Value;
  target: Value;
  loss: Value;
  parameters: readonly Value[];
}

export interface StepDescriptor {
  id: string;
  phase: StepPhase;
  title: string;
  activeNodeId?: string;
  activeEdgeId?: string;
  value?: number;
  gradient?: number;
}

export interface ParameterUpdate {
  parameterId: ParameterId;
  before: number;
  gradient: number;
  after: number;
  learningRate: number;
}
