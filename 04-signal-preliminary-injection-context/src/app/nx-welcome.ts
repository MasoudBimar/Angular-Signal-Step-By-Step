import { Component, DestroyRef, inject, Injector, OnInit, runInInjectionContext, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { startCounting } from './app.util';


@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome implements OnInit {
  readonly destroyRef = inject(DestroyRef);

  // ***********************************************************
  // The better way is to keep the refernece to Injector itself
  // and use it to create out own injection context later
  private injector = inject(Injector);


  constructor() {
    const sub = interval(1000).subscribe(console.log);
    // every subscription need to be unsubscribed
    // So thechnically this subscription will be open
    // event when the compononet will be destroyed
    // on alternative is sync pipe
    // can be unsubscribe by holiding ref to subscription and unsubscribe in onDestory

    // in Angular 14 team added the inject function
    // in Angular 15 team added destroyRef


    this.destroyRef.onDestroy(() => sub.unsubscribe());

    // startCounting();// works perfectly
    // startCounting2();// works perfectly

    // the inject method can be used just in Injection Context
    // What is the Injection Context?
    // injection context is the period of time when the object is constructed
    // So this component is constructed when constructor is activated
    // so we can use the inject in two place
    // first in the constructor
    // second in initializer of the property that is defined in the scope of the class
  }

  // Old way-- constructor Injection
  // constructor1(private destoryRef: DestroyRef) {
  //   const sub = interval(1000).subscribe(console.log);
  //   destoryRef.onDestroy(() => sub.unsubscribe());
  // }

  ngOnInit() {
    // const dr = inject(DestroyRef);
    // Error: inject() must be called from an injection context such as a constructor, a factory function
    // a field initializer or a function used with runInjectionContext
    console.log('test');

    // startCounting();// won't work
    // its outside of injection context
    // startCounting2(this.destroyRef); //works perfectly

    // *********************************************************
    // better way to create out own injection context
    // 
    runInInjectionContext(this.injector, () => {
      startCounting();
    });

  }



}
