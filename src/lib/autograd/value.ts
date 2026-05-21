export type ValueOperation = "constant" | "add" | "multiply";

export type ValueInput = Value | number;

export interface ValueOptions {
  label?: string;
}

export class Value {
  readonly data: number;
  readonly children: readonly Value[];
  readonly op: ValueOperation;
  readonly label?: string;

  private constructor(
    data: number,
    children: readonly Value[],
    op: ValueOperation,
    options: ValueOptions = {},
  ) {
    assertFiniteNumber(data);

    this.data = data;
    this.children = Object.freeze([...children]);
    this.op = op;
    this.label = options.label;
  }

  static constant(data: number, options?: ValueOptions): Value {
    return new Value(data, [], "constant", options);
  }

  static add(left: ValueInput, right: ValueInput, options?: ValueOptions): Value {
    return asValue(left).add(right, options);
  }

  static multiply(left: ValueInput, right: ValueInput, options?: ValueOptions): Value {
    return asValue(left).multiply(right, options);
  }

  add(other: ValueInput, options?: ValueOptions): Value {
    const right = asValue(other);

    return new Value(this.data + right.data, [this, right], "add", options);
  }

  multiply(other: ValueInput, options?: ValueOptions): Value {
    const right = asValue(other);

    return new Value(this.data * right.data, [this, right], "multiply", options);
  }
}

export function constant(data: number, options?: ValueOptions): Value {
  return Value.constant(data, options);
}

export function add(
  left: ValueInput,
  right: ValueInput,
  options?: ValueOptions,
): Value {
  return Value.add(left, right, options);
}

export function multiply(
  left: ValueInput,
  right: ValueInput,
  options?: ValueOptions,
): Value {
  return Value.multiply(left, right, options);
}

function asValue(value: ValueInput): Value {
  if (value instanceof Value) {
    return value;
  }

  return Value.constant(value);
}

function assertFiniteNumber(value: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Value data must be a finite number. Received: ${value}`);
  }
}
