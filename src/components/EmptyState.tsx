import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onNewEmpreendimento: () => void;
}

export function EmptyState({ onNewEmpreendimento }: EmptyStateProps) {
  return (
    <div className="text-center bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-10 sm:p-16 max-w-2xl mx-auto">
      <Sparkles className="mx-auto h-16 w-16 text-brand-start opacity-80" />
      <h2 className="mt-6 text-3xl font-bold text-slate-800">
        Bem-vindo ao AgenteBom Genio
      </h2>
      <p className="mt-4 text-lg text-slate-600">
        Nenhum empreendimento encontrado. Que tal criar o primeiro?
      </p>
      <div className="mt-8">
        <button
          onClick={onNewEmpreendimento}
          className="px-6 py-3 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Criar Primeiro Empreendimento
        </button>
      </div>
    </div>
  );
} 