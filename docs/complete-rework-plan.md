# Colorblind Simulator — Complete Product Rework Plan

**Status:** Proposed  
**Purpose:** Product direction, architectural review, target design, and backlog seed  
**Target:** A scientifically defensible, privacy-first simulator that feels equally intentional on desktop and mobile while remaining close to zero-cost to operate.

---

## 1. Executive decision

Rebuild the application as a **local-first static web app**. Keep image processing in the browser, keep deployment on GitHub Pages, and do **not** introduce a backend, database, authentication, or cloud storage for the initial rework.

The current product already has the correct low-cost foundation: React, TypeScript, browser canvas processing, and static hosting. The rework should preserve that economic advantage while replacing the current monolithic implementation with a tested simulation engine, a responsive workspace, and accessible controls.

The most important technical change is to stop reprocessing the image while the comparison divider moves. The app should:

1. Decode the source image once.
2. Generate and cache the selected simulation asynchronously.
3. Render original and simulated images as two layers.
4. Move the divider by changing only a clip/mask value.

This makes the primary interaction cheap enough to remain smooth on mobile and desktop.

### Recommended target stack

- React 19 + TypeScript.
- Current supported Vite release.
- Node 24 LTS for local development and CI.
- Browser-native APIs for image decoding, workers, storage of preferences, and sharing settings.
- CSS modules or a small token-based global stylesheet. Avoid introducing a large component system.
- Vitest + Testing Library for unit/component tests.
- Playwright for end-to-end, responsive, and accessibility checks.
- GitHub Actions + GitHub Pages for validation and deployment.

React should be retained because the rewrite cost of changing framework is not justified by the product. Framer Motion and Tailwind should only remain if the reworked UI demonstrably benefits from them. The current app primarily uses hand-written CSS, and the required motion can be implemented with small CSS transitions that respect reduced-motion preferences.

---

## 2. Product analysis

### 2.1 Current product promise

The product lets a user upload an image or open a generated demo, select a color-vision-deficiency type, and drag a divider between the original and simulated views.

### 2.2 Current feature inventory

| Area | Current capability | Assessment |
| --- | --- | --- |
| Image input | File upload | Useful core feature; needs validation, drag/drop, paste, and mobile camera support. |
| Demo | Programmatically generated landscape | Useful for onboarding, but visually artificial and weak for real accessibility evaluation. |
| Simulation types | Protanopia, deuteranopia, tritanopia | Good minimum set, but only full dichromacy is represented and scientific provenance is not exposed. |
| Comparison | Draggable before/after divider | Strong signature interaction, but current rendering strategy is expensive. |
| Controls | Desktop side panel and mobile bottom panel | Functional but layout is heavily hard-coded and behaves like two separate interfaces. |
| Education | Short descriptions and extensive README content | Good intent; important explanations should exist in the product, not only the README. |
| Privacy | Images are processed in-browser | Major product advantage, but it is not clearly communicated to the user. |
| Accessibility | Some ARIA, keyboard handling, and linting | Positive start, but drag alternatives, focus behavior, labels, help text, and mobile interaction need redesign. |
| Testing | Three main-menu rendering tests | Insufficient for the algorithm, interactions, responsive behavior, and accessibility. |
| Delivery | GitHub Actions to GitHub Pages | Correct low-cost model; workflow can be simplified and hardened. |

### 2.3 Primary audiences and jobs to be done

#### Accessibility practitioner or designer

> When I evaluate an image, chart, palette, or interface, I want to inspect likely color-confusion problems quickly so that I can improve the design before publishing it.

#### Developer or tester

> When I build a color-dependent interface, I want a repeatable simulator with clear presets and keyboard-accessible controls so that I can validate assets and screenshots during development.

#### Educator, student, or curious visitor

> When I learn about color vision deficiency, I want a clear visual comparison and trustworthy explanation so that I understand the practical effect without mistaking the simulation for a diagnosis.

#### Person with color vision deficiency

> When I review an image or palette, I want tools that help identify potentially confusing colors without the product claiming to reproduce my exact perception.

### 2.4 Product principles

