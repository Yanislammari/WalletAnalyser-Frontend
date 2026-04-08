import type React from "react";

interface BackgroundProps {
  children: React.ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white">
      <div className="absolute -top-[20%] -right-[10%] w-[900px] h-[900px] rounded-full bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-transparent blur-[120px]" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-400/20 via-purple-400/20 to-transparent blur-[100px]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <svg
          className="absolute top-0 right-0 h-full w-[60%]"
          viewBox="0 0 500 1000"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 Q400,400 200,1000 L500,1000 L500,0 Z"
            fill="rgba(139,92,246,0.08)"
          />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}

export default Background;
