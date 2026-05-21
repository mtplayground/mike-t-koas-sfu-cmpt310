import { describe, expect, it } from "vitest";
import { createStepController } from "./index";

const TOLERANCE = 1e-8;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

describe("step sequence", () => {
  it("targets the expected active node and edge for each walkthrough step", () => {
    const { steps } = createStepController().getState();

    expect(
      steps.map(({ id, phase, activeNodeId, activeEdgeId }) => ({
        id,
        phase,
        activeNodeId,
        activeEdgeId,
      })),
    ).toEqual([
      {
        id: "forward:x1",
        phase: "forward",
        activeNodeId: "x1",
        activeEdgeId: undefined,
      },
      {
        id: "forward:x2",
        phase: "forward",
        activeNodeId: "x2",
        activeEdgeId: undefined,
      },
      {
        id: "forward:z_h1",
        phase: "forward",
        activeNodeId: "z_h1",
        activeEdgeId: "x1->h1",
      },
      {
        id: "forward:h1",
        phase: "forward",
        activeNodeId: "h1",
        activeEdgeId: "z_h1->h1",
      },
      {
        id: "forward:z_h2",
        phase: "forward",
        activeNodeId: "z_h2",
        activeEdgeId: "x2->h2",
      },
      {
        id: "forward:h2",
        phase: "forward",
        activeNodeId: "h2",
        activeEdgeId: "z_h2->h2",
      },
      {
        id: "forward:z_y",
        phase: "forward",
        activeNodeId: "z_y",
        activeEdgeId: "h1->yHat",
      },
      {
        id: "forward:yHat",
        phase: "forward",
        activeNodeId: "yHat",
        activeEdgeId: "z_y->yHat",
      },
      {
        id: "loss:mse",
        phase: "loss",
        activeNodeId: "loss",
        activeEdgeId: "yHat->loss",
      },
      {
        id: "backward:loss",
        phase: "backward",
        activeNodeId: "loss",
        activeEdgeId: undefined,
      },
      {
        id: "backward:yHat",
        phase: "backward",
        activeNodeId: "yHat",
        activeEdgeId: "loss->yHat",
      },
      {
        id: "backward:z_y",
        phase: "backward",
        activeNodeId: "z_y",
        activeEdgeId: "yHat->z_y",
      },
      {
        id: "backward:h1",
        phase: "backward",
        activeNodeId: "h1",
        activeEdgeId: "z_y->h1",
      },
      {
        id: "backward:h2",
        phase: "backward",
        activeNodeId: "h2",
        activeEdgeId: "z_y->h2",
      },
      {
        id: "backward:parameters",
        phase: "backward",
        activeNodeId: "w_x1_h1",
        activeEdgeId: "gradients->parameters",
      },
      {
        id: "update:gradient-descent",
        phase: "update",
        activeNodeId: "w_x1_h1",
        activeEdgeId: "parameters->updated-parameters",
      },
    ]);
  });

  it("keeps descriptor values and gradients aligned with the computed network", () => {
    const { network, steps } = createStepController().getState();
    const byId = new Map(steps.map((step) => [step.id, step]));

    expectClose(byId.get("forward:x1")?.value ?? Number.NaN, network.inputs.x1.data);
    expectClose(byId.get("forward:x2")?.value ?? Number.NaN, network.inputs.x2.data);
    expectClose(
      byId.get("forward:z_h1")?.value ?? Number.NaN,
      network.hiddenPreActivations.h1.data,
    );
    expectClose(
      byId.get("forward:h1")?.value ?? Number.NaN,
      network.hiddenActivations.h1.data,
    );
    expectClose(
      byId.get("forward:z_h2")?.value ?? Number.NaN,
      network.hiddenPreActivations.h2.data,
    );
    expectClose(
      byId.get("forward:h2")?.value ?? Number.NaN,
      network.hiddenActivations.h2.data,
    );
    expectClose(
      byId.get("forward:z_y")?.value ?? Number.NaN,
      network.outputPreActivation.data,
    );
    expectClose(byId.get("forward:yHat")?.value ?? Number.NaN, network.prediction.data);
    expectClose(byId.get("loss:mse")?.value ?? Number.NaN, network.loss.data);

    expectClose(byId.get("backward:loss")?.gradient ?? Number.NaN, network.loss.grad);
    expectClose(
      byId.get("backward:yHat")?.gradient ?? Number.NaN,
      network.prediction.grad,
    );
    expectClose(
      byId.get("backward:z_y")?.gradient ?? Number.NaN,
      network.outputPreActivation.grad,
    );
    expectClose(
      byId.get("backward:h1")?.gradient ?? Number.NaN,
      network.hiddenActivations.h1.grad,
    );
    expectClose(
      byId.get("backward:h2")?.gradient ?? Number.NaN,
      network.hiddenActivations.h2.grad,
    );
  });

  it("updates every parameter with before - learningRate * gradient", () => {
    const learningRate = 0.125;
    const { network, updates } = createStepController({ learningRate }).getState();

    expect(updates.map((update) => update.parameterId)).toEqual([
      "w_x1_h1",
      "w_x2_h1",
      "b_h1",
      "w_x1_h2",
      "w_x2_h2",
      "b_h2",
      "w_h1_y",
      "w_h2_y",
      "b_y",
    ]);

    updates.forEach((update, index) => {
      const parameter = network.parameters[index];

      expectClose(update.before, parameter.data);
      expectClose(update.gradient, parameter.grad);
      expectClose(update.after, update.before - learningRate * update.gradient);
    });
  });
});
