import { describe, expect, it } from "vitest";
import { constant, meanSquaredError } from "./index";

const TOLERANCE = 1e-8;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

describe("meanSquaredError", () => {
  it("builds a squared residual loss from autograd ops", () => {
    const prediction = constant(0.2, { label: "prediction" });
    const target = constant(0.7, { label: "target" });
    const loss = meanSquaredError(prediction, target, {
      label: "loss",
      residualLabel: "prediction-target",
      negativeTargetLabel: "-target",
    });

    expect(loss.label).toBe("loss");
    expect(loss.op).toBe("multiply");
    expectClose(loss.data, 0.25);

    loss.backward();

    expectClose(prediction.grad, -1);
    expectClose(target.grad, 1);
  });
});
