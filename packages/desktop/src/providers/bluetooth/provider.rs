use std::sync::Arc;

use anyhow::Result;
use async_trait::async_trait;
use bluest::Adapter;
use tokio::{sync::Mutex, task::AbortHandle};

use crate::providers::{
  interval_provider::IntervalProvider, variables::ProviderVariables,
};

use super::{
  BluetoothProviderConfig, BluetoothVariables, LocalDevice, LocalService,
};

pub struct BluetoothProvider {
  pub config: Arc<BluetoothProviderConfig>,
  abort_handle: Option<AbortHandle>,
  state: Arc<Mutex<()>>,
}

impl BluetoothProvider {
  pub async fn new(config: BluetoothProviderConfig) -> BluetoothProvider {
    BluetoothProvider {
      config: Arc::new(config),
      abort_handle: None,
      state: Arc::new(Mutex::new(())),
    }
  }
}

#[async_trait]
impl IntervalProvider for BluetoothProvider {
  type Config = BluetoothProviderConfig;
  type State = ();

  fn config(&self) -> Arc<BluetoothProviderConfig> {
    self.config.clone()
  }

  fn state(&self) -> Arc<()> {
    Arc::new(())
  }

  fn abort_handle(&self) -> &Option<AbortHandle> {
    &self.abort_handle
  }

  fn set_abort_handle(&mut self, abort_handle: AbortHandle) {
    self.abort_handle = Some(abort_handle)
  }

  async fn get_refreshed_variables(
    _: &BluetoothProviderConfig,
    _state: &(),
  ) -> Result<ProviderVariables> {
    let adapter = Adapter::default().await.unwrap();

    let connected_devices = adapter.connected_devices().await?;

    println!("Connected devices: {:?}", connected_devices);

    let mut devices: Vec<LocalDevice> = vec![];

    for device in connected_devices {
      println!("Device: {:?}", device);
      let external_services = device.services().await.unwrap();
      let mut services: Vec<LocalService> = vec![];
      for service in external_services {
        services.push(LocalService {
          uuid: service.uuid().to_string(),
          is_primary: service.is_primary().await.unwrap(),
        });
      }
      devices.push(LocalDevice {
        local_name: device.name().unwrap(),
        is_connected: device.is_connected().await,
        is_paired: device.is_paired().await.unwrap(),
        services,
        rssi: device.rssi().await.unwrap(),
      });
    }

    let variables = BluetoothVariables {
      connected_devices: devices,
    };

    Ok(ProviderVariables::Bluetooth(variables))
  }
}
