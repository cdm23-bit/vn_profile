"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ChoiceMenu from "@/app/components/choice-menu";
import CharacterPortrait from "@/app/components/character-portrait";
import DialogueBox from "@/app/components/dialogue-box";
import EndingScreen from "@/app/components/ending-screen";
import SceneBackground from "@/app/components/scene-background";
import TitleScreen from "@/app/components/title-screen";
import VNTools, {
  type BacklogEntry,
  type TextSpeed,
  type ToolsPanel,
} from "@/app/components/vn-tools";
import {
  createVisualNovelScript,
  type SceneChoice,
  type SceneId,
} from "@/data/visual-novel-script";
import type { ProfileData } from "@/lib/profile-data";

const SCENE_ORDER: SceneId[] = [
  "introduction",
  "personal-information",
  "skills",
  "projects",
  "contact",
  "ending",
];

const SAVE_KEY = "cdm-profile-story-save";
const SAVE_EVENT = "cdm-profile-story-save-updated";
const STORAGE_UNAVAILABLE = "__storage_unavailable__";

interface SavedProgress {
  version: 1;
  scene: SceneId;
  dialogueIndex: number;
  visibleCharacters: number;
  backlog: BacklogEntry[];
  seenLines: string[];
}

const TYPEWRITER_INTERVALS: Record<TextSpeed, number> = {
  slow: 42,
  normal: 22,
  fast: 9,
};

function subscribeToSave(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SAVE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SAVE_EVENT, onStoreChange);
  };
}

function getSaveSnapshot() {
  try {
    return window.localStorage.getItem(SAVE_KEY);
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

function isSavedProgress(
  value: unknown,
  script: ReturnType<typeof createVisualNovelScript>,
): value is SavedProgress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== 1 ||
    !SCENE_ORDER.some((scene) => scene === candidate.scene) ||
    !Number.isInteger(candidate.dialogueIndex) ||
    !Number.isInteger(candidate.visibleCharacters) ||
    !Array.isArray(candidate.backlog) ||
    !Array.isArray(candidate.seenLines)
  ) {
    return false;
  }

  const backlogIsValid = candidate.backlog.every((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) {
      return false;
    }
    const item = entry as Record<string, unknown>;
    return typeof item.speaker === "string" && typeof item.text === "string";
  });
  const seenLinesAreValid = candidate.seenLines.every((key: unknown) =>
    SCENE_ORDER.some((sceneId) => {
      const prefix = `${sceneId}:`;
      if (typeof key !== "string" || !key.startsWith(prefix)) {
        return false;
      }
      const indexText = key.slice(prefix.length);
      const index = Number(indexText);
      return (
        String(index) === indexText &&
        Number.isInteger(index) &&
        index >= 0 &&
        index < script[sceneId].entries.length
      );
    }),
  );
  if (!backlogIsValid || !seenLinesAreValid) {
    return false;
  }

  const scene = candidate.scene as SceneId;
  const dialogueIndex = candidate.dialogueIndex as number;
  const visibleCharacters = candidate.visibleCharacters as number;
  const sceneEntries = script[scene].entries;

  if (scene === "ending") {
    return dialogueIndex === 0 && visibleCharacters === 0;
  }

  return (
    dialogueIndex >= 0 &&
    dialogueIndex < sceneEntries.length &&
    visibleCharacters >= 0 &&
    visibleCharacters <= sceneEntries[dialogueIndex].text.length
  );
}

