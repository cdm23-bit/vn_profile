export interface BacklogEntry {
  speaker: string;
  text: string;
}

export type ToolsPanel = "backlog" | "settings" | null;
export type TextSpeed = "slow" | "normal" | "fast";

export default function VNTools({
  panel,
  onPanelChange,
  backlog,
  autoAdvance,
  onToggleAuto,
  skipRead,
  onToggleSkip,
  textSpeed,
  onTextSpeedChange,
  onQuickSave,
  saveStatus,
  progress,
}: {
  panel: ToolsPanel;
  onPanelChange: (panel: ToolsPanel) => void;
  backlog: BacklogEntry[];
  autoAdvance: boolean;
  onToggleAuto: () => void;
  skipRead: boolean;
  onToggleSkip: () => void;
  textSpeed: TextSpeed;
  onTextSpeedChange: (speed: TextSpeed) => void;
  onQuickSave: () => void;
  saveStatus: string | null;
  progress: number;
}) {
  const togglePanel = (next: Exclude<ToolsPanel, null>) => {
    onPanelChange(panel === next ? null : next);
  };

  return (
    <>
      <nav className="vn-toolbar" aria-label="Visual novel controls">
        <div className="vn-toolbar-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="vn-toolbar-actions">
          <button
            className={`tool-button${autoAdvance ? " is-active" : ""}`}
            type="button"
            aria-pressed={autoAdvance}
            onClick={onToggleAuto}
          >
            AUTO <i aria-hidden="true">{autoAdvance ? "ON" : "OFF"}</i>
          </button>
          <button
            className={`tool-button${skipRead ? " is-active" : ""}`}
            type="button"
            aria-pressed={skipRead}
            onClick={onToggleSkip}
          >
            SKIP <i aria-hidden="true">{skipRead ? "ON" : "OFF"}</i>
          </button>
          <button
            className={`tool-button${panel === "backlog" ? " is-active" : ""}`}
            type="button"
            aria-expanded={panel === "backlog"}
            onClick={() => togglePanel("backlog")}
          >
            LOG
          </button>
          <button
            className={`tool-button${panel === "settings" ? " is-active" : ""}`}
            type="button"
            aria-expanded={panel === "settings"}
            onClick={() => togglePanel("settings")}
          >
            SETTINGS
          </button>
        </div>
      </nav>

      {panel && (
        <section
          className={`tool-panel tool-panel--${panel}`}
          aria-label={panel === "backlog" ? "Dialogue backlog" : "Story settings"}
          aria-live={panel === "backlog" ? "polite" : undefined}
        >
          <div className="tool-panel-heading">
            <div>
              <span>{panel === "backlog" ? "PREVIOUS LINES" : "PREFERENCES"}</span>
              <strong>{panel === "backlog" ? "DIALOGUE LOG" : "STORY SETTINGS"}</strong>
            </div>
            <button
              className="tool-close"
              type="button"
              onClick={() => onPanelChange(null)}
              aria-label="Close panel"
            >
              CLOSE <span aria-hidden="true">×</span>
            </button>
          </div>

          {panel === "backlog" ? (
            <div className="backlog-list">
              {backlog.length === 0 ? (
                <p className="backlog-empty">
                  Dialogue you have read will appear here.
                </p>
              ) : (
                backlog.map((entry, index) => (
                  <article className="backlog-entry" key={`${index}-${entry.speaker}`}>
                    <span>{entry.speaker}</span>
                    <p>{entry.text}</p>
                  </article>
                ))
              )}
            </div>
          ) : (
            <div className="settings-content">
              <fieldset className="speed-setting">
                <legend>TEXT SPEED</legend>
                <div className="speed-options">
                  {(["slow", "normal", "fast"] as const).map((speed) => (
                    <button
                      className={`speed-button${textSpeed === speed ? " is-selected" : ""}`}
                      type="button"
                      key={speed}
                      aria-pressed={textSpeed === speed}
                      onClick={() => onTextSpeedChange(speed)}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="settings-toggles">
                <button
                  className="setting-toggle"
                  type="button"
                  aria-pressed={autoAdvance}
                  onClick={onToggleAuto}
                >
                  <span>Auto advance</span>
                  <strong>{autoAdvance ? "ON" : "OFF"}</strong>
                </button>
                <button
                  className="setting-toggle"
                  type="button"
                  aria-pressed={skipRead}
                  onClick={onToggleSkip}
                >
                  <span>Skip read lines</span>
                  <strong>{skipRead ? "ON" : "OFF"}</strong>
                </button>
              </div>
              <button className="quick-save-button" type="button" onClick={onQuickSave}>
                <span>QUICK SAVE</span>
                <span aria-hidden="true">↓</span>
              </button>
              {saveStatus && (
                <p className="save-status" role="status">{saveStatus}</p>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
