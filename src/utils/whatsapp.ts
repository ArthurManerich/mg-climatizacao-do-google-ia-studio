import { WHATSAPP } from '../config';

export const WHATSAPP_NUMBER = WHATSAPP.number;
export const WHATSAPP_NAME = WHATSAPP.name;

export const DEFAULT_QUICK_QUOTE_MESSAGE = 
  `Olá! Gostaria de solicitar um orçamento para serviços de climatização.`;

/**
 * Gerador de link direto e limpo do WhatsApp.
 * Cada chamada produz uma URL independente baseada no texto fornecido,
 * sem manter ou acumular histórico de mensagens anteriores.
 */
export const getWhatsAppLink = (message: string, number?: string): string => {
  const rawNumber = number || WHATSAPP.number;
  // Extrai somente os dígitos numéricos
  let cleanNumber = rawNumber.replace(/\D/g, '');
  
  if (!cleanNumber) {
    cleanNumber = WHATSAPP.number.replace(/\D/g, '');
  }
  
  // Se for número brasileiro com 10 ou 11 dígitos sem código do país, inclui 55
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    cleanNumber = `55${cleanNumber}`;
  }

  // Garante uma mensagem limpa e sem espaços em branco desnecessários
  const cleanMessage = (message || DEFAULT_QUICK_QUOTE_MESSAGE).trim();

  // Retorna a URL padrão wa.me com a mensagem limpa e codificada
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(cleanMessage)}`;
};



