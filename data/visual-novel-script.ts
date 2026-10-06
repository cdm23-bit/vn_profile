import type { ProfileData } from "@/lib/profile-data";

export type StoryLocation =
  | "walkway"
  | "hallway"
  | "library"
  | "courtyard"
  | "cafeteria"
  | "computer-lab";

export type CharacterExpression =
  | "neutral"
  | "happy"
  | "curious"
  | "thinking"
  | "surprised"
  | "annoyed"
  | "suspicious"
  | "embarrassed"
  | "serious";

export type StoryFlag =
  | "answered-honestly"
  | "asked-about-her"
  | "asked-about-her-again"
  | "respected-the-book"
  | "solved-the-riddle"
  | "remembered-her-clue"
  | "solved-the-lab-problem"
  | "respected-christians-privacy";

export interface StoryProgress {
  flags: ReadonlySet<StoryFlag>;
  goodChoices: number;
  badChoices: number;
  solvedPuzzles: number;
}

export interface StoryChoice {
  label: string;
  next: StoryNodeId;
  impact?: "good" | "bad";
  addsFlags?: StoryFlag[];
  correct?: boolean;
}

interface NodeBase {
  location: StoryLocation;
}

export interface DialogueNode extends NodeBase {
  kind: "dialogue";
  speaker: string;
  text: string;
  expression?: CharacterExpression;
  next: StoryNodeId;
}

export interface ChoiceNode extends NodeBase {
  kind: "choice";
  speaker: string;
  prompt: string;
  expression?: CharacterExpression;
  category: "CONVERSATION" | "CAMPUS MYSTERY" | "FOUND NOTE" | "OBSERVATION";
  choices: StoryChoice[];
}

export interface ArchiveNode extends NodeBase {
  kind: "archive";
  ending: "good" | "secret";
  next: StoryNodeId;
}

export interface EndingNode extends NodeBase {
  kind: "ending";
  ending: "good" | "bad" | "secret";
}

interface RouteRule {
  next: StoryNodeId;
  minGoodChoices?: number;
  maxBadChoices?: number;
  minSolvedPuzzles?: number;
  requiredFlags?: StoryFlag[];
}

export interface RouteNode extends NodeBase {
  kind: "route";
  rules: RouteRule[];
  fallback: StoryNodeId;
}

export type StoryNode = DialogueNode | ChoiceNode | ArchiveNode | EndingNode | RouteNode;

export type StoryNodeId =
  | "opening"
  | "first-question"
  | "reply-honest"
  | "reply-profile"
  | "reply-entitled"
  | "reply-curious"
  | "hallway"
  | "book-mystery"
  | "book-right"
  | "book-wrong"
  | "library"
  | "riddle"
  | "riddle-right"
  | "riddle-wrong"
  | "courtyard"
  | "about-her"
  | "cafeteria"
  | "memory"
  | "memory-right"
  | "memory-wrong"
  | "computer-lab"
  | "lab-logic"
  | "lab-right"
  | "lab-wrong"
  | "project-story"
  | "personal-profile-story"
  | "skill-story"
  | "final-situation"
  | "final-choice"
  | "final-respectful"
  | "final-intrusive"
  | "ending-gate"
  | "profile-archive"
  | "secret-archive"
  | "good-ending"
  | "secret-ending"
  | "bad-ending";

const girl = "The girl";
const you = "You";
const system = "SYSTEM";

