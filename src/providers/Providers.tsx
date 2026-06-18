import React from "react";
//import AppInsightsProvider from "./AppInsightsProvider";
import GoogleOAuthLoginProvider from "./GoogleOAuthLoginProvider";
import { AuthProvider } from "./AuthProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props: ProvidersProps) => (
  //<AppInsightsProvider>
    <GoogleOAuthLoginProvider>
      <AuthProvider>
        {props.children}
      </AuthProvider>
    </GoogleOAuthLoginProvider>
  //</AppInsightsProvider>
)

export default Providers;
