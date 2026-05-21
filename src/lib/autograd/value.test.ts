import { describe, expect, it } from "vitest";
import { Value, constant, relu, sigmoid, tanh, topologicalSort } from "./index";

const TOLERANCE = 1e-8;
const NUMERIC_TOLERANCE = 1e-5;

function expectClose(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

function numericDerivative(
  fn: (first: number, second: number) => number,
  first: number,
  second: number,
  variable: "first" | "second",
) {
  const epsilon = 1e-6;

  if (variable === "first") {
    return (fn(first + epsilon, second) - fn(first - epsilon, second)) / (2 * epsilon);
  }

  return (fn(first, second + epsilon) - fn(first, second - epsilon)) / (2 * epsilon);
}

function sigmoidNumber(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function scalarFixture(first: number, second: number) {
  return sigmoidNumber(first * second + Math.tanh(first)) * Math.max(0, second + 0.25);
}

function valueFixture(first: Value, second: Value) {
  return first
    .multiply(second)
    .add(first.tanh())
    .sigmoid()
    .multiply(second.add(0.25).relu());
}

function positionOf(positions: Map<Value, number>, value: Value) {
  const position = positions.get(value);

  if (position === undefined) {
    throw new Error("Expected value to be present in topological order.");
  }

  return position;
}

describe("Value", () => {
  it("stores forward data, children, operation labels, and local gradients", () => {
    const first = constant(2, { label: "first" });
    const second = constant(-3, { label: "second" });
    const product = first.multiply(second, { label: "product" });
    const result = product.add(4, { label: "result" });

    expect(first.data).toBe(2);
    expect(first.children).toHaveLength(0);
    expect(first.op).toBe("constant");
    expect(first.label).toBe("first");

    expect(product.data).toBe(-6);
    expect(product.children).toEqual([first, second]);
    expect(product.op).toBe("multiply");
    expect(product.localGradients).toEqual([
      { child: first, derivative: second.data },
      { child: second, derivative: first.data },
    ]);

    expect(result.data).toBe(-2);
    expect(result.op).toBe("add");
    expect(result.children[0]).toBe(product);
    expect(result.children[1].data).toBe(4);
    expect(result.localGradients.map(({ derivative }) => derivative)).toEqual([1, 1]);
  });

  it("computes activation forward values and local derivatives", () => {
    const input = constant(0.75);

    const sigmoidValue = sigmoid(input);
    const expectedSigmoid = sigmoidNumber(input.data);
    expectClose(sigmoidValue.data, expectedSigmoid);
    expect(sigmoidValue.op).toBe("sigmoid");
    expectClose(
      sigmoidValue.localGradients[0].derivative,
      expectedSigmoid * (1 - expectedSigmoid),
    );

    const tanhValue = tanh(input);
    const expectedTanh = Math.tanh(input.data);
    expectClose(tanhValue.data, expectedTanh);
    expect(tanhValue.op).toBe("tanh");
    expectClose(
      tanhValue.localGradients[0].derivative,
      1 - expectedTanh * expectedTanh,
    );

    const negativeRelu = relu(constant(-0.5));
    expect(negativeRelu.data).toBe(0);
    expect(negativeRelu.localGradients[0].derivative).toBe(0);

    const positiveRelu = relu(constant(0.5));
    expect(positiveRelu.data).toBe(0.5);
    expect(positiveRelu.localGradients[0].derivative).toBe(1);
  });

  it("returns a topological order with children before their parents", () => {
    const input = constant(2);
    const square = input.multiply(input);
    const output = square.add(square);
    const sorted = topologicalSort(output);

    expect(new Set(sorted).size).toBe(sorted.length);
    expect(sorted.at(-1)).toBe(output);

    const positions = new Map(sorted.map((value, index) => [value, index]));

    for (const value of sorted) {
      const valuePosition = positionOf(positions, value);

      for (const child of value.children) {
        const childPosition = positionOf(positions, child);
        expect(childPosition).toBeLessThan(valuePosition);
      }
    }
  });

  it("accumulates gradients through shared graph nodes", () => {
    const input = constant(2);
    const square = input.multiply(input);
    const output = square.add(square);

    output.backward();

    expect(output.grad).toBe(1);
    expect(square.grad).toBe(2);
    expect(input.grad).toBe(8);
  });

  it("matches numeric gradients for a mixed arithmetic and activation expression", () => {
    const first = constant(0.7);
    const second = constant(0.8);
    const output = valueFixture(first, second);

    output.backward();

    expectClose(output.data, scalarFixture(first.data, second.data));
    expectClose(
      first.grad,
      numericDerivative(scalarFixture, first.data, second.data, "first"),
      NUMERIC_TOLERANCE,
    );
    expectClose(
      second.grad,
      numericDerivative(scalarFixture, first.data, second.data, "second"),
      NUMERIC_TOLERANCE,
    );
  });

  it("resets reachable gradients on each backward pass", () => {
    const input = constant(3);
    const output = input.multiply(2);

    output.backward();
    output.backward({ seed: 0.5 });

    expect(output.grad).toBe(0.5);
    expect(input.grad).toBe(1);
  });

  it("rejects non-finite values and gradients", () => {
    expect(() => constant(Number.NaN)).toThrow(TypeError);
    expect(() => constant(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => constant(1).addGrad(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
  });
});
