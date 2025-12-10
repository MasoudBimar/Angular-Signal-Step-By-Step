import { Component, DestroyRef, effect, EffectRef, inject, Injector, OnInit, runInInjectionContext, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { startCounting } from './app.util';

/**
 * Reactive Context (synchronous)
 *
 * An effect is a reactive context that runs a function whenever the signals it depends on change.
 * Effects are used to perform side effects in response to signal changes, such as updating the DOM or making HTTP requests.
 *
 * Effects can only be created within an injection context, such as a component or a service.
 * 
 * Reactive context is a context that has access to the Angular dependency injection system.
 * This means that you can use the inject function to access services and other dependencies within an effect.
 * Reactive context is Locations in your code where angular follows calling signals
 * 1. inside the body of a computed : derived = computed(() => { firstSignal() * 2})
 * 2. inside the body of an effect:  effect(() => { console.log(firstSignal())})
 * 
 * In Reactive context :
 *  It's Ok to read from signals
 *  It's Not Ok to Modify signals
 *  It's Not Ok to create signals
 *  It's Not Ok to create an effect
 */
@Component({
    selector: 'app-signal-and-injection',
    imports: [CommonModule],
    template: `
    <button (click)="go()">Go Button</button>
  `,
    styles: [],
    encapsulation: ViewEncapsulation.None,
})
export class SignalAndInjection {
    readonly destroyRef = inject(DestroyRef);
    private injector = inject(Injector);
    readonly value = signal(0);
    ef: EffectRef | null = null;


    constructor() {
        setInterval(() => {
            this.value.update(v => v + 1);
        }, 1000);



    }

    go() {
        // *************************************************************
        // Error: the effect can only be used within an ijection context
        // why does the effect require an ijection context
        // effect ties itself to destroyRef, the effect use the destoryRef automatically
        // So the effect lifespan of an ijector
        // when an effect created it needs an ijector in order to recieve a destoryRef
        //  and attach itself to the destoryRef and when the destoryRef triggers the effect will stop
        effect(() => {
            console.log('heyyyyyyyyy', this.value())
        })

        // how to fix the error
        // we can iject the injector and

        effect(() => {
            console.log('heyyyyyyyyy', this.value())
        }, { injector: this.injector });

        // *****************************
        // we can only create effect inside the injection context
        // or where we have access to th einjector and we can provide the injectory for effect


        // *************************************
        // what if we want to stop the effect before destorying the component
        this.ef = effect(() => {
            console.log(this.value());
        }, { injector: this.injector });
    }

    stop() {
        this.ef?.destroy();
        this.ef = null;
    }


}
