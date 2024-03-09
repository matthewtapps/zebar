use serde::Deserialize;

#[cfg(all(windows, target_arch = "x86_64"))]
use super::komorebi::KomorebiProviderConfig;
use super::{
  battery::BatteryProviderConfig, bluetooth::BluetoothProviderConfig,
  cpu::CpuProviderConfig, host::HostProviderConfig, 
  ip::IpProviderConfig, memory::MemoryProviderConfig, 
  network::NetworkProviderConfig, weather::WeatherProviderConfig,
};

#[derive(Deserialize, Debug)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ProviderConfig {
  Battery(BatteryProviderConfig),
  Bluetooth(BluetoothProviderConfig),
  Cpu(CpuProviderConfig),
  Host(HostProviderConfig),
  Ip(IpProviderConfig),
  #[cfg(all(windows, target_arch = "x86_64"))]
  Komorebi(KomorebiProviderConfig),
  Memory(MemoryProviderConfig),
  Network(NetworkProviderConfig),
  Weather(WeatherProviderConfig),
}
