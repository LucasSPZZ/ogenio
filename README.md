# AgenteBom Genio

Gerenciador de Empreendimentos com integração Google Drive - Desenvolvido pela AgenteBom.

## 🚀 Sobre o Projeto

O **AgenteBom Genio** é uma aplicação web moderna para gerenciamento de empreendimentos com integração completa ao Google Drive. Permite criar pastas organizadas, fazer upload de arquivos e gerenciar documentos de forma eficiente.

## ✨ Funcionalidades

- 🔐 **Autenticação Google Drive** - Login seguro com OAuth 2.0
- 📁 **Criação de Pastas** - Organize seus empreendimentos no Drive
- 📤 **Upload de Arquivos** - Drag & drop para upload múltiplo
- 🗂️ **Gerenciamento Completo** - Crie, edite e exclua empreendimentos
- 🎨 **Interface Moderna** - Design responsivo com Tailwind CSS
- 📱 **PWA Ready** - Funciona offline e pode ser instalado

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Google Drive API** - Integração com nuvem
- **Lucide React** - Ícones

## 📦 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre na pasta
cd agentebom-genio

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.development.example .env.development
# Edite o arquivo .env.development com suas credenciais do Google

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.development` com:

```env
VITE_SITE_URL=https://agentebom.com/genio
VITE_GOOGLE_API_KEY=sua_chave_api_google
VITE_GOOGLE_CLIENT_ID=seu_id_cliente_oauth
```

### Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Drive API
4. Configure as credenciais OAuth 2.0
5. Adicione `https://agentebom.com/genio` como origem autorizada

## 🚀 Deploy

O projeto está configurado para ser deployado em `https://agentebom.com/genio/`.

```bash
# Build para produção
npm run build

# Os arquivos estarão em /dist
# Faça upload para o servidor em /genio/
```

## 📱 PWA

A aplicação é uma PWA (Progressive Web App) que pode ser instalada em dispositivos móveis e desktop.

## 🤝 Suporte

Para suporte técnico ou dúvidas, entre em contato com a **AgenteBom**.

## 📄 Licença

Desenvolvido pela AgenteBom - Todos os direitos reservados.

---

**AgenteBom Genio** - Transformando a gestão de empreendimentos 🏢✨ 