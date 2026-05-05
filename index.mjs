// MPP.sol — Machine Payments Protocol for Solana
// Specification metadata. The substantive content lives in ./spec/*.md.

export const version = '0.1.0-draft.1';
export const status = 'draft';
export const maintainer = 'psyto';
export const homepage = 'https://github.com/mppsol/spec';

export const docs = Object.freeze({
  wire: 'spec/wire.md',
  session: 'spec/session.md',
  cpi: 'spec/cpi.md',
  settlement: 'spec/settlement.md',
  security: 'spec/security.md',
});

export default Object.freeze({ version, status, maintainer, homepage, docs });
