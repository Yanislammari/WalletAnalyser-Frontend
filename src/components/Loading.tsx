import type React from "react";

interface LoadingProps {
  size?: number;
}

const Loading: React.FC<LoadingProps> = (props: LoadingProps) => {
  const size: number = props.size || 32;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
      <span
        className="loading loading-spinner text-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default Loading;
