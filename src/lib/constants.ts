// Shared constants that can be used in both client and server components
// This file should NEVER import Mongoose or any Node.js-only modules

export const USER_CATEGORIES = [
  'Architect',
  'Contractor',
  'Builder',
  'Agency',
  'Material Supplier',
  'Educational Institute',
  'Student',
  'Trade Professional',
] as const;

export type UserCategory = (typeof USER_CATEGORIES)[number];
export type UserStatus = 'pending' | 'active' | 'rejected' | 'banned';

export const COA_REGEX = /^CA\/\d{4}\/\d{5}$/;


