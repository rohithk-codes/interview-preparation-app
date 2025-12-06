import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useEffect, useState } from "react";
import type { Question } from "../types";
import apiService from "../services/api"
import Layout from "../components/common/Layout";
import { Plus, Edit, Trash2, AlertCircle, Search } from 'lucide-react';


const AdminPage = () => {
const navigate = useNavigate();
const toast = useToast();
const [questions,setQuestions] = useState<Question[]>([]);
const [loading,setLoading] = useState(true)
const [searchTerm,setSearchTerm] = useState("")
const [deleteConfirm,setDeleteConfirm] = useState<string | null>(null)

useEffect(()=>{
    loadQuestions()
},[])

const loadQuestions = async ()=>{
    setLoading(true)
    try {
        const response = await apiService.getQuestions({limit:1000})
        if(response.success){
            setQuestions(response.data)
        }
    } catch (error:any) {
        toast.error("Failed to load questions")
    }finally{
        setLoading(false)
    }
}

const handleDelete = async (id:string)=>{
    try {
        await apiService.deleteQuestion(id)
        loadQuestions()
        setDeleteConfirm(null)
    } catch (error:any) {
       toast.error(error.response?.data?.message || "Failed to delete question") 
    }
}

const filteredQuestions = questions.filter(q=>
    q.title.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
    q.topic.toLowerCase().includes(searchTerm.toLowerCase())
)

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage coding questions</p>
          </div>
          <button
            onClick={() => navigate('/admin/questions/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Question
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.difficulty === 'Easy').length}
            </div>
            <div className="text-sm text-gray-600">Easy</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.difficulty === 'Medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.difficulty === 'Hard').length}
            </div>
            <div className="text-sm text-gray-600">Hard</div>
          </div>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acceptance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No questions found
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((question) => (
                      <tr key={question._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{question.title}</div>
                          <div className="text-sm text-gray-500 flex flex-wrap gap-1 mt-1">
                            {question.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {question.topic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {question.totalSubmissions}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {question.acceptanceRate ? `${question.acceptanceRate}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/admin/questions/edit/${question._id}`)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {deleteConfirm === question._id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(question._id)}
                                  className="text-red-600 hover:text-red-900 text-xs font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-gray-600 hover:text-gray-900 text-xs font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(question._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

}


export default AdminPage