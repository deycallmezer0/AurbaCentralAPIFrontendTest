// Device.js
import React from "react";

const Device = ({ device }) => (
  <tr key={device.macaddr}>
    <td>{device.serial}</td>
    <td>{device.group_name}</td>
    <td>{device.firmware_version}</td>
    <td>{device.status}</td>
    <td>{device.swarm_name || "N/A"}</td>
  </tr>
);

export default Device;
