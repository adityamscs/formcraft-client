import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Trash2, Share2, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { formApi } from '../services/api';
import { IForm } from '../types';

const FormList = () => {
  const [forms, setForms] = useState<IForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await formApi.getAll();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formApi.delete(id);
        setForms(forms.filter(form => form._id !== id));
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await formApi.publish(id);
      fetchForms(); // Refresh the list
    } catch (error) {
      console.error('Error publishing form:', error);
    }
  };

  const copyShareLink = async (shareLink: string) => {
    const fullUrl = `${window.location.origin}/preview/${shareLink}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      // toast success event via custom event bus
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Share link copied!' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Could not copy link' } }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium">Loading your forms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Form Dashboard
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Create, manage, and analyze your forms with powerful insights and beautiful designs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-compact bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
            </div>
          </div>
        </div>
        <div className="card-compact bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{forms.filter(f => f.isPublished).length}</p>
            </div>
          </div>
        </div>
        <div className="card-compact bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{forms.filter(f => !f.isPublished).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your Forms</h2>
          <p className="text-gray-600 mt-1">Manage and organize your form collection</p>
        </div>
        <Link
          to="/builder"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create New Form</span>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Your First Form</h3>
            <p className="text-gray-600 mb-8">Start building beautiful, interactive forms with our powerful form builder.</p>
            <Link
              to="/builder"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Sparkles size={20} />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form._id} className="card-compact group hover:scale-105 transition-all duration-200">
              {/* Form Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {form.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {form.isPublished ? (
                      <span className="badge-success">
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="badge-warning">
                        <Edit className="w-3 h-3 mr-1" />
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Description */}
              {form.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{form.description}</p>
              )}

              {/* Form Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6 p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{form.questions.length} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Link
                    to={`/builder/${form._id}`}
                    className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Form"
                  >
                    <Edit size={18} />
                  </Link>
                  
                  <Link
                    to={`/preview/${form.shareLink}`}
                    className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                    title="Preview Form"
                  >
                    <Eye size={18} />
                  </Link>
                  
                  {form.isPublished && (
                    <button
                      onClick={() => copyShareLink(form.shareLink!)}
                      className="p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      title="Copy Share Link"
                    >
                      <Share2 size={18} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(form._id!)}
                    className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Form"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {!form.isPublished && (
                  <button
                    onClick={() => handlePublish(form._id!)}
                    className="btn-secondary text-sm bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 hover:border-emerald-600"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormList; 