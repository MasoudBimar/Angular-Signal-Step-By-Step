import { DestroyRef, inject } from "@angular/core";
import { interval } from "rxjs";

// This function is implemented/located outside the component.
// So we need to get destroyRef as param
// or call it in the Injection context
export function startCounting() {
    const dr = inject(DestroyRef)
    const sub = interval(1000).subscribe(console.log);
    dr.onDestroy(() => sub.unsubscribe());


}


// This function is implemented/located outside the component.
// So we need to get destroyRef as param
// better version because if the function going to be called inside injection context it can be called without passing the destroyRef

export function startCounting2(dr: DestroyRef= inject(DestroyRef)) {
    // const dr = inject(DestroyRef)
    const sub = interval(1000).subscribe(console.log);
    dr.onDestroy(() => sub.unsubscribe());

    
}