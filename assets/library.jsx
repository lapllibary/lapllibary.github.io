import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
const Museum = React.lazy(() => import('./museum.jsx'));
const closeMuseum = () => window.dispatchEvent(new Event('close-library-museum'));

const source = document.querySelector('.shelf');
const books = [...source.querySelectorAll('details')].flatMap((group, categoryIndex) =>
  [...group.querySelectorAll('li')].map((item, index) => ({
    id: `${categoryIndex}-${index}`,
    title: [...item.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join('').trim(),
    translation: item.querySelector('.zh')?.textContent || '',
    author: item.querySelector('.by')?.textContent || '',
    category: group.querySelector('h4').textContent,
    categoryIndex,
  }))
);
const categories = [...new Set(books.map(book => book.category))];
const storageKey = 'emerson-library-saved-v1';
function readSaved() {
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(saved) ? saved.filter(id => books.some(book => book.id === id)) : []; }
  catch { return []; }
}
function Library() {
  const [museum, setMuseum] = useState(false);
  React.useEffect(() => { const close = () => setMuseum(false); window.addEventListener('close-library-museum', close); return () => window.removeEventListener('close-library-museum', close); }, []);
  const [saved, setSaved] = useState(readSaved);
  const [notice, setNotice] = useState('');
  function toggle(book) {
    const next = saved.includes(book.id) ? saved.filter(id => id !== book.id) : [...saved, book.id];
    setSaved(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setNotice(''); }
    catch { setNotice('Your saved shelf is available for this visit. Browser storage is unavailable.'); }
  }
  return <div className="library-shell">
    <div className="library-entrance"><p className="library-eyebrow">A WALKABLE COLLECTION</p><h3>Step inside<br />the reading room.</h3><p>A quiet place for history, literature, and imagined futures.</p><button onClick={() => setMuseum(true)}>Enter the 3D library ↗</button><span>Walk, explore, and discover the books on my shelves.</span></div>{museum && <React.Suspense fallback={<div className="museum-loading" role="status">Opening the reading room…</div>}><Museum books={books} onClose={closeMuseum} saved={saved} onSave={toggle} /></React.Suspense>}    {notice && <p role="status">{notice}</p>}
  </div>;
}
if (source) {
  const mount = document.createElement('div');
  mount.id = 'interactive-library';
  const heading = document.querySelector('.shelf-head');
  (heading || source).before(mount);
  createRoot(mount).render(<Library />);
  source.hidden = false;
  if (heading) heading.hidden = false;
}
