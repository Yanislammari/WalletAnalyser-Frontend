import React from "react";
//import AppInsightsProvider from "./AppInsightsProvider";
import GoogleOAuthLoginProvider from "./GoogleOAuthLoginProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props: ProvidersProps) => (
  //<AppInsightsProvider>
    <GoogleOAuthLoginProvider>
        {props.children}
    </GoogleOAuthLoginProvider>
  //</AppInsightsProvider>
)

export default Providers;
