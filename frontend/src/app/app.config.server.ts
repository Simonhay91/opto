import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode, ServerRoute } from '@angular/ssr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: 'product/**', renderMode: RenderMode.Server },
  { path: 'catalog/:categorySlug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withFetch()),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
