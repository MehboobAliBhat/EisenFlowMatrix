# Eisenhower Matrix Productivity Tool

A sleek, local-first Eisenhower Matrix application built with SvelteKit and Tailwind CSS. This tool helps you prioritize tasks based on urgency and importance, following the classic 2x2 matrix framework.

## 🚀 Features

- **Frictionless 2x2 Grid:** Clearly categorized quadrants (Do, Schedule, Delegate, Eliminate) with distinct visual coding.
- **Quick Task Entry:** Rapidly capture tasks with an always-visible input bar.
- **Dynamic Task Migration:** Move tasks between quadrants with a single click.
- **Local-First Persistence:** All data is saved automatically to your browser's `localStorage`.
- **Dark/Light Mode:** Full support for both themes with a persistence toggle.
- **Data Portability:** Export your tasks as a JSON file for backup or import into other systems.
- **Responsive Design:** Optimized for both desktop and mobile viewing.

## 📖 User Guide

### Capturing Tasks
1. Type your task in the top input field.
2. Select the appropriate quadrant (Q1-Q4) from the dropdown.
3. Press **Enter** or click **Add Task**.

### Managing the Matrix
- **Complete a Task:** Click the circular checkbox on the left of any task card.
- **Move a Task:** Hover over a task card (on desktop) or look for the "Q" buttons (Q1, Q2, etc.) to shift it to a different quadrant instantly.
- **Delete a Task:** Click the red trash icon on the task card.
- **Switch Theme:** Use the sun/moon icon in the top right to toggle between light and dark modes.
- **Backup Data:** Click **Download JSON** to save your current task list to your machine.

## 🛠️ Technical Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** Svelte Runes (`$state`, `$effect`)
- **Persistence:** Browser `localStorage`

## 📦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
