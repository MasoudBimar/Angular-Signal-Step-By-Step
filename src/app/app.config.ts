import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(),withComponentInputBinding()),// functions starts with "with" are called router configuration functions, 
    // they configure the router with specific features, in this case we are configuring the router to use hash-based navigation 
    // and to support component input binding for route parameters.
    provideZonelessChangeDetection(),
  ]
};
