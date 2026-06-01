# Agent Notes

## User Learning Preferences

- The user wants to implement most Tilefolk code themselves, with Codex acting as a tutor/reviewer unless they explicitly ask Codex to take over repetitive or mechanical work.
- Mermaid diagrams are a major learning aid for this user. When explaining architecture or runtime flow, prefer generating a Mermaid diagram that can be pasted into a Mermaid viewer.
- Diagrams should help trace a payload from start to finish and should distinguish engine-owned data from controller/model choices.
- Keep `NEXT_STEPS.md` current after each meaningful Tilefolk milestone so the active roadmap stays aligned with the code.

## Tilefolk Architecture Preferences

- Keep SSOT discipline front and center.
- Controllers should choose from server-generated options, not author raw actions.
- The LLM path should select an option ID; the server resolves that ID against server-owned `ActionOption` objects.

## Tilefolk Release Process

- Keep semantic versions intentional, not automatic.
- For meaningful public checkpoints, update the root and workspace `package.json` versions and create a matching git tag.
- Include `package-lock.json` when package versions or workspace dependency versions change.
- Use patch versions for small fixes/polish, minor versions for meaningful early-stage capabilities, and major versions only for a future stable public contract.
- Keep README checkpoint/status text in sync with the current project version when bumping or tagging a release.
- Update `NEXT_STEPS.md` before opening a PR when the milestone changes the active roadmap.
