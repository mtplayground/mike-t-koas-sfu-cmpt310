import type { ReactNode } from "react";

interface AppShellProps {
  controls: ReactNode;
  diagram: ReactNode;
  math: ReactNode;
  explanation: ReactNode;
}

export function AppShell({ controls, diagram, math, explanation }: AppShellProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <a
        href="#walkthrough-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-teal-800 focus:shadow-lg focus:ring-2 focus:ring-teal-600"
      >
        Skip to walkthrough
      </a>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">CMPT 310</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 sm:text-4xl">
              Neural Network Walkthrough
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-600">
            Step through a fixed training example as the app surfaces the graph,
            chain-rule math, and explanation context side by side.
          </p>
        </header>

        <div
          id="walkthrough-content"
          className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
        >
          <section
            aria-labelledby="diagram-panel-title"
            className="flex min-h-[420px] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-coral-700">
                  Diagram
                </p>
                <h2
                  id="diagram-panel-title"
                  className="mt-1 text-xl font-semibold text-zinc-950"
                >
                  Network
                </h2>
              </div>
            </div>
            <div className="flex-1" data-layout-region="diagram">
              {diagram}
            </div>
            <div data-layout-region="controls">{controls}</div>
          </section>

          <aside className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
            <section
              aria-labelledby="math-panel-title"
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              data-layout-region="math"
            >
              <p className="text-xs font-semibold uppercase text-teal-700">Math</p>
              <h2
                id="math-panel-title"
                className="mt-1 text-xl font-semibold text-zinc-950"
              >
                Chain Rule
              </h2>
              <div className="mt-4">{math}</div>
            </section>

            <section
              aria-labelledby="explanation-panel-title"
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              data-layout-region="explanation"
            >
              <p className="text-xs font-semibold uppercase text-coral-700">
                Explanation
              </p>
              <h2
                id="explanation-panel-title"
                className="mt-1 text-xl font-semibold text-zinc-950"
              >
                Current Step
              </h2>
              <div className="mt-4">{explanation}</div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
