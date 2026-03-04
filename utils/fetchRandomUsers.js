const axios = require('axios');

const fetchRandomUsers = async (randomUserNumber = 10) => {
  try {
    const response = await axios.get(
      `https://randomuser.me/api/?results=${randomUserNumber}`,
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching random users:', error);
    return [];
  }
};

module.exports = fetchRandomUsers;
