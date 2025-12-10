# Angular Signals Step-by-Step Guide

A comprehensive learning guide for mastering **Angular Signals** with the latest version of Angular (v21). This repository provides practical examples and patterns for modern Angular development using signals, standalone components, and reactive programming.

## About This Project

This project demonstrates:

- **Angular Signals**: Writable signals, computed signals, and signal effects
- **Change Detection**: OnPush change detection strategies with signals
- **RxJS Interoperability**: Combining observables with the signals API
- **Standalone Components**: Building modern Angular apps without NgModules
- **Advanced Patterns**: Signal-based state management, dependency injection, and routing
- **Practical Examples**: Real-world use cases like currency conversion and movie listings

## Project Structure

```
src/app/
├── 01-change-detection/       # Change detection patterns (Default vs OnPush)
├── 02-rxjs-state-management/  # State management with RxJS
├── 03-signal-first-touch/     # Introduction to signals
├── 04-signal-preliminary-injection-context/  # Signals with DI and effects
├── 05-signal-computed-effect/ # Computed signals and effects
├── 06-rxjs-interop/          # RxJS and signals interoperability
├── 07-signal-apis/           # Advanced signal patterns and components
└── 08-router-inputs/         # Signal-based routing and input handling
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm package manager

### Installation

```bash
npm install
```

or with pnpm:

```bash
pnpm install
```

## Development Server

To start a local development server, run:

```bash
npm start
```

or:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project for production, run:

```bash
npm run build
```

or:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running Unit Tests

To execute unit tests, use the following command:

```bash
npm test
```

or:

```bash
ng test
```

Tests are run using the [Vitest](https://vitest.dev/) test runner.

## Key Learning Topics

### 1. Change Detection

Explore the difference between default and OnPush change detection strategies and how signals work with Angular's change detection system.

### 2. Signals Fundamentals

Learn the basics of signals, including:

- Creating writable signals
- Computing derived values with `computed()`
- Running side effects with `effect()`

### 3. State Management

See how signals can be used for state management and how they compare to traditional RxJS approaches.

### 4. RxJS Interoperability

Understand how to integrate RxJS observables with Angular's signals API using `toSignal()` and `toObservable()`.

### 5. Standalone Components

Build complete applications using standalone components with dependency injection and routing.

## Resources

- [Angular Official Documentation](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Vitest Documentation](https://vitest.dev/)

## License

MIT
