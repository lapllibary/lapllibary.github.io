import * as THREE from 'three';

export function createGalleryInscription(scene, resources) {
  const theme = getComputedStyle(document.documentElement);
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.font = `164px ${theme.getPropertyValue('--inscription-font').trim()}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.getPropertyValue('--cosmos-gold').trim();
  ctx.shadowColor = theme.getPropertyValue('--cosmos-glow').trim(); ctx.shadowBlur = 10;
  ctx.fillText('出山志在登鳌顶，', 1024, 195);
  ctx.fillText('何日身才入凤池', 1024, 425);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(15, 4.7);
  const material = new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:.85,transparent:true,depthWrite:false,roughness:.7,side:THREE.DoubleSide});
  const inscription = new THREE.Mesh(geometry,material);
  inscription.name = '出山志在登鳌顶，何日身才入凤池';
  inscription.position.set(0,8.2,-21);
  scene.add(inscription);resources.push(texture,geometry,material);
}
