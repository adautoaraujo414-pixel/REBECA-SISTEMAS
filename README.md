# 🚗 REBECA - Sistema de Corridas via WhatsApp

Sistema completo de gerenciamento de corridas com atendimento automatizado via WhatsApp, integrado com IA (OpenAI GPT-4) e Evolution API.

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Deploy](#deploy)
- [Painéis](#painéis)
- [Funcionalidades](#funcionalidades)

---

## 📦 Requisitos

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **Evolution API** (WhatsApp)
- **OpenAI API Key** (GPT-4 + Whisper)
- **Servidor** (VPS com Ubuntu 22.04+)

---

## 🚀 Instalação

### 1. Extrair o projeto

```bash
unzip rebeca-FINAL-COMPLETO.zip
cd rebeca
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

### 4. Criar banco de dados

```bash
sudo -u postgres createdb rebeca_db
npm run db:migrate
```

### 5. Iniciar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

---

## 📱 Painéis

| Painel | URL | Login |
|--------|-----|-------|
| **Master** | `/master` | adautoaraujo414@gmail.com / Ci851213@ |
| **ADM** | `/admin` | Configurado pelo Master |
| **Motorista** | `/motorista` | Telefone + Senha |
| **Rastrear** | `/rastrear?corrida=ID` | Público |

---

## ✨ Funcionalidades

### 🤖 Rebeca (IA)
- Atendimento 100% automatizado via WhatsApp
- OpenAI GPT-4 para interpretação
- Whisper para transcrição de áudios
- Mensagens curtas e diretas
- Delay artificial (1-3s)
- Confirmação antes de chamar motorista

### ⏰ Monitoramento de Corridas
- Verifica atrasos a cada 30 segundos
- Avisa cliente após 2 min de atraso
- Cancela e reatribui após 5 min
- Registra atraso no Anti-Fraude

### 🏷️ White Label
- Padrão: "ZAP CORRIDAS"
- Personalizado: +R$ 50/mês

### 📞 Recusa de Ligações
- Recusa automática
- Envia mensagem curta

---

## 🖥️ Deploy com PM2

```bash
npm install -g pm2
pm2 start src/index.js --name rebeca
pm2 save
pm2 startup
```

---

**Versão:** 2.1.0  
**Autor:** Adauto
