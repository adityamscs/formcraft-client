import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { formApi, responseApi, API_ORIGIN } from '../services/api';
import { IForm, IFormResponse } from '../types';

const FormPreview = () => {
  const { shareLink } = useParams();
  const [form, setForm] = useState<IForm | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (shareLink) {
      fetchForm();
    }
  }, [shareLink]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await formApi.getByShareLink(shareLink!);
      setForm(data);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    // Validate required questions
    const requiredQuestions = form.questions.filter(q => q.required);
    const missingRequired = requiredQuestions.filter(q => !responses[q.id]);

    if (missingRequired.length > 0) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please fill in all required questions' } }));
      return;
    }

    try {
      setSubmitting(true);
      const responseData: Partial<IFormResponse> = {
        responses: Object.entries(responses).map(([questionId, answers]) => ({
          questionId,
          answers
        }))
      };

      await responseApi.submit(form._id!, responseData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Error submitting response' } }));
    } finally {
      setSubmitting(false);
    }
  };

  const renderCategorizeQuestion = (question: any) => {
    const userAnswers = responses[question.id] || {};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
            <div className="space-y-2">
              {question.categories.map((category: string) => (
                <div key={category} className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800">{category}</h5>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Items</h4>
            <div className="space-y-2">
              {question.items.map((item: any) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <p className="text-gray-800 mb-2">{item.text}</p>
                  <select
                    value={userAnswers[item.id] || ''}
                    onChange={(e) => {
                      const newAnswers = { ...userAnswers, [item.id]: e.target.value };
                      handleResponseChange(question.id, newAnswers);
                    }}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {question.categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClozeQuestion = (question: any) => {
    const userAnswers = responses[question.id] || {};
    
    // Split text by blanks and render with input fields
    const textParts = question.text.split('_____');
    
    return (
      <div className="space-y-4">
        <div className="text-gray-800 leading-relaxed">
          {textParts.map((part: string, index: number) => (
            <span key={index}>
              {part}
              {index < textParts.length - 1 && (
                <input
                  type="text"
                  value={userAnswers[`blank_${index}`] || ''}
                  onChange={(e) => {
                    const newAnswers = { ...userAnswers, [`blank_${index}`]: e.target.value };
                    handleResponseChange(question.id, newAnswers);
                  }}
                  className="mx-2 px-2 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700"
                  placeholder="Answer"
                />
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderComprehensionQuestion = (question: any) => {
    const userAnswers = responses[question.id] || {};
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Passage</h4>
          <p className="text-gray-800 leading-relaxed">{question.passage}</p>
        </div>
        
        <div className="space-y-4">
          {question.questions.map((q: any, index: number) => (
            <div key={q.id} className="border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                Question {index + 1}: {q.question}
              </h5>
              
              {q.type === 'text' ? (
                <textarea
                  value={userAnswers[q.id] || ''}
                  onChange={(e) => {
                    const newAnswers = { ...userAnswers, [q.id]: e.target.value };
                    handleResponseChange(question.id, newAnswers);
                  }}
                  className="input-field"
                  rows={3}
                  placeholder="Enter your answer"
                />
              ) : (
                <div className="space-y-2">
                  {q.options?.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={userAnswers[q.id] === option}
                        onChange={(e) => {
                          const newAnswers = { ...userAnswers, [q.id]: e.target.value };
                          handleResponseChange(question.id, newAnswers);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestion = (question: any, index: number) => {
    return (
      <div key={question.id} className="card">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {index + 1}. {question.title}
          </h3>
          {question.required && (
            <span className="text-red-500 text-sm">* Required</span>
          )}
        </div>

        {question.image && (
          <div className="mb-4">
            <img 
              src={`${API_ORIGIN}${question.image}`} 
              alt="Question" 
              className="max-w-full rounded"
            />
          </div>
        )}

        {question.type === 'categorize' && renderCategorizeQuestion(question)}
        {question.type === 'cloze' && renderClozeQuestion(question)}
        {question.type === 'comprehension' && renderComprehensionQuestion(question)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Form not found or not published</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-gray-600">Your response has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="text-center mb-8">
        {form.headerImage && (
          <div className="mb-6">
            <img 
              src={`${API_ORIGIN}${form.headerImage}`} 
              alt="Header" 
              className="max-w-full mx-auto rounded-lg"
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 text-lg">{form.description}</p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {form.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mx-auto"
        >
          <Send size={20} />
          <span>{submitting ? 'Submitting...' : 'Submit Response'}</span>
        </button>
      </div>
    </div>
  );
};

export default FormPreview; 