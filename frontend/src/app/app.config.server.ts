import { mergeApplicationConfig, ApplicationConfig, PLATFORM_ID } from '@angular/core';
import { provideServerRendering, withRoutes, RenderMode, ServerRoute, ALLOWED_HOSTS } from '@angular/ssr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: 'product/:slug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withFetch()),
    {
      provide: ALLOWED_HOSTS,
      useValue: [
        'localhost',
        'preview.emergentagent.com',
        'product-catalog-185.preview.emergentagent.com',
        'optowire.preview.emergentagent.com',
        'dev.planetworkspace.com'
      ]
    }
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