export default function VNGame({ profile }: { profile: ProfileData }) {
  const script = useMemo(() => createVisualNovelScript(profile), [profile]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState<SceneId>("introduction");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backlog, setBacklog] = useState<BacklogEntry[]>([]);
  const [panel, setPanel] = useState<ToolsPanel>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [skipRead, setSkipRead] = useState(false);
  const [textSpeed, setTextSpeed] = useState<TextSpeed>("normal");
  const [seenLines, setSeenLines] = useState<Set<string>>(() => new Set());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const transitionLock = useRef(false);
  const savedJson = useSyncExternalStore(
    subscribeToSave,
    getSaveSnapshot,
    () => null,
  );
  const { savedProgress, storageMessage } = useMemo(() => {
    if (savedJson === STORAGE_UNAVAILABLE) {
      return {
        savedProgress: null,
        storageMessage: "Local saves are unavailable in this browser.",
      };
    }

    if (!savedJson) {
      return { savedProgress: null, storageMessage: null };
    }

    try {
      const parsedProgress: unknown = JSON.parse(savedJson);
      if (isSavedProgress(parsedProgress, script)) {
        return { savedProgress: parsedProgress, storageMessage: null };
      }

      return {
        savedProgress: null,
        storageMessage: "The local save slot is invalid.",
      };
    } catch {
      return {
        savedProgress: null,
        storageMessage: "The local save slot could not be read.",
      };
    }
  }, [savedJson, script]);

  const scene = script[currentScene];
  const currentEntry = scene.entries[dialogueIndex];
  const isEnding = currentScene === "ending";
  const isTyping =
    isPlaying && !isEnding && visibleCharacters < currentEntry.text.length;
  const sceneFinished =
    !isEnding &&
    dialogueIndex === scene.entries.length - 1 &&
    !isTyping;
  const visibleText = isEnding
    ? ""
    : currentEntry.text.slice(0, visibleCharacters);
  const lineKey = `${currentScene}:${dialogueIndex}`;

  useEffect(() => {
    if (!isPlaying || isTransitioning || isEnding) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCharacters((count) =>
        Math.min(count + 1, currentEntry.text.length),
      );
    }, TYPEWRITER_INTERVALS[textSpeed]);

    return () => window.clearInterval(timer);
  }, [currentEntry, isEnding, isPlaying, isTransitioning, textSpeed]);

  const moveToScene = useCallback((nextScene: SceneId) => {
    if (transitionLock.current) {
      return;
    }

    transitionLock.current = true;
    setIsTransitioning(true);
    window.setTimeout(() => {
      setCurrentScene(nextScene);
      setDialogueIndex(0);
      setVisibleCharacters(0);
      window.setTimeout(() => {
        transitionLock.current = false;
        setIsTransitioning(false);
      }, 140);
    }, 180);
  }, []);

  const startStory = useCallback(() => {
    setCurrentScene("introduction");
    setDialogueIndex(0);
    setVisibleCharacters(0);
    setBacklog([]);
    setPanel(null);
    setIsPlaying(true);
  }, []);

  const addCurrentLineToBacklog = useCallback(() => {
    setBacklog((entries) => [
      ...entries,
      { speaker: currentEntry.speaker, text: currentEntry.text },
    ]);
  }, [currentEntry]);

  const handleContinue = useCallback(() => {
    if (!isPlaying || isTransitioning || isEnding) {
      return;
    }

    if (isTyping) {
      setVisibleCharacters(currentEntry.text.length);
      return;
    }

    if (currentEntry.choices) {
      return;
    }

    if (dialogueIndex < scene.entries.length - 1) {
      setSeenLines((seen) => new Set(seen).add(lineKey));
      addCurrentLineToBacklog();
      const nextIndex = dialogueIndex + 1;
      const nextEntry = scene.entries[nextIndex];
      const nextLineKey = `${currentScene}:${nextIndex}`;
      if (nextEntry.choices) {
        setSkipRead(false);
      } else if (skipRead && seenLines.has(nextLineKey)) {
        setVisibleCharacters(nextEntry.text.length);
      } else if (skipRead) {
        setSkipRead(false);
      }
      setDialogueIndex(nextIndex);
    }
  }, [
    addCurrentLineToBacklog,
    currentEntry,
    currentScene,
    dialogueIndex,
    isEnding,
    isPlaying,
    isTransitioning,
    isTyping,
    lineKey,
    seenLines,
    scene.entries,
    skipRead,
  ]);

  const handleChoice = useCallback(
    (choice: SceneChoice) => {
      setSeenLines((seen) => new Set(seen).add(lineKey));
      addCurrentLineToBacklog();
      setPanel(null);
      setSkipRead(false);
      moveToScene(choice.nextScene);
    },
    [addCurrentLineToBacklog, lineKey, moveToScene],
  );

  const handleQuickSave = useCallback(() => {
    const progress: SavedProgress = {
      version: 1,
      scene: currentScene,
      dialogueIndex: isEnding ? 0 : dialogueIndex,
      visibleCharacters: isEnding ? 0 : visibleCharacters,
      backlog,
      seenLines: Array.from(seenLines),
    };

    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
      window.dispatchEvent(new Event(SAVE_EVENT));
      setSaveStatus("PROGRESS SAVED IN THIS BROWSER.");
    } catch {
      setSaveStatus("SAVE FAILED. BROWSER STORAGE IS UNAVAILABLE.");
    }
  }, [backlog, currentScene, dialogueIndex, isEnding, seenLines, visibleCharacters]);

  const resumeStory = useCallback(() => {
    if (!savedProgress) {
      return;
    }

    setCurrentScene(savedProgress.scene);
    setDialogueIndex(savedProgress.dialogueIndex);
    setVisibleCharacters(savedProgress.visibleCharacters);
    setBacklog(savedProgress.backlog);
    setSeenLines(new Set(savedProgress.seenLines));
    setPanel(null);
    setIsPlaying(true);
  }, [savedProgress]);

  useEffect(() => {
    if (
      !isPlaying ||
      !autoAdvance ||
      panel !== null ||
      isTyping ||
      isTransitioning ||
      isEnding ||
      currentEntry.choices
    ) {
      return;
    }

    const timer = window.setTimeout(handleContinue, 1400);
    return () => window.clearTimeout(timer);
  }, [
    autoAdvance,
    currentEntry,
    handleContinue,
    isEnding,
    isPlaying,
    isTransitioning,
    isTyping,
    panel,
  ]);

  useEffect(() => {
    if (
      !skipRead ||
      !isPlaying ||
      isEnding ||
      isTransitioning ||
      panel !== null ||
      !seenLines.has(lineKey) ||
      currentEntry.choices
    ) {
      return;
    }

    if (isTyping) {
      return;
    }

    const timer = window.setTimeout(handleContinue, 90);
    return () => window.clearTimeout(timer);
  }, [
    currentEntry,
    handleContinue,
    isEnding,
    isPlaying,
    isTransitioning,
    isTyping,
    lineKey,
    panel,
    seenLines,
    skipRead,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === "Escape") {
        setPanel((currentPanel) => currentPanel === null ? "settings" : null);
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setPanel((currentPanel) => currentPanel === "backlog" ? null : "backlog");
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleContinue();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleContinue, isPlaying]);

  const restartStory = () => {
    setCurrentScene("introduction");
    setDialogueIndex(0);
    setVisibleCharacters(0);
    setBacklog([]);
    setPanel(null);
    setSkipRead(false);
    setIsPlaying(true);
  };

  const toggleSkipRead = () => {
    if (skipRead) {
      setSkipRead(false);
      return;
    }

    if (isEnding || currentEntry.choices || !seenLines.has(lineKey)) {
      return;
    }

    if (isTyping) {
      setVisibleCharacters(currentEntry.text.length);
    }
    setSkipRead(true);
  };

  if (!isPlaying) {
    return (
      <TitleScreen
        profile={profile}
        onStart={startStory}
        onResume={resumeStory}
        hasSave={savedProgress !== null}
        storageMessage={storageMessage}
      />
    );
  }

  const sceneNumber = SCENE_ORDER.indexOf(currentScene) + 1;

  return (
    <main className="vn-shell">
      <div
        className={`game-frame${isTransitioning ? " is-transitioning" : ""}`}
        data-scene={currentScene}
      >
        <header className="game-header">
          <div className="game-brand">
            <span className="brand-mark"><i aria-hidden="true" /> CDM / ARCHIVE</span>
            <span className="brand-divider" aria-hidden="true" />
            <span className="game-file-label">A PROFILE STORY</span>
          </div>
          <div className="game-status">
            <span className="status-light" aria-hidden="true" />
            <span>LOCAL STORY FILE</span>
            <span className="status-divider" aria-hidden="true">/</span>
            <span>{String(sceneNumber).padStart(2, "0")} : {String(SCENE_ORDER.length).padStart(2, "0")}</span>
          </div>
        </header>

        <VNTools
          panel={panel}
          onPanelChange={setPanel}
          backlog={backlog}
          autoAdvance={autoAdvance}
          onToggleAuto={() => setAutoAdvance((enabled) => !enabled)}
          skipRead={skipRead}
          onToggleSkip={toggleSkipRead}
          textSpeed={textSpeed}
          onTextSpeedChange={setTextSpeed}
          onQuickSave={handleQuickSave}
          saveStatus={saveStatus}
          progress={(sceneNumber / SCENE_ORDER.length) * 100}
        />

        {isEnding ? (
          <EndingScreen
            profile={profile}
            onRestart={restartStory}
            onTitle={() => setIsPlaying(false)}
          />
        ) : (
          <>
            <section className="scene-stage" aria-label={`${scene.title} scene`}>
              <SceneBackground scene={currentScene} />
              <div className="scene-location">
                <span className="scene-location-marker" aria-hidden="true" />
                {scene.setting}
              </div>
              <div className="scene-coordinate" aria-hidden="true">
                SCENE {String(sceneNumber).padStart(2, "0")}<br />
                PROFILE / {profile.id.toUpperCase()}
              </div>
              <div className="scene-bottom-mark" aria-hidden="true">
                <span />
                SIGNAL STABLE
              </div>
              <CharacterPortrait
                name={profile.fullName}
                active={currentEntry.speaker === profile.fullName}
              />
            </section>

            <div
              className={`story-controls${!isTyping && currentEntry.choices ? " has-choices" : ""}`}
            >
              <DialogueBox
                entry={currentEntry}
                scene={scene}
                visibleText={visibleText}
                isTyping={isTyping}
                sceneFinished={sceneFinished}
                onContinue={handleContinue}
              />

              {!isTyping && currentEntry.choices && (
                <ChoiceMenu choices={currentEntry.choices} onChoose={handleChoice} />
              )}
            </div>
          </>
        )}

        <footer className="game-footer">
          <span>PROFILE DATABASE <i aria-hidden="true">/</i> ACCESS LEVEL 01</span>
          <span>CHRISTIAN DAVE MAINIT</span>
        </footer>
        {storageMessage && (
          <p className="storage-notice" role="status">
            {storageMessage}
          </p>
        )}
        <div className="transition-shutter" aria-hidden="true" />
      </div>
    </main>
  );
}
