# My Profile — A Profile Story

This project presents Christian Dave Mainit's profile as a short, playable
visual novel. Start at the title screen, advance the dialogue, and choose a
topic to explore. The story runs locally in the browser and uses no backend or
external game engine.

## Run locally

```sh
npm install
npm run dev
```

Use the on-screen Continue button, click the dialogue, or press Enter/Space to
advance. When a line is still typing, the first input reveals it; the next
advances. Topic choices appear at the end of a scene.

The in-game command bar adds a dialogue log (also available with Backspace),
automatic advance, read-line skip, and slow/normal/fast text speed settings.
Open Settings for a quick save; saved progress is stored in this browser and
can be resumed from the title screen. Automatic advance pauses at choices.

## Edit the profile and story

- `data/profile.json` holds the profile details.
- `lib/profile-data.ts` exposes the typed profile data.
- `data/visual-novel-script.ts` defines the scenes, dialogue, choices, and
  profile-driven skill, project, and contact readouts.
- `app/components/` contains the title, scene, portrait, dialogue, choices, and
  credits UI.

The story is a client-side React experience on the existing Next.js App Router
and TypeScript foundation. Profile and story content are bundled with the app;
no database, credentials, or audio assets are required.

## Checks

```sh
npm run lint
npm run build
```
