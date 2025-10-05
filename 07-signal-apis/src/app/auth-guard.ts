import { inject, Inject, Injectable, input, Input } from "@angular/core";
import { CanActivate, CanActivateFn } from "@angular/router";

@Injectable({
    providedIn: 'root'})
export class AuthService{
    isLoggedIn(){
        return true;
    }
}

// TODO: ng Old
export class AuthGuard implements CanActivate {
    /**
     *
     */
    constructor(private readonly auth: AuthService) {
        
    }

    canActivate(){
        return this.auth.isLoggedIn();
    }
}

// TODO: ng new
export const authGuard: CanActivateFn = () => inject(AuthService).isLoggedIn();

// We needed constructor injection for injecting auth service into the auth guard class
// But with inject function we can directly inject the service where we need it
// So we can write router guard and http interceptors as simple functions instead of classes

//  the same approach also extends to the new APIs in Angular
// input, output, viewChild, contentChild, etc. 
// All can be used as signal-based functions driven instead of decorators

// TODO: for input you needed to implement at least onInit and  other lifecycle hooks to access the content
// with input function you can directly access the input as a signal
// -------------------------------------------------------------------
// export class BeforeComponent {
//     constructor(@Inject('SOME_NUMBER') private num: number) { }
//     @Input({required: true}) title!: string;
// }

// export class AfterComponent {
//     readonly num = inject('SOME_NUMBER');
//     readonly title = input.required<string>();
// }
