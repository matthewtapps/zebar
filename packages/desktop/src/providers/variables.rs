use serde::Serialize;

#[cfg(all(windows, target_arch = "x86_64"))]
use super::komorebi::KomorebiVariables;
use super::{
  battery::BatteryVariables, cpu::CpuVariables, host::HostVariables,
  ip::IpVariables, memory::MemoryVariables, network::NetworkVariables,
  weather::WeatherVariables, bluetooth::BluetoothVariables,
};

#[derive(Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum ProviderVariables {
  Battery(BatteryVariables),
  Bluetooth(BluetoothVariables),
  Cpu(CpuVariables),
  Host(HostVariables),
  Ip(IpVariables),
  #[cfg(all(windows, target_arch = "x86_64"))]
  Komorebi(KomorebiVariables),
  Memory(MemoryVariables),
  Network(NetworkVariables),
  Weather(WeatherVariables),
}
