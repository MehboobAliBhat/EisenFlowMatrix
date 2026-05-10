# MatrixFlow Elite: Design Specifications

## 1. Vision & Aesthetic
"MatrixFlow Elite" is an industrial-grade productivity tool designed for high-density information management. The aesthetic is clean, sharp-edged (zero border-radius), and highly functional, prioritizing data over decoration.

## 2. Iconography
- **Library:** Lucide-Svelte (Frozen Choice)
- **Standard Stroke Width:** 2px (default), 3px (headers)
- **Sizes:**
  - Sidebar: 18px
  - Top Bar: 14px
  - Capture Bar: 14px
  - Matrix Headers: 16px
  - Task Actions: 12px

## 3. Color System (Industrial Standards)
The application uses a semantic color system for Quadrants and system states.

### Core Palettes
- **Surface (Light):** `#FAFAFA`
- **Surface (Dark):** `#1F2937` (Inverse Surface)
- **Border:** `#ECECEC` (Light), `#374151` (Dark)

### Quadrant Semantics
- **Q1 (Do):** `#FF5F5F` (Red)
- **Q2 (Plan):** `#5F9FFF` (Blue)
- **Q3 (Handoff):** `#FFB35F` (Orange)
- **Q4 (Void):** `#A0A0A0` (Gray)

## 4. Typography
- **Primary Font:** 'Inter', sans-serif (Precision UI)
- **Mono Font:** 'JetBrains Mono' (Data visualization)
- **Standard UI Text:** 13px - 14px
- **High-Density Text:** 11px - 12px (Task Cards)

## 5. Layout Constants (High-Density)
- **Sidebar Width:** 240px (Full), 70px (Collapsed)
- **Header Height:** 44px
- **Capture Bar Height:** 40px
- **Task Card Height:** 36px
- **Grid Gap:** 12px (3 units)

## 6. Implementation Rules
- **No Utilities:** Styling must be handled via semantic CSS classes (e.g., `.task-card`, `.sidebar-nav-item`).
- **Theming:** Use CSS variables for all colors to support instant Dark/Light mode switching without utility logic.
- **Zero Radius:** No rounded corners allowed. All borders are 90-degree angles.
- **Interactions:** Every functional element must have a clear `:hover` and `:active` state.