1. **Trust before spectacle.** Accuracy, provenance, limitations, and plain-language explanations matter more than decorative motion.
2. **Private by default.** Images never leave the device in the core product.
3. **Instant interaction.** Moving the comparison control must not trigger image processing.
4. **No drag-only workflows.** Every drag action has buttons, keyboard controls, or another equivalent input method.
5. **One product, responsive composition.** Desktop and mobile share the same information architecture; only placement changes.
6. **Progressive enhancement.** Workers, OffscreenCanvas, camera access, and PWA behavior improve the experience but are not required for the basic workflow.
7. **No premature platform.** Add a backend only when a validated feature cannot be delivered safely in-browser.

---

## 3. Architectural review of the current implementation

### 3.1 What is already good

- Static hosting keeps operating cost effectively at zero.
- Images are processed locally, reducing privacy, security, and storage concerns.
- TypeScript, linting, tests, an error boundary, and CI are already present.
- The comparison concept is immediately understandable.
- The application has attempted mouse, touch, and keyboard support rather than treating mobile as an afterthought.

### 3.2 High-priority findings

#### A. The simulation engine and UI are coupled in one large component

`ColorWorldSplit.tsx` contains domain data, image creation, file reading, pixel transforms, canvas sizing, pointer handling, tooltip positioning, responsive behavior, and the complete UI tree. This makes changes risky and prevents focused testing.

**Recommendation:** Separate the pure color model, image pipeline, interaction state, and presentation components.

#### B. Divider movement performs expensive image work

The current render callback is dependent on slider position. Each movement creates a new `Image`, recalculates canvas dimensions, draws pixels, calls `getImageData`, transforms pixels, and calls `putImageData` on the main thread.

**Impact:** Jank, battery usage, heat, inconsistent mobile performance, and complexity in pointer handling.

**Recommendation:** Precompute the simulated bitmap once. Place original and simulated layers on top of each other and update only `clip-path`, canvas clipping, or an equivalent compositor-friendly mask while dragging.

#### C. The scientific model is not sufficiently explicit or testable

The current implementation applies three simple 3×3 matrices directly to byte-valued image data. The product does not document the exact model, color space assumptions, severity behavior, validation source, or known limitations in the UI.

**Recommendation:** Implement a pure, sourced simulation module based on an established model such as Machado, Oliveira, and Fernandes (2009), including the published correction, or Brettel, Viénot, and Mollon (1997) where appropriate. Define whether matrices operate in linear RGB, implement sRGB transfer functions correctly, and validate reference vectors in automated tests.

The tool must clearly state that simulations are approximations and are not diagnostic.

#### D. Pointer handling is duplicated and stateful

Mouse and touch interactions are implemented through several overlapping element listeners, document listeners, and effects. Some callbacks close over render-time state and the invisible touch area is independently focusable.

**Recommendation:** Use Pointer Events with pointer capture through one interaction hook. Keep one semantic slider focus target and support Arrow keys, Home, End, Page Up, and Page Down.

#### E. Mobile layout depends on fixed viewport arithmetic

The layout uses `100vh`, fixed bottom margins, fixed control heights, viewport-width branching in render, and several overlapping media-query corrections. Mobile browser chrome, safe areas, orientation changes, and small landscape screens can produce fragile layouts.

**Recommendation:** Use `100dvh` with fallback, CSS grid, safe-area insets, a responsive bottom sheet, container queries where useful, and `ResizeObserver` for the workspace.

#### F. Image fidelity is weakened by rendering styles

The image canvas uses `image-rendering: crisp-edges` and browser-specific contrast optimization. Those properties are inappropriate defaults for photographic fidelity and can visually alter the comparison.

**Recommendation:** Use normal high-quality interpolation by default and offer pixelated rendering only as an explicit option for pixel art.

### 3.3 Medium-priority findings

