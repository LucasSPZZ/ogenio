import React, { useState } from 'react';
import './App.css';

interface Empreendimento {
  id: string;
  nome: string;
  descricao: string;
  arquivos: File[];
  criadoEm: Date;
}

function App() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState<Empreendimento | null>(null);
  const [novoEmpreendimento, setNovoEmpreendimento] = useState({
    nome: '',
    descricao: ''
  });

  const criarEmpreendimento = () => {
    if (novoEmpreendimento.nome.trim()) {
      const novo: Empreendimento = {
        id: Date.now().toString(),
        nome: novoEmpreendimento.nome,
        descricao: novoEmpreendimento.descricao,
        arquivos: [],
        criadoEm: new Date()
      };
      setEmpreendimentos([...empreendimentos, novo]);
      setNovoEmpreendimento({ nome: '', descricao: '' });
      setModalAberto(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, empreendimentoId: string) => {
    const files = Array.from(event.target.files || []);
    setEmpreendimentos(prev => 
      prev.map(emp => 
        emp.id === empreendimentoId 
          ? { ...emp, arquivos: [...emp.arquivos, ...files] }
          : emp
      )
    );
  };

  const GenieIcon = () => (
    <div className="genie-icon">
      <div className="lamp">
        <div className="lamp-top"></div>
        <div className="lamp-body"></div>
        <div className="smoke">✨</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <GenieIcon />
            <h1>Genio</h1>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setModalAberto(true)}
          >
            <span className="plus-icon">+</span>
            Novo Empreendimento
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {empreendimentos.length === 0 ? (
          <div className="empty-state">
            <GenieIcon />
            <h2>Bem-vindo ao Genio</h2>
            <p>Crie seu primeiro empreendimento para começar</p>
            <button 
              className="btn-secondary"
              onClick={() => setModalAberto(true)}
            >
              Criar Empreendimento
            </button>
          </div>
        ) : (
          <div className="empreendimentos-grid">
            {empreendimentos.map(emp => (
              <div key={emp.id} className="empreendimento-card">
                <div className="card-header">
                  <h3>{emp.nome}</h3>
                  <span className="arquivo-count">{emp.arquivos.length} arquivos</span>
                </div>
                {emp.descricao && (
                  <p className="descricao">{emp.descricao}</p>
                )}
                <div className="card-actions">
                  <label className="upload-btn">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e, emp.id)}
                      style={{ display: 'none' }}
                    />
                    <span className="upload-icon">📎</span>
                    Upload
                  </label>
                  <button 
                    className="btn-outline"
                    onClick={() => setEmpreendimentoSelecionado(emp)}
                  >
                    Configurar
                  </button>
                </div>
                {emp.arquivos.length > 0 && (
                  <div className="arquivos-list">
                    {emp.arquivos.slice(0, 3).map((arquivo, idx) => (
                      <div key={idx} className="arquivo-item">
                        {arquivo.name}
                      </div>
                    ))}
                    {emp.arquivos.length > 3 && (
                      <div className="arquivo-item more">
                        +{emp.arquivos.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para Novo Empreendimento */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Empreendimento</h2>
              <button 
                className="close-btn"
                onClick={() => setModalAberto(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Empreendimento</label>
                <input
                  type="text"
                  value={novoEmpreendimento.nome}
                  onChange={(e) => setNovoEmpreendimento(prev => ({
                    ...prev,
                    nome: e.target.value
                  }))}
                  placeholder="Digite o nome..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={novoEmpreendimento.descricao}
                  onChange={(e) => setNovoEmpreendimento(prev => ({
                    ...prev,
                    descricao: e.target.value
                  }))}
                  placeholder="Descrição do empreendimento..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-outline"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={criarEmpreendimento}
                disabled={!novoEmpreendimento.nome.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações */}
      {empreendimentoSelecionado && (
        <div className="modal-overlay" onClick={() => setEmpreendimentoSelecionado(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configurações - {empreendimentoSelecionado.nome}</h2>
              <button 
                className="close-btn"
                onClick={() => setEmpreendimentoSelecionado(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="config-section">
                <h3>Arquivos Enviados</h3>
                {empreendimentoSelecionado.arquivos.length === 0 ? (
                  <p className="empty-files">Nenhum arquivo enviado ainda</p>
                ) : (
                  <div className="files-list">
                    {empreendimentoSelecionado.arquivos.map((arquivo, idx) => (
                      <div key={idx} className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{arquivo.name}</span>
                        <span className="file-size">
                          {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="config-section">
                <h3>Upload de Arquivos</h3>
                <label className="upload-area">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e, empreendimentoSelecionado.id)}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-content">
                    <span className="upload-icon large">📎</span>
                    <p>Clique para fazer upload de arquivos</p>
                    <small>Ou arraste arquivos aqui</small>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;