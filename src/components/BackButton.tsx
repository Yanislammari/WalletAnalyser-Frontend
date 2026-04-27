import type React from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { FiArrowLeft } from "react-icons/fi";

interface BackButtonProps {
  route: string;
}

const BackButton: React.FC<BackButtonProps> = (props: BackButtonProps) => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <button
      onClick={() => navigate(props.route)}
      className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
    >
      <FiArrowLeft size={20} />
    </button>
  );
}

export default BackButton;
