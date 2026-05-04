import React from "react";
import { InputMode } from "../enums/InputMode";

interface InputModeToggleProps {
  value: InputMode;
  onChange: (value: InputMode) => void;
}

const InputModeToggle: React.FC<InputModeToggleProps> = (props: InputModeToggleProps) => {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
      {([InputMode.AMOUNT, InputMode.SHARES] as InputMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => props.onChange(mode)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            props.value === mode ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {mode === InputMode.AMOUNT ? "Amount" : "Shares"}
        </button>
      ))}
    </div>
  );
}

export default InputModeToggle;
