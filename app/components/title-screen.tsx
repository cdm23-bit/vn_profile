import type { ProfileData } from "@/lib/profile-data";

export default function TitleScreen({
  profile,
  onStart,
  onResume,
  hasSave,
  storageMessage,
}: {
  profile: ProfileData;
  onStart: () => void;
  onResume: () => void;
  hasSave: boolean;
  storageMessage: string | null;
}) {
  return (
    <main className="title-screen">
      <div className="title-backdrop" aria-hidden="true">
        <span className="title-orbit title-orbit--one" />
        <span className="title-orbit title-orbit--two" />
        <span className="title-crosshair title-crosshair--one" />
        <span className="title-crosshair title-crosshair--two" />
      </div>

      <div className="title-topline">
        <span className="brand-mark"><i aria-hidden="true" /> CDM / ARCHIVE</span>
        <span>INTERACTIVE PROFILE // 01</span>
      </div>

      <div className="title-content">
        <p className="title-eyebrow"><span>01</span> A SHORT VISUAL STORY</p>
        <h1>
          <span>CHRISTIAN DAVE</span>
          <strong>MAINIT<span className="title-period">.</span></strong>
        </h1>
        <div className="title-rule"><span /></div>
        <p className="title-program">{profile.program}</p>
        <p className="title-invitation">
          A profile, told one scene at a time.
          <br />
          Choose a path. Take it at your own pace.
        </p>
        <div className="title-actions">
          <button className="start-button" type="button" onClick={onStart}>
            <span className="start-button-index">▶</span>
            <span>BEGIN STORY</span>
            <span className="start-button-arrow" aria-hidden="true">→</span>
          </button>
          {hasSave && (
            <button className="resume-button" type="button" onClick={onResume}>
              RESUME STORY <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
        {storageMessage && (
          <p className="title-storage-notice" role="status">{storageMessage}</p>
        )}
      </div>

      <div className="title-bottomline">
        <span>NO SKIP / NO RUSH</span>
        <span>LOCAL STORY FILE · READY</span>
        <span>USE ENTER OR SPACE</span>
      </div>
    </main>
  );
}
