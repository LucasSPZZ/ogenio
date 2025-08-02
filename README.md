# AgenteBom Genio

Gerenciador de Empreendimentos com integração direta ao Google Drive, desenvolvido pela AgenteBom.

## 🚀 Sobre o Projeto

O **AgenteBom Genio** é uma aplicação web moderna, client-side, para gerenciamento de empreendimentos. Ela se conecta diretamente à conta Google Drive do usuário para criar pastas organizadas, fazer upload de arquivos e gerenciar documentos de forma eficiente e segura.

## ✨ Funcionalidades

-   🔐 **Autenticação Segura com Google:** Login direto via OAuth 2.0, garantindo que a aplicação só acesse o que o usuário permitir.
-   📁 **Criação de Pastas:** Organize seus empreendimentos em pastas dedicadas dentro do seu próprio Google Drive.
-   📤 **Upload de Arquivos:** Suporte a arrastar e soltar (drag & drop) e upload múltiplo de arquivos.
-   🗂️ **Gerenciamento Completo:** Crie, edite, exclua arquivos e empreendimentos com facilidade.
-   🎨 **Interface Moderna:** Design responsivo e intuitivo construído com Tailwind CSS.
-   📱 **PWA Ready:** Funciona offline e pode ser instalado em dispositivos móveis e desktops.
-   🎭 **Modo de Demonstração:** Permite testar a interface sem precisar conectar uma conta Google, ideal para avaliação rápida.

## 🛠️ Tecnologias

-   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
-   **API:** Google Drive API v3
-   **Ícones:** Lucide React

## 📦 Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [url-do-repositorio]
    cd agentebom-genio
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as Variáveis de Ambiente:**
    *   Crie uma cópia do `.env.development.example` (se houver) ou crie um novo arquivo `.env.development`.
    *   Adicione suas credenciais do Google Cloud:
        ```env
        VITE_GOOGLE_API_KEY=SUA_CHAVE_DE_API_DO_GOOGLE
        VITE_GOOGLE_CLIENT_ID=SEU_ID_DE_CLIENTE_OAUTH_DO_GOOGLE
        ```
4.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5178`.

## ⚙️ Configuração do Google Cloud Console

Para que a autenticação funcione, você precisa configurar suas credenciais no Google Cloud:

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto ou selecione um existente.
3.  Ative a **Google Drive API**.
4.  Vá para **Credenciais**, crie uma **Chave de API** e um **ID do cliente OAuth 2.0**.
5.  Ao configurar o ID do cliente OAuth, em **"Origens JavaScript autorizadas"** e **"URIs de redirecionamento autorizados"**, adicione a URL onde sua aplicação irá rodar (ex: `http://localhost:5178` para desenvolvimento e `https://agentebom.com` para produção).

## 📄 Licença

Desenvolvido pela AgenteBom - Todos os direitos reservados. 