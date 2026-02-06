# Planning Guide

A multi-mode AI reasoning and creative production assistant that exposes five distinct capabilities—structural analysis (Chadrak), narrative refinement (Nova), execution planning (Triad), professional audio brief generation (Audio Studio), and professional video brief generation (Video Studio)—allowing users to examine their ideas through different cognitive lenses, create production-ready scripts and prompts for external AI audio/video tools, or combine all three reasoning cores for comprehensive insight.

**Experience Qualities**:
1. **Professional** - The interface should feel like a serious analytical and creative tool, not a toy, with clear delineation between modes and outputs that command respect.
2. **Efficient** - Users should move quickly between cores, see results clearly, and understand which mode to use when without friction or confusion.
3. **Insightful** - The experience should create "aha" moments by revealing different facets of the same input, making visible what was previously invisible in the user's thinking, and enabling creative multimedia expression.

**Complexity Level**: Light Application (multiple features with basic state)
  - Five distinct modes (three reasoning cores plus audio/video generation) plus a combined view, with text input/output, media generation, and mode switching, but no accounts or complex data structures.

## Essential Features

### AI Engine Selection
- **Functionality**: Users can select from top-tier AI engines across multiple providers: OpenAI (GPT-4o, GPT-4o Mini), Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus), and Google (Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash), with selections persisting across sessions via the Spark runtime - no API keys required
- **Purpose**: Give users access to the best AI models from multiple providers, allowing them to choose optimal engines based on quality/speed/capability trade-offs for each type of analysis
- **Trigger**: User opens engine selector dropdown in any core view
- **Progression**: User clicks engine selector → optionally filters by provider (All/OpenAI/Anthropic/Google) → sees available engines with descriptions, speed indicators (fast/balanced/powerful/ultra), cost tier badges (economy/standard/premium/ultra-premium), and color-coded provider badges → selects preferred engine → selection saves automatically → used for all subsequent analyses in that core
- **Success criteria**: Engine selection displays all providers clearly, includes helpful descriptions and visual indicators (Lightning for fast, Gauge for balanced, Rocket for powerful, Brain for ultra), color-coded provider badges (green for OpenAI, amber for Anthropic, blue for Google), filter by provider works smoothly, persists across sessions, each core maintains independent engine preference in Tri-Core mode

### Core Mode Selection
- **Functionality**: Users can choose between Chadrak (structural), Nova (narrative), Triad (execution), Audio AI (audio generation), Video AI (video generation), or Tri-Core (all three reasoning cores) modes
- **Purpose**: Different types of problems benefit from different reasoning approaches—structure for analysis, narrative for communication, execution for implementation, and creative modes for multimedia content generation
- **Trigger**: User clicks on a mode card or navigation element
- **Progression**: Landing page → mode selection → input interface with mode-specific guidance
- **Success criteria**: Clear visual distinction between modes, obvious current mode indicator, seamless switching

### Single Core Analysis (Chadrak/Nova/Triad)
- **Functionality**: User selects AI engine from multiple providers (OpenAI, Anthropic, Google) with models ranging from fast economy options to ultra-premium reasoning engines, enters text, system applies mode-specific reasoning using selected engine through Spark runtime, displays formatted result
- **Purpose**: Allow focused analysis through one cognitive lens at a time with user's choice of best-in-class AI models from leading providers for optimal balance of quality, speed, and capability based on task requirements
- **Trigger**: User selects engine from available options across providers, enters text and clicks "Analyze" (or mode-specific button)
- **Progression**: User selects engine (Claude 3.5 Sonnet for top-tier reasoning, GPT-4o for multimodal tasks, Gemini 1.5 Pro for massive context, or economy options for faster responses) → types input → clicks analyze button → loading state → formatted result appears → user can change engine or edit input and re-run
- **Success criteria**: Response appears within appropriate timeframe based on selected engine, formatting is readable, user can iterate quickly, engine selection persists across sessions, visible indicators show which provider and engine is being used, all major providers work reliably

