import { useState, useEffect, useCallback } from 'react';

// Declarações de tipos para o linter
declare global {
  interface Window { gapi: any; google: any; }
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const isDemoMode = !API_KEY || API_KEY.includes('SUA_CHAVE') || 
                          !CLIENT_ID || CLIENT_ID.includes('SEU_ID');

let tokenClient: any = null;

export const useGoogleAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadScript = useCallback((src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (isDemoMode) {
        setIsInitialized(true);
        return;
      }

      try {
        await loadScript('https://apis.google.com/js/api.js');
        await loadScript('https://accounts.google.com/gsi/client');
        
        await new Promise<void>((resolve) => window.gapi.load('client', resolve));
        
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              window.gapi.client.setToken(tokenResponse);
              setIsSignedIn(true);
            }
          },
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Erro na inicialização do Google Auth:", error);
      }
    };
    initialize();
  }, [loadScript]);

  const signIn = useCallback(() => {
    if (isDemoMode) {
      setIsSignedIn(true);
    } else if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }, []);

  const signOut = useCallback(() => {
    if (isDemoMode) {
      setIsSignedIn(false);
      return;
    }
    const token = window.gapi?.client?.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken(null);
        setIsSignedIn(false);
      });
    }
  }, []);

  return { isSignedIn, isInitialized, signIn, signOut, isDemoMode };
}; 