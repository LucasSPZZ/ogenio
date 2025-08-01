import { useState } from 'react';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { EmpreendimentoCard } from './components/EmpreendimentoCard';
import { Modal } from './components/Modal';
import { ConfigModal } from './components/ConfigModal';
import { Spinner } from './components/Spinner';
import * as driveService from './services/driveService';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import type { Empreendimento, ManagedFile } from './types';
import { LogIn, AlertCircle } from 'lucide-react';

function App() {
  const { isSignedIn, isInitialized, signIn, signOut, isDemoMode } = useGoogleAuth();
  
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState<Empreendimento | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [novoEmpreendimento, setNovoEmpreendimento] = useState({ nome: '', descricao: '' });

  const handleCriarEmpreendimento = async () => {
    if (!novoEmpreendimento.nome.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const folderId = isDemoMode
        ? `demo-folder-${Date.now()}`
        : await driveService.createFolder(novoEmpreendimento.nome);
      
      const novo: Empreendimento = {
        id: Date.now().toString(),
        nome: novoEmpreendimento.nome,
        descricao: novoEmpreendimento.descricao,
        driveFolderId: folderId,
        arquivos: [],
        criadoEm: new Date(),
      };
      setEmpreendimentos(prev => [...prev, novo]);
      setNovoEmpreendimento({ nome: '', descricao: '' });
      setIsNewModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar:", error);
      alert("Não foi possível criar o empreendimento.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEmpreendimento = async (empreendimentoId: string, empreendimentoName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o empreendimento "${empreendimentoName}"? Esta ação removerá a pasta e todos os arquivos do seu Google Drive permanentemente.`)) {
      return;
    }

    const target = empreendimentos.find(e => e.id === empreendimentoId);
    if (!target) return;

    try {
      if (!isDemoMode && target.driveFolderId) {
        await driveService.deleteFile(target.driveFolderId);
      }
      setEmpreendimentos(prev => prev.filter(e => e.id !== empreendimentoId));
    } catch (error) {
        console.error("Erro ao excluir empreendimento:", error);
        alert(`Não foi possível excluir o empreendimento. Verifique se a pasta ainda existe no seu Google Drive.`);
    }
  };

  const updateEmpreendimentoArquivos = (id: string, updateFn: (arquivos: ManagedFile[]) => ManagedFile[]) => {
    setEmpreendimentos(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, arquivos: updateFn(emp.arquivos) } : emp))
    );
    if (empreendimentoSelecionado?.id === id) {
      setEmpreendimentoSelecionado(prev => (prev ? { ...prev, arquivos: updateFn(prev.arquivos) } : null));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | DragEvent, empreendimentoId: string) => {
    const targetEmpreendimento = empreendimentos.find(e => e.id === empreendimentoId);
    if (!targetEmpreendimento || !targetEmpreendimento.driveFolderId) return;

    const files = 'dataTransfer' in event ? Array.from((event as DragEvent).dataTransfer?.files || []) : Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newManagedFiles: ManagedFile[] = files.map(file => ({ file, status: 'uploading' }));
    updateEmpreendimentoArquivos(empreendimentoId, arquivos => [...arquivos, ...newManagedFiles]);
    
    newManagedFiles.forEach(async (managedFile) => {
      try {
        const driveId = isDemoMode
          ? `demo-file-${Date.now()}`
          : await driveService.uploadFile(targetEmpreendimento.driveFolderId!, managedFile.file);

        updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
          arquivos.map(f => f === managedFile ? { ...f, status: 'completed', driveId } : f)
        );
      } catch (error: any) {
        updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
          arquivos.map(f => f === managedFile ? { ...f, status: 'error', error: error.message || 'Falha no upload' } : f)
        );
      }
    });
  };
  
  const handleDeleteFile = async (empreendimentoId: string, fileIndex: number) => {
    const fileToDelete = empreendimentos.find(e => e.id === empreendimentoId)?.arquivos[fileIndex];
    if (!fileToDelete) return;

    updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
      arquivos.map((f, i) => i === fileIndex ? { ...f, status: 'deleting' } : f)
    );

    try {
      if (!isDemoMode && fileToDelete.driveId) {
        await driveService.deleteFile(fileToDelete.driveId);
      }
      updateEmpreendimentoArquivos(empreendimentoId, arquivos => arquivos.filter((_, i) => i !== fileIndex));
    } catch (error: any) {
      console.error("Erro ao deletar arquivo:", error);
      if (error.message && error.message.toLowerCase().includes('file not found')) {
        updateEmpreendimentoArquivos(empreendimentoId, arquivos => arquivos.filter((_, i) => i !== fileIndex));
      } else {
        alert("Falha ao deletar o arquivo.");
        updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
          arquivos.map((f, i) => i === fileIndex ? { ...f, status: 'error', error: 'Falha ao deletar' } : f)
        );
      }
    }
  };
  
  const handleClearAllFiles = async (empreendimentoId: string) => {
    const target = empreendimentos.find(e => e.id === empreendimentoId);
    if (!target || target.arquivos.length === 0) return;

    updateEmpreendimentoArquivos(empreendimentoId, arquivos =>
        arquivos.map(f => ({ ...f, status: 'deleting' }))
    );

    try {
        if (!isDemoMode) {
            const deletePromises = target.arquivos
                .filter(f => f.driveId)
                .map(f => driveService.deleteFile(f.driveId!));
            await Promise.all(deletePromises);
        }
        updateEmpreendimentoArquivos(empreendimentoId, () => []);
    } catch (error) {
        console.error("Erro ao limpar arquivos:", error);
        alert("Falha ao remover todos os arquivos. Tente novamente.");
        updateEmpreendimentoArquivos(empreendimentoId, () => target.arquivos.map(f => ({...f, status: 'completed'})));
    }
  }

  const handleSaveEmpreendimento = (id: string, data: { nome: string; descricao: string }) => {
    setEmpreendimentos(prev => prev.map(emp => (emp.id === id ? { ...emp, ...data } : emp)));
  };
  
  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner className="w-10 h-10 text-brand-start" /></div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">
        <EmptyState onNewEmpreendimento={() => {}} />
        <div className="mt-8">
          {isDemoMode ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Modo de Demonstração</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 max-w-sm">Para usar o Google Drive, configure suas credenciais no arquivo <code className="bg-slate-100 px-1 rounded">.env.development</code></p>
              <button onClick={signIn} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform">
                <LogIn size={20} /> Entrar em Modo Demo
              </button>
            </div>
          ) : (
            <button onClick={signIn} className="flex items-center gap-3 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform">
              <LogIn size={20} /> Login com Google Drive
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <Header onNewEmpreendimento={() => setIsNewModalOpen(true)} onSignOut={signOut} />

      {isDemoMode && isSignedIn && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2"><div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-yellow-800 text-sm"><AlertCircle className="w-4 h-4" /><span>Modo de Demonstração - Dados são simulados</span></div></div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {empreendimentos.length === 0 ? (
          <EmptyState onNewEmpreendimento={() => setIsNewModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {empreendimentos.map((emp, index) => (
              <div key={emp.id} style={{ animationDelay: `${index * 100}ms` }} className="opacity-0 animate-fade-in">
                <EmpreendimentoCard empreendimento={emp} onFileUpload={handleFileUpload} onConfigure={setEmpreendimentoSelecionado} onDelete={handleDeleteEmpreendimento} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Novo Empreendimento"
        footer={
          <>
            <button onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50">Cancelar</button>
            <button onClick={handleCriarEmpreendimento} disabled={!novoEmpreendimento.nome.trim() || isCreating} className="w-48 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {isCreating ? <Spinner /> : 'Criar Empreendimento'}
            </button>
          </>
        }>
        <div className="space-y-6">
          <div><label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome do Empreendimento</label><input type="text" id="nome" value={novoEmpreendimento.nome} onChange={(e) => setNovoEmpreendimento(p => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" autoFocus /></div>
          <div><label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label><textarea id="descricao" value={novoEmpreendimento.descricao} onChange={(e) => setNovoEmpreendimento(p => ({ ...p, descricao: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
        </div>
      </Modal>

      {empreendimentoSelecionado && (
        <ConfigModal 
            empreendimento={empreendimentoSelecionado} 
            onClose={() => setEmpreendimentoSelecionado(null)} 
            onSave={handleSaveEmpreendimento} 
            onFileUpload={handleFileUpload} 
            onDeleteFile={handleDeleteFile}
            onClearAllFiles={handleClearAllFiles}
        />
      )}
    </div>
  );
}

export default App;