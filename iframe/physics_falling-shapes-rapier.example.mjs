import { deviceType } from 'examples/utils';

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('application-canvas'));
window.focus();

// Load Rapier WASM instead of Ammo.js
const RAPIER = await import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/+esm');
await RAPIER.init();

const gfxOptions = {
    deviceTypes: [deviceType]
};

const device = await pc.createGraphicsDevice(canvas, gfxOptions);
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new pc.AppOptions();
createOptions.graphicsDevice = device;
createOptions.keyboard = new pc.Keyboard(document.body);

createOptions.componentSystems = [
    pc.RenderComponentSystem,
    pc.CameraComponentSystem,
    pc.LightComponentSystem,
    pc.ScriptComponentSystem,
    // Use Rapier systems instead of Ammo.js
    pc.RapierCollisionComponentSystem,
    pc.RapierRigidBodyComponentSystem,
    pc.ElementComponentSystem
];
createOptions.resourceHandlers = [
    pc.TextureHandler,
    pc.ContainerHandler,
    pc.ScriptHandler,
    pc.JsonHandler,
    pc.FontHandler
];

const app = new pc.AppBase(canvas);
app.init(createOptions);

// Initialize Rapier on the rigidbody system
app.systems.rigidbody.initializeRapier(RAPIER);

// Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// Ensure canvas is resized when window changes size
const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

app.start();

app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

// Set the gravity for our rigid bodies
app.systems.rigidbody.gravity.set(0, -9.81, 0);

/**
 * @param {pc.Color} color - The color of the material.
 * @returns {pc.StandardMaterial} The new material.
 */
function createMaterial(color) {
    const material = new pc.StandardMaterial();
    material.diffuse = color;
    material.update();
    return material;
}

// create a few materials for our objects
createMaterial(new pc.Color(1, 0.3, 0.3));
const gray = createMaterial(new pc.Color(0.7, 0.7, 0.7));
const blue = createMaterial(new pc.Color(0.3, 0.5, 1.0));

// ***********    Create our floor   *******************
const floor = new pc.Entity();
floor.addComponent('render', {
    type: 'box',
    material: gray
});
floor.setLocalScale(10, 1, 10);
floor.addComponent('rigidbody', {
    type: 'static',
    restitution: 0.5
});
floor.addComponent('collision', {
    type: 'box',
    halfExtents: new pc.Vec3(5, 0.5, 5)
});
app.root.addChild(floor);

// ***********    Create lights   *******************
const light = new pc.Entity();
light.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 1, 1),
    castShadows: true,
    shadowBias: 0.2,
    shadowDistance: 25,
    normalOffsetBias: 0.05,
    shadowResolution: 2048
});
light.setLocalEulerAngles(45, 30, 0);
app.root.addChild(light);

// ***********    Create camera    *******************
const camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(0.5, 0.5, 0.8),
    farClip: 50
});
app.root.addChild(camera);
camera.translate(0, 10, 15);
camera.lookAt(0, 2, 0);

/**
 * Helper function which creates a template for a collider.
 *
 * @param {string} type - The render component type.
 * @param {object} collisionOptions - The options for the collision component.
 * @returns {pc.Entity} The new template entity.
 */
const createTemplate = function (type, collisionOptions) {
    const template = new pc.Entity();
    template.addComponent('render', { type: type });
    template.addComponent('rigidbody', {
        type: 'dynamic',
        mass: 50,
        restitution: 0.5
    });
    template.addComponent('collision', collisionOptions);
    return template;
};

// ***********    Create templates    *******************
const boxTemplate = createTemplate('box', {
    type: 'box',
    halfExtents: new pc.Vec3(0.5, 0.5, 0.5)
});

const sphereTemplate = createTemplate('sphere', {
    type: 'sphere',
    radius: 0.5
});

const capsuleTemplate = createTemplate('capsule', {
    type: 'capsule',
    radius: 0.5,
    height: 2
});

const cylinderTemplate = createTemplate('cylinder', {
    type: 'cylinder',
    radius: 0.5,
    height: 1
});

// No mesh/torus in Rapier demo (avoids asset loading)
const templates = [boxTemplate, sphereTemplate, capsuleTemplate, cylinderTemplate];

// disable the templates because we don't want them to be visible
templates.forEach((template) => {
    template.enabled = false;
});

// ***********    Update Function   *******************
let timer = 0;
let count = 40;

// Simple seeded random for determinism
let seed = 42;
function seededRandom() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff);
}

// Set an update function on the application's update event
app.on('update', (dt) => {
    // create a falling shape every 0.2 seconds
    if (count > 0) {
        timer -= dt;
        if (timer <= 0) {
            count--;
            timer = 0.2;

            // Clone a random template and position it above the floor
            const template = templates[Math.floor(seededRandom() * templates.length)];
            const clone = template.clone();
            clone.enabled = true;
            app.root.addChild(clone);

            clone.rigidbody.teleport(seededRandom() * 2 - 1, 10, seededRandom() * 2 - 1);
            clone.rigidbody.angularVelocity = new pc.Vec3(
                seededRandom() * 10 - 5,
                seededRandom() * 10 - 5,
                seededRandom() * 10 - 5
            );
        }
    }

    // Show active bodies in blue and frozen bodies in gray
    app.root.findComponents('rigidbody').forEach((/** @type {pc.RapierRigidBodyComponent} */ body) => {
        if (body.entity.render) {
            body.entity.render.meshInstances[0].material = body.isActive() ? blue : gray;
        }
    });
});

export { app };
