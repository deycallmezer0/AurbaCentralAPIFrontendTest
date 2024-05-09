// DeviceTable.js
import React from "react";
import Device from "./Device"; // Make sure to import the Device component
class DeviceTable extends React.Component {
  render() {
    const { devices, title } = this.props;
    const deviceCount = Array.isArray(devices) ? devices.length : 0;

    return (
      <div>
        <h2>{`${title} (${deviceCount})`}</h2>

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
            {Array.isArray(devices) &&
              devices.map((device) => (
                <Device key={device.macaddr} device={device} />
              ))}
            {(!Array.isArray(devices) || devices.length === 0) && (
              <tr>
                <td colSpan="5">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DeviceTable;
