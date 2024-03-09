use serde::Deserialize;

use crate::impl_interval_config;

#[derive(Deserialize, Debug)]
pub struct BluetoothProviderConfig {
  pub refresh_interval: u64,
}

impl_interval_config!(BluetoothProviderConfig);
