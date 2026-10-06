import type { StoryChoice } from "@/data/visual-novel-script";

export default function ChoiceMenu({
  category,
  choices,
  onChoose,
}: {
  category: string;
  choices: StoryChoice[];
  onChoose: (choice: StoryChoice) => void;
}) {
  return (
    <nav className="choice-menu" aria-label={`${category.toLowerCase()} choices`}>
      <span className="choice-heading">{category}</span>
      <div className="choice-list">
        {choices.map((choice, index) => (
          <button
            className="choice-button"
            key={`${choice.next}-${choice.label}`}
            onClick={() => onChoose(choice)}
            type="button"
          >
            <span className="choice-number">{index + 1}</span>
            <span>{choice.label}</span>
            <span className="choice-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
