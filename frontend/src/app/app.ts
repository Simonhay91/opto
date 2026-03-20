import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';

const CRM_LOADER_URL = 'https://btx.planetfibers.com/upload/crm/site_button/loader_4_4otl26.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen transition-theme">
      <app-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [':host { display: block; }']
})
export class App implements OnInit {
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this.doc.createElement('script');
    s.async = true;
    s.src = `${CRM_LOADER_URL}?${Math.floor(Date.now() / 60000)}`;
    this.doc.body.appendChild(s);
  }
}
