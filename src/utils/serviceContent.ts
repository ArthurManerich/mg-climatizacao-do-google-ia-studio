import type { Service } from '../types';

const RESTRICTED_SERVICE_CONTENT = [
  { pattern: /\bpmoc\b/i, label: 'PMOC' },
  { pattern: /\banvisa\b/i, label: 'ANVISA' },
  { pattern: /\b(?:crea|art|trt|cft|crt|rrt)\b/i, label: 'registro ou responsabilidade técnica' },
  { pattern: /\b(?:respons[aá]vel t[eé]cnico|t[eé]cnico registrado|engenheir[oa]|laudo t[eé]cnico)\b/i, label: 'registro ou responsabilidade técnica' },
  { pattern: /\b(?:representante oficial|assist[eê]ncia t[eé]cnica autorizada)\b/i, label: 'vínculo profissional não confirmado' },
  { pattern: /\b(?:24\s*h|24\s*horas|24\s*\/\s*7)\b/i, label: 'atendimento 24 horas' },
  { pattern: /\b(?:r[- ]?32|r[- ]?410a)\b/i, label: 'fluido refrigerante específico' },
  { pattern: /\bbactericida\b/i, label: 'produto bactericida' },
  { pattern: /\b(?:preço|preços|desconto|parcelamento)\b|r\s*\$/i, label: 'preço ou condição comercial' },
  { pattern: /\bgarantia\s+(?:de\s+)?(?:(?:1|um)\s+ano|12\s+meses)\b/i, label: 'garantia não confirmada' },
  { pattern: /\b(?:capacitor(?:es)?|placas? eletr[oô]nicas?)\b/i, label: 'componente técnico não confirmado' },
] as const;

type ServiceContent = Partial<Pick<Service, 'title' | 'description' | 'bullet_points'>>;

export function findRestrictedServiceContent(service: ServiceContent): string | null {
  const content = [service.title ?? '', service.description ?? '', ...(service.bullet_points ?? [])].join(' ');
  return RESTRICTED_SERVICE_CONTENT.find(({ pattern }) => pattern.test(content))?.label ?? null;
}

export function assertSafeServiceContent(service: ServiceContent): void {
  const restricted = findRestrictedServiceContent(service);
  if (restricted) {
    throw new Error(`Revise o serviço: ${restricted} não está autorizado no conteúdo público.`);
  }
}
