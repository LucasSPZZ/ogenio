// Funções que interagem com a API do Drive, assumindo que o usuário já está autenticado.

export const createFolder = async (folderName: string): Promise<string> => {
  const response = await window.gapi.client.drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  return response.result.id;
};

export const uploadFile = async (folderId: string, file: File): Promise<string> => {
  const metadata = {
    name: file.name,
    parents: [folderId],
    mimeType: file.type,
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);
  
  const token = window.gapi.client.getToken();
  if (!token) throw new Error("Usuário não autenticado");

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ Authorization: `Bearer ${token.access_token}` }),
    body: form,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message || 'Falha no upload');
  }
  
  const result = await res.json();
  return result.id;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await window.gapi.client.drive.files.delete({
    fileId: fileId,
  });
}; 