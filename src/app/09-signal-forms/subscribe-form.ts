import { Component, effect, signal } from "@angular/core";
import { Subscription, SubscriptionSchema, initialData } from "./subscription";
import { Form } from "@angular/forms";
import { Field, form } from "@angular/forms/signals";

@Component({
  selector: 'app-subscribe-form',
  templateUrl: './subscribe-form.html',
  styleUrl: './subscribe-form.scss',
  imports: [Field]
})
export class SubscribeForm {

  subscribeModel = signal<Subscription>(initialData); // form data model

  subscribeForm = form(this.subscribeModel, SubscriptionSchema);

  // for accessing real-time information about the form state
  // we can use subsribeForm.email() function to get the email field state
  // for accessing form values, we can use subscribeForm.value()
  // for checking form validity, we can use subscribeForm.valid() function
  // for checking form errors, we can use subscribeForm.errors() function
  // for checking if the form is touched, we can use subscribeForm.touched() function
  // for checking if the form is dirty, we can use subscribeForm.dirty() function
  // for checking if the form is enabled, we can use subscribeForm.enabled() function
  eff = effect(() => {
    console.log('Form Data Changed:', this.subscribeModel().email);
  });


}
