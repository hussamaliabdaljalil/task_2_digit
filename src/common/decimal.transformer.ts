import { ValueTransformer } from 'typeorm';

/** Postgres returns DECIMAL as string; expose it as a JS number. */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) =>
    value === null || value === undefined ? value : Number(value),
};
