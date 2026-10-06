import type { StoryLocation } from "@/data/visual-novel-script";

export default function SceneBackground({ location }: { location: StoryLocation }) {
  return (
    <div className={`scene-background scene-background--${location}`} aria-hidden="true">
      <div className="scene-landscape" />
      <div className="scene-architecture">
        <span />
        <span />
        <span />
      </div>
      <div className="scene-grid" />
      <div className="scene-vignette" />
      <div className="scene-crosshair scene-crosshair--one" />
      <div className="scene-crosshair scene-crosshair--two" />
    </div>
  );
}
