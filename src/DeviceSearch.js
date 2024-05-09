import React from "react";
import DeviceTable from "./DeviceTable";
import "./deviceSearch.css";

class DeviceSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      searchResults: [],
      updated: [],
      notUpdated: [],
      failed: [],
      searching: [],
      searchTime: 0,
      countdown: null,
      group: "", // Added group to state
      updatedCount: 0,
      totalDevices: 0,
      isSearching: false,
    };
    this.countdownInterval = null;
  }

  handleSearchQueryChange = (event) => {
    this.setState({
      searchQuery: event.target.value,
    });
  };

  handleGroupChange = (event) => {
    this.setState({
      group: event.target.value,
    });
  };

  clearDevices = () => {
    this.setState({ searchResults: [] , updated: [], notUpdated: [], searching: [] });
  };


  checkFirmware = () => {
    this.setState(
      (prevState) => {
        let updatedDevices = prevState.searching.filter(
          (device) => parseFloat(device.firmware_version) > 10
        );
        let devicesToUpdate = prevState.searching.filter(
          (device) => parseFloat(device.firmware_version) <= 10
        );

        // Create a Set with the serials of the updated devices
        let updatedSet = new Set(
          prevState.updated.map((device) => device.serial)
        );

        // Filter out the devices that are already in the updated state
        updatedDevices = updatedDevices.filter(
          (device) => !updatedSet.has(device.serial)
        );

        return {
          updated: [...prevState.updated, ...updatedDevices],
          notUpdated: [...prevState.notUpdated, ...devicesToUpdate],
          searching: devicesToUpdate, // Update the searching list with the devices to update
          updatedCount: prevState.updatedCount + updatedDevices.length,
        };
      },
      () => {
        this.updateComplete();
      }
    );
  };

  updateComplete = () => {
    if (this.state.updatedCount === this.state.totalDevices) {
      alert("All devices are up to date");
    }
    if (this.state.notUpdated.length > 0) {
      this.setState({ startCountdown: true }); // Set the state to trigger countdown
    }
  };

  componentDidUpdate(_prevProps, prevState) {
    // Check if startCountdown state has changed
    if (
      this.state.startCountdown !== prevState.startCountdown &&
      this.state.startCountdown === true
    ) {
      this.startCountdown(); // Start the countdown again
      this.setState({ startCountdown: false }); // Reset the state
    }
  }

  moveToGroup = () => {
    const token = localStorage.getItem("access_token");
    const refreshToken = this.props.refresh_token;
    const serials = this.state.searchResults.map((device) => device.serial);

    // Validation
    if (!this.state.group.trim()) {
      alert("Group is required and should be a non-empty string.");
      return;
    }

    if (!serials.length) {
      alert("Serials array is empty.");
      return;
    }

    fetch(`http://localhost:5001/api/move-to-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: token,
        refresh_token: refreshToken,
        group: this.state.group,
        serials: serials,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error("Failed to move devices to group");
        }
      })
      .then((data) => {
        console.log(data);
        this.setState({
          searching: this.state.searchResults,
          searchResults: [],
        }); // Move devices to searching array
        this.startCountdown(); // Start the countdown
      })
      .catch((error) => {
        console.error(error);
      });
  };

  startCountdown = () => {
    this.setState({ countdown: 6 * 1 }); // Set the countdown to 6 minutes
    this.countdownInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.countdown <= 1) {
          clearInterval(this.countdownInterval); // Stop the countdown
          this.searchDevicesAgain(); // Search devices again
          return { countdown: null };
        } else {
          return { countdown: prevState.countdown - 1 };
        }
      });
    }, 1000);
  };

  // In searchDevicesAgain function
  searchDevicesAgain = () => {
    this.checkFirmware(); // Check firmware
  };

  handleSearch = () => {
    if (this.state.isSearching) {
      return; // Exit if a search is already in progress
    }

    this.setState({ isSearching: true });
    const token = localStorage.getItem("access_token");
    const queries = this.state.searchQuery
      .split("\n")
      .filter((query) => query.trim() !== "");

    // Remove duplicates
    const uniqueQueries = [...new Set(queries)];

    this.clearDevices();
    this.props.addConsoleMessage("Searching for devices");

    const startTime = Date.now(); // Start the timer
    this.setState({ totalDevices: uniqueQueries.length });

    const searchPromises = uniqueQueries.map((query) => {
      return (
        fetch(`http://localhost:5001/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: token,
            serial: query,
          }),
        })
          .then((response) => response.json())
          // In handleSearch function
          .then((data) => {
            if (!data.serial) {
              data.serial = query;
            }
            this.setState((prevState) => {
              // Check if a device with the same serial number already exists
              if (
                prevState.searchResults.some(
                  (device) => device.serial === data.serial
                )
              ) {
                return null; // Don't update the state if the device already exists
              }
              // Check the firmware version of the device
              if (parseFloat(data.firmware_version) > 10) {
                // Add the device to the updated list
                return {
                  updated: [...prevState.updated, data],
                  searchResults: [...prevState.searchResults, data],
                };
              } else {
                // Add the device to the notUpdated list
                return {
                  notUpdated: [...prevState.notUpdated, data],
                  searchResults: [...prevState.searchResults, data],
                };
              }
            });
            this.props.addConsoleMessage(
              `Found device with serial ${data.serial}`
            );
          })
      );
    });

    return Promise.all(searchPromises).then(() => {
      const endTime = Date.now();
      this.setState({ searchTime: endTime - startTime, isSearching: false });
    });
  };

  render() {
    const { countdown, searching, updated, notUpdated } =
      this.state;
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return (
      <div className="device-search">
        <h1>Device Search</h1>
        {countdown !== null && (
          <div>
            Time remaining: {minutes}:{seconds < 10 ? "0" : ""}
            {seconds}
          </div>
        )}
        <div>Search Time: {this.state.searchTime} ms</div>
        <div>
          <label>
            Enter serial numbers to search for:
            <textarea
              value={this.state.searchQuery}
              onChange={this.handleSearchQueryChange}
            />
          </label>
        </div>
        <div>
          <label>
            Enter group name:
            <input
              type="text"
              value={this.state.group}
              onChange={this.handleGroupChange}
            />
          </label>
        </div>
        <div>
          <button onClick={this.handleSearch}>Search</button>
          <button onClick={this.clearDevices}>Clear Devices</button>
        </div>
        <div className="actions">
          <button onClick={this.moveToGroup}>Move to Group</button>
          <button onClick={this.showDeviceList}>Show Device List</button>
        </div>
        <div className="status-tables">
          <DeviceTable devices={searching} title="Searching" />
          <DeviceTable devices={updated} title="Updated" />
          <DeviceTable devices={notUpdated} title="Not Updated" />
        </div>
      </div>
    );
  }
}

export default DeviceSearch;
