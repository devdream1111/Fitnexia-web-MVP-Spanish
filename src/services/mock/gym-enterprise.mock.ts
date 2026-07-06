import { readMockJson, writeMockJson } from '@/services/mock/storage';

export interface MockClubBranding {
  primaryColor: string;
  accentColor: string;
  logoLabel: string;
}

export interface MockEnterpriseOnboarding {
  steps: { id: string; label: string; done: boolean }[];
}

export interface MockIntegration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

function seedBranding(): MockClubBranding {
  return { primaryColor: '#2563eb', accentColor: '#7c3aed', logoLabel: 'Logo del club' };
}

function seedOnboarding(): MockEnterpriseOnboarding {
  return {
    steps: [
      { id: 'config', label: 'Configuración inicial del club', done: true },
      { id: 'migrate', label: 'Migración de socios', done: false },
      { id: 'train', label: 'Capacitación del staff', done: false },
      { id: 'launch', label: 'Puesta en marcha', done: false },
    ],
  };
}

function seedIntegrations(): MockIntegration[] {
  return [
    { id: 'access', name: 'Control de acceso', description: 'Torniquetes y lectores QR', connected: false },
    { id: 'accounting', name: 'Contabilidad', description: 'Exportación a software contable', connected: false },
    { id: 'crm', name: 'CRM', description: 'Sincronización de socios', connected: true },
  ];
}

export const mockBrandingService = {
  get(institutionId: string): MockClubBranding {
    return readMockJson(`branding_${institutionId}`, seedBranding);
  },
  save(institutionId: string, branding: MockClubBranding): MockClubBranding {
    writeMockJson(`branding_${institutionId}`, branding);
    return branding;
  },
};

export const mockEnterpriseService = {
  getOnboarding(institutionId: string): MockEnterpriseOnboarding {
    return readMockJson(`onboarding_${institutionId}`, seedOnboarding);
  },
  toggleStep(institutionId: string, stepId: string): MockEnterpriseOnboarding {
    const current = readMockJson(`onboarding_${institutionId}`, seedOnboarding);
    const next = {
      steps: current.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    };
    writeMockJson(`onboarding_${institutionId}`, next);
    return next;
  },
  listIntegrations(institutionId: string): MockIntegration[] {
    return readMockJson(`integrations_${institutionId}`, seedIntegrations);
  },
  toggleIntegration(institutionId: string, id: string): MockIntegration[] {
    const list = readMockJson(`integrations_${institutionId}`, seedIntegrations);
    const next = list.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i));
    writeMockJson(`integrations_${institutionId}`, next);
    return next;
  },
};

export const mockQrCheckInService = {
  /** Simulates scan — memberId 'overdue' triggers blocked state for demo. */
  validate(memberCode: string): { ok: boolean; memberName: string; status: 'active' | 'overdue' } {
    if (memberCode.toLowerCase().includes('overdue') || memberCode === '999') {
      return { ok: false, memberName: 'Socio demo (moroso)', status: 'overdue' };
    }
    return { ok: true, memberName: 'Socio demo', status: 'active' };
  },
};
