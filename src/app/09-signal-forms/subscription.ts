import { applyWhen, email, max, min, minLength, required, schema } from "@angular/forms/signals";

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

// Another suggestion is using applyWhen
// Applies a condition to a set of validation rules or a set of fields

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
  // for using applyWhen first we need to comment the required validator for phone
  // use applyWhen to apply condition to multiple rules or to effect multiple fields
  // applyWhen(
  //   rootPath.phone,
  //   ({ valueOf }) => valueOf(rootPath.sendViaText) === true,
  //   (phonePath) => {
  //     required(phonePath, { message: 'Your cell phone number is required to receive out newsLetter' }),
  //       minLength(phonePath, 10, {
  //         message: 'Minimum of 10 digits is required'
  //       })
  //   }
  // )
});
