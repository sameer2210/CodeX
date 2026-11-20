# CodeX Design System

**Status:** Directional proposal; validate with student prototypes and usability feedback.

## Product feel
Modern, focused, welcoming, developer-oriented, motivating. Avoid clutter and enterprise-admin styling.

## Principles
- One clear primary task per screen.
- Connect code, visualization, and explanation.
- Make participant presence, connectivity, edit permissions, and shared state visible.
- Explain hints, scores, and recommendations.
- Accessibility: keyboard support, visible focus, readable contrast, semantic labels, reduced motion.
- Responsive layouts that remain useful on small screens rather than shrinking desktop UI.

## Visual foundation
Use a neutral surface palette and restrained accent. Define semantic tokens for background, surface, text, muted text, border, focus, success, warning, and error. Support light/dark themes only if both can be maintained and tested. Audit current typography and component conventions before replacing them. Define spacing, radius, elevation, and motion tokens centrally.

## Core patterns
- Learning path: topic, objective, prerequisites, progress, next action.
- Problem page: statement, constraints, examples, hints, editor, tests, submissions, complexity, discussion.
- Study room: participants, connection status, editor, chat, run/submit controls, call controls.
- AI mentor: progressive hints, explanation, review, complexity, compare approaches; label AI output.
- Contest: authoritative countdown, rules, submissions, results, accessible leaderboard.
- Visualization: play/pause, next/previous, reset, speed, state explanation, text alternative.
- System Design: canvas, components, connections, scenario, constraints, bottlenecks, rubric.

## Component states
Consider default, hover, focus, active, disabled, loading, success, error, empty, and offline as applicable.

## Motion
Use animation to explain state changes or algorithm steps, not only decoration. Respect reduced-motion preferences.

## Design acceptance
Test mobile/tablet/desktop, keyboard navigation, focus, contrast, overflow, loading/error states, and consistency with existing components.
