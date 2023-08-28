import axios from 'axios';

const PIXABAY_API_KEY = '39076335-b62ce52c3bdb788b53746507f';
const BASE_URL = 'https://pixabay.com/api/';

const fetchImages = async (query, page = 1, perPage = 40) => {
  return await axios
    .get(BASE_URL, {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    })
    .then(response => {
      return response.data;
    });
};

export default fetchImages;
