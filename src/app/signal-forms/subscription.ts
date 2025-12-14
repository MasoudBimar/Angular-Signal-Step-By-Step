import { email, max, min, minLength, required, schema } from "@angular/forms/signals";

export interface Subscription { // subscripotion
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sendViaText: boolean;
  sendViaEmail: boolean;
  yearsAsFan: number;


}

// use this to initialize forms
export const initialData: Subscription = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sendViaText: true,
  sendViaEmail: true,
  yearsAsFan: NaN
};

export const SubscriptionSchema = schema<Subscription>((rootPath) => {
  required(rootPath.email, {
    message: 'Email is required',
    // valueOf Is a helper method provided by the forms, field context
    // Takes in a schema path
    // Returns current value of field at that path
    // Is AUtomatically reactive as form state changes
    // Works for single and grouped fields
    when: ({ valueOf }) => valueOf(rootPath.sendViaEmail) === true
  });
  email(rootPath.email, { message: 'Invalid email address' });
  minLength(rootPath.email, 5, { message: 'Email must be at least 5 characters long' });
  required(rootPath.phone, {
    message: 'Your Phone Number is required to send the newsLetter',
    when: ({ valueOf }) => valueOf(rootPath.sendViaText) === true
  });
  min(rootPath.yearsAsFan, 0, { message: 'You must be a fan for at least 0 years' });
  max(rootPath.yearsAsFan, 100, { message: 'You must be a fan for at least 100 years' });

});
