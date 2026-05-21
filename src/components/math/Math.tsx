import { useMemo } from "react";
import { renderToString, type KatexOptions } from "katex";
import "katex/dist/katex.min.css";

interface MathProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
  macros?: KatexOptions["macros"];
}

interface RenderedMath {
  html: string;
  error: null;
}

interface FailedMath {
  html: null;
  error: string;
}

export function Math({
  latex,
  displayMode = false,
  className,
  ariaLabel,
  macros,
}: MathProps) {
  const rendered = useMemo<RenderedMath | FailedMath>(() => {
    try {
      return {
        html: renderToString(latex, {
          displayMode,
          errorColor: "#b83f2f",
          output: "htmlAndMathml",
          throwOnError: true,
          trust: false,
          strict: "warn",
          macros,
        }),
        error: null,
      };
    } catch (error) {
      return {
        html: null,
        error:
          error instanceof Error ? error.message : "Unable to render math.",
      };
    }
  }, [displayMode, latex, macros]);

  const classes = [
    displayMode ? "block overflow-x-auto" : "inline-block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (rendered.html === null) {
    return (
      <code
        className={[
          "inline-block max-w-full overflow-x-auto rounded-lg border border-coral-300 bg-coral-50 px-3 py-2 text-sm text-coral-700",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={rendered.error}
      >
        {latex}
      </code>
    );
  }

  const sharedProps = {
    className: classes,
    "aria-label": ariaLabel,
    dangerouslySetInnerHTML: { __html: rendered.html },
  };

  return displayMode ? <div {...sharedProps} /> : <span {...sharedProps} />;
}
