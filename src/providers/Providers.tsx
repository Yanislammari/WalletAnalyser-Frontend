import React from "react";
//import AppInsightsProvider from "./AppInsightsProvider";
import GoogleOAuthLoginProvider from "./GoogleOAuthLoginProvider";
import { SearchProvider } from "./SearchProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props: ProvidersProps) => (
  //<AppInsightsProvider>
    <GoogleOAuthLoginProvider>
      <SearchProvider>
        {props.children}
      </SearchProvider>
    </GoogleOAuthLoginProvider>
  //</AppInsightsProvider>
)

export default Providers;
