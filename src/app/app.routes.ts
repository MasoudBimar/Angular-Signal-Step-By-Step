import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signal-forms', pathMatch: 'full' },
  { path: 'change-detection/1-default', loadComponent: () => import('./01-change-detection/1-change-detection-default').then(m => m.ChangeDetectionSampleDefault) },
  { path: 'change-detection/2-default', loadComponent: () => import('./01-change-detection/2-change-detection-default').then(m => m.ChangeDetectionSampleDefault) },
  { path: 'change-detection/3-default', loadComponent: () => import('./01-change-detection/3-change-detection-default').then(m => m.ChangeDetectionSampleDefault) },
  { path: 'change-detection/1-on-push', loadComponent: () => import('./01-change-detection/1-change-detection-onpush').then(m => m.ChangeDetectionSampleOnPush) },
  { path: 'change-detection/2-on-push', loadComponent: () => import('./01-change-detection/2-change-detection-onpush').then(m => m.ChangeDetectionSampleOnPush) },
  { path: 'change-detection/3-on-push', loadComponent: () => import('./01-change-detection/3-change-detection-onpush').then(m => m.ChangeDetectionSampleOnPush) },
  { path: 'rxjs-state-management', loadComponent: () => import('./02-rxjs-state-management/1-rxjs-state-management').then(m => m.RxJsStateManagement) },
  { path: 'rxjs-state-management/another-challenge', loadComponent: () => import('./02-rxjs-state-management/2-rxjs-state-management').then(m => m.rxJsStateManagement) },
  { path: 'signal-first-touch', loadComponent: () => import('./03-signal-first-touch/1-signal-first-use').then(m => m.StartSignal) },
  { path: 'signal-preliminary-injection-context', loadComponent: () => import('./04-signal-preliminary-injection-context/1-injection-context').then(m => m.InjectionContext) },
  { path: 'signal-preliminary-injection-context/injection', loadComponent: () => import('./04-signal-preliminary-injection-context/4-signal-and-injection-context').then(m => m.SignalAndInjectionContext) },
  { path: 'signal-preliminary-injection-context/effect', loadComponent: () => import('./04-signal-preliminary-injection-context/3-using-effects').then(m => m.UsingEffect) },
  { path: 'signal-computed-effect', loadComponent: () => import('./05-signal-computed-effect/computed-signal-and-effect').then(m => m.ComputedSignalAndEffect) },
  { path: 'rxjs-interop', loadComponent: () => import('./06-rxjs-interop/rxjs-interop').then(m => m.RxJsInteroperability) },
  { path: 'signal-apis', loadComponent: () => import('./07-signal-apis/signal-api').then(m => m.SignalAPI) },
  { path: 'signal-apis/currency-converter', loadComponent: () => import('./07-signal-apis/components/currency-converter/currency-converter.component').then(m => m.CurrencyConverterComponent) },
  { path: 'signal-apis/option-selector', loadComponent: () => import('./07-signal-apis/components/option-selector/option-selector.component').then(m => m.OptionSelectorComponent) },
  { path: 'router-inputs', loadComponent: () => import('./08-router-inputs/nx-welcome').then(m => m.NxWelcome) },
  { path: 'router-inputs/movie/:id', loadComponent: () => import('./08-router-inputs/movie-details/movie-details.component').then(m => m.default) },
  { path: 'signal-forms', loadComponent: () => import('./09-signal-forms/subscribe-form').then(m => m.SubscribeForm) },
  { path: '**', redirectTo: '' }
];
