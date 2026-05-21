import { Value, type ValueInput, type ValueOptions } from "./value";

export interface MeanSquaredErrorOptions extends ValueOptions {
  residualLabel?: string;
  negativeTargetLabel?: string;
}

export function meanSquaredError(
  prediction: ValueInput,
  target: ValueInput,
  options: MeanSquaredErrorOptions = {},
): Value {
  const negativeTarget = Value.multiply(target, -1, {
    label: options.negativeTargetLabel,
  });
  const residual = Value.add(prediction, negativeTarget, {
    label: options.residualLabel,
  });

  return residual.multiply(residual, { label: options.label });
}
