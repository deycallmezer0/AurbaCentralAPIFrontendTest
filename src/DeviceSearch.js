// DeviceSearch.js
import React from 'react';
import DeviceTable from './DeviceTable';
import './deviceSearch.css';
import StatusTable from './StatusTable';
class DeviceSearch extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        searchQuery: "",
        searchResults: [],
        searchTime: 0, // Add this line,
        countdown: null // Add this line
      };
      this.countdownInterval = null; // Add this line
    }
  
    handleSearchQueryChange = event => {
      this.setState({
        searchQuery: event.target.value
      });
    };

    clearDevices = () => {
        this.setState({ searchResults: [] });
      }
      moveToGroup = () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = this.props.refresh_token;
        const serials = this.state.searchResults.map(device => device.serial);
    
        // If serials is supposed to be a single string, join the array into a string
        const serialsString = serials.join(',');
    
        fetch(`http://localhost:5000/api/move-to-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                access_token: token,
                refresh_token: refreshToken,
                query: serialsString
            })
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Failed to move devices to group');
            }
        })
        .then(data => {
            console.log(data);
            this.startCountdown(); // Start the countdown
        })
        .catch(error => {
            console.error(error);
        });
    };
    startCountdown = () => {
        this.setState({ countdown: 7 * 60 }); // Set the countdown to 7 minutes
        this.countdownInterval = setInterval(() => {
            this.setState(prevState => {
                if (prevState.countdown <= 1) {
                    clearInterval(this.countdownInterval); // Stop the countdown
                    return { countdown: null };
                } else {
                    return { countdown: prevState.countdown - 1 };
                }
            });
        }, 1000);
    };
    handleSearch = () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = this.props.refresh_token;
        const queries = this.state.searchQuery.split('\n').filter(query => query.trim() !== '');

        this.clearDevices(); // Clear the devices before starting new search
        this.props.addConsoleMessage('Searching for devices');

        const startTime = Date.now(); // Start the timer

        const searchPromises = queries.map(query => {
          return fetch(`http://localhost:5000/api/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              access_token: token,
              serial: query,
            })
          })
          .then(response => response.json())
          .then(data => {
            // If the data doesn't have a serial, add the query as the serial
            if (!data.serial) {
              data.serial = query;
            }
            this.setState(prevState => ({
              searchResults: [...prevState.searchResults, data]
            }));
            this.props.addConsoleMessage(`Found device with serial ${data.serial}`);
          });
        });

        Promise.all(searchPromises).then(() => {
          const endTime = Date.now(); // End the timer
          this.setState({ searchTime: endTime - startTime }); // Set the search time
        });
    };

    render() {
        const { countdown } = this.state;
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return (
          <div className="device-search">
            <h1>Device Search</h1>
            {countdown !== null && <div>Time remaining: {minutes}:{seconds < 10 ? '0' : ''}{seconds}</div>}
            <div>Search Time: {this.state.searchTime} ms</div> {/* Display the search time */}
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
              <button onClick={this.handleSearch}>Search</button>
            </div>
            <DeviceTable devices={this.state.searchResults} clearDevices={this.clearDevices} />
            <div className='actions'>
              <button onClick={this.moveToGroup}>Move to Group</button>
              <button onClick={this.showDeviceList}>Show Device List</button>
            </div>
            
          </div>
        );
    }
}

export default DeviceSearch;