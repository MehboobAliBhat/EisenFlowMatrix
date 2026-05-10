import { browser } from '$app/environment';
import type { ThemeDefinition } from './types';

const DEFAULT_THEMES: ThemeDefinition[] = [
  {
    id: 'industrial-classic',
    name: 'Industrial Classic',
    colors: {
      primary: '#448aff',
      q1: '#ff5252',
      q2: '#448aff',
      q3: '#ffa726',
      q4: '#334155'
    },
    layout: {
      radius: 0,
      gap: 4,
      cardPadding: 10
    }
  },
  {
    id: 'modern-soft',
    name: 'Modern Soft',
    colors: {
      primary: '#9c27b0',
      q1: '#ef4444',
      q2: '#3b82f6',
      q3: '#f59e0b',
      q4: '#64748b'
    },
    layout: {
      radius: 8,
      gap: 12,
      cardPadding: 12
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
    const savedThemes = localStorage.getItem('eisen-custom-themes');
    const customThemes = savedThemes ? JSON.parse(savedThemes) : [];
    this.themes = [...DEFAULT_THEMES, ...customThemes];
    
    const savedActiveId = localStorage.getItem('eisen-active-theme-id');
    if (savedActiveId && this.themes.find(t => t.id === savedActiveId)) {
      this.activeThemeId = savedActiveId;
    }
    
    this.applyTheme();
  }

  applyTheme() {
    if (!browser) return;
    const theme = this.activeTheme;
    const root = document.documentElement;

    // Apply primary
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-soft', `${theme.colors.primary}1a`);

    // Apply quadrants
    root.style.setProperty('--color-q1', theme.colors.q1);
    root.style.setProperty('--color-q1-soft', `${theme.colors.q1}0f`);
    root.style.setProperty('--color-q1-header', `${theme.colors.q1}1a`);

    root.style.setProperty('--color-q2', theme.colors.q2);
    root.style.setProperty('--color-q2-soft', `${theme.colors.q2}0f`);
    root.style.setProperty('--color-q2-header', `${theme.colors.q2}1a`);

    root.style.setProperty('--color-q3', theme.colors.q3);
    root.style.setProperty('--color-q3-soft', `${theme.colors.q3}0f`);
    root.style.setProperty('--color-q3-header', `${theme.colors.q3}1a`);

    root.style.setProperty('--color-q4', theme.colors.q4);
    root.style.setProperty('--color-q4-soft', `${theme.colors.q4}0f`);
    root.style.setProperty('--color-q4-header', `${theme.colors.q4}1a`);

    // Apply layout
    root.style.setProperty('--radius', `${theme.layout.radius}px`);
    root.style.setProperty('--grid-gap', `${theme.layout.gap}px`);
    root.style.setProperty('--card-padding', `${theme.layout.cardPadding}px`);
    
    localStorage.setItem('eisen-active-theme-id', this.activeThemeId);
  }

  addTheme(theme: ThemeDefinition) {
    this.themes = [...this.themes, theme];
    this.saveCustomThemes();
  }

  updateTheme(updatedTheme: ThemeDefinition) {
    this.themes = this.themes.map(t => t.id === updatedTheme.id ? updatedTheme : t);
    this.saveCustomThemes();
    if (this.activeThemeId === updatedTheme.id) this.applyTheme();
  }

  resetToDefault(id: string) {
    const defaultTheme = DEFAULT_THEMES.find(t => t.id === id);
    if (defaultTheme) {
      this.updateTheme(JSON.parse(JSON.stringify(defaultTheme)));
    }
  }

  private saveCustomThemes() {
    const customOnes = this.themes.filter(t => !DEFAULT_THEMES.find(d => d.id === t.id));
    localStorage.setItem('eisen-custom-themes', JSON.stringify(customOnes));
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
        // Ensure unique ID for import
        const newTheme = { ...theme, id: `imported-${Date.now()}` };
        this.addTheme(newTheme);
      }
    } catch (e) {
      console.error('Failed to import theme', e);
    }
  }
}

export const themeService = new ThemeService();
