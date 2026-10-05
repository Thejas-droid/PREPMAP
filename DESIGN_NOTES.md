# UX decisions behind Quant Path v4

## Primary job

The app's primary job is not to manage a curriculum. The curriculum is already decided. Its job is to reduce the activation energy between opening the app and beginning the next useful study block.

## Design rules used

### 1. Today first
The first screen contains the current day's timed blocks, not analytics or a roadmap. Future planning is secondary.

### 2. One completion action
A study block has one tracker action: complete / incomplete. Learning, coding, note-taking and problem solving happen in the linked material or editor—not inside the tracker.

### 3. Progressive disclosure
The full 16-week plan, application roadmap, cloud setup and older carry-over work are secondary views. This follows established progressive-disclosure guidance: reveal detail when relevant rather than putting all possible information into the initial view.

References:
- Nielsen Norman Group, Progressive Disclosure: https://www.nngroup.com/videos/progressive-disclosure/
- Apple HIG, Disclosure Controls: https://developer.apple.com/design/human-interface-guidelines/disclosure-controls
- Apple HIG, Layout / Visual Hierarchy: https://developer.apple.com/design/human-interface-guidelines/layout

### 4. Calm feedback instead of reward noise
Progress feedback is restrained: today's completion, overall completion, weekly percentages and study streak. No coins, confetti, rank pressure or giant gamification surfaces.

A 2024 systematic review of tailored digital gamification for learning highlighted the importance of immediate responses to learner actions and adaptive/personalized use of game elements rather than simply adding more reward mechanics:
https://www.sciencedirect.com/science/article/pii/S0360131524000149

### 5. Carry-over without guilt
Unfinished blocks are acknowledged, but they are collapsed by default and explicitly do not replace today's core schedule. The app recommends addressing the most recent carry-over only after today's planned work if energy remains.

### 6. Familiar, classic product UI
The visual system uses conventional navigation, white/neutral surfaces, restrained navy/green semantic color, thin borders, modest radii, system typography, standard labels and lists. Decorative gradients, glows, generated-looking hero graphics and excessive badges were removed.

Apple's 2026 design principles emphasize familiarity, consistency, purpose, hierarchy and keeping the interface out of the way of the person's goal:
https://developer.apple.com/design/human-interface-guidelines/design-principles

## Storage model

1. Every tick saves immediately to IndexedDB.
2. If signed into cloud sync, a debounced copy is sent to the Render API.
3. The Render API stores a JSONB state in Neon Postgres.
4. A cloud outage never blocks local study.
5. JSON export/import remains available as an independent backup.

Render Free's filesystem is ephemeral and free Render Postgres expires after 30 days, which is why the persistent database is external:
https://render.com/docs/free

Neon's Free plan currently provides persistent Postgres storage suitable for a personal tracker:
https://neon.com/blog/neon-free-plan-1-gb-per-project
