import photoPointerUrl from './case-competition.asset.json?url';

const image = document.querySelector('[data-case-competition-photo]');
if (image) {
  fetch(photoPointerUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Case competition photo unavailable');
      return response.json();
    })
    .then((photo) => { image.src = photo.url; })
    .catch((error) => console.warn(error.message));
}
