import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

// Get Client ID from environment variable
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface GoogleAuthWrapperProps {
  children: React.ReactNode;
}

export const GoogleAuthWrapper: React.FC<GoogleAuthWrapperProps> = ({ children }) => {
  if (!clientId) {
    console.warn("Google Client ID is missing in environment variables.");
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
