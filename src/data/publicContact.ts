/** Owner-confirmed registered office (virtual address); it is not a campus or visitor venue. */
export const academyPublicAddress = '1 Unity St, Bristol BS1 5HH, United Kingdom';

/** Legal identity facts confirmed directly by the academy owner. */
export const academyLegalIdentity = {
  legalName: 'Clinova International Academy Ltd',
  acronym: 'Clinova / CIA',
  companyNumber: '16048192',
  incorporationDate: '2025-10-14',
  registeredOfficeLabel: 'Registered office (virtual address)',
  registeredOfficeAddress: academyPublicAddress,
  registeredOfficeNotice: 'Not a campus, visiting location, or public-facing venue.',
} as const;

/** Owner-confirmed optional phone for the Pakistan local agent; use only as a secondary contact. */
export const academyPakistanAgentPhone = '0306-9633353';
