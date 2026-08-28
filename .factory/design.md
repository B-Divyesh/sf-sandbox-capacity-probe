# Visual thesis: topographic operations chart

Sandbox Capacity Probe looks like a field map used before entering uncertain terrain. Capacity is not presented as an abstract dashboard score: contour lines, survey marks, elevation bands, and a single measured route make the idea of an operating envelope tangible. The system is intentionally light, papery, and technical rather than dark-terminal generic.

## Palette

- `paper` #F2F0E7 and `paper-raised` #FAF9F4: warm map stock that keeps dense technical copy calm.
- `ink` #17251F and `ink-muted` #516057: deep forest inks; body contrast on paper exceeds 7:1.
- `contour` #B7B9A9: low-emphasis terrain rules, never used for body text.
- `survey` #C04A2B with `survey-dark` #8D311B: vermilion field marks and the primary action; white text is used only on `survey-dark`.
- `altitude` #23695A: measured/safe states; paired with a label or icon.
- `amber` #8A5B06 and `danger` #9D2D32: warning and unsafe states, always stated in words.
- Dark treatment uses `night` #101814, `night-raised` #18231E, `night-ink` #F2F0E7, and restrained `night-contour` #48534B. It is available via the user’s system preference while the printed-report treatment stays light.

## Type

The interface uses the system sans stack (`Inter`-like proportions where available) for prose and the system monospace stack for commands, measurements, coordinates, and labels. No font files or third-party requests are needed. Headings are slightly condensed with tight tracking; numeric tables use tabular figures. The scale is 14 / 16 / 20 / 26 / 40 / 64 px on an 8 px rhythm.

## Layout and spacing

The page follows a 12-column survey grid, with a maximum reading width of 1184 px. Spacing is built on 4 px and 8 px units: 8 for paired metadata, 16 for controls, 24 for groups, 48–72 for sections. Rules and map labels create hierarchy before cards. Panels are reserved for independent instruments such as the planner or benchmark sample.

At 390 px, the map legend collapses, comparison columns stack, code lines scroll, and the fixed purchase action becomes an in-flow button. Content order remains: promise, proof, runbook, planner, purchase.

## Interaction grammar

Controls behave like survey tools: selection moves a crosshair, calculated values settle into contour bands, and copied commands show a stamped `Copied` state. Focus is a 3 px teal outline with offset. Every target is at least 44 px. Planner changes update a nearby text summary through a polite live region. Errors state both the failed measurement and the corrective command.

## Motion

Only one entrance motion is used: contour strokes reveal once over 600 ms while the hero loads. Interface transitions are 160–220 ms and limited to opacity and transform. Nothing loops. Under `prefers-reduced-motion: reduce`, contour reveal and all smooth movement become instant opacity changes.

## Original asset plan and provenance

`site/public/topographic-envelope.webp` is an original generated illustration: an oblique topographic relief of an abstract container fleet with a vermilion survey route and safe operating plateau. It contains no text or logos so that accessible HTML owns meaning. Generated for this product with `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment, then converted locally to WebP. Prompt and deployment metadata are retained beside the source during generation; the committed WebP is used as decorative context with a descriptive alt because it communicates the bounded-envelope metaphor.

Small contour dividers, crosshairs, and the product mark are deterministic CSS/SVG authored in-repository. They use no external icon set.
