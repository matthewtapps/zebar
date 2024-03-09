import type { Owner } from 'solid-js';

import type { BluetoothProviderConfig } from '~/user-config';
import { createProviderListener } from '../create-provider-listener';

export interface BluetoothVariables {
  connectedDevices: Device[];
}

export interface Device {
    localName: String,
    isConnected: String,
    isPaired: String,
    services: Service[],
    rssi: number,
}

interface Service {
    uuid: String,
    isPrimary: boolean,
}

export async function createBluetoothProvider(
  config: BluetoothProviderConfig,
  owner: Owner,
) {
  const bluetoothVariables = await createProviderListener<
    BluetoothProviderConfig,
    BluetoothVariables
  >(config, owner);

  return {
    get variable() {
      return bluetoothVariables().connectedDevices;
    },
  };
}
