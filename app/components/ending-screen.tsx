type Ending = "good" | "bad" | "secret";

const ENDING_COPY: Record<Ending, { title: string; subtitle: string; message: string }> = {
  good: {
    title: "A FRIEND,",
    subtitle: "AT LAST.",
    message: "The afternoon ends with a shared walk back across campus.",
  },
  bad: {
    title: "ACCESS",
    subtitle: "DENIED.",
    message: "“I thought you wanted to know about him. But you only wanted information.”",
  },
  secret: {
    title: "MORE THAN",
    subtitle: "A FILE.",
    message: "“Next time, I'll tell you more about me. As a friend.”",
  },
};

export default function EndingScreen({
  ending,
  onRestart,
  onTitle,
}: {
  ending: Ending;
  onRestart: () => void;
  onTitle: () => void;
}) {
  const copy = ENDING_COPY[ending];

  return (
    <main className={`ending-screen ending-screen--${ending}`}>
      <div className="ending-backdrop" aria-hidden="true" />
      <div className="ending-stamp" aria-hidden="true">
        {ending === "bad" ? (
          <>ACCESS<br />DENIED</>
        ) : (
          <>SESSION<br />COMPLETE</>
        )}
      </div>
      <p className="ending-eyebrow">
        {ending === "bad" ? "CONNECTION TERMINATED" : "CAMPUS / EVENING"}
      </p>
      <h1 id="ending-title">
        {copy.title}
        <br />
        <span>{copy.subtitle}</span>
      </h1>
      <div className="ending-rule" />
      <p className="ending-message">{copy.message}</p>
      <div className="ending-actions">
        <button className="continue-button" type="button" onClick={onRestart}>
          <span>WALK IT AGAIN</span>
          <span aria-hidden="true">↻</span>
        </button>
        <button className="text-button" type="button" onClick={onTitle}>
          RETURN TO TITLE
        </button>
      </div>
    </main>
  );
}
