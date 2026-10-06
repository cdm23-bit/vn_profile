"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterPortrait from "@/app/components/character-portrait";
import ChoiceMenu from "@/app/components/choice-menu";
import DialogueBox from "@/app/components/dialogue-box";
import EndingScreen from "@/app/components/ending-screen";
import ProfileArchive from "@/app/components/profile-archive";
import SceneBackground from "@/app/components/scene-background";
import TitleScreen from "@/app/components/title-screen";
import {
  createVisualNovelScript,
  resolveStoryRoute,
  type CharacterExpression,
  type StoryChoice,
  type StoryNodeId,
  type StoryNode,
  type StoryProgress,
} from "@/data/visual-novel-script";
import type { ProfileData } from "@/lib/profile-data";

const TYPEWRITER_INTERVAL = 24;

const EMPTY_PROGRESS: StoryProgress = {
  flags: new Set(),
  goodChoices: 0,
  badChoices: 0,
  solvedPuzzles: 0,
};

type RenderableStoryNode = Exclude<StoryNode, { kind: "route" }>;

function getRenderableNode(
  nodeId: StoryNodeId,
  progress: StoryProgress,
  script: Record<StoryNodeId, StoryNode>,
): RenderableStoryNode {
  const node = script[resolveStoryRoute(nodeId, progress, script)];
  if (node.kind === "route") {
    throw new Error(`Story route "${nodeId}" did not resolve to a scene.`);
  }
  return node;
}

