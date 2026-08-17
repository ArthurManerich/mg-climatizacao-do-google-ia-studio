import { Photo } from '../types';
import { IMAGES } from '../config';

export const initialPortfolioItems: Photo[] = [];

export const PORTFOLIO_CATEGORIES: Record<string, string> = {
  'instalacao': 'Instalação',
  'manutencao': 'Manutenção',
  'higienizacao': 'Higienização',
  'carga-gas': 'Carga de Gás',
  'residencial': 'Residencial',
  'empresarial': 'Empresarial',
};
