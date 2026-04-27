import React from "react";

interface ErrorCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  hint?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = (props: ErrorCardProps) => {
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
        <div className="px-8 pb-8">
          <a
            href="/main"
            className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-purple-200 cursor-pointer"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorCard;
