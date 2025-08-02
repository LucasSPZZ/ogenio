let tokenClient: any = null;

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const isDemoMode = !API_KEY || API_KEY.includes('SUA_CHAVE') || 
                          !CLIENT_ID || CLIENT_ID.includes('SEU_ID');

const handleGapiLoad = (callback: (isSignedIn: boolean) => void) => {
  console.log('Inicializando GAPI e GIS...');
  
  window.gapi.load('client', () => {
    console.log('GAPI client carregado, inicializando...');
    window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      console.log('GAPI client inicializado com sucesso.');
    }).catch((err: any) => console.error("Erro ao inicializar GAPI client:", err));
  });

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        console.log('Token response recebido:', tokenResponse);
        if (tokenResponse && tokenResponse.access_token) {
          window.gapi.client.setToken(tokenResponse);
          callback(true);
        } else {
          console.error("Erro na resposta do token:", tokenResponse);
          callback(false);
        }
      },
    });
    console.log('Token client inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar token client:', error);
  }
  
  // O usuário não está logado na inicialização
  callback(false);
};

export const initClient = (callback: (isSignedIn: boolean) => void) => {
  console.log('initClient chamado, modo demo:', isDemoMode);
  
  if (isDemoMode) {
    console.log('Modo de demonstração ativado.');
    setTimeout(() => callback(false), 50); // Simula pequena espera
    return;
  }
  
  let attempts = 0;
  const maxAttempts = 50; // Máximo 5 segundos (50 * 100ms)
  
  // Tenta inicializar repetidamente até que os scripts estejam prontos
  const checkAndInit = () => {
    attempts++;
    console.log(`Verificando scripts... (tentativa ${attempts}/${maxAttempts})`, { 
      gapi: !!window.gapi, 
      google: !!window.google,
      googleAccounts: !!window.google?.accounts,
      googleOAuth2: !!window.google?.accounts?.oauth2
    });
    
    if (window.gapi && window.google?.accounts?.oauth2) {
      console.log('Scripts prontos, inicializando...');
      handleGapiLoad(callback);
    } else if (attempts >= maxAttempts) {
      console.error('Timeout: Scripts do Google não carregaram após', maxAttempts, 'tentativas');
      console.log('Forçando modo demo devido a falha no carregamento dos scripts');
      callback(false); // Força modo demo
    } else {
      console.log('Scripts ainda não carregados, aguardando...');
      setTimeout(checkAndInit, 100);
    }
  };
  checkAndInit();
};

export const signIn = () => {
  if (isDemoMode) return Promise.resolve();
  if (!tokenClient) {
    console.error('Token client não inicializado. Tentando inicializar novamente...');
    return Promise.reject("Cliente de token não inicializado.");
  }
  
  console.log('Iniciando processo de login...');
  tokenClient.requestAccessToken({ prompt: 'consent' });
  return Promise.resolve();
};

export const signOut = (callback: () => void) => {
  if (isDemoMode) {
    callback();
    return;
  }
  
  const token = window.gapi?.client?.getToken();
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken(null);
      callback();
    });
  } else {
    callback();
  }
};

const createApiRequest = async (path: string, method: 'POST' | 'DELETE', body?: any) => {
  const token = window.gapi.client.getToken();
  if (!token) throw new Error('Usuário não autenticado');

  const response = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || `Falha na requisição: ${response.statusText}`);
  }
  return response.json();
};

export const createFolder = async (folderName: string): Promise<string> => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `demo-folder-${Date.now()}`;
  }
  const metadata = { name: folderName, mimeType: 'application/vnd.google-apps.folder' };
  const result = await createApiRequest('files', 'POST', metadata);
  return result.id;
};

export const uploadFile = async (folderId: string, file: File): Promise<string> => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `demo-file-${Date.now()}`;
  }
  const token = window.gapi.client.getToken();
  if (!token) throw new Error('Usuário não autenticado');

  const metadata = { name: file.name, parents: [folderId] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token.access_token}` },
    body: form,
  });
  
  const result = await response.json();
  if (result.error) throw new Error(result.error.message);
  return result.id;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  if (isDemoMode || fileId.startsWith('demo-')) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  await createApiRequest(`files/${fileId}`, 'DELETE');
}; 