export interface ThemeDefinition {
  id: string;
  name: string;
  colors: {
    primary: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  layout: {
    radius: number;
    gap: number;
    cardPadding: number;
  };
}

export interface Task {
  id: string;
  text: string;
  quadrant: number;
  completed: boolean;
  timestamp: number;
}

export interface QuadrantConfig {
  id: number;
  label: string;
  title: string;
  sub: string;
  icon: any;
  var: string;
  soft: string;
}

export interface SidebarLink {
  id: string;
  label: string;
  icon: any;
  var: string;
  soft: string;
}
