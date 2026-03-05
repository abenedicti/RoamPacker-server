const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = process.env.OPENTRIPMAP_API_KEY;

//* Search of a city and get the datas
//! tested ok
router.get('/city/:cityName', async (req, res, next) => {
  try {
    const cityName = req.params.cityName;

    const cityResponse = await axios.get(
      'https://api.opentripmap.com/0.1/en/places/geoname',
      {
        params: {
          apikey: API_KEY,
          name: cityName,
        },
      },
    );
    //* check if city exist in API
    if (!cityResponse.data || !cityResponse.data.lat) {
      return res.status(404).json({ message: 'City not found' });
    }

    const cityLatitude = cityResponse.data.lat;
    const cityLongitude = cityResponse.data.lon;
    res.json({
      city: cityName,
      latitude: cityLatitude,
      longitude: cityLongitude,
    });
  } catch (error) {
    next(error);
  }
});

//* Get activities around a city
//! tested ok
router.get('/city/:cityName/activities', async (req, res, next) => {
  try {
    const cityName = req.params.cityName;

    // 1. Get datas
    const cityResponse = await axios.get(
      'https://api.opentripmap.com/0.1/en/places/geoname',
      {
        params: {
          apikey: API_KEY,
          name: cityName,
        },
      },
    );

    const cityLatitude = cityResponse.data.lat;
    const cityLongitude = cityResponse.data.lon;

    // 2. Get interests around a city
    const radius = 10000; // 10 km around the city
    const maxResults = 50;
    const activitiesResponse = await axios.get(
      'https://api.opentripmap.com/0.1/en/places/radius',
      {
        params: {
          apikey: API_KEY,
          radius,
          lon: cityLongitude,
          lat: cityLatitude,
          limit: maxResults,
          kinds: 'interesting_places', // filter by type of places
        },
      },
    );

    // return only important infos
    const activities = activitiesResponse.data.features.map((place) => ({
      xid: place.properties.xid, // place's id
      name: place.properties.name,
      kind: place.properties.kinds,
      dist: place.properties.dist,
      rate: place.properties.rate,
      osm: place.properties.osm, // ref to OpenStreetMap
    }));

    res.json({ city: cityName, activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
