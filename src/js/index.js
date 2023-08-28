import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchImages from './pixabay-api';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

let previousSearchQuery = '';
let currentPage = 0;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const searchImagesHandler = async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const searchQuery = form.elements.searchQuery.value;

  if (searchQuery === previousSearchQuery) {
    currentPage += 1;
  } else {
    previousSearchQuery = searchQuery;
    currentPage = 1;
  }

  // console.log(`Search query: ${searchQuery}`);
  console.log(`Current page: ${currentPage}`);

  const searchResults = await fetchImages(searchQuery, currentPage);
  if (searchResults.total === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notify.success(`Hooray! We found ${searchResults.totalHits} images.`);
    createGallery(searchResults.hits);
    lightbox.refresh();
    if (searchResults.totalHits > 40) {
      loadMoreBtn.classList.remove('visually-hidden');
    } else {
      loadMoreBtn.classList.add('visually-hidden');
    }
  }

  console.log(searchResults);
};

const loadMoreImagesHandler = async () => {};

const createGallery = images => {
  const galleryMarkup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
          <div class="photo-card">
          <a class="link gallery-item" href="${largeImageURL}">
              <img src="${webformatURL}" alt="${tags}" width="330" height="220" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                <span>${likes}</span>
              </p>
              <p class="info-item">
                <b>Views</b>
                <span>${views}</span>
              </p>
              <p class="info-item">
                <b>Comments</b>
                <span>${comments}</span>
              </p>
              <p class="info-item">
                <b>Downloads</b>
                <span>${downloads}</span>
              </p>
            </div>
            </a>
          </div>
        `
    )
    .join('');
  gallery.innerHTML = galleryMarkup;
};

searchForm.addEventListener('submit', searchImagesHandler);
