export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  bullet_points: string[];
  order_index?: number;
  created_at?: string;
}

export interface Faq {
  id?: number;
  q: string;
  a: string;
  order_index?: number;
  created_at?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  order_index?: number;
  created_at?: string;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string;
  category: string;
  img: string;
  service_id?: string | null;
  created_at?: string;
}

export interface BeforeAfter {
  id: number;
  title: string;
  description: string;
  before_img: string;
  after_img: string;
  category?: string;
  created_at?: string;
}

export interface Setting {
  key: string;
  value: any;
  updated_at?: string;
}

export interface UserSession {
  user: {
    id: string;
    email?: string;
  } | null;
  accessToken: string | null;
}

// Backward-compatibility type aliases
export type Photo = Portfolio;
export type PortfolioItem = Portfolio;
export type FaqItem = Faq;
export type ServiceItem = Service;
export type BeforeAfterItem = BeforeAfter;

export interface SimulatorServiceOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface SimulatorBtuOption {
  id: string;
  label: string;
  desc: string;
}

export interface SimulatorPropertyOption {
  id: string;
  label: string;
  multiplier: number;
}

export interface PublicSimulatorPropertyOption {
  id: string;
  label: string;
}

export interface SimulatorBasePrice {
  min: number;
  max: number;
  time: string;
}

export interface SimulatorConfig {
  services: SimulatorServiceOption[];
  capacities: SimulatorBtuOption[];
  propertyTypes: SimulatorPropertyOption[];
  basePrices: Record<string, Record<string, SimulatorBasePrice>>;
}

export interface PublicSimulatorConfig {
  services: SimulatorServiceOption[];
  capacities: SimulatorBtuOption[];
  propertyTypes: PublicSimulatorPropertyOption[];
}