- Uploaded files have no explicit size, pixel-count, decoding, or unsupported-format error flow.
- Data URLs inflate memory usage and are retained in React state. Object URLs and decoded `ImageBitmap` instances are preferable.
- Tooltips are hover-only and hidden on mobile; help must work through focus and tap.
- The canvas container has `role="button"`, while its keyboard behavior merely recenters the divider. The semantic model is unclear.
- The current generated demo focuses on saturated scenery rather than representative charts, maps, forms, status indicators, and photographs.
- The application does not expose severity or anomalous trichromacy despite these being common real-world conditions.
- There is no visible privacy statement, simulation provenance, limitations note, or feedback path.
- Metadata is minimal and there is no installable/offline experience.
- The GitHub Pages SPA redirect workaround exists even though the current app has no meaningful routing.
- CI installs dependencies multiple times, tests EOL Node versions, and grants Pages permissions at workflow scope rather than only to deployment.
- Current tests validate only initial copy and button presence.

### 3.4 Dependency and delivery findings

The current repository targets React 18, Vite 4, and Node 18/20 in CI. As of this plan, React 19 is the documented current major, Vite 8 is supported, Node 24 is LTS, and Node 18 and 20 are end-of-life.

Upgrade dependencies deliberately rather than all at once:

1. Establish behavioral tests around the current product.
2. Upgrade Node/tooling and make CI green.
3. Upgrade React/Vite.
4. Refactor the product behind tests.

---

## 4. Target product scope

### 4.1 Must-have rework release

#### Image acquisition

- Choose a local raster image.
- Drag and drop on desktop.
- Paste from clipboard.
- Use camera/photo picker affordances on supported mobile browsers.
- Validate MIME type, file size, decoded dimensions, and pixel count.
- Show useful errors and recovery actions.
- State clearly: **“Processed locally — your image is not uploaded.”**

#### Simulation

- Protanopia, deuteranopia, and tritanopia.
- Protanomaly, deuteranomaly, and tritanomaly through a severity control where supported by the chosen model.
- Normal/original mode.
- Scientifically sourced implementation with reference tests.
- Plain-language explanation and model limitations.

#### Comparison workspace

- Split view with draggable divider.
- Side-by-side view.
- Press-and-hold or toggle between original and simulated views.
- Fit, zoom, pan, and reset.
- Full-screen workspace.
- Keyboard shortcuts shown in contextual help.
- Smooth divider movement without image recomputation.

#### Responsive controls

- Desktop: compact inspector alongside the workspace, collapsible without covering the image.
- Mobile portrait: bottom sheet with a persistent compact control row and expandable details.
- Mobile landscape: compact overlay or side rail that preserves the image area.
- Shared component and state model across all layouts.

#### Education and trust

- In-product explanation of each deficiency type.
- “What this can and cannot tell you” section.
- Link to research/model references.
- Accessibility guidance: do not rely on color alone, check contrast, labels, shape, pattern, and text.
- A curated sample gallery containing a photograph, chart, map, form/status UI, and palette.

#### Export

- Download the currently simulated image locally.
- Preserve original dimensions for export when memory permits.
- Add a small metadata note in the download dialog, not as a forced watermark.

### 4.2 Should-have after the core release

- Installable PWA with offline sample assets and local simulation.
- Live camera simulation using WebGL2 or another profiled real-time rendering path.
- Palette extraction and color-confusion inspection.
- A “problem areas” view that highlights pixels or palette pairs likely to collapse under the selected model.
- Shareable URL containing only non-sensitive settings such as simulation type, severity, comparison mode, and divider position.
- Embed mode for documentation and accessibility education.
- Batch processing for multiple local images on desktop.

### 4.3 Explicitly defer

These features add cost, abuse risk, privacy obligations, or operational complexity and should require product evidence before implementation:

- User accounts.
- Cloud image storage.
- Public galleries.
- Server-side website screenshots.
- Permanent share links containing uploaded images.
- Team workspaces and comments.
- Paid plans.
- AI-generated accessibility advice.

### 4.4 Remove or replace

- Replace the full-screen “main menu” with a useful empty workspace and direct image drop zone.
- Replace the generated cartoon landscape with curated representative samples.
- Remove hover-only custom tooltip positioning.
- Remove duplicated pointer/touch listeners.
- Remove `crisp-edges` as the default for images.
- Remove the SPA 404 redirect unless real path-based routes are introduced.
- Remove dependencies that are not earning their maintenance cost.

---

