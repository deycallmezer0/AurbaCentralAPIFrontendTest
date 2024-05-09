import React, { useEffect, useRef } from 'react';
import DeviceTable from '../DeviceTable';
import DeviceSearch from '../DeviceSearch';
import { useState } from 'react';
const fetchTokens = async (refreshToken, accessToken) => {
    console.log('Fetching tokens')
    const response = await fetch('http://localhost:5000/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken, access_token: accessToken }),
    });

    if (!response.ok) {
        console.log(response)
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};


// Read tokens from local storage
const getSavedTokens = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = localStorage.getItem('access_token');
    return { refresh_token: refreshToken, access_token: accessToken };
};
function Search() {
    const [tokens, setTokens] = useState(getSavedTokens());
    const [consoleMessages, setConsoleMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const consoleRef = useRef(null);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [consoleMessages]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [consoleMessages]);
    const addConsoleMessage = (message) => {
        setConsoleMessages(prevMessages => [...prevMessages, message]);
    };
    // If tokens exist, extract refresh and access tokens
    let refreshToken, accessToken;
    if (tokens) {
        try {
            refreshToken = tokens.refresh_token;
            accessToken = tokens.access_token;
        } catch (error) {
            console.error('Failed to extract tokens', error);
        }
    }
    else {
        refreshToken = localStorage.getItem('refresh_token');
        accessToken = localStorage.getItem('access_token');
    }

    console.log(refreshToken);
    console.log(accessToken);

    const handleGetTokens = async () => {
        const newTokens = await fetchTokens(refreshToken, accessToken);
        setTokens(newTokens);
        localStorage.setItem('access_token', newTokens.access_token);
        localStorage.setItem('refresh_token', newTokens.refresh_token);
    };
    const searchForDevices = async () => {
        console.log('Searching for devices');
        console.log("Tokens" + refreshToken + accessToken)
        const response = await fetch('http://localhost:5000/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken, access_token: accessToken }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    };
    
    return (
        <div>
            <h1>Search</h1>
            <button onClick={handleGetTokens}>Get Tokens</button>
            
            <div ref={consoleRef} className="console" style={{ height: '200px', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
                {consoleMessages.map((message, index) => (
                    <p key={index} style={{ textAlign: 'center' }}>{message}</p>
                ))}
            </div>
            <DeviceSearch searchForDevices={searchForDevices} addConsoleMessage={addConsoleMessage} />
        </div>
    );
}

export default Search;