import React, { useMemo } from "react";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin, AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { APPINSIGHTS_CONNECTION_STRING } from "../constants/env";

interface AppInsightsProviderProps {
  children: React.ReactNode;
}

const AppInsightsProvider: React.FC<AppInsightsProviderProps> = (props: AppInsightsProviderProps) => {
  const reactPlugin = useMemo(() => new ReactPlugin(), []);

  useMemo(() => {
    if (!APPINSIGHTS_CONNECTION_STRING) {
      console.warn("[AppInsights] VITE_APPINSIGHTS_CONNECTION_STRING not set — telemetry disabled.");
      return;
    }

    const appInsights = new ApplicationInsights({
      config: {
        connectionString: APPINSIGHTS_CONNECTION_STRING,
        extensions: [reactPlugin],
        enableAutoRouteTracking: true,
        autoTrackPageVisitTime: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      },
    });

    appInsights.loadAppInsights();
  }, []);

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      {props.children}
    </AppInsightsContext.Provider>
  );
};

export default AppInsightsProvider;
