import type React from "react";
import Background from "../components/Background";
import Loading from "../components/Loading";

const AuthLoading: React.FC = () => {
  return (
    <Background>
      <Loading size={96} />
    </Background>
  );
}

export default AuthLoading;
