import type React from "react";

interface LoadingProps {
  size?: number;
}

const Loading: React.FC<LoadingProps> = (props: LoadingProps) => {
  const size: number = props.size || 32;

  return (
    <div className="flex-1 flex items-center justify-center w-full">
      <span
        className="loading loading-spinner text-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default Loading;