### Audio Studio - Professional Brief Generator
- **Functionality**: User selects AI engine from multiple providers (OpenAI, Anthropic, Google) with models optimized for creative tasks, chooses mode (voiceover/music/sound design), fills in context fields (genre, tempo, tone, duration), describes audio need, AI generates comprehensive professional brief including script, specifications, and optimized prompts for external AI audio tools (ElevenLabs, Suno, Udio, etc.)
- **Purpose**: Prepare production-ready scripts and prompts that users can copy and paste into AI audio generation services to get professional results without needing audio production expertise
- **Trigger**: User selects engine from available options across providers, fills form fields, enters description and clicks "Generate Audio Brief"
- **Progression**: User selects engine (Claude 3.5 Sonnet for detailed creative briefs, Gemini 1.5 Flash for efficient generation, or GPT-4o for comprehensive audio direction) → chooses mode (voiceover/music/soundscape) → fills contextual fields → enters main idea → clicks generate → AI creates structured brief with sections for audio brief, detailed script/specification, AI tool prompt, usage notes → user copies sections or entire brief to clipboard → pastes into external AI tool
- **Success criteria**: Brief generates within appropriate timeframe based on selected engine, output includes all required sections (audio brief, script/specs, AI prompt, usage notes), copy functionality works for sections and full brief, realistic and professional tone focused on text outputs not actual audio generation, all providers deliver quality results

### Video Studio - Professional Brief Generator
- **Functionality**: User selects AI engine from multiple providers (OpenAI, Anthropic, Google) with models suited for creative and detailed planning tasks, fills platform/audience/duration/tone fields, describes video concept, AI generates comprehensive production package including video brief, timestamped script, scene breakdown with visual descriptions, and optimized prompts for external AI video tools (Runway, Pika, Synthesia, etc.)
- **Purpose**: Create production-ready storyboards, scripts, and scene-specific prompts that users can use with text-to-video AI services to produce professional video content without video production expertise
- **Trigger**: User selects engine from available options across providers, fills form fields, enters description and clicks "Generate Video Brief"
- **Progression**: User selects engine (Claude 3.5 Sonnet for comprehensive production planning, Gemini 1.5 Pro for detailed storyboarding with massive context, or GPT-4o for multimodal-aware briefs) → selects platform (YouTube/TikTok/Training/Marketing) → fills audience/duration/tone → enters video idea → clicks generate → AI creates structured brief with sections for video brief, full script with timestamps, scene breakdown with visual descriptions, prompts for video AI tools, production notes → user copies sections or entire brief → uses prompts with external video AI services
- **Success criteria**: Brief generates within appropriate timeframe based on selected engine and complexity, output includes all sections (brief, script, scene breakdown, AI prompts, production notes), realistic about not generating actual video, copy functionality works, provides actionable guidance for external AI video tools, all providers deliver production-quality briefs

