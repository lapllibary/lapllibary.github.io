import React, { useEffect, useState } from 'react';
import manifest from './cover/manifest.json';

const pointers = import.meta.glob('./cover/*.asset.json', {
  query: '?url', import: 'default', eager: true,
});
const normalizeTitle = title => title.normalize('NFKC').trim();
const covers = new Map(manifest.flatMap(entry =>
  [entry.title, ...(entry.aliases || [])].map(title => [normalizeTitle(title), entry])
));
const cache = new Map();

export default function BookCover({ book }) {
  const entry = covers.get(normalizeTitle(book.title)) || covers.get(normalizeTitle(book.translation || ''));
  const [photo, setPhoto] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPhoto(null);
    setFailed(false);
    if (!entry) return;
    if (!cache.has(entry.file)) {
      const url = pointers[`./cover/${entry.file}`];
      cache.set(entry.file, fetch(url).then(response => {
        if (!response.ok) throw new Error('Cover unavailable');
        return response.json();
      }).catch(error => { cache.delete(entry.file); throw error; }));
    }
    cache.get(entry.file).then(pointer => {
      if (!cancelled) setPhoto(pointer);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [entry]);

  if (!entry || failed) return <p className="museum-cover-status">Cover unavailable.</p>;
  if (!photo) return <p className="museum-cover-status" role="status">Loading cover…</p>;
  return <figure className="museum-cover">
    <img src={photo.url} alt={`Cover of ${entry.matched_title}`} onError={() => setFailed(true)} />
  </figure>;
}