## 5. Target frontend architecture

### 5.1 Suggested repository structure

```text
src/
  app/
    App.tsx
    AppShell.tsx
    routes.tsx                 # only if real routes are introduced
  features/
    simulator/
      components/
        ImageDropZone.tsx
        ImageWorkspace.tsx
        ComparisonLayers.tsx
        ComparisonSlider.tsx
        SimulationControls.tsx
        MobileControlSheet.tsx
        DesktopInspector.tsx
        ZoomControls.tsx
      domain/
        cvd-model.ts
        cvd-presets.ts
        color-space.ts
        simulation-types.ts
      image/
        decode-image.ts
        image-limits.ts
        preview-sizing.ts
        export-image.ts
      worker/
        simulation.worker.ts
        simulation-client.ts
      hooks/
        useImageSource.ts
        usePointerSlider.ts
        useSimulation.ts
        useWorkspaceViewport.ts
      state/
        simulator-reducer.ts
        simulator-url-state.ts
    education/
      components/
      content/
    samples/
      sample-manifest.ts
  shared/
    components/
    hooks/
    styles/
      tokens.css
      globals.css
    lib/
  test/
    fixtures/
    helpers/
```

### 5.2 State model

Use a reducer and small focused hooks rather than a global state library initially.

Suggested state:

```ts
type SimulatorState = {
  source: ImageSource | null;
  selectedDeficiency: DeficiencyType;
  severity: number;
  comparisonMode: 'split' | 'side-by-side' | 'toggle';
  splitPosition: number;
  zoom: number;
  pan: { x: number; y: number };
  panel: 'collapsed' | 'compact' | 'expanded';
  processing: ProcessingState;
};
```

Rules:

- Keep decoded image objects and generated bitmaps outside serializable UI state where possible.
- Store only preferences in `localStorage`.
- Put safe, non-image settings in URL search parameters for shareable views.
- Never place uploaded image bytes in URLs, localStorage, logs, analytics, or error reports.

### 5.3 Image-processing pipeline

1. Validate the file before decoding.
2. Create an object URL and revoke it when replaced.
3. Decode once with `createImageBitmap` where available, with a tested fallback.
4. Create a bounded preview bitmap, for example a configurable maximum long edge, to control memory and processing time.
5. Send transferable image data or an `ImageBitmap` to a Web Worker.
6. Convert sRGB values according to the chosen model’s color-space requirements.
7. Produce the simulated preview once per type/severity combination and cache a small number of recent results.
8. Return an `ImageBitmap` to the main thread.
9. Render original and simulation as stacked layers.
10. Change only the visual clipping boundary while dragging.
11. Reprocess the original-resolution source only when the user explicitly exports.

### 5.4 Renderer decision

#### Static images

Use Canvas 2D in a worker/OffscreenCanvas path where available, with a main-thread fallback. This is simpler and easier to validate than adopting WebGL for the first release.

#### Live camera, if added

Use a GPU shader path such as WebGL2 after profiling. Do not force the static-image architecture to adopt GPU complexity before it is needed.

### 5.5 UI component design

Components should be semantic and layout-neutral:

- `ComparisonSlider` owns accessible slider semantics and pointer capture.
- `ComparisonLayers` owns clipping only.
- `SimulationControls` exposes controlled fields and contains no device-width logic.
- `DesktopInspector` and `MobileControlSheet` compose the same control components.
- `ImageWorkspace` owns zoom/pan and workspace sizing.
- Help text is rendered in accessible popovers/dialogs, not manually positioned hover tooltips.

---

## 6. Backend and database design

### 6.1 Initial decision: none required

The core product has no legitimate requirement for a backend or database. Local processing provides:

- Lowest possible hosting cost.
- No image-storage bill.
- Minimal privacy and security surface.
- No account support burden.
- Offline potential.
- Fast global delivery through static hosting.

Use GitHub Pages until a validated requirement conflicts with its limitations. A custom static host can be considered later for custom response headers, edge analytics, or preview environments.

### 6.2 Trigger for introducing a backend

A backend is justified only if at least one approved feature requires:

