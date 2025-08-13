export interface IQuestion {
  id: string;
  type: 'categorize' | 'cloze' | 'comprehension';
  title: string;
  image?: string;
  required: boolean;
  order: number;
}

export interface ICategorizeQuestion extends IQuestion {
  type: 'categorize';
  categories: string[];
  items: {
    id: string;
    text: string;
    category: string;
  }[];
}

export interface IClozeQuestion extends IQuestion {
  type: 'cloze';
  text: string;
  blanks: {
    id: string;
    correctAnswer: string;
    userAnswer?: string;
  }[];
}

export interface IComprehensionQuestion extends IQuestion {
  type: 'comprehension';
  passage: string;
  questions: {
    id: string;
    question: string;
    type: 'multiple-choice' | 'text';
    options?: string[];
    correctAnswer?: string;
    userAnswer?: string;
  }[];
}

export interface IForm {
  _id?: string;
  title: string;
  description?: string;
  headerImage?: string;
  questions: (ICategorizeQuestion | IClozeQuestion | IComprehensionQuestion)[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  shareLink?: string;
}

export interface IFormResponse {
  _id?: string;
  formId: string;
  responses: {
    questionId: string;
    answers: string | string[] | { [key: string]: string | string[] };
  }[];
  submittedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface IApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}