### Tri-Core Combined Analysis
- **Functionality**: User selects independent AI engine for each core (Chadrak, Nova, Triad) from all worldwide providers (OpenAI, Anthropic, Google), runs the same input through all three cores simultaneously using their selected engines via Spark runtime, displays three outputs side-by-side
- **Purpose**: Comprehensive perspective on complex ideas with user control over quality/speed/capabilities for each reasoning type from different worldwide AI providers, revealing trade-offs and relationships between structure, narrative, and execution with the flexibility to mix and match best-in-class engines (e.g., Claude Opus for Chadrak's deep analysis, GPT-4o for Nova's creativity, Gemini Pro for Triad's planning)
- **Trigger**: User selects engines for each core from worldwide options and runs analysis
- **Progression**: User selects engine for each core (can mix providers: Claude for one core, GPT for another, Gemini for third) → enters input → clicks "Run Tri-Core" → three simultaneous API calls with selected worldwide engines → loading indicators → three-column result display
- **Success criteria**: All three responses visible without scrolling horizontally on desktop, clear labels for each core's output showing both core name and selected worldwide engine/provider, responses align temporally, independent engine selection for each core persists across all 11 worldwide options, visible indicators show which worldwide engine and provider each core is using

### Input Persistence
- **Functionality**: User's input text persists between sessions and when switching modes
- **Purpose**: Users can refine their input and compare results across modes without re-typing
- **Trigger**: Automatic on text change
- **Progression**: User types text → switches mode → returns to find text preserved
- **Success criteria**: No data loss when switching modes or refreshing page

### Theme Toggle
- **Functionality**: Users can toggle between dark and light themes with a single click, with preference persisting across sessions
- **Purpose**: Provide visual comfort for different lighting conditions and user preferences while maintaining the futuristic aesthetic in both modes
- **Trigger**: User clicks theme toggle button in sidebar footer
- **Progression**: User clicks toggle → smooth animation transitions icon (Moon ↔ Sun) → theme switches immediately → all components adapt colors → preference saves to localStorage
- **Success criteria**: Instant theme switching, smooth icon animation, all components properly styled in both themes, particle background adapts colors, theme preference persists across sessions

### Mobile Navigation with Swipe Gestures
- **Functionality**: Mobile users can open the sidebar menu via hamburger button or edge swipe gesture, close it via X button, backdrop tap, or swipe-to-dismiss gesture, with smooth animations and haptic-like feedback
- **Purpose**: Provide intuitive, modern mobile navigation that feels natural on touch devices, reducing friction for mobile users accessing different AI modes and settings
- **Trigger**: User taps hamburger menu button in top-left corner, or swipes from left edge of screen (within 30px) with 80px minimum swipe distance
- **Progression**: User approaches left edge → subtle edge indicator appears → swipes right → sidebar slides in with spring animation → user navigates or reads → swipes left on sidebar or taps backdrop → sidebar dismisses smoothly → returns to main content
- **Success criteria**: Edge swipe detection works reliably on touch devices, hamburger button has pulsing hint indicator for first-time users, sidebar can be dragged/swiped to close with velocity detection (500px/s threshold), smooth spring animations (damping: 25, stiffness: 200), swipe progress indicator visible during drag, "Swipe left to close" hint shows on mobile, backdrop darkens/blurs when open, navigation closes sidebar after selection, works seamlessly on all mobile screen sizes

### Conversation History
- **Functionality**: Each core mode maintains a persistent history of all analyses with timestamps, allowing users to review and revisit past work
- **Purpose**: Enables users to track their analytical journey, compare how their thinking evolved, and reference previous insights without re-running analyses
- **Trigger**: Automatically saved after each successful analysis
- **Progression**: User runs analysis → result appears → entry automatically saved to history → user clicks history panel → selects entry → full detail modal appears
- **Success criteria**: History persists between sessions, displays in reverse chronological order, allows viewing full input/output, supports deletion of individual entries or clearing all

### Offline Mode with Cached Responses
- **Functionality**: All AI responses are automatically cached locally and can be reused when offline or when the same prompt is run again, with clear visual indicators showing when cached responses are used
- **Purpose**: Enable users to work offline, reduce latency for repeated queries, provide instant responses for previously-asked questions, and reduce API costs
- **Trigger**: Automatically caches every successful AI response; loads from cache when online for matching prompts or when offline
- **Progression**: User runs analysis → system checks cache for matching prompt+engine combination → if found, loads instantly with "Cached" badge → if not found or online, fetches from AI and caches result → user can view all cached responses in Cache Management panel → can clear individual entries or entire cache
- **Success criteria**: Responses cache automatically after each API call, cached responses load instantly (<100ms), cache indicator badge appears on outputs, offline mode works seamlessly with cached data, cache management panel shows all cached responses with stats, supports viewing/deleting individual cache entries, persists across sessions, works in both single-core and tri-core modes

## Edge Case Handling

- **Empty Input** - Disable run button or show friendly prompt when textarea is empty
- **API Failure** - Display clear error message with retry option, preserve user's input
- **Very Long Input** - Warn user if input exceeds practical token limits (~3000 words)
- **Concurrent Requests** - Disable submit button during processing to prevent duplicate calls
- **Mobile Layout** - Stack Tri-Core outputs vertically instead of side-by-side; history panel appears below on mobile; brief generators adapt to mobile screens with stacked form fields
- **Mobile Sidebar** - Hamburger menu positioned to avoid touch zones, edge swipe only triggers from left 30px of screen to prevent accidental activation, swipe velocity threshold prevents unintended closes, sidebar remains accessible on all screen orientations
- **Swipe Conflicts** - Edge swipe disabled when sidebar is closed on desktop (only active on mobile <1024px), does not interfere with scrolling or other gestures, vertical scrolling takes precedence over horizontal swipe detection
- **Menu Discovery** - First-time mobile users see pulsing indicator on hamburger button to encourage exploration, edge swipe indicator appears briefly when user touches left edge to teach gesture
- **Large History** - History panel scrolls smoothly with efficient rendering for 100+ entries
- **Deleting Current View** - If user deletes a history entry they're currently viewing in the modal, gracefully close the modal
- **Brief Generation Failures** - Show clear error messages if AI brief generation fails, preserve user's form data and prompt for retry
- **Browser Clipboard Support** - Gracefully handle browsers that don't support clipboard API with fallback message
- **Copy Feedback** - Provide clear visual feedback when sections are copied to clipboard
- **Theme Transition** - Ensure smooth visual transition when switching themes without jarring content shifts or particle disruption
- **Theme Persistence** - Default to dark theme for first-time users; load saved preference on subsequent visits
- **Engine Selection Defaults** - If no engine is selected, default to GPT-4o; if stored engine becomes unavailable, fallback gracefully to default; first-time users see GPT-4o as recommended starting point
- **Mixed Engine Performance** - In Tri-Core mode with different worldwide providers and engines selected, faster engines (Claude Haiku, GPT-4o-mini, Gemini Flash) complete first while others (Claude Opus, o1, Gemini Pro) continue loading independently, showing individual progress per core
- **Provider Diversity** - Users can mix and match providers in Tri-Core mode (e.g., Claude for Chadrak, GPT for Nova, Gemini for Triad) to get best-in-class performance for each reasoning type
- **Reasoning Model Handling** - Special UI feedback for o-series reasoning models (o1, o1-mini, o3-mini) that take longer but provide deeper analytical thinking, with clear indicators that extended processing time is expected
- **No API Keys Required** - All AI engines are available through the Spark runtime's built-in LLM API without requiring user-provided API keys
- **Form Persistence** - Audio/Video studio form data persists between sessions so users can iterate on briefs
- **Long Brief Output** - Ensure generated briefs are fully scrollable and readable on all screen sizes
- **Offline Mode Transitions** - Gracefully handle transitions between online and offline states with clear user feedback
- **Cache Matching** - Cache matching is case-insensitive and whitespace-normalized to maximize cache hits while avoiding false positives
- **Cache Storage Limits** - Cache automatically maintains max 100 entries, removing oldest when limit reached
- **Cache Corruption** - Gracefully handle corrupted cache data by falling back to empty cache state
- **Network Failures** - When API calls fail, automatically check cache before showing error, providing cached response if available
- **Mixed Online/Offline States** - In Tri-Core mode, if some cores have cached responses and others don't, show appropriate mix of cached and fresh results
- **Cache Indicator Visibility** - "Cached" badge clearly visible but not distracting, using accent color to differentiate from core badges

## Design Direction

The design should feel like a precision instrument—dark or light based on user preference, focused, minimal, with just enough visual hierarchy to guide the eye without distraction. Think high-end analytics dashboard meets creative studio, where the AI outputs and generated media are the stars and the UI recedes into a supportive framework. The interface adapts seamlessly between dark (default) and light themes while maintaining its futuristic, professional character. Minimal over rich, since the content itself is complex and varied.

## Color Selection

Custom palette - A sophisticated dual-theme system with cyan accents. Dark theme (default) evokes technology, precision, and clarity for extended analytical sessions. Light theme provides a clean, professional alternative for bright environments while maintaining the same futuristic character.

**Dark Theme (Default):**
- **Primary Color**: Deep space blue-black (#0A0E1A, oklch(0.11 0.02 260)) - Communicates depth, seriousness, and focus; creates a canvas that lets content breathe
- **Secondary Colors**: 
  - Slate gray (#1E293B, oklch(0.22 0.015 250)) for cards and elevated surfaces
  - Charcoal (#0F172A, oklch(0.13 0.015 255)) for subtle backgrounds
- **Accent Color**: Cyan (#06B6D4, oklch(0.72 0.11 200)) for interactive elements, core indicators, and emphasis—evokes technology and precision

**Light Theme:**
- **Primary Color**: Light neutral (#FAFAFC, oklch(0.98 0.002 260)) - Clean, professional background that reduces glare
- **Secondary Colors**:
  - White (#FFFFFF, oklch(1 0 0)) for cards and elevated surfaces
  - Soft gray (#F5F5F7, oklch(0.96 0.005 255)) for subtle backgrounds
- **Accent Color**: Deep cyan (#067888, oklch(0.55 0.15 195)) for interactive elements—maintains brand identity

**Foreground/Background Pairings (Dark Theme):**
  - Background (#0A0E1A): Light gray text (#E5E7EB, oklch(0.92 0.002 260)) - Ratio 12.8:1 ✓
  - Card (#1E293B): White text (#FFFFFF, oklch(1 0 0)) - Ratio 11.2:1 ✓
  - Primary Cyan (#06B6D4): Deep space (#0A0E1A, oklch(0.11 0.02 260)) - Ratio 6.2:1 ✓
  - Accent Cyan (#06B6D4): White text (#FFFFFF, oklch(1 0 0)) - Ratio 6.5:1 ✓
  - Muted (#334155, oklch(0.32 0.015 250)): Light gray (#E5E7EB) - Ratio 4.8:1 ✓

**Foreground/Background Pairings (Light Theme):**
  - Background (#FAFAFC): Dark text (#26262A, oklch(0.15 0.01 260)) - Ratio 13.5:1 ✓
  - Card (#FFFFFF): Dark text (#26262A, oklch(0.15 0.01 260)) - Ratio 14.0:1 ✓
  - Primary Cyan (#067888): White text (#FFFFFF, oklch(1 0 0)) - Ratio 5.8:1 ✓
  - Muted (#F5F5F7): Dark gray (#3F3F46) - Ratio 7.2:1 ✓

## Font Selection

The typeface should be technical yet approachable—clean sans-serif that works equally well for UI labels and lengthy analytical output, with excellent readability at various sizes and weights.

- **Primary Font**: Inter (Google Fonts) - Modern, highly legible, designed for screens, with excellent number/symbol rendering for analytical content
- **Monospace**: JetBrains Mono (Google Fonts) - For any code snippets or structured output that benefits from fixed-width

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold / 32px / -0.02em letter-spacing / leading-tight
  - H2 (Mode Names): Inter SemiBold / 24px / -0.01em letter-spacing / leading-snug
  - H3 (Section Headers in Output): Inter Medium / 18px / normal letter-spacing / leading-normal
  - Body (Input/Output): Inter Regular / 15px / normal letter-spacing / leading-relaxed (1.6)
  - Labels (UI Elements): Inter Medium / 13px / 0.01em letter-spacing / leading-normal / uppercase
  - Caption (Helper Text): Inter Regular / 13px / normal letter-spacing / leading-normal

## Animations

Animations should be barely perceptible—smooth enough to feel polished, subtle enough to never slow the user down. The balance leans heavily toward functionality over delight in this analytical context, with the addition of ambient sci-fi atmosphere through subtle particle effects.

- **Purposeful Meaning**: Motion communicates state changes (loading, transitioning between modes) and guides attention to new results appearing. Ambient particle animation reinforces the high-tech AI control center atmosphere without distracting from content.
- **Hierarchy of Movement**: 
  - Critical: Loading indicators (need to be obvious)
  - Important: Result appearance (subtle fade-in to reduce jarring content shifts)
  - Ambient: Background particle system with floating particles, connection lines, mouse interaction, and gentle pulsing effects
  - Nice-to-have: Mode transitions, hover states on cards

### Particle Background System
A canvas-based particle animation system that enhances the sci-fi atmosphere:
- **Visual Elements**: 
  - 100-150 floating particles (density adjusts to screen size)
  - Particles in cyan, violet, emerald, and muted gray matching the app's color palette
  - Dynamic connection lines between nearby particles (within 120px)
  - Gentle pulsing effect on particles using sine wave animation
- **Interaction**: 
  - Particles subtly repel from mouse cursor within 150px radius
  - Smooth physics-based movement with velocity dampening
  - Boundary collision detection keeps particles on screen
- **Performance**: 
  - Fixed behind all UI elements (z-index: 0)
  - Pointer-events disabled for click-through
  - Optimized particle count based on viewport area
  - Semi-transparent trail effect creates depth
- **Aesthetic**: Reinforces the "AI command center" theme with subtle, non-distracting motion that suggests data flow and computational activity

## Component Selection

- **Components**:
  - **Card** - For mode selection on landing page and containing each core's output in Tri-Core view; add subtle border glow on hover using cyan accent
  - **Textarea** - For user input; custom styling with focus ring in cyan
  - **Button** - Primary action (Run/Analyze) uses solid cyan fill; secondary actions use outline variant
  - **Select** - For AI engine selection with custom styling showing engine name, description, speed indicator (Lightning for fast, Gauge for balanced, Rocket for powerful, Brain for ultra-reasoning), cost tier badge (economy/standard/premium/ultra-premium), and color-coded provider badges (green for OpenAI, purple for OpenAI reasoning, orange for Anthropic, blue for Google)
  - **Separator** - Between outputs in Tri-Core view
  - **ScrollArea** - For long outputs to maintain layout integrity and history panel scrolling
  - **Tabs** - Alternative navigation pattern for switching between cores if card-based routing feels too heavy
  - **Badge** - To label each core in Tri-Core view output headers, history entries, cost tiers in engine selector, and AI provider badges
  - **Dialog** - For viewing full history entry details in a modal overlay
  
- **Customizations**:
  - **CoreModeCard** - Custom component combining Card with icon, title, description, and hover glow effect
  - **OutputPanel** - Custom component wrapping ScrollArea with formatted markdown-style rendering, now with optional cache indicator badge
  - **LoadingIndicator** - Custom animated component with three pulsing dots in cyan (representing three cores)
  - **HistoryPanel** - Custom sidebar component displaying chronological list of past analyses with view/delete actions
  - **HistoryDetailModal** - Custom dialog component showing full input/output of a historical analysis
  - **EngineSelect** - Custom select component showing all 11 worldwide AI engines from OpenAI, Anthropic, and Google with icons (Lightning for fast, Gauge for balanced, Rocket for powerful, Brain for ultra-reasoning), detailed descriptions, cost tier badges (economy/standard/premium/ultra-premium), and color-coded provider badges (green for OpenAI, purple for OpenAI o-series, orange for Anthropic, blue for Google)
  - **OfflineIndicator** - Custom component showing online/offline status with animated transitions and toast notifications
  - **CacheManagementPanel** - Custom panel component for viewing, managing, and deleting cached AI responses with statistics
  
- **States**:
  - Buttons: Default (cyan bg) → Hover (brighter cyan) → Active (pressed, slightly darker) → Disabled (muted gray, 50% opacity)
  - Textarea: Default (subtle border) → Focus (cyan ring, 2px) → Error (red border if empty on submit)
  - Cards: Default (slate bg) → Hover (subtle cyan border glow, translate-y-[-2px])
  
- **Icon Selection**:
  - Chadrak Core: Cube (structure/architecture) or GitBranch (logical flow)
  - Nova Core: Sparkle or Lightning (refinement/transformation)
  - Triad Core: ListChecks or Workflow (execution/steps)
  - Tri-Core: CirclesFour or Atom (integration/synergy)
  - Audio Studio: Waveform (sound/audio production)
  - Video Studio: VideoCamera (video/visual production)
  - Run/Analyze: ArrowRight or default button styling
  - Loading: CircleNotch (spinning)
  - History: Clock (time/past)
  - View History Entry: Eye (view/inspect)
  - Delete: Trash (remove)
  - Copy: Copy (clipboard action)
  - Copied: CheckCircle (confirmation)
  - Theme (Dark): Moon (filled, with primary color)
  - Theme (Light): Sun (filled, with accent color)
  - Engine Speed (Fast): Lightning (fast processing - Claude Haiku, GPT-4o-mini, Gemini Flash)
  - Engine Speed (Powerful): Rocket (high capability - GPT-4o, Claude Sonnet, Gemini Pro)
  - Engine Speed (Balanced): Gauge (middle ground - o1-mini, Gemini 2.0 Flash)
  - Engine Speed (Ultra): Brain (maximum reasoning - o1, o3-mini, Claude Opus)
  - Offline: WifiSlash (no connection)
  - Online: WifiHigh (connected)
  - Cache: Database (cached response indicator)
  - Cache Management: HardDrives (storage/cache stats)
  
- **Spacing**:
  - Page padding: px-6 py-8 (mobile), px-12 py-12 (desktop)
  - Card gaps: gap-6 (mode selection grid)
  - Internal card padding: p-6
  - Section spacing: space-y-8 (major sections), space-y-4 (related elements)
  - Tri-Core column gaps: gap-6 (desktop), gap-8 (mobile/stacked)
  
- **Mobile**:
  - Mode selection: 2-column grid on mobile (3x2), 3-column on desktop
  - Tri-Core outputs: Stack vertically with full width on mobile; 3-column grid on desktop (min-width: 1024px)
  - History panel: Stacks below main content on mobile/tablet (< 1280px), appears as sidebar on desktop
  - Navigation: If using tabs, make them scrollable horizontally on mobile
  - Input textarea: Reduce from h-48 to h-32 on mobile to leave room for output
  - Audio/Video players: Full width on mobile with responsive controls, maintain aspect ratios for video frames
