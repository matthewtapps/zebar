use serde::Serialize;

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BluetoothVariables {
  pub connected_devices: Vec<LocalDevice>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalDevice {
  pub local_name: String,
  pub is_connected: bool,
  pub is_paired: bool,
  pub services: Vec<LocalService>,
  pub rssi: i16,
}

// I am unsure how to actually use the services information for anything useful but this is how
// it can be used if necessary - this would need to be done for characteristics, descriptors, etc
// down the tree of structs.
#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalService {
  pub uuid: String,
  pub is_primary: bool,
}