- Durable cross-device projects.
- Team collaboration.
- Server-generated screenshots.
- Permanent image share links.
- Paid entitlements.
- Moderated public content.

### 6.3 Conditional backend design

If durable projects become necessary, use a small serverless API, object storage for binaries, and a serverless relational database for metadata. Keep image-processing jobs separate from the interactive API.

Logical entities:

```text
User
- id
- provider_subject
- created_at
- deleted_at

Project
- id
- owner_id
- title
- source_asset_id
- created_at
- updated_at

Asset
- id
- owner_id
- storage_key
- sha256
- media_type
- width
- height
- bytes
- created_at
- expires_at

SimulationPreset
- id
- project_id
- deficiency_type
- severity
- comparison_mode
- split_position
- created_at
- updated_at

Share
- id
- project_id
- token_hash
- expires_at
- revoked_at
- created_at
```

Design rules:

- Store images in object storage, never in database rows.
- Hash share tokens at rest.
- Default shares to expiry.
- Separate user-owned assets from public derivatives.
- Add lifecycle deletion and account-erasure jobs before launch.
- Store model version with saved presets so results remain reproducible after algorithm upgrades.
- Keep anonymous/local mode available even if accounts are introduced.

---

## 7. UI/UX redesign

### 7.1 Information architecture

The primary experience should be a single workspace:

1. App bar: product name, privacy indicator, help/about, optional install action.
2. Workspace: image, comparison, zoom/pan, loading/error states.
3. Primary controls: deficiency, severity, comparison mode.
4. Secondary controls: image replacement, export, sample gallery, display options.
5. Education panel/dialog: explanation, limitations, references, accessibility advice.

Avoid a separate landing/menu screen that makes users choose between “upload” and “demo” before seeing the product.

### 7.2 Desktop composition

- Workspace takes the majority of the viewport.
- Inspector is approximately content-width, not full-height by necessity.
- Inspector can collapse to an icon rail while remaining keyboard reachable.
- Comparison labels attach to their respective image regions and remain legible at extreme divider positions.
- Drop zone supports the whole empty workspace.

### 7.3 Mobile composition

- Use dynamic viewport units and safe-area padding.
- Keep the image workspace visible while controls expand.
- A compact bottom bar contains deficiency, comparison mode, and expand action.
- Expanded controls appear in a bottom sheet with defined snap states.
- Slider touch target is large while the visible divider remains precise.
- Camera/photo picker is a first-class input action.
- Landscape mode uses available width rather than stacking a tall control panel below the image.

### 7.4 Accessibility requirements

Target WCAG 2.2 AA.

- Divider is an ARIA slider with an accessible name, current value, min/max, and keyboard support.
- Provide buttons for 0%, 50%, and 100%, or Original / Split / Simulated equivalents, so dragging is never required.
- Minimum target sizing follows WCAG 2.2 and should generally aim for 44×44 CSS pixels for touch comfort.
- Focus is always visible and never obscured by the mobile control sheet.
- No meaning is communicated by color alone.
- Motion respects `prefers-reduced-motion`.
- Status updates such as processing, completion, and errors are announced appropriately.
- Help content works on hover, focus, touch, and screen readers.
- The uploaded image receives user-editable alt/context text only where the UI meaningfully exposes it; do not invent visual descriptions.
- Screen readers can access textual simulation settings and limitations even though the pixel result itself is visual.
- Full keyboard flow is covered by automated and manual tests.

### 7.5 Visual direction

- Neutral dark and light surfaces that do not compete with the image.
- A small, accessible token system for spacing, type, radius, elevation, focus, and semantic states.
- Avoid using the product’s own accent colors as proof of accessibility.
- Make “Normal” and simulated states distinguishable through text, placement, shape, and optional pattern—not green/orange alone.
- Use restrained motion only for state continuity.

---

## 8. Security, privacy, and resilience

