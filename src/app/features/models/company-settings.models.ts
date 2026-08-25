export interface CompanySettingsModel {
  name: string | null;
  document: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
}

export interface CompanySettingsUpdateInput {
  name: string;
  document?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
}

export type CompanySettingsApiModel = CompanySettingsModel;

export function mapCompanySettingsApiModel(input: CompanySettingsApiModel): CompanySettingsModel {
  return {
    name: input.name ?? null,
    document: input.document ?? null,
    addressLine: input.addressLine ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    postalCode: input.postalCode ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    logoUrl: input.logoUrl ?? null,
  };
}
