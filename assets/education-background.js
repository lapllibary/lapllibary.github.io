import uwPointerUrl from './education-background.asset.json?url';
import ethPointerUrl from './eth-background.asset.json?url';
import hkustPointerUrl from './hkust-background.asset.json?url';

async function applyPhoto(selector, pointerUrl) {
  const entry = document.querySelector(selector);
  if (!entry) return;
  try {
    const response = await fetch(pointerUrl);
    if (!response.ok) throw new Error(`Photo unavailable: ${selector}`);
    const photo = await response.json();
    // Blob URLs avoid the CSS value size limit for high-resolution uploads.
    const imageResponse = await fetch(photo.url);
    const blobUrl = URL.createObjectURL(await imageResponse.blob());
    entry.style.setProperty('--education-card-image', `url("${blobUrl}")`);
    window.addEventListener('pagehide', () => URL.revokeObjectURL(blobUrl), {once:true});
  } catch (error) { console.warn(error.message); }
}
applyPhoto('.edu-uw', uwPointerUrl);
applyPhoto('.edu-eth', ethPointerUrl);
applyPhoto('.edu-hkust', hkustPointerUrl);
