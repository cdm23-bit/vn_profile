import type {
  ProfileData,
  Project,
  Skill,
  SocialLink,
} from "@/lib/profile-data";

export type SceneId =
  | "introduction"
  | "personal-information"
  | "skills"
  | "projects"
  | "contact"
  | "ending";

export interface SceneChoice {
  label: string;
  nextScene: SceneId;
}

export interface DialogueEntry {
  speaker: string;
  text: string;
  choices?: SceneChoice[];
  skill?: Pick<Skill, "name" | "mastery">;
  project?: Pick<Project, "status" | "technologies">;
  contacts?: SocialLink[];
}

export interface VNScene {
  title: string;
  chapter: string;
  setting: string;
  entries: DialogueEntry[];
}

function formatSkillName(name: string) {
  switch (name.toUpperCase()) {
    case "JAVA":
      return "Java";
    case "HTML":
    case "CSS":
    case "PHP":
      return name.toUpperCase();
    case "JAVASCRIPT":
      return "JavaScript";
    default:
      return name;
  }
}

export function createVisualNovelScript(
  profile: ProfileData,
): Record<SceneId, VNScene> {
  const sectionChoices: SceneChoice[] = [
    { label: "About me", nextScene: "personal-information" },
    { label: "Skills", nextScene: "skills" },
    { label: "Projects", nextScene: "projects" },
    { label: "Contact", nextScene: "contact" },
  ];

  return {
    introduction: {
      title: "A PROFILE STORY",
      chapter: "PROLOGUE",
      setting: "LOCAL ARCHIVE // CONNECTION ESTABLISHED",
      entries: [
        {
          speaker: "SYSTEM",
          text: "A quiet archive opens. Take a moment, and follow a thread.",
        },
        {
          speaker: profile.fullName,
          text: `I'm ${profile.fullName}, a ${profile.program} student. Where would you like to begin?`,
          choices: sectionChoices,
        },
      ],
    },
    "personal-information": {
      title: "PERSONAL INFORMATION",
      chapter: "CHAPTER 01",
      setting: "IDENTITY FILE // OPEN",
      entries: [
        {
          speaker: "You",
          text: "Can you tell me a little about yourself?",
        },
        {
          speaker: profile.fullName,
          text: profile.about,
        },
        {
          speaker: profile.fullName,
          text: `Outside of IT, I enjoy ${profile.interests.map((interest) => interest.label.toLowerCase()).join(", ")}.`,
          choices: [
            { label: "Continue to skills", nextScene: "skills" },
            { label: "Visit projects", nextScene: "projects" },
            { label: "Open contact", nextScene: "contact" },
            { label: "Choose another topic", nextScene: "introduction" },
          ],
        },
      ],
    },
    skills: {
      title: "SKILLS",
      chapter: "CHAPTER 02",
      setting: "SKILL REGISTER // LIVE READOUT",
      entries: [
        {
          speaker: "You",
          text: "What kinds of skills are you working on?",
        },
        {
          speaker: profile.fullName,
          text: "I'm building my skills across a few programming and web technologies.",
        },
        ...profile.skills.map((skill) => ({
          speaker: profile.fullName,
          text: `I'm currently at ${skill.mastery}% in ${formatSkillName(skill.name)}.`,
          skill: { name: skill.name, mastery: skill.mastery },
        })),
        {
          speaker: profile.fullName,
          text: "Would you like to hear about a project next?",
          choices: [
            { label: "Continue to projects", nextScene: "projects" },
            { label: "About me", nextScene: "personal-information" },
            { label: "Open contact", nextScene: "contact" },
            { label: "Choose another topic", nextScene: "introduction" },
          ],
        },
      ],
    },
    projects: {
      title: "PROJECTS",
      chapter: "CHAPTER 03",
      setting: "WORK LOG // PROJECT RECORDS",
      entries: [
        {
          speaker: "You",
          text: "What have you been working on?",
        },
        ...profile.projects.map((project) => ({
          speaker: profile.fullName,
          text: `${project.name}. ${project.description}`,
          project: {
            status: project.status,
            technologies: project.technologies,
          },
        })),
        {
          speaker: profile.fullName,
          text: "That's what I've been working on so far. What would you like to explore next?",
          choices: [
            { label: "Continue to contact", nextScene: "contact" },
            { label: "Review skills", nextScene: "skills" },
            { label: "About me", nextScene: "personal-information" },
            { label: "Choose another topic", nextScene: "introduction" },
          ],
        },
      ],
    },
    contact: {
      title: "COMMUNICATION",
      chapter: "CHAPTER 04",
      setting: "CONTACT DIRECTORY // LOCAL PROFILE",
      entries: [
        {
          speaker: "You",
          text: "How can I get in touch with you?",
        },
        {
          speaker: profile.fullName,
          text: profile.communicationDescription,
          contacts: profile.socialLinks,
        },
        {
          speaker: profile.fullName,
          text: "Choose whichever contact channel works best for you. Would you like to see a project or wrap up?",
          choices: [
            { label: "Continue to credits", nextScene: "ending" },
            { label: "Review projects", nextScene: "projects" },
            { label: "About me", nextScene: "personal-information" },
            { label: "Choose another topic", nextScene: "introduction" },
          ],
        },
      ],
    },
    ending: {
      title: "END OF STORY",
      chapter: "CREDITS",
      setting: "SESSION COMPLETE",
      entries: [],
    },
  };
}
