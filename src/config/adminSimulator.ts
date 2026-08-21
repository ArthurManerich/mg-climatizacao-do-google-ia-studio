import type { SimulatorConfig } from '../types';
import { defaultPublicSimulatorConfig } from './simulator';

export const defaultAdminSimulatorConfig: SimulatorConfig = {
  services: defaultPublicSimulatorConfig.services,
  capacities: defaultPublicSimulatorConfig.capacities,
  propertyTypes: defaultPublicSimulatorConfig.propertyTypes.map(property => ({
    ...property,
    multiplier: 1,
  })),
  basePrices: {},
};
