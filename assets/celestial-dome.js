import * as THREE from 'three';

const DOME_ORIGIN = new THREE.Vector3(0, 0, -4);
const DOME_RADII = new THREE.Vector3(18, 18.4, 32);
const RIB_INSET = .996;
const LIGHT_RAIL_RING = 1.1;

// Intersect a lighting column or cross rail with the existing dome ring.
export function domeRailAnchor(axis, coordinate, side) {
  const rx = DOME_RADII.x * Math.sin(LIGHT_RAIL_RING) * RIB_INSET;
  const rz = DOME_RADII.z * Math.sin(LIGHT_RAIL_RING) * RIB_INSET;
  const y = DOME_RADII.y * Math.cos(LIGHT_RAIL_RING) * RIB_INSET;
  if (axis === 'x') {
    const x = coordinate - DOME_ORIGIN.x;
    return new THREE.Vector3(coordinate, y, DOME_ORIGIN.z + side * rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)));
  }
  const z = coordinate - DOME_ORIGIN.z;
  return new THREE.Vector3(DOME_ORIGIN.x + side * rx * Math.sqrt(Math.max(0, 1 - (z / rz) ** 2)), y, coordinate);
}

export function createCelestialDome(scene, resources) {
  const theme = getComputedStyle(document.documentElement);
  const token = name => theme.getPropertyValue(`--cosmos-${name}`).trim();
  const origin = DOME_ORIGIN;
  const radii = DOME_RADII;
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0,0,0,1024);
  gradient.addColorStop(0, token('dome-crown'));
  gradient.addColorStop(.55, token('dome-mid'));
  gradient.addColorStop(1, token('dome-base'));
  ctx.fillStyle = gradient; ctx.fillRect(0,0,2048,1024);
  // Soft mineral/cloud shading lets the curved surface read as architecture.
  for (let band = 0; band < 18; band++) {
    const haze = ctx.createRadialGradient(1024 + Math.sin(band * 2.4) * 800, band * 60, 0, 1024 + Math.sin(band * 2.4) * 800, band * 60, 450);
    haze.addColorStop(0, 'rgba(135,163,191,.055)'); haze.addColorStop(1, 'rgba(135,163,191,0)');
    ctx.fillStyle = haze;ctx.fillRect(0,0,2048,1024);
  }
  let seed = 739;
  const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 1900; i++) {
    const x = random()*2048, y=random()*1024, r=random() > .96 ? 1.7 : .7;
    ctx.globalAlpha = .35 + random()*.6; ctx.fillStyle = i%7 === 0 ? token('gold') : token('marble');
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; resources.push(texture);
  const shellGeometry = new THREE.SphereGeometry(1,64,32,0,Math.PI*2,0,Math.PI/2);
  const shellMaterial = new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:.65,roughness:.9,fog:false,side:THREE.BackSide});
  const shell = new THREE.Mesh(shellGeometry,shellMaterial);shell.position.copy(origin);shell.scale.copy(radii);scene.add(shell);
  resources.push(shellGeometry,shellMaterial);
  const ribMaterial = new THREE.MeshStandardMaterial({color:token('gold'),metalness:.8,roughness:.4,emissive:token('gold'),emissiveIntensity:.15});resources.push(ribMaterial);
  function rib(points, radius) {
    const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,radius,6,false);
    const object=new THREE.Mesh(geometry,ribMaterial);scene.add(object);resources.push(geometry);
  }
  function point(theta,phi) {return new THREE.Vector3(radii.x*Math.sin(theta)*Math.cos(phi)*RIB_INSET,radii.y*Math.cos(theta)*RIB_INSET,radii.z*Math.sin(theta)*Math.sin(phi)*RIB_INSET).add(origin);}
  for(let i=0;i<16;i++) rib(Array.from({length:33},(_,j)=>point(.055+j/32*(Math.PI/2-.055),i/16*Math.PI*2)),.035);
  for(const theta of [.25,.5,.8,LIGHT_RAIL_RING,1.4,Math.PI/2]) rib(Array.from({length:129},(_,j)=>point(theta,j/128*Math.PI*2)),theta===Math.PI/2?.09:.022);
  // A gold crown makes the dome's apex legible when looking upward.
  const crownGeometry = new THREE.TorusGeometry(.65,.045,8,64);
  const crown=new THREE.Mesh(crownGeometry,ribMaterial);crown.rotation.x=Math.PI/2;crown.position.set(0,18.32,-4);scene.add(crown);resources.push(crownGeometry);
}
