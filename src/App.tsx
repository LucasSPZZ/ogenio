import { useState } from 'react';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { EmpreendimentoCard } from './components/EmpreendimentoCard';
import { Modal } from './components/Modal';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import type { Empreendimento } from './types';

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function App() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState<Empreendimento | null>(null);
  const [novoEmpreendimento, setNovoEmpreendimento] = useState({
    nome: '',
    descricao: ''
  });

  const handleCriarEmpreendimento = () => {
    if (novoEmpreendimento.nome.trim()) {
      const novo: Empreendimento = {
        id: Date.now().toString(),
        nome: novoEmpreendimento.nome,
        descricao: novoEmpreendimento.descricao,
        arquivos: [],
        criadoEm: new Date(),
      };
      setEmpreendimentos([...empreendimentos, novo]);
      setNovoEmpreendimento({ nome: '', descricao: '' });
      setIsNewModalOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, empreendimentoId: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const updateEmpreendimentos = (empId: string, newFiles: File[]) => {
      setEmpreendimentos(prev =>
        prev.map(emp =>
          emp.id === empId ? { ...emp, arquivos: [...emp.arquivos, ...newFiles] } : emp
        )
      );
    };

    updateEmpreendimentos(empreendimentoId, files);

    if (empreendimentoSelecionado?.id === empreendimentoId) {
      setEmpreendimentoSelecionado(prev => prev ? { ...prev, arquivos: [...prev.arquivos, ...files] } : null);
    }
  };
  
  const handleDeleteFile = (empreendimentoId: string, fileIndex: number) => {
    const updateFunction = (prev: Empreendimento[]) =>
      prev.map(emp =>
        emp.id === empreendimentoId
          ? { ...emp, arquivos: emp.arquivos.filter((_, idx) => idx !== fileIndex) }
          : emp
      );
    setEmpreendimentos(updateFunction);

    if (empreendimentoSelecionado?.id === empreendimentoId) {
      setEmpreendimentoSelecionado(prev =>
        prev ? { ...prev, arquivos: prev.arquivos.filter((_, idx) => idx !== fileIndex) } : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <Header onNewEmpreendimento={() => setIsNewModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {empreendimentos.length === 0 ? (
          <EmptyState onNewEmpreendimento={() => setIsNewModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {empreendimentos.map(emp => (
              <EmpreendimentoCard
                key={emp.id}
                empreendimento={emp}
                onFileUpload={handleFileUpload}
                onConfigure={setEmpreendimentoSelecionado}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal para Novo Empreendimento */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Empreendimento"
        footer={
          <>
            <button onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={handleCriarEmpreendimento} disabled={!novoEmpreendimento.nome.trim()} className="px-4 py-2 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              Criar Empreendimento
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome do Empreendimento</label>
            <input type="text" id="nome" value={novoEmpreendimento.nome} onChange={(e) => setNovoEmpreendimento(p => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" autoFocus />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
            <textarea id="descricao" value={novoEmpreendimento.descricao} onChange={(e) => setNovoEmpreendimento(p => ({ ...p, descricao: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        isOpen={!!empreendimentoSelecionado}
        onClose={() => setEmpreendimentoSelecionado(null)}
        title={`Configurações: ${empreendimentoSelecionado?.nome}`}
      >
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload de Arquivos</h3>
            <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-slate-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <span className="font-medium text-slate-600">
                        Arraste arquivos ou <span className="text-brand-start">clique para selecionar</span>
                    </span>
                </span>
                <input type="file" multiple name="file_upload" className="hidden" onChange={(e) => empreendimentoSelecionado && handleFileUpload(e, empreendimentoSelecionado.id)} />
            </label>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Arquivos Enviados</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {empreendimentoSelecionado?.arquivos.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4">Nenhum arquivo enviado.</p>
              ) : (
                empreendimentoSelecionado?.arquivos.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <FileText className="h-6 w-6 text-brand-start flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button onClick={() => empreendimentoSelecionado && handleDeleteFile(empreendimentoSelecionado.id, index)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}

export default App;