import Image from "next/image";
import type { CharacterExpression } from "@/data/visual-novel-script";

const EXPRESSION_MARKS: Record<CharacterExpression, string> = {
  neutral: "—",
  happy: "✦",
  curious: "?",
  thinking: "…",
  surprised: "!",
  annoyed: "×",
  suspicious: "!",
  embarrassed: "·",
  serious: "!",
};

export default function CharacterPortrait({
  name,
  active,
  expression,
}: {
  name: string;
  active: boolean;
  expression: CharacterExpression;
}) {
  return (
    <figure
      className={`character-portrait character-portrait--${expression}${active ? " is-active" : ""}`}
      aria-label={`${name}, ${expression}`}
    >
      <div className="portrait-art">
        <Image
          src="/profile.jpg"
          alt="The anime girl watching the campus walkway"
          width={720}
          height={720}
          sizes="(max-width: 680px) 42vw, 300px"
          priority
        />
        <span className="portrait-expression-mark" aria-hidden="true">
          {EXPRESSION_MARKS[expression]}
        </span>
        <span className="portrait-scanline" aria-hidden="true" />
        <span className="portrait-corner portrait-corner--top" aria-hidden="true" />
        <span className="portrait-corner portrait-corner--bottom" aria-hidden="true" />
      </div>
      <figcaption className="portrait-caption">
        <span className="portrait-status">
          <i aria-hidden="true" />
          {expression.toUpperCase()}
        </span>
        <strong>{name}</strong>
        <span>{active ? "HERE WITH YOU" : "LISTENING"}</span>
      </figcaption>
    </figure>
  );
}
