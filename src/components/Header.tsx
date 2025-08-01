import { Sparkles, Plus } from 'lucide-react';

interface HeaderProps {
  onNewEmpreendimento: () => void;
}

export function Header({ onNewEmpreendimento }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-brand-start" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Genio
            </h1>
          </div>
          <button
            onClick={onNewEmpreendimento}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform"
          >
            <Plus size={18} />
            Novo Empreendimento
          </button>
        </div>
      </div>
    </header>
  );
} 