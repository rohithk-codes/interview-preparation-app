import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../common/Layout';
import type { Question } from '../../types';
import apiService from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const QuestionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = id !== 'new' && !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    topic: '',
    tags: [] as string[],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    solution: '',
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    hints: ['']
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await apiService.getQuestionById(id);
      if (response.success && response.data) {
        const q = response.data;
        setFormData({
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          topic: q.topic,
          tags: q.tags || [],
          testCases: q.testCases.length > 0 ? q.testCases : [{ input: '', expectedOutput: '', isHidden: false }],
          solution: q.solution || '',
          constraints: q.constraints || '',
          examples: q.examples && q.examples.length > 0 ? q.examples : [{ input: '', output: '', explanation: '' }],
          hints: q.hints && q.hints.length > 0 ? q.hints : ['']
        });
      }
    } catch (error: any) {
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.description || !formData.topic) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (formData.testCases.length === 0 || !formData.testCases[0].input) {
        toast.error('At least one test case is required');
        setLoading(false);
        return;
      }

      // Clean data
      const cleanData = {
        ...formData,
        tags: formData.tags.filter(t => t.trim()),
        testCases: formData.testCases.filter(tc => tc.input && tc.expectedOutput),
        examples: formData.examples.filter(ex => ex.input && ex.output),
        hints: formData.hints.filter(h => h.trim())
      };

      if (isEdit) {
        await apiService.updateQuestion(id!, cleanData);
        toast.success('Question updated successfully');
      } else {
        await apiService.createQuestion(cleanData);
        toast.success('Question created successfully');
      }
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }]
    });
  };

  const updateTestCase = (index: number, field: string, value: any) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, testCases: newTestCases });
  };

  const removeTestCase = (index: number) => {
    if (formData.testCases.length > 1) {
      setFormData({
        ...formData,
        testCases: formData.testCases.filter((_, i) => i !== index)
      });
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  const addHint = () => {
    setFormData({ ...formData, hints: [...formData.hints, ''] });
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  const removeHint = (index: number) => {
    setFormData({
      ...formData,
      hints: formData.hints.filter((_, i) => i !== index)
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Question' : 'Create New Question'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Arrays, Dynamic Programming"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="input-field flex-1"
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" onClick={addTag} className="btn-secondary">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => removeTag(index)} className="hover:text-primary-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Test Cases *</h2>
              <button type="button" onClick={addTestCase} className="btn-secondary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Test Case {index + 1}</span>
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                      <input
                        type="text"
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        className="input-field text-sm"
                        placeholder='e.g., [2,7,11,15], 9'
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                      <input
                        type="text"
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        className="input-field text-sm"
                        placeholder='e.g., [0,1]'
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Hidden (only visible after submission)</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Examples</h2>
              <button type="button" onClick={addExample} className="btn-secondary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Example
              </button>
            </div>

            <div className="space-y-4">
              {formData.examples.map((example, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Example {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                      <input
                        type="text"
                        value={example.input}
                        onChange={(e) => updateExample(index, 'input', e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                      <input
                        type="text"
                        value={example.output}
                        onChange={(e) => updateExample(index, 'output', e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                      <textarea
                        value={example.explanation}
                        onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                        className="input-field text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution & Constraints */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Solution & Constraints</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution Code *
                </label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  className="input-field font-mono text-sm"
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraints (Optional)
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  className="input-field text-sm"
                  rows={4}
                  placeholder="e.g., 1 <= nums.length <= 10^4"
                />
              </div>
            </div>
          </div>

          {/* Hints */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Hints (Optional)</h2>
              <button type="button" onClick={addHint} className="btn-secondary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Hint
              </button>
            </div>

            <div className="space-y-3">
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Hint ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeHint(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update Question' : 'Create Question'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default QuestionForm;