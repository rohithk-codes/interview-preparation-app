// import React,{useState,useEffect} from "react";
// import { useParams,useNavigate } from "react-router-dom";
// import Layout from "../components/common/Layout";
// import QuestionDescription from "../components/questions/QuestionDescription";
// import  TestResults from "../components/questions/TestResult";
//  import type {Question,TestResult} from "../types"
// import apiService from "../services/api"
// import { AlertCircle,ArrowLeft,History } from "lucide-react";
// import CodeEditor from "../components/questions/CodeEditor";
// import { useToast } from "../contexts/ToastContext";
// import SubmissionHistory from "../components/questions/SubmissionHistory"


// const QuestionDetail = ()=>{
//     const {id} = useParams<{id:string}>()
//     const navigate = useNavigate()
//     const toast = useToast()

//     const[question,setQuestion] = useState<Question | null>(null)
//     const[loading,setLoading] = useState(true)
//     const[error,setError] = useState("")
//     const[code,setCode] = useState("")
//     const[language,setLanguage] = useState("javascript")
//     const[testResults,setTestResults] = useState<TestResult[]>([])
//     const[submitting,setSubmitting] = useState(false)
//     const[running,setRunning] = useState(false)
//     const[showHistory,setShowHistory] = useState(false)

//     useEffect(()=>{
// if(id)loadQuestion()
//     },[id])

//     const loadQuestion = async ()=>{
//         if(!id) return;

//         setLoading(true)
//         setError("")

//         try {
//             const response = await apiService.getQuestionById(id)
//             if(response.success && response.data){
//                 setQuestion(response.data)
//                 setCode(getStarterCode(response.data))
//             }
//         } catch (error:any) {
//             setError(error.response?.data?.message || "Failed to load question")
//         }finally{
//             setLoading(false)
//         }
//     }

//     const getStarterCode = (q:Question):string=>{
//         const functionName = q.title
//         .toLowerCase()
//        .replace(/[^a-z0-9]/g, '')
//       .replace(/\s+/g, '');

//       return `function ${functionName}(){
//       // Write your code here
//       }`
//     }

//     const handleRunCode = async ()=>{
//         if(!question) return 

//         setRunning(true)
//         setTestResults([])
//         setError("")

//         try {
//             const response = await apiService.runCode(question._id,code,language)

//             if(response.success && response.data){
//                 setTestResults(response.data.testResults)
//             }

//         } catch (error:any) {
//             setError(error.response?.data?.message || "Failed to run code")
//         }finally{
//             setRunning(false)
//         }

//     }

//     const handleSubmitCode = async ()=>{
//         if(!question) return 

//         setSubmitting(true)
//         setTestResults([])
//         setError("")
//         try {
//            const response = await apiService.submitCode(question._id,code,language)
           
//            if(response.success && response.data){
//             pollSubmissionResults(response.data._id)
//            }
//         } catch (error:any) {
//            setError(error.response?.data?.message || "Failed to submit code") 
//            setSubmitting(false)
//         }
//     }

//     const pollSubmissionResults = async (submissionId:string)=>{
//         const maxAttempts = 20
//         let attempts = 0 
        
//         const poll = setInterval(async()=>{
//             attempts++;

//             try {
//            const response = await apiService.getSubmissionById(submissionId)
//            if(response.success && response.data){
//             const submission = response.data

//              if(submission.status !=="Running" && submission.status !== "Pending"){
//             setTestResults(submission.testResults)
//             setSubmitting(false)
//             clearInterval(poll)

//             if(submission.status==="Accepted"){
//                 toast.success(" All test case passed! Solution accepted")
//             }else{
//               toast.error(` ${submission.status}`);
//             }
//            }

//            }
//            if(attempts>=maxAttempts){
//             clearInterval(poll)
//             setSubmitting(false)
//             setError("Submission timed out. Please try again.")
//            }
           
//             } catch (error) {
//               clearInterval(poll)
//               setSubmitting(false)
//               setError("Failed to get submission results")  
//             }

//         },1000)
//     }


//      if (loading) {
//         return (
//           <Layout>
//             <div className="flex justify-center items-center py-12 ">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//           </Layout>
//         );
//       }
    
