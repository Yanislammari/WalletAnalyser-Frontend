import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

interface GoogleOAuthLoginProviderProps {
  children: React.ReactNode;
}

const GoogleOAuthLoginProvider: React.FC<GoogleOAuthLoginProviderProps> = (props: GoogleOAuthLoginProviderProps) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {props.children}
  </GoogleOAuthProvider>
)

export default GoogleOAuthLoginProvider;
