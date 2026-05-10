import { 
  Zap, 
  Calendar, 
  Repeat, 
  Archive, 
  ClipboardList 
} from "lucide-svelte";
import type { QuadrantConfig, SidebarLink } from "./types";

export const QUADRANTS: QuadrantConfig[] = [
  { 
    id: 1, 
    label: 'DO', 
    title: 'DO', 
    sub: 'URGENT & IMPORTANT', 
    icon: Zap, 
    var: '--color-q1', 
    soft: '--color-q1-soft' 
  },
  { 
    id: 2, 
    label: 'PLAN', 
    title: 'PLAN', 
    sub: 'IMPORTANT & NOT URGENT', 
    icon: Calendar, 
    var: '--color-q2', 
    soft: '--color-q2-soft' 
  },
  { 
    id: 3, 
    label: 'HANDOFF', 
    title: 'HANDOFF', 
    sub: 'URGENT & NOT IMPORTANT', 
    icon: Repeat, 
    var: '--color-q3', 
    soft: '--color-q3-soft' 
  },
  { 
    id: 4, 
    label: 'VOID', 
    title: 'VOID', 
    sub: 'NEITHER URGENT NOR IMPORTANT', 
    icon: Archive, 
    var: '--color-q4', 
    soft: '--color-q4-soft' 
  }
];

export const SIDEBAR_LINKS: SidebarLink[] = [
  { id: 'all', label: 'All Tasks', icon: ClipboardList, var: '--color-primary', soft: '--color-primary-soft' },
  { id: '1', label: 'Do', icon: Zap, var: '--color-q1', soft: '--color-q1-soft' },
  { id: '2', label: 'Plan', icon: Calendar, var: '--color-q2', soft: '--color-q2-soft' },
  { id: '3', label: 'Handoff', icon: Repeat, var: '--color-q3', soft: '--color-q3-soft' },
  { id: '4', label: 'Void', icon: Archive, var: '--color-q4', soft: '--color-q4-soft' }
];
