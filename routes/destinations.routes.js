const express = require('express');
const router = express.Router();
const axios = require('axios');
const destinationsData = require('../data/destinationsData.json');

const API_KEY = process.env.OPENTRIPMAP_API_KEY;
let cityCache = {}; // { countryCode: { timestamp, cities: [] } }
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

//* fetch continents and countries with json file
//* /destination/destinations-data
router.get('/destinations-data', (req, res) => {
  res.json(destinationsData);
});
//* Get countries of a continent
router.get('/:continent/countries', (req, res) => {
  const { continent } = req.params;

  const continentData = destinationsData.find(
    (data) => data.continent.toLowerCase() === continent.toLowerCase(),
  );

  if (!continentData) {
    return res.status(404).json({ message: 'Continent not found' });
  }

  res.json(continentData.countries);
});

router.get('/:country/cities', async (req, res) => {
  const { country } = req.params;

  //* check the cach
  const cached = cityCache[country];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json({ country, cities: cached.cities });
  }

  //* try with GeoNames if available if not use json
  try {
    const response = await axios.get('https://api.geonames.org/searchJSON', {
      params: {
        country,
        featureClass: 'P', //* P = only cities
        maxRows: 50,
        minPopulation: 50000,
        username: process.env.GEONAMES_USERNAME,
      },
      timeout: 10000, //* 10 sec max to avoid blockage
    });

    const cities = response.data.geonames.map((c) => c.name);

    //* to show request if already asked instead of sending a new one
    cityCache[country] = {
      timestamp: Date.now(),
      cities,
    };

    return res.json({ country, cities });
  } catch (error) {
    console.error('GeoNames error:', error.response?.data || error.message);

    //* fallback static json - searching main cities and if API not available keep the previous results
    let fallbackCities = [];
    for (const continent of destinationsData) {
      const countryEntry = continent.countries.find((c) => c.code === country);
      if (countryEntry && Array.isArray(countryEntry.cities)) {
        fallbackCities = countryEntry.cities;
        break;
      }
    }

    //* fallback to prevent re-loading for each click
    cityCache[country] = {
      timestamp: Date.now(),
      cities: fallbackCities,
    };

    //* to send cities from json or empty array
    return res.json({ country, cities: fallbackCities });
  }
});

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
