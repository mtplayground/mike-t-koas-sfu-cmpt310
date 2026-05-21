export type ValueOperation =
  | "constant"
  | "add"
  | "multiply"
  | "sigmoid"
  | "relu"
  | "tanh";

export type ValueInput = Value | number;

export interface ValueOptions {
  label?: string;
}

export interface LocalGradient {
  child: Value;
  derivative: number;
}

export class Value {
  readonly data: number;
  readonly children: readonly Value[];
  readonly localGradients: readonly LocalGradient[];
  readonly op: ValueOperation;
  readonly label?: string;

  private constructor(
    data: number,
    children: readonly Value[],
    op: ValueOperation,
    options: ValueOptions = {},
    localGradients: readonly LocalGradient[] = [],
  ) {
    assertFiniteNumber(data);

    this.data = data;
    this.children = Object.freeze([...children]);
    this.localGradients = freezeLocalGradients(localGradients, this.children);
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

  static sigmoid(input: ValueInput, options?: ValueOptions): Value {
    return asValue(input).sigmoid(options);
  }

  static relu(input: ValueInput, options?: ValueOptions): Value {
    return asValue(input).relu(options);
  }

  static tanh(input: ValueInput, options?: ValueOptions): Value {
    return asValue(input).tanh(options);
  }

  add(other: ValueInput, options?: ValueOptions): Value {
    const right = asValue(other);

    return new Value(this.data + right.data, [this, right], "add", options, [
      { child: this, derivative: 1 },
      { child: right, derivative: 1 },
    ]);
  }

  multiply(other: ValueInput, options?: ValueOptions): Value {
    const right = asValue(other);

    return new Value(this.data * right.data, [this, right], "multiply", options, [
      { child: this, derivative: right.data },
      { child: right, derivative: this.data },
    ]);
  }

  sigmoid(options?: ValueOptions): Value {
    const output = sigmoidForward(this.data);

    return new Value(output, [this], "sigmoid", options, [
      { child: this, derivative: output * (1 - output) },
    ]);
  }

  relu(options?: ValueOptions): Value {
    return new Value(Math.max(0, this.data), [this], "relu", options, [
      { child: this, derivative: this.data > 0 ? 1 : 0 },
    ]);
  }

  tanh(options?: ValueOptions): Value {
    const output = Math.tanh(this.data);

    return new Value(output, [this], "tanh", options, [
      { child: this, derivative: 1 - output * output },
    ]);
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

export function sigmoid(input: ValueInput, options?: ValueOptions): Value {
  return Value.sigmoid(input, options);
}

export function relu(input: ValueInput, options?: ValueOptions): Value {
  return Value.relu(input, options);
}

export function tanh(input: ValueInput, options?: ValueOptions): Value {
  return Value.tanh(input, options);
}

function asValue(value: ValueInput): Value {
  if (value instanceof Value) {
    return value;
  }

  return Value.constant(value);
}

function freezeLocalGradients(
  localGradients: readonly LocalGradient[],
  children: readonly Value[],
): readonly LocalGradient[] {
  return Object.freeze(
    localGradients.map((localGradient) => {
      if (!children.includes(localGradient.child)) {
        throw new Error("Local gradient child must be present in Value children.");
      }

      assertFiniteNumber(localGradient.derivative);

      return Object.freeze({
        child: localGradient.child,
        derivative: localGradient.derivative,
      });
    }),
  );
}

function sigmoidForward(value: number): number {
  if (value >= 0) {
    return 1 / (1 + Math.exp(-value));
  }

  const exponential = Math.exp(value);
  return exponential / (1 + exponential);
}

function assertFiniteNumber(value: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Value data must be a finite number. Received: ${value}`);
  }
}
