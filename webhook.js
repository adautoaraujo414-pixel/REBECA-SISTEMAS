// ========================================
// UBMAX - WEBHOOK WHATSAPP BUSINESS API
// Recebe mensagens da API Oficial
// ========================================

const express = require('express');
const router = express.Router();
const MetaWhatsApp = require('../whatsapp/metaApi');
const { query } = require('../database/connection');

// Importar fluxo da Rebeca
let FluxoConversa;
try {
  FluxoConversa = require('../conversation/fluxo');
} catch (e) {
  console.log('⚠️ Fluxo não carregado ainda');
}

/**
 * GET /webhook
 * Verificação do webhook pelo Facebook
 */
router.get('/', (req, res) => {
  console.log('🔔 Verificação de webhook recebida');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Token de verificação global ou por empresa
  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'ubmax_webhook_token_2024';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado!');
    return res.status(200).send(challenge);
  }

  console.log('❌ Token de verificação inválido');
  return res.sendStatus(403);
});

/**
 * POST /webhook
 * Recebe mensagens e eventos do WhatsApp
 */
router.post('/', async (req, res) => {
  try {
    // Responder imediatamente (Facebook exige resposta rápida)
    res.sendStatus(200);

    const body = req.body;
    
    // Verificar se é evento do WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    console.log('📩 Webhook recebido:', JSON.stringify(body, null, 2));

    // Processar webhook
    const resultado = await MetaWhatsApp.processarWebhook(req);
    
    if (!resultado.success || !resultado.mensagens?.length) {
      return;
    }

    // Processar cada mensagem com a Rebeca
    for (const msg of resultado.mensagens) {
      await processarMensagemRebeca(msg);
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
});

/**
 * Processar mensagem com a Rebeca
 */
async function processarMensagemRebeca(msg) {
  try {
    const { empresaId, from, type, text, location, audio, button, interactive } = msg;

    console.log(`\n📱 Mensagem de ${from} (Empresa ${empresaId})`);
    console.log(`   Tipo: ${type}`);

    // Criar objeto de mensagem compatível com o fluxo existente
    const mensagemFormatada = {
      from: from + '@c.us', // Formato esperado pelo fluxo
      empresaId: empresaId,
      type: type,
      body: text || '',
      location: location,
      isAudio: type === 'audio',
      audioData: audio,
      // Para botões/listas
      selectedButtonId: button?.payload || interactive?.id,
      selectedButtonText: button?.text || interactive?.title
    };

    // Extrair texto de diferentes tipos de mensagem
    if (type === 'button') {
      mensagemFormatada.body = button?.text || '';
    } else if (type === 'interactive') {
      mensagemFormatada.body = interactive?.title || '';
    }

    // Processar com o fluxo da Rebeca
    if (FluxoConversa) {
      // Passar a API do WhatsApp para o fluxo usar
      const fluxo = new FluxoConversa.FluxoConversa({
        enviarMensagem: async (para, texto) => {
          return await MetaWhatsApp.enviarMensagem(empresaId, para, texto);
        },
        enviarLocalizacao: async (para, lat, lng, nome, end) => {
          return await MetaWhatsApp.enviarLocalizacao(empresaId, para, lat, lng, nome, end);
        },
        enviarBotoes: async (para, texto, botoes) => {
          return await MetaWhatsApp.enviarBotoes(empresaId, para, texto, botoes);
        }
      });
      
      await fluxo.processarMensagem(mensagemFormatada);
    } else {
      // Fallback: resposta simples
      console.log('⚠️ Fluxo não disponível, enviando resposta padrão');
      await MetaWhatsApp.enviarMensagem(
        empresaId, 
        from, 
        'Olá! Sou a Rebeca, sua assistente virtual. Em que posso ajudar? 😊'
      );
    }

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
}

module.exports = router;
