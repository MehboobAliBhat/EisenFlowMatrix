import { browser } from '$app/environment';
import type { ThemeDefinition } from './types';

const DEFAULT_THEMES: ThemeDefinition[] = [
  {
    id: 'industrial-classic',
    name: 'Workbench (Industrial)',
    colors: {
      primary: '#2563eb',
      q1: '#dc2626',
      q2: '#2563eb',
      q3: '#d97706',
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
    id: 'modern-soft',
    name: 'The Studio (Modern)',
    colors: {
      primary: '#8b5cf6',
      q1: '#f43f5e',
      q2: '#0ea5e9',
      q3: '#f59e0b',
      q4: '#6366f1'
    },
    layout: {
      radius: 12,
      gap: 12,
      cardPadding: 14,
      cardHeight: 46,
      fontSize: 14
    }
  },
  {
    id: 'laws-of-ux',
    name: 'The Architect (Swiss)',
    colors: {
      primary: '#0055FF',
      q1: '#000000',
      q2: '#0055FF',
      q3: '#333333',
      q4: '#999999'
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
    id: 'material-m3',
    name: 'The System (M3)',
    colors: {
      primary: '#6750A4',
      q1: '#B3261E',
      q2: '#0061A4',
      q3: '#625B71',
      q4: '#7D5260'
    },
    layout: {
      radius: 24,
      gap: 14,
      cardPadding: 16,
      cardHeight: 52,
      fontSize: 15
    }
  },
  {
    id: 'nord-polar',
    name: 'Nord Polar',
    colors: {
      primary: '#88C0D0',
      q1: '#BF616A',
      q2: '#81A1C1',
      q3: '#EBCB8B',
      q4: '#4C566A'
    },
    layout: {
      radius: 6,
      gap: 10,
      cardPadding: 10,
      cardHeight: 42,
      fontSize: 13
    }
  },
  {
    id: 'github-primer',
    name: 'Primer (GitHub)',
    colors: {
      primary: '#0969da',
      q1: '#cf222e',
      q2: '#0969da',
      q3: '#9a6700',
      q4: '#6e7781'
    },
    layout: {
      radius: 6,
      gap: 8,
      cardPadding: 10,
      cardHeight: 38,
      fontSize: 13
    }
  }
];

class ThemeService {
  themes = $state<ThemeDefinition[]>([]);
  activeThemeId = $state('industrial-classic');
  
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
