import { CYCLE_STAGES } from "../furnaceDashboardTypes";

interface Props {
  activeStage: string;
  completed: boolean;
}

export default function CycleTimeline({ activeStage, completed }: Props) {
  const activeIndex = completed
    ? CYCLE_STAGES.length - 1
    : Math.max(0, CYCLE_STAGES.indexOf(activeStage));

  const progress = (activeIndex / (CYCLE_STAGES.length - 1)) * 100;

  return (
    <section className="fd-card fd-timeline">
      <div className="fd-card__head">
        <h3>Melt journey</h3>
        <span>
          Step {activeIndex + 1} of {CYCLE_STAGES.length}
        </span>
      </div>

      <div className="fd-track">
        <div className="fd-track__line">
          <div className="fd-track__fill" style={{ width: `${progress}%` }} />
        </div>

        <ol>
          {CYCLE_STAGES.map((stage, i) => {
            const state = i < activeIndex || (completed && i === activeIndex)
              ? "done"
              : i === activeIndex
              ? "current"
              : "todo";

            return (
              <li key={stage} className={`fd-step fd-step--${state}`}>
                <span className="fd-step__node">{state === "done" ? "✓" : i + 1}</span>
                <span className="fd-step__label">{stage}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}