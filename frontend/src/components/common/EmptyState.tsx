import React from "react";
import type { LucideIcon } from "lucide-react";


interface EmptyStateProps{
    icon:LucideIcon;
    title:string;
    description:string;
    action?:{
        label:string;
        onClick:()=>void
    }
}

const EmptyState = ({icon:Icon,title,description,action}:EmptyStateProps)=>{
     return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}


export default EmptyState;