export function createVisualNovelScript(profile: ProfileData): Record<StoryNodeId, StoryNode> {
  const donutProject = profile.projects.find(
    (project) => project.id === "donut-business-management-system",
  );

  if (!donutProject) {
    throw new Error("The profile data must include the donut business management project.");
  }
  const personalProfile = profile.projects.find(
    (project) => project.id === "personal-profile",
  );
  const htmlSkill = profile.skills.find((skill) => skill.id === "html");
  const javascriptSkill = profile.skills.find((skill) => skill.id === "javascript");

  if (!personalProfile || !htmlSkill || !javascriptSkill) {
    throw new Error("The profile data must include the personal profile project and web skills.");
  }

  return {
    opening: {
      kind: "dialogue",
      location: "walkway",
      speaker: system,
      text: "Late afternoon settles over campus. Near the directory, a girl watches you make a third slow lap.",
      next: "first-question",
    },
    "first-question": {
      kind: "choice",
      location: "walkway",
      speaker: girl,
      expression: "suspicious",
      prompt: "You look lost. Or very committed to that map. Who are you looking for?",
      category: "CONVERSATION",
      choices: [
        {
          label: "Christian Dave Mainit. I want to understand who he is.",
          next: "reply-honest",
          impact: "good",
          addsFlags: ["answered-honestly"],
        },
        {
          label: "Christian. I'm putting together a profile.",
          next: "reply-profile",
        },
        {
          label: "You know him. Tell me everything.",
          next: "reply-entitled",
          impact: "bad",
        },
        {
          label: "Before that, who are you?",
          next: "reply-curious",
          impact: "good",
          addsFlags: ["asked-about-her"],
        },
      ],
    },
    "reply-honest": {
      kind: "dialogue",
      location: "walkway",
      speaker: girl,
      expression: "thinking",
      text: "At least that's an honest answer. Curiosity is fine. Acting like you own someone's story isn't.",
      next: "hallway",
    },
    "reply-profile": {
      kind: "dialogue",
      location: "walkway",
      speaker: girl,
      expression: "curious",
      text: "A profile? That could mean anything. I'll decide what I think of you as we go.",
      next: "hallway",
    },
    "reply-entitled": {
      kind: "dialogue",
      location: "walkway",
      speaker: girl,
      expression: "annoyed",
      text: "That's a pretty confident way to ask a stranger for a favor.",
      next: "hallway",
    },
    "reply-curious": {
      kind: "dialogue",
      location: "walkway",
      speaker: girl,
      expression: "surprised",
      text: "Me? Nice try. Let's start with the person you came here to ask about.",
      next: "hallway",
    },
    hallway: {
      kind: "dialogue",
      location: "hallway",
      speaker: system,
      text: "She heads toward the library. You fall into step beside her. At the corridor turn, a book sits alone on a dry chair beneath an open window.",
      next: "book-mystery",
    },
    "book-mystery": {
      kind: "choice",
      location: "hallway",
      speaker: girl,
      expression: "curious",
      prompt: "It's open to a page, with a note tucked inside: “Back before the second bell. Saving this spot.” What do you think happened?",
      category: "CAMPUS MYSTERY",
      choices: [
        {
          label: "Someone stepped away briefly and plans to come back.",
          next: "book-right",
          impact: "good",
          correct: true,
          addsFlags: ["respected-the-book"],
        },
        {
          label: "It's abandoned. We should take it and look for a name.",
          next: "book-wrong",
          impact: "bad",
        },
        {
          label: "Someone hid it here so nobody else could borrow it.",
          next: "book-wrong",
        },
      ],
    },
    "book-right": {
      kind: "dialogue",
      location: "hallway",
      speaker: girl,
      expression: "happy",
      text: "Exactly. The note answers it, and the book is dry. We can leave it alone instead of turning somebody's break into a scavenger hunt.",
      next: "library",
    },
    "book-wrong": {
      kind: "dialogue",
      location: "hallway",
      speaker: girl,
      expression: "serious",
      text: "The note says they'll be back, and the book is dry. Let's not rummage through someone else's things just because we're curious.",
      next: "library",
    },
    library: {
      kind: "dialogue",
      location: "library",
      speaker: girl,
      expression: "neutral",
      text: `Christian studies ${profile.program}. He's focused on practical skills in software and web development.`,
      next: "riddle",
    },
    riddle: {
      kind: "choice",
      location: "library",
      speaker: you,
      expression: "thinking",
      prompt: "A folded note has been left beside the return slot: “I have keys, but no locks. I have space, but no room. You can enter, but you can't go outside.”",
      category: "FOUND NOTE",
      choices: [
        {
          label: "A keyboard",
          next: "riddle-right",
          impact: "good",
          correct: true,
          addsFlags: ["solved-the-riddle"],
        },
        { label: "A classroom", next: "riddle-wrong" },
        { label: "A piano", next: "riddle-wrong" },
      ],
    },
    "riddle-right": {
      kind: "dialogue",
      location: "library",
      speaker: girl,
      expression: "happy",
      text: "Keyboard. Whoever left that note has been here before; the corners are soft from being folded. Good eye.",
      next: "courtyard",
    },
    "riddle-wrong": {
      kind: "dialogue",
      location: "library",
      speaker: girl,
      expression: "happy",
      text: "Not quite. It was a keyboard. The note can stay a mystery for its next reader.",
      next: "courtyard",
    },
    courtyard: {
      kind: "dialogue",
      location: "courtyard",
      speaker: girl,
      expression: "curious",
      text: "It's quieter out here. I like this corner when the main paths get crowded. What about you—are you curious about anything besides Christian?",
      next: "about-her",
    },
    "about-her": {
      kind: "choice",
      location: "courtyard",
      speaker: you,
      expression: "curious",
      prompt: "For once, she's asking what you want to know.",
      category: "CONVERSATION",
      choices: [
        {
          label: "Yeah. What do you like doing when you're not people-watching?",
          next: "cafeteria",
          impact: "good",
          addsFlags: ["asked-about-her-again"],
        },
        {
          label: "I'd rather hear more about Christian's work.",
          next: "cafeteria",
          impact: "bad",
        },
        {
          label: "I hadn't thought about it. Tell me what you notice around here.",
          next: "cafeteria",
          impact: "good",
        },
      ],
    },
    cafeteria: {
      kind: "dialogue",
      location: "cafeteria",
      speaker: girl,
      expression: "happy",
      text: "Mostly I read, people-watch, and take the path behind the library when campus gets too loud. Nothing mysterious. Don't look so disappointed.",
      next: "memory",
    },
    memory: {
      kind: "choice",
      location: "cafeteria",
      speaker: girl,
      expression: "curious",
      prompt: "You said you were listening. Where do I go when campus gets too loud?",
      category: "OBSERVATION",
      choices: [
        {
          label: "The path behind the library.",
          next: "memory-right",
          impact: "good",
          correct: true,
          addsFlags: ["remembered-her-clue"],
        },
        { label: "The computer lab.", next: "memory-wrong" },
        { label: "The main campus walkway.", next: "memory-wrong" },
      ],
    },
    "memory-right": {
      kind: "dialogue",
      location: "cafeteria",
      speaker: girl,
      expression: "surprised",
      text: "You remembered. Most people are already thinking about what they want to ask next.",
      next: "computer-lab",
    },
    "memory-wrong": {
      kind: "dialogue",
      location: "cafeteria",
      speaker: girl,
      expression: "thinking",
      text: "The path behind the library. I did just tell you, though the cafeteria is loud enough to excuse a little forgetfulness.",
      next: "computer-lab",
    },
    "computer-lab": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "neutral",
      text: "A lab computer has lost its network connection. The other desks are online; this one has a dark port light and a loose cable labeled “02.”",
      next: "lab-logic",
    },
    "lab-logic": {
      kind: "choice",
      location: "computer-lab",
      speaker: girl,
      expression: "thinking",
      prompt: "What's the first thing to check?",
      category: "CAMPUS MYSTERY",
      choices: [
        {
          label: "Reconnect the loose cable marked 02.",
          next: "lab-right",
          impact: "good",
          correct: true,
          addsFlags: ["solved-the-lab-problem"],
        },
        { label: "Unplug the router and reset every desk.", next: "lab-wrong" },
        { label: "Assume the whole lab network is down.", next: "lab-wrong" },
      ],
    },
    "lab-right": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "happy",
      text: "Right. One dark port, one loose cable. Start with the evidence in front of you, not the biggest possible explanation.",
      next: "project-story",
    },
    "lab-wrong": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "thinking",
      text: "The loose cable is the simplest explanation. No need to reset the whole lab before checking the obvious clue.",
      next: "project-story",
    },
    "project-story": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "curious",
      text: `He is building a ${donutProject.name.toLowerCase()}. It's ${donutProject.status.toLowerCase()}, using ${donutProject.technologies.map((technology) => technology.name).join(", ")}.`,
      next: "personal-profile-story",
    },
    "personal-profile-story": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "happy",
      text: `The personal profile is already ${personalProfile.status.toLowerCase()}. He made it with ${personalProfile.technologies.map((technology) => technology.name).join(", ")}.`,
      next: "skill-story",
    },
    "skill-story": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "thinking",
      text: `His notes put ${htmlSkill.name} at ${htmlSkill.mastery}% and ${javascriptSkill.name} at ${javascriptSkill.mastery}%. A snapshot of what he's practicing, not a score for who he is.`,
      next: "final-situation",
    },
    "final-situation": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: system,
      text: "On the desk is a USB drive labeled “CDM — PROFILE.” The lab is empty. The girl looks from it to you.",
      next: "final-choice",
    },
    "final-choice": {
      kind: "choice",
      location: "computer-lab",
      speaker: girl,
      expression: "serious",
      prompt: "What should we do?",
      category: "CONVERSATION",
      choices: [
        {
          label: "Leave it here and tell the lab attendant. It's not ours to open.",
          next: "final-respectful",
          impact: "good",
          addsFlags: ["respected-christians-privacy"],
        },
        {
          label: "Open it. We've followed this trail far enough.",
          next: "final-intrusive",
          impact: "bad",
        },
        {
          label: "Take it. We can return it after I see the profile.",
          next: "final-intrusive",
          impact: "bad",
        },
      ],
    },
    "final-respectful": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "happy",
      text: "Thank you. That drive is his. You could have looked, but you chose to respect a boundary even when nobody was watching.",
      next: "ending-gate",
    },
    "final-intrusive": {
      kind: "dialogue",
      location: "computer-lab",
      speaker: girl,
      expression: "serious",
      text: "That's exactly why I was careful. Knowing about someone doesn't give us permission to open their things.",
      next: "ending-gate",
    },
    "ending-gate": {
      kind: "route",
      location: "computer-lab",
      rules: [
        {
          next: "secret-archive",
          minGoodChoices: 4,
          maxBadChoices: 1,
          minSolvedPuzzles: 3,
          requiredFlags: [
            "asked-about-her",
            "asked-about-her-again",
            "respected-christians-privacy",
          ],
        },
        {
          next: "profile-archive",
          minGoodChoices: 2,
          maxBadChoices: 2,
          minSolvedPuzzles: 2,
          requiredFlags: ["respected-christians-privacy"],
        },
      ],
      fallback: "bad-ending",
    },
    "profile-archive": {
      kind: "archive",
      location: "computer-lab",
      ending: "good",
      next: "good-ending",
    },
    "secret-archive": {
      kind: "archive",
      location: "computer-lab",
      ending: "secret",
      next: "secret-ending",
    },
    "good-ending": {
      kind: "ending",
      location: "computer-lab",
      ending: "good",
    },
    "secret-ending": {
      kind: "ending",
      location: "courtyard",
      ending: "secret",
    },
    "bad-ending": {
      kind: "ending",
      location: "computer-lab",
      ending: "bad",
    },
  };
}

export function resolveStoryRoute(
  nodeId: StoryNodeId,
  progress: StoryProgress,
  script: Record<StoryNodeId, StoryNode>,
): StoryNodeId {
  let resolvedId = nodeId;
  let routeDepth = 0;

  while (script[resolvedId].kind === "route") {
    const route = script[resolvedId];
    if (route.kind !== "route") {
      break;
    }

    const matchedRule = route.rules.find((rule) =>
      (rule.minGoodChoices === undefined ||
        progress.goodChoices >= rule.minGoodChoices) &&
      (rule.maxBadChoices === undefined ||
        progress.badChoices <= rule.maxBadChoices) &&
      (rule.minSolvedPuzzles === undefined ||
        progress.solvedPuzzles >= rule.minSolvedPuzzles) &&
      (rule.requiredFlags === undefined ||
        rule.requiredFlags.every((flag) => progress.flags.has(flag))),
    );
    resolvedId = matchedRule?.next ?? route.fallback;
    routeDepth += 1;

    if (routeDepth > Object.keys(script).length) {
      throw new Error("The visual novel story contains a circular route.");
    }
  }

  return resolvedId;
}
