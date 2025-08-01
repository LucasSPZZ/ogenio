export interface ManagedFile {
  file: File;
  status: 'uploading' | 'completed';
}

export interface Empreendimento {
  id: string;
  nome: string;
  descricao: string;
  arquivos: ManagedFile[];
  criadoEm: Date;
} 