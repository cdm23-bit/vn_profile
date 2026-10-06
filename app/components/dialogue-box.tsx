export default function DialogueBox({
  speaker,
  text,
  isTyping,
  onContinue,
}: {
  speaker: string;
  text: string;
  isTyping: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="dialogue-panel" aria-label="Visual novel dialogue">
      <div className="dialogue-topline">
        <span>AFTER THE LAST BELL <i aria-hidden="true">/</i> CAMPUS STORY</span>
        <span className="dialogue-state">
          <i aria-hidden="true" />
          {isTyping ? "SPEAKING" : "WAITING"}
        </span>
      </div>

      <div className="dialogue-content">
        <div className="dialogue-copy">
          <span className="speaker-name">{speaker}</span>
          <button
            className="dialogue-text-button"
            type="button"
            onClick={onContinue}
            aria-label={`${speaker}: ${text}. ${isTyping ? "Finish line" : "Continue"}`}
          >
            <span className="dialogue-text">
              {text}
              {isTyping && <span className="typing-caret" aria-hidden="true" />}
            </span>
          </button>
        </div>
      </div>

      <div className="dialogue-footer">
        <span className="advance-hint">
          <kbd>ENTER</kbd> / <kbd>SPACE</kbd>
          <span>TO {isTyping ? "REVEAL" : "CONTINUE"}</span>
        </span>
        <button className="continue-button" type="button" onClick={onContinue}>
          <span>{isTyping ? "REVEAL LINE" : "CONTINUE"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
