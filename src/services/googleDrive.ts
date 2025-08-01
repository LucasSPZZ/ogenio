const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const isDemoMode = !API_KEY || API_KEY.includes('SUA_CHAVE') || 
                          !CLIENT_ID || CLIENT_ID.includes('SEU_ID');

let tokenClient: any = null;
let isInitialized = false;

export const initClient = (callback: (isSignedIn: boolean) => void) => {
  console.log('Inicializando cliente...', { isDemoMode, API_KEY: API_KEY ? 'Configurado' : 'Não configurado' });
  
  // Se está em modo demo, não precisa carregar nada
  if (isDemoMode) {
    console.log('Modo demo ativado - pulando inicialização da API do Google');
    isInitialized = true;
    setTimeout(() => callback(false), 100);
    return;
  }

  // Verifica se os scripts já estão carregados
  if (!window.gapi || !window.google) {
    console.log('Scripts do Google não carregados, carregando...');
    loadGoogleScripts(() => {
      initializeGoogleAPIs(callback);
    });
  } else {
    console.log('Scripts do Google já carregados');
    initializeGoogleAPIs(callback);
  }
};

const loadGoogleScripts = (onComplete: () => void) => {
  let scriptsLoaded = 0;
  const totalScripts = 2;
  
  const checkComplete = () => {
    scriptsLoaded++;
    if (scriptsLoaded === totalScripts) {
      onComplete();
    }
  };

  // Carrega GAPI
  if (!document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
    const scriptGapi = document.createElement('script');
    scriptGapi.src = 'https://apis.google.com/js/api.js';
    scriptGapi.async = true;
    scriptGapi.onload = checkComplete;
    scriptGapi.onerror = () => {
      console.error('Erro ao carregar GAPI script');
      checkComplete();
    };
    document.head.appendChild(scriptGapi);
  } else {
    checkComplete();
  }

  // Carrega GIS
  if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    const scriptGis = document.createElement('script');
    scriptGis.src = 'https://accounts.google.com/gsi/client';
    scriptGis.async = true;
    scriptGis.onload = checkComplete;
    scriptGis.onerror = () => {
      console.error('Erro ao carregar GIS script');
      checkComplete();
    };
    document.head.appendChild(scriptGis);
  } else {
    checkComplete();
  }
};

const initializeGoogleAPIs = (callback: (isSignedIn: boolean) => void) => {
  const initGapi = () => {
    if (!window.gapi) {
      console.error('GAPI não disponível');
      callback(false);
      return;
    }

    window.gapi.load('client', () => {
      window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      }).then(() => {
        console.log('GAPI inicializado com sucesso');
        initGIS(callback);
      }).catch((error: any) => {
        console.error('Erro ao inicializar GAPI:', error);
        callback(false);
      });
    });
  };

  const initGIS = (callback: (isSignedIn: boolean) => void) => {
    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services não disponível');
      callback(false);
      return;
    }

    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            console.log('Token recebido com sucesso');
            window.gapi.client.setToken(tokenResponse);
            isInitialized = true;
            callback(true);
          } else {
            console.error('Erro no token response:', tokenResponse);
            callback(false);
          }
        },
      });
      console.log('GIS inicializado com sucesso');
      isInitialized = true;
      callback(false); // Não está logado ainda
    } catch (error) {
      console.error('Erro ao inicializar GIS:', error);
      callback(false);
    }
  };

  // Aguarda um pouco para garantir que os scripts carregaram
  setTimeout(initGapi, 100);
};

export const signIn = () => {
  if (isDemoMode) {
    console.log('Tentativa de login em modo demo ignorada');
    return Promise.resolve();
  }
  
  if (!tokenClient) {
    console.error('Token client não inicializado');
    return Promise.reject('Cliente não inicializado');
  }
  
  console.log('Iniciando processo de login...');
  tokenClient.requestAccessToken({ prompt: 'consent' });
  return Promise.resolve();
};

export const signOut = (callback: () => void) => {
  if (isDemoMode) {
    console.log('Logout em modo demo');
    callback();
    return;
  }
  
  if (!window.gapi?.client?.getToken()) {
    console.log('Usuário não estava logado');
    callback();
    return;
  }

  try {
    const token = window.gapi.client.getToken();
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken(null);
        console.log('Logout realizado com sucesso');
        callback();
      });
    } else {
      window.gapi.client.setToken(null);
      callback();
    }
  } catch (error) {
    console.error('Erro no logout:', error);
    callback();
  }
};

export const createFolder = async (folderName: string): Promise<string> => {
  if (isDemoMode) {
    console.log(`Criando pasta demo: ${folderName}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return `demo-folder-${Date.now()}`;
  }

  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API não disponível');
  }

  try {
    const response = await window.gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      }
    });
    return response.result.id;
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    throw error;
  }
};

export const uploadFile = async (folderId: string, file: File): Promise<string> => {
  if (isDemoMode) {
    console.log(`Upload demo: ${file.name}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `demo-file-${Date.now()}`;
  }

  const token = window.gapi?.client?.getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  try {
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Erro no upload: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string): Promise<void> => {
  if (isDemoMode) {
    console.log(`Deletando arquivo demo: ${fileId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }

  if (fileId.startsWith('demo-')) {
    return; // Não tenta deletar arquivos de demo
  }

  const token = window.gapi?.client?.getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}; 