export default function VNGame({ profile }: { profile: ProfileData }) {
  const script = useMemo(() => createVisualNovelScript(profile), [profile]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nodeId, setNodeId] = useState<StoryNodeId>("opening");
  const [progress, setProgress] = useState<StoryProgress>(EMPTY_PROGRESS);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backlog, setBacklog] = useState<{ speaker: string; text: string }[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const transitionLock = useRef(false);

  const node = getRenderableNode(nodeId, progress, script);
  const isTextNode = node.kind === "dialogue" || node.kind === "choice";
  const displayedText =
    node.kind === "dialogue" ? node.text : node.kind === "choice" ? node.prompt : "";
  const isTyping = isPlaying && isTextNode && visibleCharacters < displayedText.length;
  const currentExpression: CharacterExpression =
    node.kind === "dialogue" || node.kind === "choice"
      ? node.expression ?? "neutral"
      : "serious";
  useEffect(() => {
    if (!isPlaying || !isTextNode || isTransitioning) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCharacters((count) => Math.min(count + 1, displayedText.length));
    }, TYPEWRITER_INTERVAL);

    return () => window.clearInterval(timer);
  }, [displayedText, isPlaying, isTextNode, isTransitioning]);

  const moveTo = useCallback(
    (nextId: StoryNodeId, nextProgress = progress) => {
      if (transitionLock.current) {
        return;
      }

      const resolvedId = resolveStoryRoute(nextId, nextProgress, script);
      transitionLock.current = true;
      setIsTransitioning(true);
      window.setTimeout(() => {
        setNodeId(resolvedId);
        setVisibleCharacters(0);
        window.setTimeout(() => {
          transitionLock.current = false;
          setIsTransitioning(false);
        }, 160);
      }, 180);
    },
    [progress, script],
  );

  const addCurrentLineToBacklog = useCallback(() => {
    if (node.kind !== "dialogue" && node.kind !== "choice") {
      return;
    }

    setBacklog((entries) => [
      ...entries,
      {
        speaker: node.speaker,
        text: node.kind === "dialogue" ? node.text : node.prompt,
      },
    ]);
  }, [node]);

  const continueStory = useCallback(() => {
    if (!isPlaying || isTransitioning || !isTextNode) {
      return;
    }

    if (isTyping) {
      setVisibleCharacters(displayedText.length);
      return;
    }

    if (node.kind === "dialogue") {
      addCurrentLineToBacklog();
      moveTo(node.next);
    }
  }, [
    addCurrentLineToBacklog,
    displayedText,
    isPlaying,
    isTextNode,
    isTransitioning,
    isTyping,
    moveTo,
    node,
  ]);

  const choose = useCallback(
    (choice: StoryChoice) => {
      if (node.kind !== "choice" || isTransitioning) {
        return;
      }

      addCurrentLineToBacklog();
      const nextFlags = new Set(progress.flags);
      choice.addsFlags?.forEach((flag) => nextFlags.add(flag));
      const nextProgress: StoryProgress = {
        flags: nextFlags,
        goodChoices: progress.goodChoices + (choice.impact === "good" ? 1 : 0),
        badChoices: progress.badChoices + (choice.impact === "bad" ? 1 : 0),
        solvedPuzzles: progress.solvedPuzzles + (choice.correct ? 1 : 0),
      };
      setProgress(nextProgress);
      moveTo(choice.next, nextProgress);
    },
    [addCurrentLineToBacklog, isTransitioning, moveTo, node, progress],
  );

  const startStory = useCallback(() => {
    transitionLock.current = false;
    setNodeId("opening");
    setProgress(EMPTY_PROGRESS);
    setVisibleCharacters(0);
    setBacklog([]);
    setIsLogOpen(false);
    setIsTransitioning(false);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (!isPlaying) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startStory();
        }
        return;
      }

      if (node.kind === "choice" && /^[1-4]$/.test(event.key)) {
        const choiceIndex = Number(event.key) - 1;
        const choice = node.choices[choiceIndex];
        if (choice) {
          event.preventDefault();
          choose(choice);
        }
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setIsLogOpen((open) => !open);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        continueStory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choose, continueStory, isPlaying, node, startStory]);

  if (!isPlaying) {
    return <TitleScreen onStart={startStory} />;
  }

  if (node.kind === "ending") {
    return (
      <EndingScreen
        ending={node.ending}
        onRestart={startStory}
        onTitle={() => setIsPlaying(false)}
      />
    );
  }

  return (
    <main className="vn-shell">
      <div className={`game-frame${isTransitioning ? " is-transitioning" : ""}`}>
        <header className="game-header">
          <div className="game-brand">
            <span className="brand-mark"><i aria-hidden="true" /> AFTER THE LAST BELL</span>
            <span className="brand-divider" aria-hidden="true" />
            <span className="game-file-label">A SHORT CAMPUS STORY</span>
          </div>
          <div className="game-header-actions">
            <button
              className="restart-button"
              type="button"
              aria-expanded={isLogOpen}
              onClick={() => setIsLogOpen((open) => !open)}
            >
              LOG <span aria-hidden="true">↗</span>
            </button>
            <button className="restart-button" type="button" onClick={startStory}>
              RESTART <span aria-hidden="true">↻</span>
            </button>
          </div>
        </header>

        <section
          className={`scene-stage scene-stage--${node.location}`}
          aria-label={`${node.location.replace("-", " ")} scene`}
        >
          <SceneBackground location={node.location} />
          <div className="scene-location">
            <span className="scene-location-marker" aria-hidden="true" />
            {node.location.replace("-", " ").toUpperCase()}
          </div>
          <div className="scene-coordinate" aria-hidden="true">
            CAMPUS<br />LATE AFTERNOON
          </div>
          <CharacterPortrait
            name="The girl"
            active={node.kind !== "dialogue" || node.speaker === "The girl"}
            expression={currentExpression}
          />
        </section>

        {node.kind === "archive" ? (
          <ProfileArchive
            profile={profile}
            secret={node.ending === "secret"}
            onContinue={() => moveTo(node.next)}
          />
        ) : (
          <div
            className={`story-controls${node.kind === "choice" && !isTyping ? " has-choices" : ""}`}
          >
            <DialogueBox
              speaker={node.speaker}
              text={displayedText.slice(0, visibleCharacters)}
              isTyping={isTyping}
              onContinue={continueStory}
            />
            {node.kind === "choice" && !isTyping && (
              <ChoiceMenu
                category={node.category}
                choices={node.choices}
                onChoose={choose}
              />
            )}
          </div>
        )}

        {isLogOpen && (
          <aside className="story-log" aria-label="Dialogue log">
            <div className="story-log-heading">
              <strong>RECENT DIALOGUE</strong>
              <button type="button" onClick={() => setIsLogOpen(false)}>CLOSE ×</button>
            </div>
            <div className="story-log-list">
              {backlog.length === 0 ? (
                <p>Lines you have read will appear here.</p>
              ) : (
                backlog.map((entry, index) => (
                  <article key={`${index}-${entry.speaker}`}>
                    <span>{entry.speaker}</span>
                    <p>{entry.text}</p>
                  </article>
                ))
              )}
            </div>
          </aside>
        )}

        <footer className="game-footer">
          <span>ENTER / SPACE TO CONTINUE <i aria-hidden="true">·</i> 1-4 TO CHOOSE <i aria-hidden="true">·</i> BACKSPACE LOG</span>
          <span>NO TIMER. TAKE YOUR TIME.</span>
        </footer>
        <div className="transition-shutter" aria-hidden="true" />
      </div>
    </main>
  );
}
