import { computed, Injectable, signal } from '@angular/core';
import { Question } from './model/question';

@Injectable({
  providedIn: 'root',
})
export class Exam {
  readonly #questions = signal<Question[]>([
    {
      caption: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      correctAnswerIndex: 0,
    },
    {
      caption: 'What is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswerIndex: 2,
    },
    {
      caption: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'],
      correctAnswerIndex: 0,
    },
  ]);

  readonly questions = this.#questions.asReadonly();

  readonly #userAnswers = signal<number[]>([]);

  // readonly userAnswers = this.#userAnswers.asReadonly();

  readonly userAnswers = computed(() =>
    this.#userAnswers().map((ans, index) => ({
      userAnswerIndex: ans,
      isCorrect: ans === this.questions()[index].correctAnswerIndex,
    })),
  );

  readonly #isBusy = signal<boolean>(false);

  readonly isBusy = this.#isBusy.asReadonly();

  readonly currentQuestionIndex = computed(() => this.userAnswers().length);

  readonly currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);

  readonly questionCount = computed(() => this.questions().length);

  readonly isQuizDone = computed(() => this.userAnswers().length === this.questions().length);
}
