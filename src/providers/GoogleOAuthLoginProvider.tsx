import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../constants/env";

interface GoogleOAuthLoginProviderProps {
  children: React.ReactNode;
}

const GoogleOAuthLoginProvider: React.FC<GoogleOAuthLoginProviderProps> = (props: GoogleOAuthLoginProviderProps) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {props.children}
  </GoogleOAuthProvider>
)

export default GoogleOAuthLoginProvider;
