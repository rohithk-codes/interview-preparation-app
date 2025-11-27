import { createContext,useContext, useState} from "react"; 
import type { ReactNode } from "react";
import Toast from "../components/common/Toast";


type ToastType = "success" | "error" | "info"

interface ToastMessage {
    id:number;
    type:ToastType;
    message:string;
}

interface ToastContextType{
      showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({children}:ToastProviderProps)=>{
const [toasts,setToasts] = useState<ToastMessage[]>([])
let nextId = 0 ;

const showToast = (type:ToastType,message:string)=>{
    const id = nextId++;
    setToasts((prev)=>[...prev,{id,type,message}])
}
const removeToast= (id:number)=>{
     setToasts((prev)=>prev.filter((toast)=>toast.id !== id))
}

const value: ToastContextType = {
    showToast,
    success: (message: string) => showToast('success', message),
    error: (message: string) => showToast('error', message),
    info: (message: string) => showToast('info', message)
  };

   return (
      <ToastContext.Provider value={value}>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContext.Provider>
    );
    
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};