import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Plus, Edit, Image } from "lucide-react";
import { formApi, uploadApi } from "../services/api";
import {
  IForm,
  IQuestion,
  ICategorizeQuestion,
  IClozeQuestion,
  IComprehensionQuestion,
} from "../types";
import QuestionEditor from "./QuestionEditor";

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<IForm>({
    title: "",
    description: "",
    headerImage: "",
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const data = await formApi.getById(id!);
        setForm(data);
      } catch (error) {
        console.error("Error fetching form:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate form before saving
      if (!form.title.trim()) {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please enter a form title' } }));
        return;
      }

      console.log("Saving form:", form);

      if (id) {
        const updatedForm = await formApi.update(id, form);
        console.log("Form updated:", updatedForm);
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Form updated' } }));
      } else {
        const savedForm = await formApi.create(form);
        console.log("Form created:", savedForm);
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Form created' } }));
        navigate(`/builder/${savedForm._id}`);
      }
    } catch (error) {

      console.error("Error saving form:", error);
      console.error("Form data that failed to save:", form);

      const message = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Please check the console for details.';
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: `Error saving form: ${message}` } }));
    } finally {
      setSaving(false);
    }
  };

  const handleHeaderImageUpload = async (file: File) => {
    try {
      const result = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, headerImage: result.path }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const addQuestion = (type: "categorize" | "cloze" | "comprehension") => {
    const newQuestion: IQuestion = {
      id: Date.now().toString(),
      type,
      title: "",
      required: false,
      order: form.questions.length,
    };

    let questionData:
      | ICategorizeQuestion
      | IClozeQuestion
      | IComprehensionQuestion;

    switch (type) {
      case "categorize":
        questionData = {
          ...newQuestion,
          type: "categorize",
          categories: ["Category 1", "Category 2"],
          items: [
            { id: "1", text: "Item 1", category: "Category 1" },
            { id: "2", text: "Item 2", category: "Category 2" },
          ],
        };
        break;
      case "cloze":
        questionData = {
          ...newQuestion,
          type: "cloze",
          text: "This is a _____ test with _____ blanks.",
          blanks: [
            { id: "1", correctAnswer: "sample" },
            { id: "2", correctAnswer: "multiple" },
          ],
        };
        break;
      case "comprehension":
        questionData = {
          ...newQuestion,
          type: "comprehension",
          passage: "Read the following passage and answer the questions below.",
          questions: [
            {
              id: "1",
              question: "What is the main topic?",
              type: "text",
              correctAnswer: "",
            },
          ],
        };
        break;
      default:
        return;
    }

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, questionData],
    }));
  };

  const updateQuestion = (
    questionId: string,
    updatedQuestion: ICategorizeQuestion | IClozeQuestion | IComprehensionQuestion
  ) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? updatedQuestion : q
      ),
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...form.questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);

    // Update order
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index,
    }));

    setForm((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {id ? "Edit Form" : "Create New Form"}
        </h1>
        <p className="text-gray-600 text-lg">
          {id
            ? "Modify your form and update your questions"
            : "Build beautiful, interactive forms with our powerful editor"}
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Save className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Form Builder
            </h2>
            <p className="text-gray-600 text-sm">
              Design and customize your form
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save Form"}</span>
          </button>
        </div>
      </div>

      {/* Form Settings */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Details Panel */}
        <div className="lg:col-span-2">
          <div className="card space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Form Details
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Give your form a descriptive title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Describe what this form is for and provide any instructions"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Header Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeaderImageUpload(file);
                    }}
                    className="sr-only"
                    id="header-image-upload"
                  />
                  <label
                    htmlFor="header-image-upload"
                    className="cursor-pointer block"
                  >
                {form.headerImage ? (
                      <div className="space-y-4">
                        <img
                          src={`${window.location.origin.replace(/:\\d+$/, '')}${form.headerImage}`}
                          alt="Header"
                          className="max-w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          Upload header image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Preview Panel */}
        <div className="lg:col-span-1">
          <div className="card-compact sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Form Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="space-y-3">
                {form.headerImage && (
                  <div className="w-full h-20 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={`http://localhost:5000${form.headerImage}`}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {form.title || "Untitled Form"}
                  </h4>
                  {form.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {form.questions.length} question
                  {form.questions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <p className="text-gray-600 text-sm">
                Add and customize your form questions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => addQuestion("categorize")}
              className="btn-secondary flex items-center space-x-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
            >
              <Plus size={16} />
              <span>Categorize</span>
            </button>
            <button
              onClick={() => addQuestion("cloze")}
              className="btn-secondary flex items-center space-x-2 text-sm bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-cyan-100"
            >
              <Plus size={16} />
              <span>Cloze</span>
            </button>
            <button
              onClick={() => addQuestion("comprehension")}
              className="btn-secondary flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
            >
              <Plus size={16} />
              <span>Comprehension</span>
            </button>
          </div>
        </div>

        {form.questions.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your form by adding your first question using the
                buttons above.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Categorize
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  Cloze
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Comprehension
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {form.questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onReorder={reorderQuestions}
                index={index}
                totalQuestions={form.questions.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



export default FormBuilder;
