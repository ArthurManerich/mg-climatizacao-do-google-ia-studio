import { WHATSAPP } from '../config';
import { OFFICIAL_WHATSAPP, validWhatsApp } from './companySettings';

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
  const cleanNumber = validWhatsApp(number || WHATSAPP.number) ?? OFFICIAL_WHATSAPP;

  // Garante uma mensagem limpa e sem espaços em branco desnecessários
  const cleanMessage = (message || DEFAULT_QUICK_QUOTE_MESSAGE).trim();

  // Retorna a URL padrão wa.me com a mensagem limpa e codificada
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(cleanMessage)}`;
};