- Accept an explicit list of raster formats; reject or carefully sandbox SVG and other active formats.
- Apply file-size, decoded-dimension, and total-pixel limits before allocating large canvases.
- Downsample previews to avoid memory exhaustion on mobile.
- Revoke object URLs and close `ImageBitmap` resources.
- Never transmit uploaded pixels without an explicit future feature and consent flow.
- Add a restrictive Content Security Policy appropriate for static hosting.
- Keep third-party scripts out of the core page.
- Avoid analytics initially. If analytics are later justified, collect only coarse product events and never filenames, image data, dimensions that could fingerprint content, or settings tied to an identity.
- Provide a graceful fallback when workers, OffscreenCanvas, clipboard access, camera access, or PWA APIs are unavailable.
- Error messages should distinguish unsupported format, oversized image, decode failure, memory pressure, and unexpected processing failure.

---

## 9. Quality strategy

### 9.1 Unit tests

- sRGB linearization and companding.
- Matrix/model output against published or independently generated reference vectors.
- Severity interpolation.
- Clamping and alpha preservation.
- Preview sizing and memory guards.
- Slider position and keyboard increments.
- Reducer transitions.
- URL-state parsing and sanitization.

### 9.2 Component tests

- Upload, paste, drop, replace, and error recovery.
- Deficiency and severity selection.
- Loading and cancellation when settings change rapidly.
- Accessible slider behavior.
- Mobile control-sheet focus management.
- Export states.
- Reduced-motion behavior.

### 9.3 End-to-end tests

Test at representative desktop, tablet, small phone, large phone, and mobile-landscape viewports.

Critical journeys:

1. Open sample → change simulation → drag and keyboard-adjust divider.
2. Upload image → zoom/pan → switch comparison mode → export.
3. Paste image → trigger validation error → recover.
4. Complete core journey using keyboard only.
5. Complete core journey using touch emulation.
6. Reload a URL containing safe settings.
7. Run offline after installation, if PWA is included.

### 9.4 Visual and algorithm regression

- Commit small licensed test fixtures.
- Generate deterministic output snapshots for key presets.
- Compare output with a tolerance rather than exact browser-dependent bytes where necessary.
- Add responsive visual snapshots for the empty, processing, workspace, expanded-controls, and error states.

### 9.5 Performance budgets

Define and measure budgets on reference hardware rather than relying only on Lighthouse:

- Divider movement remains compositor-only and visually smooth.
- Source decoding and preview simulation do not block input for long tasks.
- A typical phone photo produces a usable preview within an agreed target on a mid-range phone.
- Preview dimensions are bounded.
- JavaScript bundle size is reviewed in CI.
- No unnecessary rerenders during pointer movement.

---

## 10. CI/CD and maintenance design

### 10.1 Pull-request validation

Use one primary Node 24 LTS job for:

