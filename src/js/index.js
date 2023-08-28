import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchImages from './pixabay-api';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

let searchQuery = '';
let currentPage = 1;
let currentHits = 0;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const clearGallery = () => {
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('visually-hidden');
};

const updateLoadMoreBtnVisibility = (hits, totalHits) => {
  if (hits >= totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    loadMoreBtn.classList.add('visually-hidden');
  } else {
    loadMoreBtn.classList.remove('visually-hidden');
  }
};

const searchImagesHandler = async event => {
  event.preventDefault();
  const form = event.currentTarget;
  searchQuery = form.elements.searchQuery.value.trim();

  // console.log(`Search query: ${searchQuery}`);

  clearGallery();

  if (!searchQuery) return;

  currentPage = 1;

  // console.log(`Current page: ${currentPage}`);

  const searchResults = await fetchImages(searchQuery, currentPage);
  currentHits = searchResults.hits.length;

  if (searchResults.total === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notify.success(`Hooray! We found ${searchResults.totalHits} images.`);
    gallery.innerHTML = getGalleryMarkup(searchResults.hits);
    lightbox.refresh();

    updateLoadMoreBtnVisibility(currentHits, searchResults.totalHits);
  }

  // console.log(searchResults);
};

const getGalleryMarkup = images => {
  return images
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
};

const loadMoreImagesHandler = async () => {
  currentPage += 1;
  const searchResults = await fetchImages(searchQuery, currentPage);
  gallery.insertAdjacentHTML('beforeend', getGalleryMarkup(searchResults.hits));
  lightbox.refresh();

  currentHits += searchResults.hits.length;
  // console.log(`Current page: ${currentPage}`);
  // console.log(`Current hits: ${currentHits}`);
  // console.log(searchResults);

  updateLoadMoreBtnVisibility(currentHits, searchResults.totalHits);
};

searchForm.addEventListener('submit', searchImagesHandler);
loadMoreBtn.addEventListener('click', loadMoreImagesHandler);
