import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCelestialScenery } from './celestial-scenery.js';
import { arrangeSubjects, createSubjectSign, BOOK_SHELF_BASE_HEIGHT } from './library-subjects.js';

export default function Museum({ books, onClose, saved, onSave }) {
  const host = useRef(null);
  const navigation = useRef({});
  const dialog = useRef(null);
  useEffect(() => { const previous = document.activeElement; dialog.current?.querySelector('button')?.focus(); return () => previous?.focus(); }, []);
  const subjects = React.useMemo(() => arrangeSubjects(books), [books]);
  const browseSubjects = [...subjects].sort((a, b) => {
    const priority = name => name === 'Science fiction' ? 0 : name === 'History and biography' ? 1 : 2;
    return priority(a.name) - priority(b.name);
  });
  const [activeSubject, setActiveSubject] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(false);
  const [tracing, setTracing] = useState(false);
  const [tracingStatus, setTracingStatus] = useState('idle');
  const tracingEnabled = useRef(false);
  tracingEnabled.current = tracing;
  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { setError(true); return; }
    const container = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e6dfcf');
    scene.fog = new THREE.Fog('#e6dfcf', 22, 55);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(65, 1, .1, 100);
    camera.position.set(0, 2.2, 13);
    let yaw = 0, pitch = 0;
    const resources = [];
    const environmentScene = new RoomEnvironment();
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environment = environmentGenerator.fromScene(environmentScene, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .4;
    resources.push(environment);
    environmentScene.dispose();
    environmentGenerator.dispose();
    function material(color, extra = {}) { const value = new THREE.MeshStandardMaterial({ color, roughness: .85, ...extra }); resources.push(value); return value; }
    function box(w, h, d, mat, x, y, z) { const geometry = new THREE.BoxGeometry(w, h, d); resources.push(geometry); const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(x, y, z); scene.add(mesh); return mesh; }
    const { shelfMaterial: wood } = createCelestialScenery(scene, resources, subjects);
    const colors = ['#344d42', '#884637', '#32495d', '#b3914f', '#62506b'];
    function texture(book, number) {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 640;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = colors[book.categoryIndex % colors.length]; ctx.fillRect(0, 0, 512, 640);
      ctx.strokeStyle = '#d4be84'; ctx.lineWidth = 3; ctx.strokeRect(30, 30, 452, 580);
      ctx.fillStyle = '#eee3c7'; ctx.font = '18px Georgia'; ctx.fillText(`EMERSON'S LIBRARY   /   ${String(number + 1).padStart(2, '0')}`, 55, 80);
      ctx.font = '36px Georgia'; let line = '', y = 205;
      for (const word of book.title.split(' ')) { if (ctx.measureText(line + word).width > 395 && line) { ctx.fillText(line.trim(), 55, y); y += 47; line = ''; } line += word + ' '; }
      ctx.fillText(line.trim(), 55, y);
      ctx.font = '21px Georgia'; const author = book.author || book.translation || 'From the personal collection';
      let authorLine = '', authorY = 485;
      for (const word of author.split(' ')) { if (ctx.measureText(authorLine + word).width > 390 && authorLine) { ctx.fillText(authorLine.trim(), 55, authorY); authorY += 29; authorLine = ''; } authorLine += word + ' '; }
      ctx.fillText(authorLine.trim(), 55, authorY);
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; resources.push(tex); return tex;
    }
    const glowColor = getComputedStyle(document.documentElement).getPropertyValue('--cosmos-book-glow').trim();
    const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 128;
    const haloContext = haloCanvas.getContext('2d');
    const gradient = haloContext.createRadialGradient(64, 64, 12, 64, 64, 64);
    gradient.addColorStop(0, glowColor); gradient.addColorStop(.45, glowColor); gradient.addColorStop(1, 'transparent');
    haloContext.fillStyle = gradient; haloContext.fillRect(0, 0, 128, 128);
    const haloTexture = new THREE.CanvasTexture(haloCanvas); haloTexture.colorSpace = THREE.SRGBColorSpace; resources.push(haloTexture);
    const haloGeometry = new THREE.PlaneGeometry(1.5, 1.8); resources.push(haloGeometry);
    const exhibits = [];
    subjects.forEach(subject => {
      createSubjectSign(scene, resources, subject);
      subject.books.forEach((book, position) => {
      const index = books.indexOf(book);
      const side = subject.side;
      const z = subject.z + (subject.columns - 1) * .55 - (position % subject.columns) * 1.1;
      const y = BOOK_SHELF_BASE_HEIGHT + Math.floor(position / subject.columns) * 1.15;
      const coverTexture = texture(book, index);
      const cover = material('#ffffff', { map: coverTexture, emissiveMap: coverTexture, emissive: '#ffffff', emissiveIntensity: .85 });
      const mesh = box(.12, 1.12, .88, cover, side * 11.65, y, z);
      // A plane on the inner wall face keeps titles readable from the aisle.
      const geo = new THREE.PlaneGeometry(.88, 1.12); resources.push(geo);
      const face = new THREE.Mesh(geo, cover); face.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2; face.position.set(side * 11.55, y, z); face.userData.book = book; scene.add(face); exhibits.push(face);
      const haloMaterial = new THREE.MeshBasicMaterial({ map: haloTexture, transparent: true, opacity: .38, blending: THREE.AdditiveBlending, depthWrite: false }); resources.push(haloMaterial);
      const halo = new THREE.Mesh(haloGeometry, haloMaterial); halo.rotation.copy(face.rotation); halo.position.set(side * 11.57, y, z); halo.userData.pathTracingExclude = true; scene.add(halo); face.userData.halo = halo;
      box(.55, .08, 1.25, wood, side * 11.65, y - .62, z);
    });
    });
    let pathTracer = null, disposed = false, lastMotion = performance.now();
    function initializeTracer() {
    setTracingStatus('preparing');
    import('./library-pathtracer.js').then(({ createLibraryPathTracer }) => {
      if (disposed) return;
      try { pathTracer = createLibraryPathTracer(renderer, scene, camera); setTracingStatus('ready'); }
      catch (error) { console.warn('Library ray tracing unavailable:', error); setTracingStatus('unavailable'); }
    }).catch(error => { if (!disposed) { console.warn('Library ray tracing could not load:', error); setTracingStatus('unavailable'); } });
    }
    const previousPosition = camera.position.clone();
    const previousRotation = camera.quaternion.clone();
    const keys = new Set();
    const ray = new THREE.Raycaster();
    let hovered = null;
    function highlight(book) {
      if (hovered === book) return;
      if (hovered) { hovered.material.emissiveIntensity = .85; hovered.userData.halo.material.opacity = .38; }
      hovered = book;
      if (hovered) { hovered.material.emissiveIntensity = 1.65; hovered.userData.halo.material.opacity = .8; }
      pathTracer?.updateMaterials();
      lastMotion = performance.now();
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
    }
    function bookAt(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      return ray.intersectObjects(exhibits)[0]?.object || null;
    }
    function inspect(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      const hit = ray.intersectObjects(exhibits)[0]; if (hit) setSelected(hit.object.userData.book);
    }
    let drag = null, moved = false;
    const down = event => { drag = [event.clientX, event.clientY]; moved = false; renderer.domElement.setPointerCapture(event.pointerId); };
    const move = event => { if (!drag) { highlight(bookAt(event)); return; } highlight(null); const dx = event.clientX - drag[0], dy = event.clientY - drag[1]; if (Math.abs(dx) + Math.abs(dy) > 2) moved = true; yaw -= dx * .004; pitch = THREE.MathUtils.clamp(pitch - dy * .003, -.65, .65); drag = [event.clientX, event.clientY]; };
    renderer.domElement.addEventListener('pointerleave', () => highlight(null));
    renderer.domElement.style.cursor = 'grab';
    const up = event => { if (!moved) inspect(event); drag = null; };
    const keydown = event => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault(); keys.add(event.key.toLowerCase()); if (event.key === 'Escape') onClose(); };
    const keyup = event => keys.delete(event.key.toLowerCase());
    const blur = () => keys.clear();
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur);
    renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointermove', move); renderer.domElement.addEventListener('pointerup', up);
    function resize() { renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); pathTracer?.reset(); }
    window.addEventListener('resize', resize); resize();
    const clock = new THREE.Clock();
    navigation.current = { startTracing: initializeTracer, visit: subject => { camera.position.set(subject.side * 2.5, 3.1, subject.z); yaw = subject.side === -1 ? Math.PI / 2 : -Math.PI / 2; pitch = -Math.atan2(subject.signY - 3.1, 8.95); keys.clear(); setSelected(null); setActiveSubject(subject.name); }, step: direction => { if (direction === 'left') yaw += .3; if (direction === 'right') yaw -= .3; if (direction === 'forward' || direction === 'back') { const distance = direction === 'forward' ? 1.2 : -1.2; camera.position.x -= Math.sin(yaw) * distance; camera.position.z -= Math.cos(yaw) * distance; } }, home: () => { camera.position.set(0, 2.2, 13); yaw = 0; pitch = 0; setActiveSubject(''); } };
    renderer.setAnimationLoop(() => {
      const delta = Math.min(clock.getDelta(), .05);
      if (keys.has('arrowleft') || keys.has('q')) yaw += delta * 1.3;
      if (keys.has('arrowright') || keys.has('e')) yaw -= delta * 1.3;
      const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
      const strafe = Number(keys.has('d')) - Number(keys.has('a'));
      camera.position.x += (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * delta * 5;
      camera.position.z += (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * delta * 5;
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -10.5, 10.5); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -23, 15);
      camera.rotation.order = 'YXZ'; camera.rotation.set(pitch, yaw, 0);
      if (!camera.position.equals(previousPosition) || !camera.quaternion.equals(previousRotation)) {
        lastMotion = performance.now(); previousPosition.copy(camera.position); previousRotation.copy(camera.quaternion); pathTracer?.reset();
      }
      if (pathTracer && tracingEnabled.current) {
        try { pathTracer.render(performance.now() - lastMotion < 350); }
        catch (error) { console.warn('Library ray tracing stopped:', error); pathTracer.dispose(); pathTracer = null; setTracingStatus('unavailable'); renderer.render(scene, camera); }
      } else { pathTracer?.reset(); renderer.render(scene, camera); }
    });
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { disposed = true; document.body.style.overflow = previousOverflow; renderer.setAnimationLoop(null); pathTracer?.dispose(); renderer.dispose(); resources.forEach(resource => resource.dispose()); renderer.domElement.remove(); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); window.removeEventListener('resize', resize); };
  }, [books, onClose]);
  return <div className="museum" ref={dialog} onKeyDown={event => { if (event.key === "Tab") { const buttons = [...dialog.current.querySelectorAll("button, summary")].filter(element => element.getClientRects().length > 0); const first = buttons[0], last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }} role="dialog" aria-modal="true" aria-label="Walkable personal library"><div className="museum-canvas" ref={host} /><header className="museum-header"><button onClick={onClose}>↖ Back to portfolio</button><span>EMERSON LIU <i> / The celestial library</i></span><button onClick={onClose}>▦ Collection</button></header><details className="museum-subjects" open><summary>Browse subjects <span>{subjects.length}</span></summary><nav aria-label="Library subjects">{browseSubjects.map(subject => <button key={subject.name} aria-pressed={activeSubject === subject.name} onClick={() => navigation.current.visit?.(subject)}>{subject.name}<span>{subject.books.length}</span></button>)}</nav></details><div className="museum-caption"><p>THE PERSONAL COLLECTION</p><h2>Wander through<br />a world of ideas.</h2><span>{books.length} books. A lifetime of curiosity.</span></div><div className="museum-controls"><p>WASD / arrows to walk · Drag to look · Click a book to inspect</p><div><button aria-label="Turn left" onClick={() => navigation.current.step?.('left')}>↶</button><button aria-label="Walk forward" onClick={() => navigation.current.step?.('forward')}>↑</button><button aria-label="Walk backward" onClick={() => navigation.current.step?.('back')}>↓</button><button aria-label="Turn right" onClick={() => navigation.current.step?.('right')}>↷</button><button onClick={() => navigation.current.home?.()}>Reset view</button><button aria-pressed={tracing && tracingStatus !== "unavailable"} disabled={tracingStatus === "preparing" || tracingStatus === "unavailable"} onClick={() => { if (tracingStatus === "idle") navigation.current.startTracing?.(); setTracing(!tracing); }}>{tracingStatus === "idle" ? "Enable ray tracing" : tracingStatus === "preparing" ? "Preparing ray tracing…" : tracingStatus === "unavailable" ? "PBR preview" : `Ray tracing ${tracing ? "on" : "off"}`}</button></div></div>{error && <div className="museum-book"><h3>Explore the collection</h3><p>3D is unavailable in this browser. Every book is available in the catalog.</p><button onClick={onClose}>Open catalog</button></div>}{selected && <div className="museum-book"><button className="museum-dismiss" aria-label="Close book details" onClick={() => setSelected(null)}>×</button><p className="library-eyebrow">{selected.category}</p><h3>{selected.title}</h3>{selected.translation && <p>{selected.translation}</p>}<p>{selected.author || 'Author not listed in draft'}</p><button onClick={() => onSave(selected)}>{saved.includes(selected.id) ? '♥ Saved to your shelf' : '♡ Save to your shelf'}</button></div>}</div>;
}
