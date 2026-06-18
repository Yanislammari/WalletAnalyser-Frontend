import React from "react"

interface ErrorCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  hint?: string;
}

const ErrorCardInApp: React.FC<ErrorCardProps> = (props: ErrorCardProps) => {
  return (
    <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden">
        <div className="px-8 pt-10 pb-7 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl ${props.iconBg} flex items-center justify-center mb-5 shadow-sm`}>
            {props.icon}
          </div>
          <h1 className="text-gray-900 font-bold text-xl tracking-tight">{props.title}</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{props.description}</p>
          {props.hint && (
            <p className="text-gray-400 text-xs mt-3 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 w-full text-left">
              {props.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorCardInApp;