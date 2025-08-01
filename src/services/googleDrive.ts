declare global {
  interface Window {
    gapi: any;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Modo de demonstração quando as credenciais não estão configuradas
const isDemoMode = !API_KEY || API_KEY === 'SUA_CHAVE_DE_API_DO_GOOGLE' || 
                   !CLIENT_ID || CLIENT_ID === 'SEU_ID_DE_CLIENTE_OAUTH_DO_GOOGLE';

export const initClient = (callback: (isSignedIn: boolean) => void) => {
  if (isDemoMode) {
    console.log('Modo de demonstração ativado - Google Drive não configurado');
    callback(false);
    return;
  }

  if (!window.gapi) {
    console.error('Google API não carregada');
    callback(false);
    return;
  }

  window.gapi.load('client:auth2', () => {
    window.gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      const authInstance = window.gapi.auth2.getAuthInstance();
      callback(authInstance.isSignedIn.get());
      authInstance.isSignedIn.listen(callback);
    }).catch((error: any) => {
      console.error('Erro ao inicializar Google API:', error);
      callback(false);
    });
  });
};

export const signIn = () => {
  if (isDemoMode) {
    throw new Error('Modo de demonstração - Google Drive não configurado');
  }
  
  if (!window.gapi?.auth2) {
    throw new Error('Google API não inicializada');
  }
  return window.gapi.auth2.getAuthInstance().signIn();
};

export const signOut = () => {
  if (isDemoMode) {
    return Promise.resolve();
  }
  
  if (!window.gapi?.auth2) {
    throw new Error('Google API não inicializada');
  }
  return window.gapi.auth2.getAuthInstance().signOut();
};

export const createFolder = async (folderName: string): Promise<string> => {
  if (isDemoMode) {
    // Simula criação de pasta em modo demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `demo-folder-${Date.now()}`;
  }

  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API não disponível');
  }

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  try {
    const response = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    return response.result.id!;
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    throw error;
  }
};

export const uploadFile = async (folderId: string, file: File): Promise<string> => {
  if (isDemoMode) {
    // Simula upload em modo demo
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `demo-file-${Date.now()}`;
  }

  if (!window.gapi?.auth2) {
    throw new Error('Google API não inicializada');
  }

  const metadata = {
    name: file.name,
    parents: [folderId],
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const accessToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
    body: form,
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.id;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  if (isDemoMode) {
    // Simula exclusão em modo demo
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API não disponível');
  }

  try {
    await window.gapi.client.drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}; 