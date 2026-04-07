import React from "react";
import GoogleOAuthLoginProvider from "./GoogleOAuthLoginProvider";
import { AuthProvider } from "./AuthProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props: ProvidersProps) => (
  <GoogleOAuthLoginProvider>
    <AuthProvider>
      {props.children}
    </AuthProvider>
  </GoogleOAuthLoginProvider>
)

export default Providers;
