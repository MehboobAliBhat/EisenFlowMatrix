import { browser } from '$app/environment';
import type { ThemeDefinition } from './types';

const DEFAULT_THEMES: ThemeDefinition[] = [
  {
    id: 'elite-workbench',
    name: 'Elite Workbench',
    colors: {
      primary: '#0055ff',
      q1: '#ff0000',
      q2: '#0055ff',
      q3: '#ff8800',
      q4: '#475569'
    },
    layout: {
      radius: 0,
      gap: 6,
      cardPadding: 8,
      cardHeight: 34,
      fontSize: 12
    }
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    colors: {
      primary: '#00ffcc',
      q1: '#ff0055',
      q2: '#00ccff',
      q3: '#ffcc00',
      q4: '#94a3b8'
    },
    layout: {
      radius: 0,
      gap: 10,
      cardPadding: 12,
      cardHeight: 42,
      fontSize: 13
    }
  },
  {
    id: 'swiss-architect',
    name: 'Swiss Architect',
    colors: {
      primary: '#000000',
      q1: '#ff0000',
      q2: '#0000ff',
      q3: '#333333',
      q4: '#777777'
    },
    layout: {
      radius: 0,
      gap: 16,
      cardPadding: 12,
      cardHeight: 40,
      fontSize: 13
    }
  },
  {
    id: 'paper-high-contrast',
    name: 'Paper (High Contrast)',
    colors: {
      primary: '#111111',
      q1: '#990000',
      q2: '#003399',
      q3: '#663300',
      q4: '#333333'
    },
    layout: {
      radius: 0,
      gap: 8,
      cardPadding: 14,
      cardHeight: 46,
      fontSize: 14
    }
  },
  {
    id: 'github-dark-elite',
    name: 'GitHub Elite',
    colors: {
      primary: '#2f81f7',
      q1: '#f85149',
      q2: '#2f81f7',
      q3: '#d29922',
      q4: '#8b949e'
    },
    layout: {
      radius: 6,
      gap: 8,
      cardPadding: 10,
      cardHeight: 38,
      fontSize: 13
    }
  },
  {
    id: 'crimson-industrial',
    name: 'Crimson Slate',
    colors: {
      primary: '#e11d48',
      q1: '#e11d48',
      q2: '#2563eb',
      q3: '#ea580c',
      q4: '#334155'
    },
    layout: {
      radius: 0,
      gap: 4,
      cardPadding: 8,
      cardHeight: 32,
      fontSize: 11
    }
  }
];

class ThemeService {
  themes = $state<ThemeDefinition[]>([]);
  activeThemeId = $state('elite-workbench');
  
  activeTheme = $derived(
    this.themes.find(t => t.id === this.activeThemeId) || DEFAULT_THEMES[0]
  );

  constructor() {
    if (browser) {
      this.load();
    }
  }

  private load() {
    // 1. Load Themes (Merged with Defaults)
    const savedThemes = localStorage.getItem('eisen-themes-v3');
    if (savedThemes) {
      try {
        const parsed = JSON.parse(savedThemes);
        const defaultIds = new Set(DEFAULT_THEMES.map(t => t.id));
        const customThemes = parsed.filter((t: ThemeDefinition) => !defaultIds.has(t.id));
        const savedDefaults = parsed.filter((t: ThemeDefinition) => defaultIds.has(t.id));
        
        const baseThemes = DEFAULT_THEMES.map(d => {
          const saved = savedDefaults.find((s: ThemeDefinition) => s.id === d.id);
          return saved || d;
        });

        this.themes = [...baseThemes, ...customThemes];
      } catch (e) {
        this.themes = [...DEFAULT_THEMES];
      }
    } else {
      this.themes = [...DEFAULT_THEMES];
    }
    
    // 2. Load Active Selection
    const savedActiveId = localStorage.getItem('eisen-active-theme-id');
    if (savedActiveId && this.themes.find(t => t.id === savedActiveId)) {
      this.activeThemeId = savedActiveId;
    }
    
    // 3. Apply Initial State
    this.applyTheme();
  }

  save() {
    if (!browser) return;
    localStorage.setItem('eisen-themes-v3', JSON.stringify(this.themes));
    localStorage.setItem('eisen-active-theme-id', this.activeThemeId);
  }

  applyTheme() {
    if (!browser) return;
    const theme = this.activeTheme;
    const root = document.documentElement;

    // Apply primary
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-soft', `${theme.colors.primary}1a`);

    // Apply quadrants
    const quadrants = ['q1', 'q2', 'q3', 'q4'] as const;
    quadrants.forEach(q => {
      const color = theme.colors[q];
      root.style.setProperty(`--color-${q}`, color);
      root.style.setProperty(`--color-${q}-soft`, `${color}0f`);
      root.style.setProperty(`--color-${q}-header`, `${color}1a`);
    });

    // Apply layout
    root.style.setProperty('--radius', `${theme.layout.radius}px`);
    root.style.setProperty('--grid-gap', `${theme.layout.gap}px`);
    root.style.setProperty('--card-padding', `${theme.layout.cardPadding}px`);
    root.style.setProperty('--card-height', `${theme.layout.cardHeight}px`);
    root.style.setProperty('--font-size-task', `${theme.layout.fontSize}px`);
    
    this.save();
  }

  addTheme(theme: ThemeDefinition) {
    this.themes = [...this.themes, theme];
    this.save();
  }

  updateTheme(updatedTheme: ThemeDefinition) {
    this.themes = this.themes.map(t => t.id === updatedTheme.id ? updatedTheme : t);
    this.save();
    if (this.activeThemeId === updatedTheme.id) this.applyTheme();
  }

  resetToDefault(id: string) {
    const defaultTheme = DEFAULT_THEMES.find(t => t.id === id);
    if (defaultTheme) {
      const reset = JSON.parse(JSON.stringify(defaultTheme));
      this.updateTheme(reset);
    }
  }

  exportTheme(theme: ThemeDefinition) {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eisen-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  }

  importTheme(json: string) {
    try {
      const theme = JSON.parse(json);
      if (theme.id && theme.colors && theme.layout) {
        const newTheme = { ...theme, id: `imported-${Date.now()}` };
        this.addTheme(newTheme);
      }
    } catch (e) {
      console.error('Failed to import theme', e);
    }
  }
}

export const themeService = new ThemeService();
