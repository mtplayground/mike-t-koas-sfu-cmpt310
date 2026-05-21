import { describe, expect, it } from "vitest";
import { createStepController } from "./index";

const TOLERANCE = 1e-8;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

describe("StepController", () => {
  it("builds ordered forward, loss, backward, and update descriptors", () => {
    const controller = createStepController();
    const state = controller.getState();

    expect(state.currentIndex).toBe(0);
    expect(state.currentStep.id).toBe("forward:x1");
    expect(state.steps.map((step) => step.phase)).toEqual([
      "forward",
      "forward",
      "forward",
      "forward",
      "forward",
      "forward",
      "forward",
      "forward",
      "loss",
      "backward",
      "backward",
      "backward",
      "backward",
      "backward",
      "backward",
      "update",
    ]);
    expect(state.steps.at(-1)?.id).toBe("update:gradient-descent");
  });

  it("exposes next, previous, and reset navigation state", () => {
    const controller = createStepController();

    expect(controller.getState().canGoPrevious).toBe(false);

    const nextState = controller.next();
    expect(nextState.currentIndex).toBe(1);
    expect(nextState.canGoPrevious).toBe(true);

    const previousState = controller.previous();
    expect(previousState.currentIndex).toBe(0);

    controller.next();
    controller.next();
    const resetState = controller.reset();
    expect(resetState.currentIndex).toBe(0);
    expect(resetState.currentStep.id).toBe("forward:x1");
  });

  it("stays within navigation boundaries", () => {
    const controller = createStepController();

    controller.previous();
    expect(controller.getState().currentIndex).toBe(0);

    for (let index = 0; index < 100; index += 1) {
      controller.next();
    }

    const state = controller.getState();
    expect(state.currentIndex).toBe(state.steps.length - 1);
    expect(state.canGoNext).toBe(false);
  });

  it("computes one gradient descent update for every preset parameter", () => {
    const learningRate = 0.05;
    const controller = createStepController({ learningRate });
    const { updates } = controller.getState();

    expect(updates).toHaveLength(9);
    expect(updates.every((update) => update.learningRate === learningRate)).toBe(true);

    for (const update of updates) {
      expectClose(update.after, update.before - learningRate * update.gradient);
    }

    expect(updates.some((update) => Math.abs(update.gradient) > 0)).toBe(true);
  });

  it("rejects invalid learning rates", () => {
    expect(() => createStepController({ learningRate: 0 })).toThrow(TypeError);
    expect(() =>
      createStepController({ learningRate: Number.POSITIVE_INFINITY }),
    ).toThrow(TypeError);
  });
});
