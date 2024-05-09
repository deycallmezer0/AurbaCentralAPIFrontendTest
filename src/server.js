const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.post('/api/search', async (req, res) => {
    console.log('Searching for APs')
    const { refresh_token, access_token, serial } = req.body;
    console.log('Body Keys: ' + Object.keys(req.body) + ' Serial: ' + serial + ' Refresh Token: ' + refresh_token + ' Access Token: ' + access_token);
    const url = 'https://apigw-uswest4.central.arubanetworks.com/monitoring/v1/aps/' + serial;
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer ' + access_token,
        }
      };
      try {
        const response = await axios(url, options);
        if (response.status !== 200) {
          throw new Error('Failed to search for APs');
        }
        console.log('Results successfully retrieved and sent to client');
        res.json(response.data);
        } catch (error) {
        res.status(500).json({ "message":"Jeremy is a bitch" });
        }
    });
app.post('/api/move-to-group', async (req, res) => {
    const { query, access_token } = req.body;
    const url = 'https://apigw-uswest4.central.arubanetworks.com/configuration/v1/devices/move';
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer ' + access_token},
        data: {
            'group': 'FD-Pilot',
            'serials': [query]
        }
      };
      try {
        const response = await axios(url, options);
        if (response.status !== 200) {
          throw new Error('Status not 200' + response.status);
        }
        console.log('APs successfully moved to group');
        res.json(response.data);
        } catch (error) {
        console.error(error);
        res.status(500).json({ 'Caught error':error });
        }
    }
);

app.post('/api/token', async (req, res) => {
  const { refresh_token, access_token } = req.body;
  const url = `https://apigw-uswest4.central.arubanetworks.com/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`;
  console.log(url);
  const options = {
      method: 'POST',
      headers: {
          accept: 'application/json',
          authorization: `Bearer ${access_token}`,
      }
  };

  try {
    const response = await axios(url, options);
    if (response.status !== 200) {
      throw new Error('Failed to retrieve tokens');
      console.log(response.data.url)
    }
    console.log('Tokens successfully retrieved and sent to client');
    res.json(response.data);
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tokens' });
    }

}
);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
