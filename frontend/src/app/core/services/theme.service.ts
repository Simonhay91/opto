import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  // Light mode only — dark mode toggle is hidden
  isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Always force light mode
      localStorage.setItem('theme', 'light');
      this.applyTheme(false);
    }
  }

  toggle() {
    // No-op: dark mode disabled
  }

  private applyTheme(dark: boolean) {
    const html = this.document.documentElement;
    if (dark) html.classList.add('dark');
    else html.classList.remove('dark');
  }
}
