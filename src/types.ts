export interface ManagedFile {
  file: File;
  status: 'uploading' | 'completed' | 'error' | 'deleting';
  driveId?: string;
  error?: string;
}

export interface Empreendimento {
  id: string;
  nome: string;
  descricao: string;
  driveFolderId: string | null;
  arquivos: ManagedFile[];
  criadoEm: Date;
} 