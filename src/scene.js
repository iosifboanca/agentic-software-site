import {
    ACESFilmicToneMapping, BoxGeometry, Color, CylinderGeometry, DirectionalLight,
    DoubleSide, DynamicDrawUsage, ExtrudeGeometry, Group, InstancedMesh, Mesh,
    MeshBasicMaterial, MeshStandardMaterial, Object3D, Path, PerspectiveCamera, PlaneGeometry,
    PMREMGenerator, PointLight, Scene, Shape, WebGLRenderer
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;

function createHelix(material, compact) {
    const outline = new Shape();
    outline.absellipse(0, 0, 1.85, 1.12, 0, TAU, false, 0);
    const hole = new Path();
    hole.absellipse(0, 0, 1.76, 1.03, 0, TAU, true, 0);
    outline.holes.push(hole);
    const geometry = new ExtrudeGeometry(outline, {
        depth: .025, bevelEnabled: true, bevelThickness: .012,
        bevelSize: .01, bevelSegments: 2, steps: 1, curveSegments: compact ? 44 : 80
    });
    const count = compact ? 32 : 58;
    const object = new InstancedMesh(geometry, material, count);
    object.instanceMatrix.setUsage(DynamicDrawUsage);
    object.frustumCulled = false;
    const dummy = new Object3D();
    const silver = new Color('#e2e8d7');
    const lime = new Color('#d8ff65');
    for (let index = 0; index < count; index++) {
        object.setColorAt(index, index % 11 === 0 ? lime : silver);
    }
    object.instanceColor.needsUpdate = true;

    function update(time, pointer, scroll) {
        for (let index = 0; index < count; index++) {
            const fraction = index / (count - 1);
            const angle = fraction * Math.PI * 1.65 + time * .075;
            const swell = 1 + .1 * Math.cos(fraction * TAU + time * .25);
            dummy.position.set(.12 * Math.sin(fraction * TAU), (fraction - .5) * 5.8, 0);
            dummy.rotation.set(Math.PI / 2, angle, 0, 'YXZ');
            dummy.scale.set(swell, swell, 1);
            dummy.updateMatrix();
            object.setMatrixAt(index, dummy.matrix);
        }
        object.instanceMatrix.needsUpdate = true;
        object.rotation.set(.08 + pointer.y * .12, -.45 + pointer.x * .22, -.2 + pointer.x * .07 + scroll * .16);
    }
    return { object, update };
}

function createStructure(material) {
    const object = new Group();
    const dark = material.clone();
    dark.color.set('#58604c');
    dark.roughness = .45;
    const accent = new MeshStandardMaterial({ color: '#d8ff65', emissive: '#a4c844', emissiveIntensity: .28, metalness: .5, roughness: .25 });
    const disc = new Mesh(new CylinderGeometry(1.2, 1.2, .12, 64), dark);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(-1.1, -.1, -.4);
    object.add(disc);
    [[1.4, 3.1, 1.0, .15, 0], [1.3, 1.8, .12, -.5, .4], [2.4, .48, -.35, -1.15, .7]].forEach(([width, height, x, y, z]) => {
        const slab = new Mesh(new BoxGeometry(width, height, .07), material);
        slab.position.set(x, y, z);
        slab.rotation.y = -.35;
        object.add(slab);
        const edge = new Mesh(new BoxGeometry(.018, height, .08), accent);
        edge.position.set(x - width * .47, y, z + .05);
        object.add(edge);
    });
    const line = new Mesh(new BoxGeometry(5.5, .015, .018), accent);
    line.rotation.z = .17;
    line.position.set(-.05, -.25, 1);
    object.add(line);
    const floor = new Mesh(new PlaneGeometry(60, 60), new MeshBasicMaterial({ color: '#10140f', toneMapped: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.42;
    object.add(floor);

    function update(time, pointer) {
        object.rotation.y = -.15 + pointer.x * .12 + Math.sin(time * .18) * .035;
    }
    return { object, update };
}

function lightScene(scene, renderer) {
    const room = new RoomEnvironment();
    const panel = new Mesh(
        new PlaneGeometry(4, 7),
        new MeshBasicMaterial({ color: new Color('#d8ff65').multiplyScalar(3), side: DoubleSide })
    );
    panel.position.set(4, 0, 1);
    panel.lookAt(0, 0, 0);
    room.add(panel);
    const generator = new PMREMGenerator(renderer);
    const environment = generator.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose();
    generator.dispose();
    const key = new DirectionalLight('#f5ffe9', 3.5);
    key.position.set(-3, 5, 6);
    const rim = new PointLight('#d8ff65', 65, 20, 2);
    rim.position.set(3, 2, 2);
    scene.add(key, rim);
    return environment;
}

export function createSculpture(host, initialMotion) {
    const compact = matchMedia('(max-width: 700px)').matches;
    const helix = host.dataset.scene === 'helix';
    const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.5 : 1.75));
    renderer.setClearColor('#10140f', 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(helix ? 38 : 34, 1, .1, 100);
    camera.position.set(helix ? 0 : 3.6, helix ? .1 : 1.7, helix ? 11.4 : 7.6);
    camera.lookAt(0, helix ? 0 : -.05, 0);
    const environment = lightScene(scene, renderer);
    const material = new MeshStandardMaterial({ color: '#c7d0bd', metalness: 1, roughness: .12, envMapIntensity: 1.1, side: DoubleSide });
    const sculpture = helix ? createHelix(material, compact) : createStructure(material);
    scene.add(sculpture.object);
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let motion = initialMotion;
    let visible = false;
    let elapsed = 0;
    let previousTime = 0;
    let lastDraw = 0;
    let sectionTop = 0;

    function draw(timestamp = 0) {
        if (compact && timestamp - lastDraw < 32 && timestamp !== 0) return;
        const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, .05) : 0;
        previousTime = timestamp;
        lastDraw = timestamp;
        elapsed += motion ? delta : 0;
        pointer.x += (target.x - pointer.x) * .06;
        pointer.y += (target.y - pointer.y) * .06;
        const scroll = Math.min(1, Math.max(0, (scrollY - sectionTop) / innerHeight));
        sculpture.update(elapsed, pointer, scroll);
        renderer.render(scene, camera);
    }

    function syncLoop() {
        previousTime = 0;
        renderer.setAnimationLoop(motion && visible && !document.hidden ? draw : null);
        if (visible && !document.hidden) draw();
    }

    function resize() {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        if (helix) camera.position.z = Math.max(11.4, 10.8 / camera.aspect);
        camera.updateProjectionMatrix();
        sectionTop = host.closest('section').offsetTop;
        renderer.setSize(width, height, false);
        draw();
    }

    function movePointer(event) {
        const bounds = host.getBoundingClientRect();
        target.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        target.y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    }

    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
    }, { rootMargin: '50px' });
    const resizer = new ResizeObserver(resize);
    observer.observe(host);
    resizer.observe(host);
    host.addEventListener('pointermove', movePointer, { passive: true });
    host.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });
    document.addEventListener('visibilitychange', syncLoop);
    renderer.domElement.addEventListener('webglcontextlost', () => {
        renderer.setAnimationLoop(null);
        host.dataset.ready = 'false';
    });
    resize();
    host.dataset.ready = 'true';

    return {
        setMotion(enabled) {
            motion = enabled;
            syncLoop();
        },
        dispose() {
            renderer.setAnimationLoop(null);
            observer.disconnect();
            resizer.disconnect();
            document.removeEventListener('visibilitychange', syncLoop);
            scene.traverse((object) => {
                if (object.isInstancedMesh) object.dispose();
                object.geometry?.dispose();
                object.material?.dispose();
            });
            environment.dispose();
            renderer.dispose();
        }
    };
}
