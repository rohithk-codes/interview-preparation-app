import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  running: boolean;
  submitting: boolean;
}

const CodeEditor  = ({
  code,
  language,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  running,
  submitting
}:CodeEditorProps) => {
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  return (
    <div className="card p-0 overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Language:</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Button */}
          <button
            onClick={onRun}
            disabled={running || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </button>

          {/* Submit Button */}
           <button
              onClick={onSubmit}
              disabled={running || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-red-50 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-[500px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;