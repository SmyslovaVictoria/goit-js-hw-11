import Notiflix from 'notiflix';
import PixabayAPI from './api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const loadMoreBtn = document.querySelector('.loadMore-btn');
const gallery = document.querySelector('.gallery');

const pixabayAPI = new PixabayAPI();

form.addEventListener('submit', onSubmit);

loadMoreBtn.addEventListener('click', showMoreImg);

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

function onSubmit(e) {
    e.preventDefault();

  const form = e.currentTarget;
  const value = form.elements.searchQuery.value.trim();

    if (value == '') {
        onError(); 
      return;
    }
        
        pixabayAPI.setSearchQuery(value);
  clearMarkup();
  pixabayAPI.resetPage();

  pixabayAPI
    .getData()
    .then(dataImages => {
      const images = dataImages.hits;
      onSearch(dataImages.totalHits);
        images.map(image => {
    renderHtml(image);

      });
      btnShow();
      lightbox.refresh();
    })
    .catch(() => {
      onError();
    });
}

function showMoreImg() {
  pixabayAPI
    .getData()
    .then(dataImages => {
      const images = dataImages.hits;
      onSearch(dataImages.totalHits);
      images.map(image => {
        renderHtml(image);
      });
      btnShow();
      lightbox.refresh();

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    })
    .catch(() => {
      btnHide();
      onSearchEnd();
    });
}

function clearMarkup() {
  gallery.innerHTML = '';
}

function onError() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function onSearch(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function onSearchEnd() {
  Notiflix.Notify.warning(
    "We're sorry, but you've reached the end of search results."
  );
}

function btnHide() {
  loadMoreBtn.style.display = 'none';
}

function btnShow() {
  loadMoreBtn.style.display = 'block';
}

function renderHtml(img) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = img;
  const card = `
    <div class="photo-card">
    <a href="${largeImageURL}"><img class="gallery-img" src="${webformatURL}" alt="${tags}"/></a>
    <div class="info">
      <p class="info-item">
        <b>Likes: </b>
        <br>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views: </b>
        <br>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments: </b>
        <br>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads: </b>
        <br>
        ${downloads}
      </p>
    </div>
  </div>
    `;
  gallery.insertAdjacentHTML('beforeend', card);
}

