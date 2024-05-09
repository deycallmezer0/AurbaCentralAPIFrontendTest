// DeviceTable.js
import React from 'react';
import DeviceSearch from './DeviceSearch';
import  './DeviceTable.css';
import StatusTable from './StatusTable';

class DeviceTable extends React.Component {
  render() {
    const { devices, clearDevices } = this.props;
    return (
        <div>
      <div>
         <StatusTable devices={devices} />

        <button onClick={clearDevices}>Clea Devices</button>
      <table className="device-table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Group</th>
            <th>Firmware</th>
            <th>Status</th>
            <th>Swarm Name</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(devices) && devices.map(device => (
  <tr key={device.macaddr}>
    <td>{device.serial}</td>
    <td>{device.group_name}</td>
    <td>{device.firmware_version}</td>
    <td>{device.status}</td>
    <td>{device.swarm_name || 'N/A'}</td>
  </tr>
))}
          {(!Array.isArray(devices) || devices.length === 0) && (
            <tr>
              <td colSpan="3">No results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
</div>
    );
  }
}

export default DeviceTable;