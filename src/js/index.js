import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchImages from './pixabay-api';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

const imagesPerPage = 40;

const loadingErrorMsg = 'Oops! Something went wrong! Try reloading the page!';
const imagesNotFoundMsg =
  'Sorry, there are no images matching your search query. Please try again.';
const endOfResultsMsg =
  "We're sorry, but you've reached the end of search results.";

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

const renderGallery = markup => {
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
};

const updateLoadMoreBtnVisibility = (hits, totalHits) => {
  if (hits >= totalHits) {
    Notify.info(endOfResultsMsg);
    loadMoreBtn.classList.add('visually-hidden');
  } else {
    loadMoreBtn.classList.remove('visually-hidden');
  }
};

const searchImagesHandler = async event => {
  event.preventDefault();
  const form = event.currentTarget;
  searchQuery = form.elements.searchQuery.value.trim();

  clearGallery();

  if (!searchQuery) return;

  currentPage = 1;

  try {
    const searchResults = await fetchImages(searchQuery, currentPage);
    currentHits = searchResults.hits.length;

    if (searchResults.total === 0) {
      Notify.failure(imagesNotFoundMsg);
    } else {
      Notify.success(`Hooray! We found ${searchResults.totalHits} images.`);
      renderGallery(getGalleryMarkup(searchResults.hits));
      if (searchResults.totalHits > imagesPerPage) {
        updateLoadMoreBtnVisibility(currentHits, searchResults.totalHits);
      }
    }
  } catch (error) {
    Notify.failure(loadingErrorMsg);
  }
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
              <img class="gallery-image" src="${webformatURL}" alt="${tags}" width="330" height="220" loading="lazy" />
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
  try {
    const searchResults = await fetchImages(searchQuery, currentPage);

    renderGallery(getGalleryMarkup(searchResults.hits));
    scrollToNextGalleryPage();

    currentHits += searchResults.hits.length;
    updateLoadMoreBtnVisibility(currentHits, searchResults.totalHits);
  } catch (error) {
    Notify.failure(loadingErrorMsg);
  }
};

const scrollToNextGalleryPage = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

searchForm.addEventListener('submit', searchImagesHandler);
loadMoreBtn.addEventListener('click', loadMoreImagesHandler);
