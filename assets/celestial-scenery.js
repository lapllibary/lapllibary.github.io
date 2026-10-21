import * as THREE from 'three';
import { installRobotDisplays } from './robot-display.js';
import { createMarbleTextures } from './marble.js';
import { createCelestialDome, domeRailAnchor } from './celestial-dome.js';
import { createGalleryInscription } from './gallery-inscription.js';

// Geometry stays procedural; the palette belongs to the global design system.
export function createCelestialScenery(scene, resources, subjects) {
  const theme = getComputedStyle(document.documentElement);
  const color = name => theme.getPropertyValue(`--cosmos-${name}`).trim();
  const mat = (name, extra = {}) => {
    const material = new THREE.MeshPhysicalMaterial({ color: color(name), roughness: .65, ...extra });
    resources.push(material); return material;
  };
  const marbleTextures = createMarbleTextures(resources, color('marble-floor'), color('marble-vein'));
  const midnight = mat('night', { roughness: .92 });
  const floor = mat('marble-floor', { color: '#ffffff', ...marbleTextures, metalness: 0, roughness: .62, bumpMap: marbleTextures.roughnessMap, bumpScale: .008, clearcoat: .12, clearcoatRoughness: .4 });
  const gold = mat('gold', { metalness: .9, roughness: .27 });
  const marble = mat('marble'), drape = mat('drape'), steel = mat('steel', { metalness: .8, roughness: .28 });
  const joints = mat('joints', { metalness: .65 });
  const glow = mat('glow', { emissive: color('glow'), emissiveIntensity: 2.5 });
  const purpleGlow = mat('purple-light', { emissive: color('purple-light'), emissiveIntensity: 2.5 });
  // Separate fixture materials keep decorative robot and sun glows unchanged.
  const fixtureGold = glow.clone(), fixturePurple = purpleGlow.clone();
  resources.push(fixtureGold, fixturePurple);
  const fixtureLights = [];
  function registerLight(light, isPurple) {
    light.userData.libraryLightId = fixtureLights.length;
    fixtureLights.push({ light, isPurple });
  }
  function setLighting(mode) {
    const goldColor = color('glow'), purpleColor = color('purple-light');
    const phaseColors = mode === 1 ? [goldColor, goldColor] : mode === 2 ? [purpleColor, purpleColor] : [goldColor, purpleColor];
    [fixtureGold, fixturePurple].forEach((material, index) => {
      material.color.set(phaseColors[index]);
      material.emissive.set(phaseColors[index]);
    });
    fixtureLights.forEach(({ light, isPurple }) => light.color.set(phaseColors[Number(isPurple)]));
  }
  const columnLightCounts = new Map();
  function nextLightIsPurple(column) {
    const index = columnLightCounts.get(column) || 0;
    columnLightCounts.set(column, index + 1);
    return index % 2 === 0;
  }
  const orbit = new THREE.LineBasicMaterial({ color: color('gold'), transparent: true, opacity: .45 }); resources.push(orbit);
  scene.background = new THREE.Color(color('night'));
  scene.fog = new THREE.Fog(color('night'), 32, 90);
  function mesh(geometry, material, x = 0, y = 0, z = 0, parent = scene) {
    resources.push(geometry); const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  const box = (w, h, d, material, x, y, z, parent) => mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent);
  const sphere = (radius, material, x, y, z, parent) => mesh(new THREE.SphereGeometry(radius, 24, 16), material, x, y, z, parent);
  const cylinder = (top, bottom, height, material, x, y, z, parent) => mesh(new THREE.CylinderGeometry(top, bottom, height, 48), material, x, y, z, parent);
  function ring(radius, x, y, z, tilt = -Math.PI / 2, parent = scene) {
    const points = Array.from({ length: 161 }, (_, i) => { const a = i / 160 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0); });
    const geometry = new THREE.BufferGeometry().setFromPoints(points); resources.push(geometry);
    const line = new THREE.LineLoop(geometry, orbit); line.position.set(x, y, z); line.rotation.x = tilt; parent.add(line); return line;
  }
  box(40, .2, 68, floor, 0, -.1, -4);
  // Freestanding shelves leave the curved enclosure visible all the way to its base.
  for (let z = -24; z <= 16; z += 2) box(24, .008, .012, gold, 0, .004, z);
  for (let x = -12; x <= 12; x += 2) box(.012, .008, 42, gold, x, .004, -4);
  for (let r = 1; r <= 20; r += 1.5) ring(r, 0, .025, -6);

  createCelestialDome(scene, resources);
  createGalleryInscription(scene, resources);
  scene.add(new THREE.HemisphereLight(color('sky'), color('gold'), .6));
  const moonlight = new THREE.DirectionalLight(color('sky'), 1.2); moonlight.position.set(-8, 15, 6); scene.add(moonlight);
  const front = new THREE.DirectionalLight(color('marble'), .7); front.position.set(0, 5, 16); scene.add(front);
  for (const [index, z] of [7, -5, -17].entries()) {
    const lamp = new THREE.PointLight(color(index % 2 === 0 ? 'purple-light' : 'glow'), 45, 18, 1.5); lamp.position.set(0, 4, z); scene.add(lamp);
    registerLight(lamp, index % 2 === 0);

  }
  // Continuous orbital tracks tie the fixtures into the celestial architecture.
  function orbitalRail(points) {
    const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return mesh(new THREE.TubeGeometry(path, 80, .028, 8, false), gold);
  }
  for (const x of [-9.1, 0, 9.1]) {
    orbitalRail([domeRailAnchor('x', x, 1).toArray(),[x,7.45,16],[x,7.45,4],[x,7.45,-10],[x,7.45,-24],domeRailAnchor('x', x, -1).toArray()]);
  }
  for (const z of [9, -4, -17]) {
    orbitalRail([domeRailAnchor('z', z, -1).toArray(),[-11.9,7.78,z],[-9.1,7.45,z],[-4.5,8.2,z],[0,7.45,z],[4.5,8.2,z],[9.1,7.45,z],[11.9,7.78,z],domeRailAnchor('z', z, 1).toArray()]);
  }
  // Brass lamps sit directly on their tracks, with downward PBR spotlights.
  function pendant(x, z, targetX, targetY, targetZ, castShadow = false) {
    const isPurple = nextLightIsPurple(x);
    cylinder(.09, .09, .16, gold, x, 7.43, z);
    cylinder(.56, .65, .18, gold, x, 7.28, z);
    cylinder(.48, .48, .025, isPurple ? fixturePurple : fixtureGold, x, 7.17, z);
    const lamp = new THREE.SpotLight(color(isPurple ? 'purple-light' : 'glow'), 160, 24, Math.PI / 3.4, .65, 2);
    lamp.position.set(x, 7.1, z); lamp.target.position.set(targetX, targetY, targetZ);
    lamp.castShadow = castShadow;
    if (castShadow) {
      lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.0002; lamp.shadow.normalBias = .035;
      lamp.shadow.camera.near = .5; lamp.shadow.camera.far = 24;
      resources.push({ dispose: () => lamp.shadow.dispose() });
    }
    scene.add(lamp, lamp.target);
    registerLight(lamp, isPurple);
  }
  for (const z of [9, -4, -17]) pendant(0, z, 0, 0, z, true);
  for (const subject of subjects) {
    const x = subject.side * 9.1;
    orbitalRail([domeRailAnchor('z', subject.z, subject.side).toArray(),[subject.side * 11.9,7.78,subject.z],[subject.side * 10.6,7.7,subject.z],[x,7.45,subject.z]]);
    pendant(x, subject.z, subject.side * 11.5, 2.1, subject.z);
  }
  const sun = sphere(.55, glow, 3.8, 7, -24);

  // Plinths echo the reference's circular orbital pedestals.
  function plinth(x, z) {
    const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
    cylinder(1.05, 1.2, .18, gold, 0, .09, 0, group);
    cylinder(.82, .95, .45, midnight, 0, .4, 0, group);
    cylinder(.92, .92, .12, gold, 0, .69, 0, group);
    for (const r of [1.4, 1.8, 2.3]) ring(r, x, .035, z);
    return group;
  }
  const robotDisplays = [];
  function robot(x, z, turn) {
    const mount = plinth(x, z); mount.rotation.y = turn;
    const group = new THREE.Group(); mount.add(group);
    robotDisplays.push({ mount, fallback: group });
    const limb = (ax, ay, az, bx, by, bz, radius = .09) => {
      const start = new THREE.Vector3(ax, ay, az), end = new THREE.Vector3(bx, by, bz), difference = end.clone().sub(start);
      const part = mesh(new THREE.CylinderGeometry(radius, radius * .85, difference.length(), 12), steel, ...start.clone().add(end).multiplyScalar(.5).toArray(), group);
      part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), difference.normalize());
      sphere(radius * 1.35, joints, ax, ay, az, group); sphere(radius * 1.35, joints, bx, by, bz, group);
    };
    box(.64, .7, .35, steel, 0, 2.25, 0, group); box(.37, .25, .39, joints, 0, 1.72, 0, group);
    cylinder(.13, .15, .3, gold, 0, 1.96, 0, group); cylinder(.1, .1, .2, gold, 0, 2.69, 0, group);
    const head = sphere(.23, steel, 0, 2.98, 0, group); head.scale.set(.85, 1.15, .8);
    box(.32, .1, .08, joints, 0, 3.01, .17, group);
    for (const side of [-1, 1]) {
      sphere(.035, glow, side * .09, 3.01, .219, group);
      limb(side * .4, 2.5, 0, side * .55, 2.02, .02); limb(side * .55, 2.02, .02, side * .57, 1.57, .16, .07);
      box(.14, .2, .14, steel, side * .57, 1.46, .16, group);
      limb(side * .19, 1.69, 0, side * .25, 1.22, .05, .12); limb(side * .25, 1.22, .05, side * .3, .84, 0, .09);
      box(.24, .12, .4, steel, side * .3, .8, .1, group);
    }
    box(.28, .3, .025, joints, 0, 2.32, .19, group); box(.16, .035, .03, glow, 0, 2.35, .21, group);
  }
  for (const [i, z] of [5, -7, -19].entries()) {

    robot(i % 2 ? -4.2 : 4.2, z, i % 2 ? .2 : -.2);
  }
  // A small brass armillary sphere at the center of the distant gallery.
  const globe = plinth(0, -19);
  sphere(.58, gold, 0, 1.5, 0, globe);
  for (const tilt of [0, .8, 1.6]) { const arm = ring(.9, 0, 1.5, 0, tilt, globe); arm.rotation.y = .5; }
  const robots = installRobotDisplays(robotDisplays, resources);
  return { shelfMaterial: gold, setLighting, robotsReady: robots.ready, dispose: robots.dispose };
}
