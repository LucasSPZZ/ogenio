import { useState } from 'react';
import { FileText, Settings, Trash2, UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import type { Empreendimento, ManagedFile } from '../types';

interface ConfigModalProps {
  empreendimento: Empreendimento | null;
  onClose: () => void;
  onSave: (id: string, data: { nome: string; descricao: string }) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement> | DragEvent, id: string) => void;
  onDeleteFile: (empreendimentoId: string, fileIndex: number) => void;
  onClearAllFiles: (empreendimentoId: string) => void;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ConfigModal({ empreendimento, onClose, onSave, onFileUpload, onDeleteFile, onClearAllFiles }: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'arquivos'>('geral');
  const [nome, setNome] = useState(empreendimento?.nome || '');
  const [descricao, setDescricao] = useState(empreendimento?.descricao || '');
  const [isDragOver, setIsDragOver] = useState(false);

  if (!empreendimento) return null;

  const handleSave = () => {
    onSave(empreendimento.id, { nome, descricao });
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja remover todos os arquivos deste empreendimento? Esta ação não pode ser desfeita.")) {
      onClearAllFiles(empreendimento.id);
    }
  }
  
  const renderFileItem = (managedFile: ManagedFile, index: number) => {
    let icon;
    if (managedFile.status === 'uploading' || managedFile.status === 'deleting') {
      icon = <Spinner className="h-6 w-6 text-slate-400" />;
    } else if (managedFile.status === 'completed') {
      icon = <FileText className="h-6 w-6 text-brand-start flex-shrink-0" />;
    } else { // error
      icon = <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />;
    }

    return (
      <div key={index} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        {icon}
        <div className="flex-grow">
          <p className="text-sm font-medium text-slate-700 truncate">{managedFile.file.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatFileSize(managedFile.file.size)}</span>
            {managedFile.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            {managedFile.status === 'error' && <span className="text-red-600 truncate">{managedFile.error}</span>}
          </div>
        </div>
        <button onClick={() => onDeleteFile(empreendimento.id, index)} disabled={managedFile.status === 'deleting'} className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={!!empreendimento}
      onClose={onClose}
      title={`Configurações: ${empreendimento.nome}`}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md">
            Salvar Alterações
          </button>
        </>
      }
    >
      <div className="flex border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('geral')} className={`flex items-center gap-2 px-4 py-3 font-medium ${activeTab === 'geral' ? 'text-brand-start border-b-2 border-brand-start' : 'text-slate-500'}`}>
          <Settings size={18} /> Geral
        </button>
        <button onClick={() => setActiveTab('arquivos')} className={`flex items-center gap-2 px-4 py-3 font-medium ${activeTab === 'arquivos' ? 'text-brand-start border-b-2 border-brand-start' : 'text-slate-500'}`}>
          <FileText size={18} /> Arquivos
        </button>
      </div>

      {activeTab === 'geral' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome do Empreendimento</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
      )}

      {activeTab === 'arquivos' && (
        <div className="space-y-8 animate-fade-in">
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload de Arquivos</h3>
            <label 
              className={`flex justify-center w-full h-32 px-4 transition-colors bg-white border-2 border-slate-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-start focus:outline-none ${isDragOver ? 'border-brand-start bg-indigo-50' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); onFileUpload(e as any, empreendimento.id) }}
            >
                <span className="flex items-center space-x-2 pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <span className="font-medium text-slate-600">
                        Arraste arquivos ou <span className="text-brand-start">clique para selecionar</span>
                    </span>
                </span>
                <input type="file" multiple className="hidden" onChange={(e) => onFileUpload(e, empreendimento.id)} />
            </label>
          </section>
          <section>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-800">Arquivos Enviados</h3>
                {empreendimento.arquivos.length > 0 && (
                    <button onClick={handleClear} className="text-sm text-red-600 font-medium hover:underline">Remover Todos</button>
                )}
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {empreendimento.arquivos.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4">Nenhum arquivo enviado.</p>
              ) : (
                empreendimento.arquivos.map(renderFileItem)
              )}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
} 