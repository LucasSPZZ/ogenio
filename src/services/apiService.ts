const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface EmpreendimentoBackend {
  id: string;
  nome: string;
  descricao: string;
  driveFolderId: string;
}

export const createEmpreendimento = async (nome: string, descricao: string): Promise<EmpreendimentoBackend> => {
  // O endpoint/caminho do webhook será definido no seu workflow do n8n
  const response = await fetch(`${N8N_BASE_URL}/webhook/empreendimento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', nome, descricao }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro do backend:", errorBody);
    throw new Error('Falha ao criar empreendimento. Verifique se o n8n está rodando e o webhook está ativo.');
  }
  return response.json();
};

export const uploadFile = async (folderId: string, file: File): Promise<{ driveId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // O endpoint/caminho do webhook será definido no seu workflow do n8n
  const response = await fetch(`${N8N_BASE_URL}/webhook/upload/${folderId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro do backend:", errorBody);
    throw new Error('Falha no upload do arquivo. Verifique o n8n.');
  }
  return response.json();
};

export const deleteFile = async (fileId: string): Promise<void> => {
    await fetch(`${N8N_BASE_URL}/webhook/file/${fileId}`, {
        method: 'DELETE',
    });
};

export const deleteEmpreendimento = async (folderId: string): Promise<void> => {
    await fetch(`${N8N_BASE_URL}/webhook/empreendimento/${folderId}`, {
        method: 'DELETE',
    });
}; 