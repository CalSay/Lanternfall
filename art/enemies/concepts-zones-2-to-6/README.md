# Accepted enemy concepts: zones 2-6

Cal accepted these five concept sheets on 10 October 2026 and requested that they be committed and pushed for Claude. These are the selected full-resolution PNGs, copied without pixel changes.

| Zone | Enemy | Accepted sheet | Selection |
|---|---|---|---|
| 2 | Gloomjaw | [gloomjaw.png](gloomjaw.png) | Three interlocking jaw plates; dark violet void bolt. |
| 3 | Briarbound Ravager | [briarbound-ravager.png](briarbound-ravager.png) | Accepted left-facing revision; cleaver-shaped right arm. |
| 4 | Thornwing | [thornwing.png](thornwing.png) | Small torso, paired crescent thorn wings and hooked feet. |
| 5 | Nightseed Sorcerer | [nightseed-sorcerer.png](nightseed-sorcerer.png) | Floating seed-shaped heart between three root claws. |
| 6 | Riftwing | [riftwing.png](riftwing.png) | Accepted version WITH glowing eyes; eyeless revision rejected. |

Every sheet is 1536 x 1024 and includes a full-body view, anatomy details and palette. The style follows the official 34-hero concept boards and the new Thorn Imp concept.

## Art decisions for Claude

- **Enemies face left; heroes face right.** Preserve that direction in future concepts and animation poses. Ravager uses the corrected left-facing v2.
- **Riftwing keeps its glowing eyes.** Cal preferred the first version after seeing an eyeless revision: "I liked the eyes." The accepted image here is that first version. It supersedes the eyeless wording in the old roster and initial prompt; do not remove the eyes in later work.
- Gloomjaw keeps the previously approved dark/violet void bolt, rather than the obsolete holy-spark description.
- This package covers the five normal zone enemies. Thorn Imp, Captains and bosses are outside this selection.

## Using the package

Use these accepted sheets as visual references for future character packs. This commit adds source concept art; it does not replace the existing Gloomjaw animation pack or wire new art into the game. Complete animation packs still follow the project art review process.

The original generation briefs and the Ravager facing correction are in [source-prompts](source-prompts/). The first Gloomjaw and Ravager briefs were annotated with the later facing rule; the resulting selected Gloomjaw already faced left and Ravager was corrected with its second prompt. Treat the decisions above and selected PNGs as the authority when an older prompt differs. In particular, all eyeless clauses in the initial Riftwing brief are superseded by the owner selection.

[manifest.json](manifest.json) records the selected source version, dimensions and SHA-256 of each PNG. [VALIDATION.md](VALIDATION.md) records verification and repository checks.
