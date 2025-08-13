import { useState } from "react";
import { Trash2, MoveUp, MoveDown, Plus, X } from "lucide-react";
import {
  ICategorizeQuestion,
  IClozeQuestion,
  IComprehensionQuestion,
} from "../types";
import { uploadApi, API_ORIGIN } from "../services/api";

// Change: onUpdate now accepts only the specific question types
interface QuestionEditorProps {
  question: ICategorizeQuestion | IClozeQuestion | IComprehensionQuestion;
  onUpdate: (
    questionId: string,
    question: ICategorizeQuestion | IClozeQuestion | IComprehensionQuestion
  ) => void;
  onDelete: (questionId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  index: number;
  totalQuestions: number;
}

const QuestionEditor = ({
  question,
  onUpdate,
  onDelete,
  onReorder,
  index,
  totalQuestions,
}: QuestionEditorProps) => {
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      const result = await uploadApi.uploadImage(file);
      onUpdate(question.id, { ...question, image: result.path });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setImageUploading(false);
    }
  };

  // Accepts partial of the union type
  const updateQuestion = (
    updates: Partial<ICategorizeQuestion> | Partial<IClozeQuestion> | Partial<IComprehensionQuestion>
  ) => {
    // Ensure the type property is not widened to a union
    if (question.type === "categorize") {
      onUpdate(
        question.id,
        { ...question, ...updates } as ICategorizeQuestion
      );
    } else if (question.type === "cloze") {
      onUpdate(
        question.id,
        { ...question, ...updates } as IClozeQuestion
      );
    } else if (question.type === "comprehension") {
      onUpdate(
        question.id,
        { ...question, ...updates } as IComprehensionQuestion
      );
    }
  };

  const renderCategorizeEditor = () => {
    const categorizeQuestion = question as ICategorizeQuestion;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="space-y-2">
            {categorizeQuestion.categories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    const newCategories = [...categorizeQuestion.categories];
                    newCategories[index] = e.target.value;
                    onUpdate(categorizeQuestion.id, {
                      ...categorizeQuestion,
                      categories: newCategories,
                    });
                  }}
                  className="input-field"
                  placeholder="Category name"
                />
                <button
                  onClick={() => {
                    const newCategories = categorizeQuestion.categories.filter(
                      (_, i) => i !== index
                    );
                    onUpdate(categorizeQuestion.id, {
                      ...categorizeQuestion,
                      categories: newCategories,
                    });
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newCategories = [
                  ...categorizeQuestion.categories,
                  `Category ${categorizeQuestion.categories.length + 1}`,
                ];
                onUpdate(categorizeQuestion.id, {
                  ...categorizeQuestion,
                  categories: newCategories,
                });
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items
          </label>
          <div className="space-y-2">
            {categorizeQuestion.items.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...categorizeQuestion.items];
                    newItems[index] = { ...item, text: e.target.value };
                    onUpdate(categorizeQuestion.id, {
                      ...categorizeQuestion,
                      items: newItems,
                    });
                  }}
                  className="input-field"
                  placeholder="Item text"
                />
                <select
                  value={item.category}
                  onChange={(e) => {
                    const newItems = [...categorizeQuestion.items];
                    newItems[index] = { ...item, category: e.target.value };
                    onUpdate(categorizeQuestion.id, {
                      ...categorizeQuestion,
                      items: newItems,
                    });
                  }}
                  className="input-field"
                >
                  {categorizeQuestion.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const newItems = categorizeQuestion.items.filter(
                      (_, i) => i !== index
                    );
                    onUpdate(categorizeQuestion.id, {
                      ...categorizeQuestion,
                      items: newItems,
                    });
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem = {
                  id: Date.now().toString(),
                  text: `Item ${categorizeQuestion.items.length + 1}`,
                  category: categorizeQuestion.categories[0] || "Category 1",
                };
                const newItems = [...categorizeQuestion.items, newItem];
                onUpdate(categorizeQuestion.id, {
                  ...categorizeQuestion,
                  items: newItems,
                });
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderClozeEditor = () => {
    const clozeQuestion = question as IClozeQuestion;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text with Blanks
          </label>
          <textarea
            value={clozeQuestion.text}
            onChange={(e) =>
              onUpdate(clozeQuestion.id, { ...clozeQuestion, text: e.target.value })
            }
            className="input-field"
            rows={4}
            placeholder="Enter text with _____ for blanks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blanks
          </label>
          <div className="space-y-2">
            {clozeQuestion.blanks.map((blank, index) => (
              <div key={blank.id} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Blank {index + 1}:
                </span>
                <input
                  type="text"
                  value={blank.correctAnswer}
                  onChange={(e) => {
                    const newBlanks = [...clozeQuestion.blanks];
                    newBlanks[index] = {
                      ...blank,
                      correctAnswer: e.target.value,
                    };
                    onUpdate(clozeQuestion.id, {
                      ...clozeQuestion,
                      blanks: newBlanks,
                    });
                  }}
                  className="input-field"
                  placeholder="Correct answer"
                />
                <button
                  onClick={() => {
                    const newBlanks = clozeQuestion.blanks.filter(
                      (_, i) => i !== index
                    );
                    onUpdate(clozeQuestion.id, {
                      ...clozeQuestion,
                      blanks: newBlanks,
                    });
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newBlank = {
                  id: Date.now().toString(),
                  correctAnswer: "",
                };
                const newBlanks = [...clozeQuestion.blanks, newBlank];
                onUpdate(clozeQuestion.id, { ...clozeQuestion, blanks: newBlanks });
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Blank</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderComprehensionEditor = () => {
    const comprehensionQuestion = question as IComprehensionQuestion;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passage
          </label>
          <textarea
            value={comprehensionQuestion.passage}
            onChange={(e) =>
              onUpdate(comprehensionQuestion.id, {
                ...comprehensionQuestion,
                passage: e.target.value,
              })
            }
            className="input-field"
            rows={6}
            placeholder="Enter the reading passage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions
          </label>
          <div className="space-y-4">
            {comprehensionQuestion.questions.map((q, index) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Question {index + 1}
                  </span>
                  <button
                    onClick={() => {
                      const newQuestions =
                        comprehensionQuestion.questions.filter(
                          (_, i) => i !== index
                        );
                      onUpdate(comprehensionQuestion.id, {
                        ...comprehensionQuestion,
                        questions: newQuestions,
                      });
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => {
                    const newQuestions = [...comprehensionQuestion.questions];
                    newQuestions[index] = { ...q, question: e.target.value };
                    onUpdate(comprehensionQuestion.id, {
                      ...comprehensionQuestion,
                      questions: newQuestions,
                    });
                  }}
                  className="input-field"
                  placeholder="Question text"
                />

                <select
                  value={q.type}
                  onChange={(e) => {
                    const newQuestions = [...comprehensionQuestion.questions];
                    newQuestions[index] = {
                      ...q,
                      type: e.target.value as "multiple-choice" | "text",
                      options:
                        e.target.value === "multiple-choice"
                          ? ["Option 1", "Option 2"]
                          : undefined,
                    };
                    onUpdate(comprehensionQuestion.id, {
                      ...comprehensionQuestion,
                      questions: newQuestions,
                    });
                  }}
                  className="input-field"
                >
                  <option value="text">Text Answer</option>
                  <option value="multiple-choice">Multiple Choice</option>
                </select>

                {q.type === "multiple-choice" && q.options && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [
                              ...comprehensionQuestion.questions,
                            ];
                            const newOptions = [...(q.options || [])];
                            newOptions[optIndex] = e.target.value;
                            newQuestions[index] = { ...q, options: newOptions };
                            onUpdate(comprehensionQuestion.id, {
                              ...comprehensionQuestion,
                              questions: newQuestions,
                            });
                          }}
                          className="input-field"
                          placeholder="Option text"
                        />
                        <button
                          onClick={() => {
                            const newQuestions = [
                              ...comprehensionQuestion.questions,
                            ];
                            const newOptions =
                              q.options?.filter((_, i) => i !== optIndex) || [];
                            newQuestions[index] = { ...q, options: newOptions };
                            onUpdate(comprehensionQuestion.id, {
                              ...comprehensionQuestion,
                              questions: newQuestions,
                            });
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newQuestions = [
                          ...comprehensionQuestion.questions,
                        ];
                        const newOptions = [
                          ...(q.options || []),
                          `Option ${(q.options?.length || 0) + 1}`,
                        ];
                        newQuestions[index] = { ...q, options: newOptions };
                        onUpdate(comprehensionQuestion.id, {
                          ...comprehensionQuestion,
                          questions: newQuestions,
                        });
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                const newQuestion = {
                  id: Date.now().toString(),
                  question: "",
                  type: "text" as const,
                  correctAnswer: "",
                };
                const newQuestions = [
                  ...comprehensionQuestion.questions,
                  newQuestion,
                ];
                onUpdate(comprehensionQuestion.id, {
                  ...comprehensionQuestion,
                  questions: newQuestions,
                });
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionEditor = () => {
    switch (question.type) {
      case "categorize":
        return renderCategorizeEditor();
      case "cloze":
        return renderClozeEditor();
      case "comprehension":
        return renderComprehensionEditor();
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-500">
            Question {index + 1}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
            {question.type}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {index > 0 && (
            <button
              onClick={() => onReorder(index, index - 1)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Move Up"
            >
              <MoveUp size={16} />
            </button>
          )}

          {index < totalQuestions - 1 && (
            <button
              onClick={() => onReorder(index, index + 1)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Move Down"
            >
              <MoveDown size={16} />
            </button>
          )}

          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-red-600 hover:text-red-700"
            title="Delete Question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateQuestion({ title: e.target.value })}
            className="input-field"
            placeholder="Enter question title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="input-field"
            disabled={imageUploading}
          />
          {question.image && (
            <div className="mt-2">
              <img
                src={`${API_ORIGIN}${question.image}`}
                alt="Question"
                className="max-w-xs rounded"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`required-${question.id}`}
            checked={question.required}
            onChange={(e) => updateQuestion({ required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`required-${question.id}`}
            className="text-sm font-medium text-gray-700"
          >
            Required
          </label>
        </div>

        {renderQuestionEditor()}
      </div>
    </div>
  );
};

export default QuestionEditor;
