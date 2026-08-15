# how-to-draw

A beginner-friendly web app that teaches kids and new artists how to draw with step-by-step lessons.

## Core scope
- **Target audience:** kids and beginners
- **Subjects:** animals, objects, and characters
- **Output format:** ordered text instructions plus optional reference images

## MVP user flow
1. Choose a lesson from the library.
2. View guided, ordered steps with materials and tips.
3. Mark steps complete as you draw.
4. Finish lesson and record completion progress.

The UI is intentionally simple and distraction-free.

## Content model
Each lesson follows a consistent structure in `data/lessons.json`:
- `id`
- `title`
- `category`
- `difficulty`
- `materials`
- `steps`
- `referenceImage` (optional)
- `tips`

## Initial lesson library
The app includes a curated starter set of lessons across:
- Easy
- Medium
- Hard

Categories include animals, objects, and characters.

## Implemented personalization
- Search by keywords
- Filter by category
- Filter by difficulty
- Favorite lessons
- Recently viewed lessons

## Implemented learning support
- Per-lesson step tracking
- Lesson completion tracking
- Daily streak tracking
- Badge milestones based on completed lessons
- Next lesson recommendation prioritizing beginner progression

## Quality standards for tutorials
The included lessons follow these standards:
- Steps are short, beginner-friendly, and sequential
- Difficulty labels are explicit
- Materials are listed before drawing begins
- Tips reinforce confidence and simple shape construction
- Reference image links are attached for visual checks

## Technical architecture
- **Frontend:** static HTML/CSS/JavaScript single-page app (`index.html`, `styles.css`, `app.js`)
- **Content storage:** local JSON lesson library (`data/lessons.json`)
- **Personal data:** browser `localStorage` for progress, favorites, recents, and streaks
- **Asset pipeline:** reference image URLs today; can migrate to local image/video assets or CMS later

## Validation and iteration plan
- Run quick usability sessions with beginners.
- Measure where learners stop (step completion and lesson completion counts).
- Identify confusing lessons via drop-off points.
- Improve wording, step granularity, and navigation from feedback.

## Post-MVP roadmap
- Community-submitted tutorials with moderation
- Optional per-step animation playback
- Multilingual support for lesson content
- CMS-backed authoring workflow for scaling content updates

## Running locally
From the project root, serve the files with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
