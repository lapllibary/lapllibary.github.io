import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import robotPointerUrl from './robot-display.asset.json?url';

// One download and one set of GPU resources for all three static displays.
export function installRobotDisplays(displays, resources) {
  let disposed = false;
  const ready = (async () => {
    const response = await fetch(robotPointerUrl);
    if (!response.ok) throw new Error(`Robot pointer: ${response.status}`);
    const pointer = await response.json();
    const modelResponse = await fetch(pointer.url);
    if (!modelResponse.ok) throw new Error(`Robot model: ${modelResponse.status}`);
    const { scene: model } = await new GLTFLoader().parseAsync(await modelResponse.arrayBuffer(), '');
    const owned = new Set();
    model.traverse(object => {
      if (!object.isMesh) return;
      owned.add(object.geometry);
      for (const material of [].concat(object.material)) {
        owned.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) owned.add(value);
      }
      object.castShadow = true;
      object.receiveShadow = true;
    });
    if (disposed) {
      owned.forEach(resource => resource.dispose());
      return false;
    }
    try {
      const bounds = new THREE.Box3().setFromObject(model);
      const height = bounds.max.y - bounds.min.y;
      if (!Number.isFinite(height) || height <= 0) throw new Error('Robot has invalid bounds');
      const scale = 2.5 / height;
      model.scale.setScalar(scale);
      // Pedestal top is at .75; preserve ground contact if the source changes.
      model.position.y = .75 - bounds.min.y * scale;
      const instances = displays.map(() => model.clone(true));
      displays.forEach(({ mount, fallback }, index) => {
        instances[index].name = `RobotDisplay${index + 1}`;
        mount.add(instances[index]);
        fallback.visible = false;
        fallback.userData.pathTracingExclude = true;
      });
      resources.push(...owned);
      return true;
    } catch (error) {
      owned.forEach(resource => resource.dispose());
      throw error;
    }
  })().catch(error => {
    if (!disposed) console.warn('Detailed robots unavailable; keeping procedural displays:', error);
    return false;
  });
  return { ready, dispose() { disposed = true; } };
}
