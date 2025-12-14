import { email, max, min, minLength, required, schema } from "@angular/forms/signals";

export interface Subscription { // subscripotion
  firstName: string;
  lastName: string;
  email: string;
  yearsAsFan: number;

}

// use this to initialize forms
export const initialData: Subscription = {
  firstName: '',
  lastName: '',
  email: '',
  yearsAsFan: NaN
};

export const SubscriptionSchema = schema<Subscription>((rootPath) => {
  required(rootPath.email, { message: 'Email is required' });
  email(rootPath.email, { message: 'Invalid email address' });
  minLength(rootPath.email, 5, { message: 'Email must be at least 5 characters long' });
  min(rootPath.yearsAsFan, 0, { message: 'You must be a fan for at least 0 years' });
  max(rootPath.yearsAsFan, 100, { message: 'You must be a fan for at least 100 years' });

});
