import type React from "react";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes";

const App: React.FC = () => {
  return (
    <div>
      <Toaster position="bottom-left" theme="dark" richColors />
      <AppRoutes />
    </div>
  );
}

export default App;
