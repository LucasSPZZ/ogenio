import { Upload, Settings, Paperclip } from 'lucide-react';
import type { Empreendimento } from '../types';

interface EmpreendimentoCardProps {
  empreendimento: Empreendimento;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onConfigure: (empreendimento: Empreendimento) => void;
}

export function EmpreendimentoCard({ empreendimento, onFileUpload, onConfigure }: EmpreendimentoCardProps) {
  const completedFiles = empreendimento.arquivos.filter(f => f.status === 'completed').length;
  const uploadingFiles = empreendimento.arquivos.filter(f => f.status === 'uploading').length;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800">{empreendimento.nome}</h3>
          <div className="flex items-center gap-2 text-sm font-medium bg-indigo-100 text-brand-start px-3 py-1 rounded-full">
            <Paperclip size={14} />
            <span>{completedFiles}</span>
            {uploadingFiles > 0 && (
              <span className="text-xs text-slate-500">(+{uploadingFiles})</span>
            )}
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-6 h-10">{empreendimento.descricao || 'Sem descrição.'}</p>
      </div>

      <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3">
        <label className="flex-1 cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
          <Upload size={16} />
          <span>Upload</span>
          <input
            type="file"
            multiple
            onChange={(e) => onFileUpload(e, empreendimento.id)}
            className="hidden"
          />
        </label>
        <button
          onClick={() => onConfigure(empreendimento)}
          className="flex-1 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Settings size={16} />
          Configurar
        </button>
      </div>
    </div>
  );
} 