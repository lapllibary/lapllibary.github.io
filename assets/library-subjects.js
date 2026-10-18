import * as THREE from 'three';

export const BOOK_SHELF_BASE_HEIGHT = 1.6;

export function arrangeSubjects(books) {
  const nextEdge = { '-1': 15, '1': 15 };
  return [...new Set(books.map(book => book.category))].map((name, index) => {
    const collection = books.filter(book => book.category === name);
    const columns = Math.ceil(collection.length / 2);
    const side = index % 2 === 0 ? -1 : 1;
    const width = Math.max(6, columns * 1.1 + .7);
    const z = nextEdge[side] - width / 2;
    nextEdge[side] -= width;
    return {
      name, books: collection, columns, side, z,
      signY: BOOK_SHELF_BASE_HEIGHT + 1.55 + Math.floor((collection.length - 1) / columns) * 1.15,
    };
  });
}
export function createSubjectSign(scene, resources, subject) {
  const theme = getComputedStyle(document.documentElement);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = theme.getPropertyValue('--cosmos-night').trim(); ctx.fillRect(0, 0, 1024, 320);
  ctx.strokeStyle = theme.getPropertyValue('--cosmos-gold').trim(); ctx.lineWidth = 3; ctx.strokeRect(10, 10, 1004, 300);
  ctx.fillStyle = ctx.strokeStyle; ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`SUBJECT COLLECTION   /   ${subject.books.length} BOOKS`, 512, 65);
  ctx.fillStyle = theme.getPropertyValue('--cosmos-marble').trim(); ctx.font = '48px Georgia';
  const lines = []; let line = '';
  for (const word of subject.name.split(' ')) {
    if (ctx.measureText(line + word).width > 900 && line) { lines.push(line.trim()); line = ''; }
    line += word + ' ';
  }
  lines.push(line.trim());
  lines.forEach((text, index) => ctx.fillText(text, 512, 155 + index * 58));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(5.9, 1.8);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  resources.push(texture, geometry, material);
  const sign = new THREE.Mesh(geometry, material);
  sign.position.set(subject.side * 11.45, subject.signY, subject.z);
  sign.rotation.y = subject.side === -1 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(sign);
}




