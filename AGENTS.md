# Agent Notes

## User Learning Preferences

- The user wants to implement most Tilefolk code themselves, with Codex acting as a tutor/reviewer unless they explicitly ask Codex to take over repetitive or mechanical work.
- Mermaid diagrams are a major learning aid for this user. When explaining architecture or runtime flow, prefer generating a Mermaid diagram that can be pasted into a Mermaid viewer.
- Diagrams should help trace a payload from start to finish and should distinguish engine-owned data from controller/model choices.
- For Tilefolk specifically, reinforce the mantra: "The controller selects. The engine owns."

## Tilefolk Architecture Preferences

- Keep SSOT discipline front and center.
- Controllers should choose from server-generated options, not author raw actions.
- The LLM path should select an option ID; the server resolves that ID against server-owned `ActionOption` objects.
