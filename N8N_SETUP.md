# Configuração do N8N para AgenteBom Genio

Este documento descreve como configurar os workflows do n8n para funcionar como backend da aplicação AgenteBom Genio.

## 🚀 Visão Geral

O n8n atuará como backend centralizado, gerenciando todas as operações do Google Drive:
- Criação de pastas
- Upload de arquivos
- Exclusão de arquivos e pastas
- Autenticação com Google Drive

## 📋 Workflows Necessários

### 1. Webhook: Criar Empreendimento
**Endpoint:** `POST /webhook/empreendimento`

**Payload de Entrada:**
```json
{
  "action": "create",
  "nome": "Nome do Empreendimento",
  "descricao": "Descrição do empreendimento"
}
```

**Resposta Esperada:**
```json
{
  "id": "empreendimento-id",
  "nome": "Nome do Empreendimento",
  "descricao": "Descrição do empreendimento",
  "driveFolderId": "google-drive-folder-id"
}
```

**Fluxo do Workflow:**
1. **Webhook** - Recebe a requisição
2. **Google Drive** - Cria pasta no Drive
3. **Code** - Gera ID único para o empreendimento
4. **Respond to Webhook** - Retorna os dados

### 2. Webhook: Upload de Arquivo
**Endpoint:** `POST /webhook/upload/{folderId}`

**Payload de Entrada:**
- FormData com o arquivo

**Resposta Esperada:**
```json
{
  "driveId": "google-drive-file-id"
}
```

**Fluxo do Workflow:**
1. **Webhook** - Recebe o arquivo
2. **Google Drive** - Upload para a pasta especificada
3. **Respond to Webhook** - Retorna o ID do arquivo

### 3. Webhook: Deletar Arquivo
**Endpoint:** `DELETE /webhook/file/{fileId}`

**Fluxo do Workflow:**
1. **Webhook** - Recebe o ID do arquivo
2. **Google Drive** - Deleta o arquivo
3. **Respond to Webhook** - Confirma exclusão

### 4. Webhook: Deletar Empreendimento
**Endpoint:** `DELETE /webhook/empreendimento/{folderId}`

**Fluxo do Workflow:**
1. **Webhook** - Recebe o ID da pasta
2. **Google Drive** - Lista todos os arquivos da pasta
3. **Google Drive** - Deleta todos os arquivos
4. **Google Drive** - Deleta a pasta
5. **Respond to Webhook** - Confirma exclusão

## ⚙️ Configuração do Google Drive

### 1. Credenciais do Google
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a Google Drive API
4. Crie credenciais de conta de serviço
5. Baixe o arquivo JSON das credenciais

### 2. Configuração no N8N
1. No n8n, vá em **Settings > Credentials**
2. Adicione credenciais do Google Drive
3. Use o arquivo JSON da conta de serviço
4. Configure o escopo: `https://www.googleapis.com/auth/drive`

## 🔧 Configuração do N8N

### 1. Variáveis de Ambiente
```env
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_USER_MANAGEMENT_DISABLED=true
N8N_BASIC_AUTH_ACTIVE=false
```

### 2. Instalação e Execução
```bash
# Instalar n8n
npm install -g n8n

# Executar
n8n start

# Ou com Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## 📝 Exemplo de Workflow JSON

### Workflow: Criar Empreendimento
```json
{
  "name": "Criar Empreendimento",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "empreendimento",
        "responseMode": "responseNode"
      },
      "id": "webhook",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "name": "={{ $json.nome }}",
        "parents": ["root"],
        "mimeType": "application/vnd.google-apps.folder"
      },
      "id": "google-drive",
      "name": "Google Drive",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "return {\n  id: Date.now().toString(),\n  nome: $input.first().json.nome,\n  descricao: $input.first().json.descricao,\n  driveFolderId: $input.first().json.id\n};"
      },
      "id": "code",
      "name": "Code",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "id": "respond",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [["Google Drive"]]
    },
    "Google Drive": {
      "main": [["Code"]]
    },
    "Code": {
      "main": [["Respond to Webhook"]]
    }
  }
}
```

## 🧪 Testando os Webhooks

### Teste: Criar Empreendimento
```bash
curl -X POST http://localhost:5678/webhook/empreendimento \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "nome": "Teste Empreendimento",
    "descricao": "Descrição de teste"
  }'
```

### Teste: Upload de Arquivo
```bash
curl -X POST http://localhost:5678/webhook/upload/FOLDER_ID \
  -F "file=@/path/to/file.pdf"
```

## 🔒 Segurança

### 1. Autenticação
- Configure autenticação básica no n8n se necessário
- Use HTTPS em produção
- Configure CORS adequadamente

### 2. Rate Limiting
- Configure rate limiting nos webhooks
- Monitore o uso da API do Google Drive

### 3. Logs
- Ative logs detalhados no n8n
- Monitore erros e performance

## 🚀 Deploy em Produção

### 1. Configuração do Servidor
```bash
# Instalar PM2
npm install -g pm2

# Executar n8n com PM2
pm2 start n8n --name "n8n-genio"

# Salvar configuração
pm2 save
pm2 startup
```

### 2. Proxy Reverso (Nginx)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL/HTTPS
- Configure certificado SSL
- Atualize URLs no frontend para HTTPS
- Configure redirecionamento HTTP → HTTPS

## 📞 Suporte

Para dúvidas sobre configuração do n8n ou workflows, entre em contato com a **AgenteBom**.

---

**AgenteBom Genio** - Backend com N8N 🚀 