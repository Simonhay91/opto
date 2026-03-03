import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = stored === 'dark' || (!stored && prefersDark);
      this.isDark.set(dark);
      this.applyTheme(dark);
    }
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean) {
    const html = this.document.documentElement;
    if (dark) html.classList.add('dark');
    else html.classList.remove('dark');
  }
}
