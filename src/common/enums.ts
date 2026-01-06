export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  REPRESENTATIVE = 'REPRESENTATIVE',
}

export enum RepresentativeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SUSPENDED = 'SUSPENDED',
}

export enum ConsumerType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  RURAL = 'RURAL',
  PUBLIC_POWER = 'PUBLIC_POWER',
}

export enum PhaseType {
  MONOPHASIC = 'MONOPHASIC',
  BIPHASIC = 'BIPHASIC',
  TRIPHASIC = 'TRIPHASIC',
}

export enum ConsumerStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  IN_PROCESS = 'IN_PROCESS',
  CONVERTED = 'CONVERTED',
}

export enum ConsumerApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SourceType {
  SOLAR = 'SOLAR',
  HYDRO = 'HYDRO',
  BIOMASS = 'BIOMASS',
  WIND = 'WIND',
}

export enum GeneratorStatus {
  UNDER_ANALYSIS = 'UNDER_ANALYSIS',
  AWAITING_ALLOCATION = 'AWAITING_ALLOCATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  CALCULATED = 'CALCULATED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}


