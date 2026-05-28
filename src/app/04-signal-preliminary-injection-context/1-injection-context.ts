import { Component, DestroyRef, inject, Injector, OnInit, runInInjectionContext, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { startCounting } from './2-passing-injection-context';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class InjectionContext implements OnInit {
  readonly destroyRef = inject(DestroyRef);

  // ***********************************************************
  // The better way is to keep the refernece to Injector itself
  // and use it to create our own injection context later
  private injector = inject(Injector);


  constructor() {
    const sub = interval(1000).subscribe(console.log); // without unsubscribe this subscription will be open ==> memory leak
    // every subscription need to be unsubscribed
    // So technically this subscription will be open
    // even when the compononet will be destroyed
    // one alternative is using sync pipe
    // also it can be unsubscribe by holiding reference to subscription and unsubscribe in onDestory

    // in Angular 14 team added the inject function to be independent from constructor
    // in Angular 15 team added destroyRef for having access to a callback for cleanup befor destroying


    this.destroyRef.onDestroy(() => sub.unsubscribe());

    // or using rxjs
    // .pipe(takeUntilDestroyed(this.destroyRef))

    // startCounting();// works perfectly
    // startCounting2();// works perfectly

    // the inject method cannot be used anywhere
    // the inject method can be used just in Injection Context
    // What is the Injection Context?
    // injection context is the period of time when the object is constructed
    // So this component is constructed when constructor is activated
    // so we can use the inject in two place
    // first in the constructor
    // second in initializer of the property that is defined in the scope of the class
    // so we can inject normally in the component class property definition area and inside component constructor not even ngOnInit

    // also if we want to inject resource inside a method we need to call the method or function inside Injection Context

    // So except the normal scenario if we want to inject sth outside Injection Context, we need to provide the injection context:
    // 1. one way is do the inject in the normal place and then pass it
    // 2. another way is using runInInjectionContext method and passing the current injector
  }

  // Old way-- constructor Injection
  // constructor1(private destoryRef: DestroyRef) {
  //   const sub = interval(1000).subscribe(console.log);
  //   destoryRef.onDestroy(() => sub.unsubscribe());
  // }

  ngOnInit() {
    // const dr = inject(DestroyRef);
    //! Error: inject() must be called from an injection context such as a constructor, a factory function
    // a field initializer or a function used with runInjectionContext
    console.log('test');

    // startCounting();// won't work
    // its outside of injection context
    // startCounting2(this.destroyRef); //works perfectly

    // *********************************************************
    // better way to create our own injection context
    // 
    runInInjectionContext(this.injector, () => {
      startCounting();
    });

  }



}
