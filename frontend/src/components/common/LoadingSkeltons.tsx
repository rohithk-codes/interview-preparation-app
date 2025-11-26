import React from 'react';

export const QuestionCardSkeleton: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export const QuestionDetailSkeleton: React.FC = () => {
  return (
    <div className="card animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export const EditorSkeleton: React.FC = () => {
  return (
    <div className="card p-0 animate-pulse">
      <div className="h-14 bg-gray-200"></div>
      <div className="h-[500px] bg-gray-100"></div>
    </div>
  );
};