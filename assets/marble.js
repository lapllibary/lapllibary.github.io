import * as THREE from 'three';

export function createMarbleTextures(resources, baseColor, veinColor) {
  const size = 512;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  const roughness = new Uint8Array(size * size * 4);
  const base = new THREE.Color(baseColor), vein = new THREE.Color(veinColor);
  // Layered waves produce continuous mineral veins rather than random speckles.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const warp = Math.sin(u * 12 + Math.sin(v * 8)) * .65 + Math.sin(v * 17 + u * 9) * .2 + Math.sin(u * 43 - v * 21) * .065;
    const band = Math.abs(Math.sin((u * 2.8 + v * 1.6 + warp) * Math.PI));
    const fineBand = Math.abs(Math.sin((u * 7 - v * 3 + warp * 1.7) * Math.PI));
    const strength = Math.exp(-band * 55) * .8 + Math.exp(-band * 12) * .13 + Math.exp(-fineBand * 100) * .17;
    const cloud = .92 + Math.sin(u * 19 + v * 7) * Math.sin(v * 13 - u * 5) * .05;
    const offset = (y * size + x) * 4;
    const sample = base.clone().multiplyScalar(cloud).lerp(vein, Math.min(strength, .9)).convertLinearToSRGB();
    image.data[offset] = sample.r * 255; image.data[offset + 1] = sample.g * 255; image.data[offset + 2] = sample.b * 255; image.data[offset + 3] = 255;
    const rough = Math.round(185 + strength * 35);
    roughness[offset] = roughness[offset + 1] = roughness[offset + 2] = rough; roughness[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.DataTexture(roughness, size, size, THREE.RGBAFormat);
  for (const texture of [map, roughnessMap]) {
    texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(3, 5.25); texture.needsUpdate = true; resources.push(texture);
  }
  return { map, roughnessMap };
}
