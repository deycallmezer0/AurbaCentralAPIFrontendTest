import React from 'react';

class StatusTable extends React.Component {
    render() {
        if (!this.props.devices) {
            return null;
        }
        const devices = this.props.devices;

        // Filter devices based on firmware version
        const firmwareGreaterThan10 = devices.filter(device => {
            const versionNumber = parseFloat(device.firmware_version);
            return versionNumber > 10;
        });
        const firmwareLessThanEqual10 = devices.filter(device => {
            const versionNumber = parseFloat(device.firmware_version);
            return versionNumber <= 10 && !isNaN(versionNumber);
        });
        const firmwareFailed = devices.filter(device => {
            const versionNumber = parseFloat(device.firmware_version);
            return isNaN(versionNumber);
        });

        return (
            <table className="status-table">
                <thead>
                    <tr>
                        <th>Updated</th>
                        <th>Not Updated</th>
                        <th>Failed</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{firmwareGreaterThan10.length}</td>
                        <td>{firmwareLessThanEqual10.length}</td>
                        <td>{firmwareFailed.length}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default StatusTable;