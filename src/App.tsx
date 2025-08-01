import { useState } from 'react';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { EmpreendimentoCard } from './components/EmpreendimentoCard';
import { Modal } from './components/Modal';
import { ConfigModal } from './components/ConfigModal';
import { Spinner } from './components/Spinner';
import type { Empreendimento, ManagedFile } from './types';

function App() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState<Empreendimento | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [novoEmpreendimento, setNovoEmpreendimento] = useState({
    nome: '',
    descricao: ''
  });

  const handleCriarEmpreendimento = () => {
    if (!novoEmpreendimento.nome.trim() || isCreating) return;
    setIsCreating(true);

    // Simula uma chamada de API
    setTimeout(() => {
      const novo: Empreendimento = {
        id: Date.now().toString(),
        nome: novoEmpreendimento.nome,
        descricao: novoEmpreendimento.descricao,
        arquivos: [],
        criadoEm: new Date(),
      };
      setEmpreendimentos(prev => [...prev, novo]);
      setNovoEmpreendimento({ nome: '', descricao: '' });
      setIsNewModalOpen(false);
      setIsCreating(false);
    }, 1000);
  };

  const updateEmpreendimentoArquivos = (id: string, updateFn: (arquivos: ManagedFile[]) => ManagedFile[]) => {
    setEmpreendimentos(prev =>
      prev.map(emp => emp.id === id ? { ...emp, arquivos: updateFn(emp.arquivos) } : emp)
    );
    if (empreendimentoSelecionado?.id === id) {
      setEmpreendimentoSelecionado(prev => prev ? { ...prev, arquivos: updateFn(prev.arquivos) } : null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, empreendimentoId: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newManagedFiles: ManagedFile[] = files.map(file => ({ file, status: 'uploading' }));
    updateEmpreendimentoArquivos(empreendimentoId, arquivos => [...arquivos, ...newManagedFiles]);
    
    // Simula o tempo de upload para cada arquivo
    newManagedFiles.forEach((managedFile, index) => {
      setTimeout(() => {
        updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
          arquivos.map(f => f === managedFile ? { ...f, status: 'completed' } : f)
        );
      }, 1500 + (index * 200));
    });
  };
  
  const handleDeleteFile = (empreendimentoId: string, fileIndex: number) => {
    updateEmpreendimentoArquivos(empreendimentoId, arquivos => arquivos.filter((_, idx) => idx !== fileIndex));
  };

  const handleSaveEmpreendimento = (id: string, data: { nome: string; descricao: string }) => {
    setEmpreendimentos(prev =>
      prev.map(emp => emp.id === id ? { ...emp, ...data } : emp)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <Header onNewEmpreendimento={() => setIsNewModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {empreendimentos.length === 0 ? (
          <EmptyState onNewEmpreendimento={() => setIsNewModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {empreendimentos.map((emp, index) => (
              <div key={emp.id} style={{ animationDelay: `${index * 100}ms` }} className="opacity-0 animate-fade-in">
                <EmpreendimentoCard
                  empreendimento={emp}
                  onFileUpload={handleFileUpload}
                  onConfigure={setEmpreendimentoSelecionado}
                />
              </div>
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
            <button 
              onClick={handleCriarEmpreendimento} 
              disabled={!novoEmpreendimento.nome.trim() || isCreating} 
              className="w-48 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? <Spinner /> : 'Criar Empreendimento'}
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
      {empreendimentoSelecionado && (
        <ConfigModal
          empreendimento={empreendimentoSelecionado}
          onClose={() => setEmpreendimentoSelecionado(null)}
          onSave={handleSaveEmpreendimento}
          onFileUpload={handleFileUpload}
          onDeleteFile={handleDeleteFile}
        />
      )}
    </div>
  );
}

export default App;