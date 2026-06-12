export interface Question {
  readonly caption: string;
  readonly options: string[];
  readonly correctAnswerIndex: number;
}