```text
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Run Playwright in a separate job after the build or on protected pull requests. Avoid repeating `npm ci` across a broad Node matrix unless the project explicitly supports a reusable library across Node versions.

### 10.2 Deployment

- Deploy only from `main` after validation.
- Scope `pages: write` and `id-token: write` permissions to the deployment job.
- Use the official GitHub Pages artifact/deploy actions.
- Add `workflow_dispatch` for controlled redeployment.
- Use a concurrency group that prevents stale deployments.
- Consider preview deployments only if a zero/low-cost provider can deliver them without adding operational burden.

### 10.3 Dependency maintenance

- Pin the Node major through `.nvmrc` or `.node-version` and `engines`.
- Enable monthly Dependabot or Renovate updates.
- Group low-risk development dependency updates.
- Treat major Vite/React upgrades as explicit maintenance tasks with migration notes.
- Remove `gh-pages` if deployment uses only the official Pages workflow.
- Remove Framer Motion or Tailwind if the rework no longer uses them.

### 10.4 Documentation

Keep these short and current:

- README: product, privacy promise, local setup, deployment, limitations.
- Architecture decision records for simulation model, local-first hosting, and rendering pipeline.
- CONTRIBUTING: validation commands and accessibility expectations.
- Model references and versioning policy.

---

## 11. Delivery plan

### Phase 0 — Baseline and decisions

- Record current behavior and known issues.
- Choose and document the scientific model.
- Define supported browsers, image limits, and target devices.
- Add baseline interaction and output fixtures.
- Decide whether React 19/Vite 8 upgrades happen before or during the component rewrite.

**Exit:** Approved ADRs, reference fixtures, measurable acceptance criteria.

### Phase 1 — Foundation

- Upgrade supported tooling and CI.
- Introduce design tokens and app shell.
- Create feature-based folder structure.
- Add reducer/state model.
- Add error/result types and cancellation model.

**Exit:** Empty responsive workspace deployed with green CI.

### Phase 2 — Simulation engine

- Implement sourced color-space/model functions.
- Add unit/reference tests.
- Add worker client and fallback.
- Add preview sizing, caching, cleanup, and cancellation.

**Exit:** Deterministic simulator API independently tested from React.

### Phase 3 — Core workspace

- Implement image input flows.
- Implement stacked comparison layers.
- Implement pointer-capture slider and alternatives.
- Add zoom, pan, reset, loading, and errors.
- Add side-by-side and toggle modes.

**Exit:** Core journey works smoothly on reference desktop and mobile devices.

### Phase 4 — Responsive UX and accessibility

- Add desktop inspector and mobile control sheet using shared controls.
- Add safe-area/dynamic-viewport handling.
- Add education, limitations, privacy copy, and samples.
- Complete keyboard, screen-reader, touch, reduced-motion, and focus testing.

**Exit:** WCAG 2.2 AA review complete with no critical issues.

### Phase 5 — Export and release hardening

- Add original-resolution export with resource limits.
- Add visual/e2e tests and performance budgets.
- Harden CSP, file validation, and error recovery.
- Remove unused dependencies and obsolete code.
- Update documentation and release checklist.

**Exit:** Rework release ready to replace the current application.

### Phase 6 — Evidence-driven extensions

Prioritize PWA, live camera, palette analysis, problem highlighting, embed mode, or batch processing based on usage and feedback. Backend-dependent ideas remain separate discovery initiatives.

---

## 12. Epic and user-story seed

### Epic A — Scientific simulation foundation

- **A1:** As a user, I can see which simulation model and version is used so that I can judge the result’s provenance.
- **A2:** As a user, I can select a deficiency type and severity so that I can explore dichromacy and anomalous trichromacy.
- **A3:** As a maintainer, I have reference-vector tests so that model changes cannot silently alter results.
- **A4:** As a user, I am told that the simulation is approximate and not diagnostic.

### Epic B — Private image input

- **B1:** As a user, I can choose a local image.
- **B2:** As a desktop user, I can drag/drop or paste an image.
- **B3:** As a mobile user, I can choose a photo or camera source where supported.
- **B4:** As a user, I receive a recoverable error for unsupported or oversized images.
- **B5:** As a privacy-conscious user, I can verify that my image stays on my device.

### Epic C — Fast comparison workspace

- **C1:** As a user, I can move a split divider smoothly without waiting for the image to reprocess.
- **C2:** As a keyboard user, I can adjust the divider and jump to useful positions.
- **C3:** As a user, I can switch between split, side-by-side, and toggle comparison.
- **C4:** As a user, I can zoom, pan, fit, and reset the image.
- **C5:** As a user, I can cancel or supersede processing by choosing another setting.

### Epic D — Responsive product shell

- **D1:** As a desktop user, I can collapse controls without losing access to them.
- **D2:** As a mobile user, I can expand controls without covering the entire image.
- **D3:** As a landscape-phone user, I retain a useful image workspace.
- **D4:** As a user with reduced-motion preferences, transitions are minimized.
- **D5:** As a user, the app remains usable with browser zoom and text scaling.

### Epic E — Education and accessibility guidance

- **E1:** As a learner, I can understand each deficiency type in plain language.
- **E2:** As a designer, I can review practical guidance beyond the simulation itself.
- **E3:** As a user, I can open representative samples without uploading a file.
- **E4:** As a user, I can access help with mouse, keyboard, touch, and screen reader.

### Epic F — Export and sharing

- **F1:** As a user, I can download the simulated image locally.
- **F2:** As a user, I can copy a safe URL that shares settings without sharing my image.
- **F3:** As a maintainer, exports record the simulation model version in optional metadata or filename conventions.

### Epic G — Engineering quality

- **G1:** As a maintainer, pull requests run format, lint, type, unit, build, and selected e2e checks.
- **G2:** As a maintainer, unsupported Node and Vite versions are removed.
- **G3:** As a maintainer, worker and main-thread fallbacks are tested.
- **G4:** As a maintainer, responsive visual regressions are detected.
- **G5:** As a maintainer, deployment permissions are least-privilege.

### Epic H — Optional advanced tools

- **H1:** Live camera simulation.
- **H2:** Palette extraction and color-confusion pairs.
- **H3:** Problem-area highlighting.
- **H4:** Offline/PWA install.
- **H5:** Local batch processing.
- **H6:** Embeddable viewer.

---

## 13. Definition of done for product stories

A story is complete only when applicable criteria are met:

- Acceptance criteria are covered by automated tests.
- Keyboard and touch behavior are verified.
- Focus order and visible focus are correct.
- No meaning depends on color alone.
- Loading, empty, error, and recovery states exist.
- Mobile portrait, mobile landscape, and desktop layouts are reviewed.
- Processing does not expose or transmit image data.
- Model changes include reference tests and version notes.
- User-facing copy includes limitations where needed.
- Performance is checked against the agreed reference case.
- Documentation is updated when behavior or architecture changes.

---

## 14. Key architecture decisions to record

1. **ADR-001: Local-first static application; no backend for core release.**
2. **ADR-002: Scientific simulation model and color-space pipeline.**
3. **ADR-003: Precomputed image layers with clip-only divider interaction.**
4. **ADR-004: Worker-based processing with progressive fallback.**
5. **ADR-005: Responsive inspector/bottom-sheet composition using shared controls.**
6. **ADR-006: Privacy and supported image-format policy.**
7. **ADR-007: Model versioning and regression fixture policy.**

---

## 15. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Simulation appears authoritative despite being approximate | Prominent limitations, sourced model, versioning, and expert review. |
| Large images crash mobile tabs | Pixel limits, bounded previews, worker processing, cleanup, and export safeguards. |
| Severity control implies clinical precision | Use plain-language scale, explain approximation, and avoid diagnostic wording. |
| Worker/browser differences cause output drift | Reference tests, tolerances, and a single canonical algorithm. |
| Responsive controls obscure the image | Shared control model, defined bottom-sheet states, safe areas, and viewport e2e tests. |
| Dependency upgrade consumes the rewrite | Baseline tests, staged migrations, and remove unnecessary packages. |
| A future backend erodes the privacy promise | Keep anonymous local mode, explicit feature boundary, and data-retention design. |

---

## 16. Success measures

Initial success should be measured without invasive analytics:

- Core journey succeeds on agreed desktop and mobile browser matrix.
- Divider interaction remains smooth because it performs no pixel transformation.
- Model reference tests pass and model/version are visible in the product.
- No critical WCAG 2.2 AA issues in automated and manual review.
- Typical mobile photo can be loaded, simulated, compared, and exported without a tab crash.
- Production hosting remains static and requires no paid runtime service.
- A new contributor can understand the simulation pipeline and run all checks from documented commands.

If privacy-preserving analytics are later introduced, useful product metrics include image-input success rate, processing failure category, comparison-mode usage, export completion, sample usage, and device class. Never collect image content or filenames.

---

## 17. References

- Current application: `src/components/ColorWorldSplit.tsx`
- Current styles: `src/components/ColorWorldSplit.css`
- Current tests: `src/components/__tests__/ColorWorldSplit.test.tsx`
- Current delivery: `.github/workflows/deploy.yaml`
- Machado, Oliveira, Fernandes (2009), *A Physiologically-Based Model for Simulation of Color Vision Deficiency*: https://doi.org/10.1109/TVCG.2009.113
- Published correction: https://doi.org/10.1109/TVCG.2010.10
- Brettel, Viénot, Mollon (1997), *Computerized simulation of color appearance for dichromats*: https://doi.org/10.1364/JOSAA.14.002647
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Node release status: https://nodejs.org/en/about/previous-releases
- React versions: https://react.dev/versions
- Vite supported releases: https://vite.dev/releases
- GitHub Pages publishing with Actions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
