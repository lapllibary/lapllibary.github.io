import * as THREE from 'three';
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer';

export function createLibraryPathTracer(renderer, scene, camera) {
  if (!renderer.extensions.has('EXT_color_buffer_float')) throw new Error('Floating-point render targets unavailable');
  const owned = [];
  const tracedScene = scene.clone(true);
  const remove = [];
  const replace = [];
  // Path tracing uses triangle geometry; convert the orbital line art to fine tubes.
  tracedScene.traverse(object => {
    if (object.isPoints || object.userData.pathTracingExclude) { remove.push(object); return; }
    if (object.isLine) {
      const attribute = object.geometry.attributes.position;
      const points = Array.from({length: attribute.count}, (_, i) => new THREE.Vector3().fromBufferAttribute(attribute, i));
      const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), Math.min(points.length, 40), .009, 3, true);
      const material = new THREE.MeshStandardMaterial({color: object.material.color, emissive: object.material.color, emissiveIntensity: .25, metalness: .7, roughness: .4});
      const tube = new THREE.Mesh(geometry, material); tube.position.copy(object.position); tube.quaternion.copy(object.quaternion); tube.scale.copy(object.scale);
      owned.push(geometry, material); replace.push([object, tube]);
    } else if (object.isMesh && object.material.isMeshBasicMaterial) {
      const material = new THREE.MeshStandardMaterial({map: object.material.map, emissiveMap: object.material.map, color: object.material.color, emissive: '#ffffff', emissiveIntensity: .7});
      object.material = material; owned.push(material);
    }
  });
  remove.forEach(object => object.removeFromParent());
  replace.forEach(([old, replacement]) => { old.parent.add(replacement); old.removeFromParent(); });
  const environment = new GradientEquirectTexture(128);
  environment.topColor.set('#455365'); environment.bottomColor.set('#15151a'); environment.update();
  tracedScene.environment = environment; tracedScene.environmentIntensity = .4; owned.push(environment);
  const skyCanvas = document.createElement('canvas'); skyCanvas.width = 1024; skyCanvas.height = 512;
  const ctx = skyCanvas.getContext('2d'); ctx.fillStyle = '#070f1b'; ctx.fillRect(0, 0, 1024, 512);
  let seed = 739;
  for (let i = 0; i < 1400; i++) { seed = seed * 16807 % 2147483647; const x = seed / 2147483647 * 1024; seed = seed * 16807 % 2147483647; const y = seed / 2147483647 * 220; ctx.fillStyle = i % 9 === 0 ? '#ddc59b' : '#607080'; ctx.fillRect(x,y,i % 9 === 0 ? 1.4 : .7,.8); }
  const sky = new THREE.CanvasTexture(skyCanvas); sky.mapping = THREE.EquirectangularReflectionMapping; sky.colorSpace = THREE.SRGBColorSpace; tracedScene.background = sky; owned.push(sky);
  const tracer = new WebGLPathTracer(renderer);
  try {
    tracer.textureSize.set(256, 256);
    tracer.renderScale = .5;
    tracer.tiles.set(3, 3);
    tracer.bounces = 2;
    tracer.filterGlossyFactor = .5;
    tracer.renderDelay = 400;
    tracer.minSamples = 4;
    tracer.fadeDuration = 600;
    tracer.rasterizeSceneCallback = () => renderer.render(scene, camera);
    tracer.setScene(tracedScene, camera);
  } catch (error) { tracer.dispose(); owned.forEach(resource => resource.dispose()); throw error; }
  return {
    render(moving) { tracer.enablePathTracing = !moving; if (moving) tracer.updateCamera(); tracer.renderSample(); },
    reset() { tracer.updateCamera(); },
    updateMaterials() { tracer.updateMaterials(); },
    updateLighting() {
      const colors = new Map();
      scene.traverse(object => {
        if (object.isLight && object.userData.libraryLightId !== undefined) colors.set(object.userData.libraryLightId, object.color);
      });
      tracedScene.traverse(object => {
        const color = colors.get(object.userData.libraryLightId);
        if (object.isLight && color) object.color.copy(color);
      });
      tracer.updateLights();
      tracer.updateMaterials();
    },
    dispose() { tracer.dispose(); owned.forEach(resource => resource.dispose()); },
  };
}

