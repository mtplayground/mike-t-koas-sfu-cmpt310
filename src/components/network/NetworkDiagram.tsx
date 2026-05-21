import { PRESET_TRAINING_EXAMPLE, PRESET_WEIGHTS } from "../../lib/network";

interface DiagramNode {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  tone: "input" | "hidden" | "output";
}

interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  labelOffsetY: number;
}

const nodes: readonly DiagramNode[] = [
  {
    id: "x1",
    label: "x1",
    detail: formatValue(PRESET_TRAINING_EXAMPLE.inputs.x1),
    x: 82,
    y: 118,
    tone: "input",
  },
  {
    id: "x2",
    label: "x2",
    detail: formatValue(PRESET_TRAINING_EXAMPLE.inputs.x2),
    x: 82,
    y: 302,
    tone: "input",
  },
  {
    id: "h1",
    label: "h1",
    detail: `b=${formatValue(PRESET_WEIGHTS.hiddenBias.h1)}`,
    x: 326,
    y: 118,
    tone: "hidden",
  },
  {
    id: "h2",
    label: "h2",
    detail: `b=${formatValue(PRESET_WEIGHTS.hiddenBias.h2)}`,
    x: 326,
    y: 302,
    tone: "hidden",
  },
  {
    id: "yHat",
    label: "yHat",
    detail: `b=${formatValue(PRESET_WEIGHTS.outputBias)}`,
    x: 574,
    y: 210,
    tone: "output",
  },
];

const edges: readonly DiagramEdge[] = [
  {
    id: "x1->h1",
    from: "x1",
    to: "h1",
    label: `w_x1_h1 = ${formatValue(PRESET_WEIGHTS.inputHidden.h1.x1)}`,
    labelOffsetY: -18,
  },
  {
    id: "x2->h1",
    from: "x2",
    to: "h1",
    label: `w_x2_h1 = ${formatValue(PRESET_WEIGHTS.inputHidden.h1.x2)}`,
    labelOffsetY: 26,
  },
  {
    id: "x1->h2",
    from: "x1",
    to: "h2",
    label: `w_x1_h2 = ${formatValue(PRESET_WEIGHTS.inputHidden.h2.x1)}`,
    labelOffsetY: -24,
  },
  {
    id: "x2->h2",
    from: "x2",
    to: "h2",
    label: `w_x2_h2 = ${formatValue(PRESET_WEIGHTS.inputHidden.h2.x2)}`,
    labelOffsetY: 24,
  },
  {
    id: "h1->yHat",
    from: "h1",
    to: "yHat",
    label: `w_h1_y = ${formatValue(PRESET_WEIGHTS.hiddenOutput.h1)}`,
    labelOffsetY: -18,
  },
  {
    id: "h2->yHat",
    from: "h2",
    to: "yHat",
    label: `w_h2_y = ${formatValue(PRESET_WEIGHTS.hiddenOutput.h2)}`,
    labelOffsetY: 24,
  },
];

const nodeById = new Map(nodes.map((node) => [node.id, node]));

export function NetworkDiagram() {
  return (
    <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-stone-50">
      <svg
        className="h-auto w-full"
        viewBox="0 0 660 420"
        role="img"
        aria-labelledby="network-diagram-title network-diagram-description"
      >
        <title id="network-diagram-title">Preset neural network diagram</title>
        <desc id="network-diagram-description">
          Two input values feed two hidden tanh neurons, which feed one sigmoid output
          neuron. Edges are labeled with preset weights.
        </desc>
        <defs>
          <marker
            id="network-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#52525b" />
          </marker>
        </defs>
        <rect width="660" height="420" rx="8" fill="#fafaf9" />

        <g aria-label="Weighted connections">
          {edges.map((edge) => (
            <DiagramEdge key={edge.id} edge={edge} />
          ))}
        </g>

        <g aria-label="Network neurons">
          {nodes.map((node) => (
            <DiagramNode key={node.id} node={node} />
          ))}
        </g>

        <g aria-label="Layer labels" className="text-[13px] font-semibold">
          <text x="82" y="382" textAnchor="middle" fill="#3f3f46">
            Inputs
          </text>
          <text x="326" y="382" textAnchor="middle" fill="#3f3f46">
            Hidden tanh
          </text>
          <text x="574" y="382" textAnchor="middle" fill="#3f3f46">
            Output sigmoid
          </text>
        </g>
      </svg>
    </figure>
  );
}

function DiagramEdge({ edge }: { edge: DiagramEdge }) {
  const from = requireNode(edge.from);
  const to = requireNode(edge.to);
  const start = endpoint(from, to, 44);
  const end = endpoint(to, from, 48);
  const labelX = (start.x + end.x) / 2;
  const labelY = (start.y + end.y) / 2 + edge.labelOffsetY;

  return (
    <g>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#52525b"
        strokeWidth="2"
        markerEnd="url(#network-arrow)"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        className="fill-zinc-700 text-[12px] font-semibold"
        paintOrder="stroke"
        stroke="#fafaf9"
        strokeWidth="6"
      >
        {edge.label}
      </text>
    </g>
  );
}

function DiagramNode({ node }: { node: DiagramNode }) {
  const fill =
    node.tone === "input" ? "#ecfeff" : node.tone === "hidden" ? "#fff7ed" : "#f0fdf4";
  const stroke =
    node.tone === "input" ? "#0f766e" : node.tone === "hidden" ? "#c2410c" : "#15803d";

  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      <circle r="44" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <text y="-4" textAnchor="middle" className="fill-zinc-950 text-[20px] font-bold">
        {node.label}
      </text>
      <text
        y="18"
        textAnchor="middle"
        className="fill-zinc-600 text-[12px] font-medium"
      >
        {node.detail}
      </text>
    </g>
  );
}

function endpoint(from: DiagramNode, to: DiagramNode, radius: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return { x: from.x, y: from.y };
  }

  return {
    x: from.x + (dx / length) * radius,
    y: from.y + (dy / length) * radius,
  };
}

function requireNode(id: string) {
  const node = nodeById.get(id);

  if (!node) {
    throw new Error(`Unknown diagram node: ${id}`);
  }

  return node;
}

function formatValue(value: number) {
  return value.toFixed(2);
}
