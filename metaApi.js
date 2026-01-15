// ========================================
// UBMAX - INTEGRAÇÃO WHATSAPP BUSINESS API
// API OFICIAL DA META (Cloud API)
// ========================================

const axios = require('axios');
const crypto = require('crypto');
const { query } = require('../database/connection');

class MetaWhatsAppAPI {
  
  constructor() {
    // Configurações globais (fallback)
    this.graphApiVersion = 'v18.0';
    this.graphApiUrl = 'https://graph.facebook.com';
  }

  // ========================================
  // CONFIGURAÇÕES POR EMPRESA
  // ========================================

  /**
   * Buscar configurações do WhatsApp da empresa
   */
  async getEmpresaConfig(empresaId) {
    try {
      const result = await query(`
        SELECT 
          whatsapp_phone_id,
          whatsapp_business_id,
          whatsapp_token,
          whatsapp_webhook_token,
          whatsapp_numero,
          whatsapp_conectado
        FROM empresas 
        WHERE id = $1
      `, [empresaId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar config WhatsApp:', error);
      return null;
    }
  }

  /**
   * Salvar configurações do WhatsApp da empresa
   */
  async salvarConfig(empresaId, config) {
    try {
      await query(`
        UPDATE empresas SET
          whatsapp_phone_id = $1,
          whatsapp_business_id = $2,
          whatsapp_token = $3,
          whatsapp_webhook_token = $4,
          whatsapp_numero = $5,
          whatsapp_conectado = true,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [
        config.phoneId,
        config.businessId,
        config.accessToken,
        config.webhookToken || crypto.randomBytes(32).toString('hex'),
        config.numero,
        empresaId
      ]);
      
      console.log(`✅ WhatsApp configurado para empresa ${empresaId}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar config WhatsApp:', error);
      return false;
    }
  }

  // ========================================
  // ENVIO DE MENSAGENS
  // ========================================

  /**
   * Enviar mensagem de texto
   */
  async enviarMensagem(empresaId, para, texto) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      console.error('❌ WhatsApp não configurado para empresa', empresaId);
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      
      // Formatar número (remover @c.us, @s.whatsapp.net, etc)
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');
      
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'text',
        text: {
          preview_url: true,
          body: texto
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Mensagem enviada para ${numero}`);
      return { 
        success: true, 
        messageId: response.data.messages?.[0]?.id 
      };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Enviar mensagem com botões (interativa)
   */
  async enviarBotoes(empresaId, para, texto, botoes) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      // Formatar botões (máximo 3)
      const botoesFormatados = botoes.slice(0, 3).map((btn, i) => ({
        type: 'reply',
        reply: {
          id: btn.id || `btn_${i}`,
          title: btn.titulo || btn.title || btn
        }
      }));

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: texto },
          action: {
            buttons: botoesFormatados
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Botões enviados para ${numero}`);
      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar botões:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Enviar lista de opções
   */
  async enviarLista(empresaId, para, titulo, texto, secoes) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: titulo },
          body: { text: texto },
          action: {
            button: 'Ver opções',
            sections: secoes
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar lista:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Enviar localização
   */
  async enviarLocalizacao(empresaId, para, latitude, longitude, nome, endereco) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'location',
        location: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          name: nome || 'Localização',
          address: endereco || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar localização:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Enviar imagem
   */
  async enviarImagem(empresaId, para, urlImagem, legenda = '') {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'image',
        image: {
          link: urlImagem,
          caption: legenda
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Enviar documento
   */
  async enviarDocumento(empresaId, para, urlDoc, nomeArquivo, legenda = '') {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'document',
        document: {
          link: urlDoc,
          filename: nomeArquivo,
          caption: legenda
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar documento:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Enviar template aprovado (para iniciar conversa)
   */
  async enviarTemplate(empresaId, para, templateName, languageCode = 'pt_BR', components = []) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false, error: 'WhatsApp não configurado' };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;
      const numero = para.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: numero,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: response.data.messages?.[0]?.id };

    } catch (error) {
      console.error('❌ Erro ao enviar template:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async marcarComoLida(empresaId, messageId) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return { success: false };
    }

    try {
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}/messages`;

      await axios.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true };

    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Simular digitando (não disponível na API oficial, mas mantemos para compatibilidade)
   */
  async simularDigitando(empresaId, para) {
    // API oficial não tem "typing indicator"
    // Apenas retornamos sucesso para compatibilidade
    return { success: true };
  }

  // ========================================
  // WEBHOOK - RECEBER MENSAGENS
  // ========================================

  /**
   * Verificar token do webhook (GET)
   */
  verificarWebhook(req, res, webhookVerifyToken) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === webhookVerifyToken) {
      console.log('✅ Webhook verificado com sucesso!');
      return res.status(200).send(challenge);
    } else {
      console.error('❌ Falha na verificação do webhook');
      return res.sendStatus(403);
    }
  }

  /**
   * Processar webhook (POST) - recebe mensagens
   */
  async processarWebhook(req) {
    try {
      const body = req.body;

      if (!body.object || body.object !== 'whatsapp_business_account') {
        return { success: false, error: 'Não é evento do WhatsApp' };
      }

      const entries = body.entry || [];
      const mensagensProcessadas = [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field !== 'messages') continue;
          
          const value = change.value;
          const phoneNumberId = value.metadata?.phone_number_id;
          
          // Buscar empresa pelo phone_number_id
          const empresaResult = await query(
            'SELECT id FROM empresas WHERE whatsapp_phone_id = $1',
            [phoneNumberId]
          );
          
          if (empresaResult.rows.length === 0) {
            console.log('⚠️ Empresa não encontrada para phone_id:', phoneNumberId);
            continue;
          }
          
          const empresaId = empresaResult.rows[0].id;
          
          // Processar mensagens
          const messages = value.messages || [];
          
          for (const msg of messages) {
            const mensagemProcessada = {
              empresaId,
              messageId: msg.id,
              from: msg.from,
              timestamp: msg.timestamp,
              type: msg.type,
              text: null,
              location: null,
              audio: null,
              image: null,
              document: null,
              button: null,
              interactive: null
            };

            // Extrair conteúdo baseado no tipo
            switch (msg.type) {
              case 'text':
                mensagemProcessada.text = msg.text?.body;
                break;
              case 'location':
                mensagemProcessada.location = {
                  latitude: msg.location?.latitude,
                  longitude: msg.location?.longitude,
                  name: msg.location?.name,
                  address: msg.location?.address
                };
                break;
              case 'audio':
                mensagemProcessada.audio = {
                  id: msg.audio?.id,
                  mimeType: msg.audio?.mime_type
                };
                break;
              case 'image':
                mensagemProcessada.image = {
                  id: msg.image?.id,
                  mimeType: msg.image?.mime_type,
                  caption: msg.image?.caption
                };
                break;
              case 'document':
                mensagemProcessada.document = {
                  id: msg.document?.id,
                  mimeType: msg.document?.mime_type,
                  filename: msg.document?.filename
                };
                break;
              case 'button':
                mensagemProcessada.button = {
                  text: msg.button?.text,
                  payload: msg.button?.payload
                };
                break;
              case 'interactive':
                if (msg.interactive?.type === 'button_reply') {
                  mensagemProcessada.interactive = {
                    type: 'button_reply',
                    id: msg.interactive.button_reply?.id,
                    title: msg.interactive.button_reply?.title
                  };
                } else if (msg.interactive?.type === 'list_reply') {
                  mensagemProcessada.interactive = {
                    type: 'list_reply',
                    id: msg.interactive.list_reply?.id,
                    title: msg.interactive.list_reply?.title
                  };
                }
                break;
            }

            mensagensProcessadas.push(mensagemProcessada);
            
            // Marcar como lida automaticamente
            await this.marcarComoLida(empresaId, msg.id);
          }

          // Processar status de mensagens (entregue, lida, etc)
          const statuses = value.statuses || [];
          for (const status of statuses) {
            console.log(`📨 Status: ${status.status} para mensagem ${status.id}`);
          }
        }
      }

      return { success: true, mensagens: mensagensProcessadas };

    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Baixar mídia (áudio, imagem, documento)
   */
  async baixarMidia(empresaId, mediaId) {
    const config = await this.getEmpresaConfig(empresaId);
    if (!config || !config.whatsapp_token) {
      return null;
    }

    try {
      // Primeiro, pegar URL da mídia
      const urlResponse = await axios.get(
        `${this.graphApiUrl}/${this.graphApiVersion}/${mediaId}`,
        {
          headers: { 'Authorization': `Bearer ${config.whatsapp_token}` }
        }
      );

      const mediaUrl = urlResponse.data.url;

      // Depois, baixar a mídia
      const mediaResponse = await axios.get(mediaUrl, {
        headers: { 'Authorization': `Bearer ${config.whatsapp_token}` },
        responseType: 'arraybuffer'
      });

      return {
        data: mediaResponse.data,
        mimeType: urlResponse.data.mime_type
      };

    } catch (error) {
      console.error('❌ Erro ao baixar mídia:', error);
      return null;
    }
  }

  // ========================================
  // VERIFICAÇÃO DE STATUS
  // ========================================

  /**
   * Verificar se WhatsApp está configurado e funcionando
   */
  async verificarStatus(empresaId) {
    const config = await this.getEmpresaConfig(empresaId);
    
    if (!config || !config.whatsapp_token || !config.whatsapp_phone_id) {
      return { 
        conectado: false, 
        status: 'NAO_CONFIGURADO',
        mensagem: 'WhatsApp não configurado. Configure nas configurações.'
      };
    }

    try {
      // Testar conexão fazendo uma chamada simples
      const url = `${this.graphApiUrl}/${this.graphApiVersion}/${config.whatsapp_phone_id}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${config.whatsapp_token}` }
      });

      return {
        conectado: true,
        status: 'CONECTADO',
        numero: config.whatsapp_numero || response.data.display_phone_number,
        nome: response.data.verified_name,
        qualidade: response.data.quality_rating
      };

    } catch (error) {
      return {
        conectado: false,
        status: 'ERRO',
        mensagem: error.response?.data?.error?.message || 'Erro ao verificar conexão'
      };
    }
  }
}

// Exportar instância única
module.exports = new MetaWhatsAppAPI();