//       if (error && !question) {
//         return (
//           <Layout>
//             <div className="max-w-7xl mx-auto">
//               <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                 <span>{error}</span>
//               </div>
//             </div>
//           </Layout>
//         );
//       }

//       if(!question) return null


//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto">
       
//         {/* Back Button */}
//         <button
//           onClick={() => navigate('/questions')}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4  "
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Questions
//         </button>

//          <button
//             onClick={() => setShowHistory(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//           >
//             <History className="w-5 h-5" />
//             Submission History
//           </button>

//         {/* Split Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
//           {/* Left Panel - Question Description */}
//           <div className="lg:h-[calc(100vh-12rem)] lg:overflow-y-auto">
//             <QuestionDescription question={question} />
//           </div>

//           {/* Right Panel - Code Editor */}
//           <div className="space-y-4">
//             <CodeEditor
//               code={code}
//               language={language}
//               onChange={setCode}
//               onLanguageChange={setLanguage}
//               onRun={handleRunCode}
//               onSubmit={handleSubmitCode}
//               running={running}
//               submitting={submitting}
//             />

//             {/* Error Display */}
//             {error && (
//               <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {/* Test Results */}
//             {testResults.length > 0 && (
//               <TestResults results={testResults} />
//             )}
//           </div>
//         </div>
//         {
//           question && (
//             <SubmissionHistory 
//             questionId={question._id}
//             isOpen={showHistory}
//             onClose={()=>setShowHistory(false)}
//             />
//           )
//         }
//       </div>
//     </Layout>
//   );
// };

// export default QuestionDetail;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/common/Layout';
import CodeEditor from '../components/questions/CodeEditor';
import QuestionDescription from '../components/questions/QuestionDescription';
import TestResults from '../components/questions/TestResult';
import SubmissionHistory from '../components/questions/SubmissionHistory';
import type { Question, TestResult } from '../types';
import apiService from '../services/api';
import { AlertCircle, ArrowLeft, History } from 'lucide-react';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await apiService.getQuestionById(id);
      if (response.success && response.data) {
        setQuestion(response.data);
        // Set starter code
        setCode(getStarterCode(response.data));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const getStarterCode = (q: Question): string => {
    // Generate starter code based on question title
    const functionName = q.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');

    return `function ${functionName}() {
  // Write your code here
  
}`;
  };

  const handleRunCode = async () => {
    if (!question) return;

    setRunning(true);
    setTestResults([]);
    setError('');

    try {
      const response = await apiService.runCode(question._id, code, language);
      
      if (response.success && response.data) {
        setTestResults(response.data.testResults);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!question) return;

    setSubmitting(true);
    setTestResults([]);
    setError('');

    try {
      const response = await apiService.submitCode(question._id, code, language);
      
      if (response.success && response.data) {
        // Poll for results
        pollSubmissionResults(response.data._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit code');
      setSubmitting(false);
    }
  };

  const pollSubmissionResults = async (submissionId: string) => {
    const maxAttempts = 20;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const response = await apiService.getSubmissionById(submissionId);
        
        if (response.success && response.data) {
          const submission = response.data;

          if (submission.status !== 'Running' && submission.status !== 'Pending') {
            // Submission completed
            setTestResults(submission.testResults);
            setSubmitting(false);
            clearInterval(poll);

            // Show success/failure message
            if (submission.status === 'Accepted') {
              toast.success('✅ All test cases passed! Solution accepted.');
            } else {
              toast.error(`❌ ${submission.status}`);
            }
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setSubmitting(false);
          setError('Submission timed out. Please try again.');
        }
      } catch (err) {
        clearInterval(poll);
        setSubmitting(false);
        setError('Failed to get submission results');
      }
    }, 1000); // Poll every second
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error && !question) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!question) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Questions
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <History className="w-5 h-5" />
            Submission History
          </button>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Question Description */}
          <div className="lg:h-[calc(100vh-12rem)] lg:overflow-y-auto lg:sticky lg:top-20">
            <QuestionDescription question={question} />
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-4">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              running={running}
              submitting={submitting}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <TestResults results={testResults} />
            )}
          </div>
        </div>

        {/* Submission History Modal */}
        {question && (
          <SubmissionHistory
            questionId={question._id}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default QuestionDetail;