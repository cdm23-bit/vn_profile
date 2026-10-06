export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="title-screen">
      <div className="title-backdrop" aria-hidden="true">
        <span className="title-orbit title-orbit--one" />
        <span className="title-orbit title-orbit--two" />
        <span className="title-crosshair title-crosshair--one" />
        <span className="title-crosshair title-crosshair--two" />
      </div>

      <div className="title-topline">
        <span className="brand-mark"><i aria-hidden="true" /> AFTER THE LAST BELL</span>
        <span>A SHORT VISUAL NOVEL</span>
      </div>

      <div className="title-content">
        <p className="title-eyebrow"><span>01</span> CAMPUS / LATE AFTERNOON</p>
        <h1>
          <span>A NAME.</span>
          <strong>A STRANGER<span className="title-period">.</span></strong>
        </h1>
        <div className="title-rule"><span /></div>
        <p className="title-invitation">
          You came looking for Christian Dave Mainit.
          <br />
          She knows him. Whether she&apos;ll tell you is another story.
        </p>
        <div className="title-actions">
          <button className="start-button" type="button" onClick={onStart}>
            <span className="start-button-index">▶</span>
            <span>MEET HER</span>
            <span className="start-button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
        <p className="title-duration">A STORY ABOUT PAYING ATTENTION · ABOUT 5–10 MINUTES</p>
      </div>

      <div className="title-bottomline">
        <span>NO RUSH</span>
        <span>EVERY CHOICE LEAVES A TRACE</span>
        <span>ENTER / SPACE TO CONTINUE</span>
      </div>
    </main>
  );
}
