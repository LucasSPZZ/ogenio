/* global gapi, google */

// Declarações de tipos para resolver erros de linter
declare global {
  interface Window {
    onGapiLoad: () => void;
    onGisLoad: () => void;
    gapi: any;
    google: any;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const isDemoMode = !API_KEY || API_KEY.includes('SUA_CHAVE') || !CLIENT_ID || CLIENT_ID.includes('SEU_ID');

let tokenClient: any = null;
let onAuthChange: ((isSignedIn: boolean) => void) | null = null;
let gapiLoaded = false;
let gisLoaded = false;

// Promise que resolve quando ambas as APIs estiverem prontas
const gapiInitializationPromise = new Promise<void>((resolve, reject) => {
    const checkAndResolve = () => {
        if (gapiLoaded && gisLoaded) {
            resolve();
        }
    };

    window.onGapiLoad = () => {
        window.gapi.load('client', () => {
            window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            }).then(() => {
                gapiLoaded = true;
                checkAndResolve();
            }).catch(reject);
        });
    };

    window.onGisLoad = () => {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    window.gapi.client.setToken(tokenResponse);
                    if (onAuthChange) onAuthChange(true);
                } else {
                    if (onAuthChange) onAuthChange(false);
                }
            },
        });
        gisLoaded = true;
        checkAndResolve();
    };
});

// Adiciona os callbacks ao window
const gapiScript = document.createElement('script');
gapiScript.src = 'https://apis.google.com/js/api.js?onload=onGapiLoad';
gapiScript.async = true;
gapiScript.defer = true;
document.body.appendChild(gapiScript);

const gisScript = document.createElement('script');
gisScript.src = 'https://accounts.google.com/gsi/client?onload=onGisLoad';
gisScript.async = true;
gisScript.defer = true;
document.body.appendChild(gisScript);


export const initClient = async (callback: (isSignedIn: boolean) => void) => {
    onAuthChange = callback;
    if (isDemoMode) {
        console.log('Modo de demonstração ativado.');
        setTimeout(() => callback(false), 50);
        return;
    }
    await gapiInitializationPromise;
    // Estado inicial é "não logado"
    callback(false);
};

export const signIn = () => {
    if (isDemoMode || !tokenClient) return;
    tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const signOut = () => {
    if (isDemoMode) {
        if (onAuthChange) onAuthChange(false);
        return;
    }
    const token = window.gapi.client.getToken();
    if (token) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null);
            if (onAuthChange) onAuthChange(false);
        });
    }
};

const ensureApiReady = async () => {
    if (!isDemoMode) {
        await gapiInitializationPromise;
        if (!window.gapi.client.getToken()) {
            throw new Error("Usuário não autenticado");
        }
    }
};

export const createFolder = async (folderName: string): Promise<string> => {
    if (isDemoMode) {
        await new Promise(res => setTimeout(res, 500));
        return `demo-folder-${Date.now()}`;
    }
    await ensureApiReady();
    const response = await window.gapi.client.drive.files.create({
        resource: { name: folderName, mimeType: 'application/vnd.google-apps.folder' },
        fields: 'id',
    });
    return response.result.id;
};

export const uploadFile = async (folderId: string, file: File): Promise<string> => {
    if (isDemoMode) {
        await new Promise(res => setTimeout(res, 1000));
        return `demo-file-${Date.now()}`;
    }
    await ensureApiReady();
    const metadata = { name: file.name, parents: [folderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${window.gapi.client.getToken().access_token}` }),
        body: form,
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message || `Falha no upload (${res.status})`);
    }
    return (await res.json()).id;
};

export const deleteFile = async (fileId: string): Promise<void> => {
    if (isDemoMode || fileId.startsWith('demo-')) {
        await new Promise(res => setTimeout(res, 300));
        return;
    }
    await ensureApiReady();
    await window.gapi.client.drive.files.delete({ fileId });
}; 