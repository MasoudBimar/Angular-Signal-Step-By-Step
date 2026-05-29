# Angular signal RxJs Interoperability

## Turn observable to signal

### ToObservable

ToObservable creates an observable which tracks the value of a signal
toObservable is an effect that runs whenever the signal changes
underneath it uses a replaySubject to update the observable,
so that stores in memory the latest value of the signal

creating observable from a signal:

```ts
readonly number = signal(10);
readonly number$ = toObservable(this.number); // when the effect destroys the replaySubject also is destroyed
```

## Turn signal to observable

### ToSignal

ToSignal creates a signal which tracks the value of an observable
its subscribe to the observable and updates the signal whenever the observable emits a new value
who unsubscribes from the observable when the signal is destroyed (toSignal is destroyed when the component is destroyed)

creating a signal from observable

```ts
readonly number$ = of([1,2,3]);

readonly number = toSignal(number$);


readonly data$ = this.api.getData();

readonly data = toSignal(data$, {initialValue: []}); 

```

> [!NOTE]
> When using toSignal it always add '| undefined' to the return type
> because signals always have values but observables not 

> [!TIP]
> To get rid of undefined from return type, good solution is using default value `initialValue: ...` to the newly created signal
> also if we are sure that observable has initial value we can use `requireSync: true`

## Whats common between toSignal and toObservable

so both toObservable and toSignal are needed injection context to unsubscribe from the observable or destroy the effect
so both toObservable and toSignal can only be used within an injection context
so we do not need manual cleanup

## Using toSignal and toObservable in ngOnInit

As we know  OnInit does not run in an injection context so we can use them the way we use them inside injection context


## Signal and Immutability