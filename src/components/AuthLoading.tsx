import type React from "react";
import Background from "./Background";
import Loading from "./Loading";

const AuthLoading: React.FC = () => {
  return (
    <Background>
      <Loading size={96} />
    </Background>
  );
}

export default AuthLoading;
