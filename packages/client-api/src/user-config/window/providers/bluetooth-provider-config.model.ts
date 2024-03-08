import { z } from 'zod';

import { ProviderType } from '../provider-type.model';

export const BluetoothProviderConfigSchema = z.object({
  type: z.literal(ProviderType.BLUETOOTH),

  refresh_interval: z.coerce.number().default(5 * 1000),
});

export type BluetoothProviderConfig = z.infer<typeof BluetoothProviderConfigSchema>;
