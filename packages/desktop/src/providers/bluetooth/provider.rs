use std::{future::IntoFuture, sync::Arc};

use anyhow::Result;
use async_trait::async_trait;
use tokio::{sync::Mutex, task::AbortHandle};
use bluest::Adapter;

use crate::providers::{
  interval_provider::IntervalProvider,
  variables::ProviderVariables,
};

use super::{
  BluetoothProviderConfig, BluetoothVariables,
};

pub struct BluetoothProvider {
  pub config: Arc<BluetoothProviderConfig>,
  abort_handle: Option<AbortHandle>,
  adapter: Arc<Mutex<Adapter>>,
}

#[allow(dead_code)]
impl BluetoothProvider {
  pub async fn new(config: BluetoothProviderConfig) -> BluetoothProvider {
    let adapter = Adapter::default().await.unwrap(); // Await the completion of the Adapter::default() future and unwrap the Option<Adapter> to get the Adapter instance.

    BluetoothProvider {
      config: Arc::new(config),
      abort_handle: None,
      adapter: Arc::new(Mutex::new(adapter)),
    }
  }
}

#[async_trait]
impl IntervalProvider for BluetoothProvider {
  type Config = BluetoothProviderConfig;
  type State = Mutex<Adapter>;

  fn config(&self) -> Arc<BluetoothProviderConfig> {
    self.config.clone()
  }

  fn state(&self) -> Arc<Mutex<Adapter>> {
    self.adapter.clone()
  }

  fn abort_handle(&self) -> &Option<AbortHandle> {
    &self.abort_handle
  }

  fn set_abort_handle(&mut self, abort_handle: AbortHandle) {
    self.abort_handle = Some(abort_handle)
  }

  async fn get_refreshed_variables(
    _: &BluetoothProviderConfig,
    adapter: &Mutex<Adapter>,
  ) -> Result<ProviderVariables> {

    let adapter = adapter.lock().await;

    let connected_devices = adapter.connected_devices().await?;

    println!("Connected devices: {:?}", connected_devices);

    for device in connected_devices {
      println!("Device: {:?}", device);
    }

    let variables = BluetoothVariables {
      connected_devices: vec![],
    };

    Ok(ProviderVariables::Bluetooth(variables))
  }
}
