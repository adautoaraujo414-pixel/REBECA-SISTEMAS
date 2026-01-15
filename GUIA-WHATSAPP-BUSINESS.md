# 📱 Guia Completo: Configurar WhatsApp Business API

## 🎯 Visão Geral

O sistema UBMAX usa a **API Oficial do WhatsApp Business** (Meta Cloud API), garantindo:

- ✅ **Sem risco de banimento** (API oficial)
- ✅ **Alta confiabilidade** 
- ✅ **Suporte da Meta**
- ✅ **Profissional para vender**

---

## 💰 Custos

| Item | Custo |
|------|-------|
| **Conta Meta Business** | GRÁTIS |
| **API WhatsApp** | GRÁTIS (setup) |
| **Primeiras 1.000 conversas/mês** | GRÁTIS |
| **Conversas adicionais** | ~R$ 0,04 a R$ 0,65 cada |

### Estimativa mensal:
- Frota pequena (100 corridas): **R$ 0 a R$ 5**
- Frota média (500 corridas): **R$ 15 a R$ 25**
- Frota grande (2000 corridas): **R$ 40 a R$ 80**

---

## 📋 Passo a Passo de Configuração

### PASSO 1: Criar Conta Meta Business (5 min)

1. Acesse: **https://business.facebook.com**
2. Clique em "Criar Conta"
3. Preencha os dados da sua empresa
4. Verifique o email

### PASSO 2: Criar App no Facebook Developer (5 min)

1. Acesse: **https://developers.facebook.com**
2. Faça login com sua conta Facebook
3. Clique em **"Meus Apps"** → **"Criar App"**
4. Selecione **"Empresa"** ou **"Negócio"**
5. Digite um nome (ex: "Rebeca WhatsApp")
6. Selecione sua conta Business
7. Clique em **"Criar App"**

### PASSO 3: Adicionar WhatsApp ao App (3 min)

1. Na página do seu App, clique em **"Adicionar Produto"**
2. Encontre **"WhatsApp"** e clique em **"Configurar"**
3. Clique em **"Começar"**

### PASSO 4: Obter Credenciais (5 min)

Na página do WhatsApp → API Setup, você verá:

#### 4.1 Phone Number ID
- Copie o **"Phone Number ID"** (número longo)
- Ex: `123456789012345`

#### 4.2 Access Token Temporário
- Clique em **"Gerar Token de Acesso Temporário"**
- Copie o token (começa com `EAA...`)

#### 4.3 Token Permanente (RECOMENDADO)
Para produção, gere um token permanente:

1. Vá em **Configurações do App** → **Básico**
2. Anote o **App ID** e **App Secret**
3. Vá em **Tokens de Acesso do Sistema**
4. Crie um token de sistema com permissão `whatsapp_business_messaging`
5. Este token não expira!

### PASSO 5: Configurar Webhook (5 min)

1. No painel do WhatsApp, vá em **"Configuração"**
2. Em **"Webhook"**, clique em **"Editar"**
3. Cole a URL do seu sistema:
   ```
   https://SEU-DOMINIO.railway.app/webhook
   ```
4. Cole o Token de Verificação:
   ```
   ubmax_webhook_token_2024
   ```
5. Clique em **"Verificar e Salvar"**
6. Marque os campos:
   - ✅ `messages`
   - ✅ `message_status` (opcional)

### PASSO 6: Adicionar Número de Telefone (10 min)

#### Opção A: Usar Número de Teste (Grátis)
- O Meta fornece um número de teste gratuito
- Bom para começar e testar

#### Opção B: Usar seu Próprio Número
1. Vá em **"Números de Telefone"** → **"Adicionar"**
2. Selecione um número que **NÃO** esteja no WhatsApp
3. Escolha verificação por **SMS** ou **Ligação**
4. Digite o código recebido
5. Pronto! Número verificado.

### PASSO 7: Configurar no Sistema UBMAX (2 min)

1. Acesse seu painel Admin: `https://seu-sistema.railway.app/admin`
2. Vá em **"Configurações"**
3. Role até **"WhatsApp Business API"**
4. Preencha:
   - **Phone Number ID**: cole o ID copiado
   - **Access Token**: cole o token permanente
   - **Número**: seu número verificado
5. Clique em **"Salvar Configuração"**
6. Clique em **"Testar"** para enviar uma mensagem de teste

---

## ✅ Verificação Final

Se tudo estiver correto, você verá:

- 🟢 **Status: Conectado**
- ✅ Mensagem de teste recebida no WhatsApp

---

## 🔧 Troubleshooting

### Erro: "Token inválido"
- Verifique se copiou o token completo
- Gere um novo token se necessário

### Erro: "Webhook não verificado"
- Verifique se a URL está correta
- Certifique-se que o sistema está rodando
- Verifique se o token de verificação está correto

### Erro: "Número não encontrado"
- O número precisa estar verificado no Meta
- Use o número de teste para começar

### Mensagens não chegam
- Verifique se marcou `messages` no webhook
- Verifique os logs do sistema

---

## 📞 Números de Teste

O Meta permite testar com até 5 números antes de ir para produção:

1. Vá em **WhatsApp** → **API Setup**
2. Em **"To"**, adicione os números para teste
3. Envie o código de verificação para cada número
4. Esses números podem receber mensagens do número de teste

---

## 🚀 Indo para Produção

Quando estiver pronto para produção:

1. Verifique seu negócio no Meta Business
2. Adicione um número real (não de teste)
3. Crie templates de mensagem para iniciar conversas
4. Configure limites de envio

---

## 💡 Dicas

1. **Comece com número de teste** - É grátis e funciona igual
2. **Use token permanente** - Token temporário expira em 24h
3. **Monitore custos** - As primeiras 1000 conversas são grátis
4. **Templates aprovados** - Para enviar mensagem primeiro, precisa de template

---

## 📊 Monitoramento

No Meta Business Suite, você pode ver:

- Mensagens enviadas/recebidas
- Custos por conversa
- Qualidade do número
- Erros de entrega

---

## 🆘 Suporte

- **Documentação Meta**: https://developers.facebook.com/docs/whatsapp
- **Central de Ajuda**: https://www.facebook.com/business/help

---

**Pronto! Sua Rebeca agora usa a API Oficial do WhatsApp! 🎉**
