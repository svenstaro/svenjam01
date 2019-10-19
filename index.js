import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';
import lerp from 'lerp';
import {load_level} from './src/map';
import { TILE_ATLAS, loadAnimation } from "./src/animations.js";
import { CRTFilter } from 'pixi-filters';
import decomp from 'poly-decomp';
window.decomp = decomp;

import Box from './src/entities/box';

// Base stuff
import {getSpawn, getGameObjects} from './src/map';
import update from './src/update';

// Physics
import collisions from './src/physics/collisions';

// Entities
import Player from './src/entities/player';

// Event handling
import keyboard from './src/events/keyboard';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
window.app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
});

window.engine = Matter.Engine.create();
const Engine = Matter.Engine;
const World = Matter.World;
const Render = Matter.Render;
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('tileset', require("./img/0x72_16x16RobotTileset.v1.png"))
    .load(setup);

window.addEventListener("resize", function() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);
    collisions(engine, state);

    app.stage.scale = {x: 4, y: 4};
    app.stage.filters = [new CRTFilter({
        'vignetting' : 0.5,
        'noise': 0.2
    })];


    app.ticker.add((dt) => {
        Engine.update(engine, 1000 / 60);
        update(dt, state);
        app.stage.x = lerp(app.stage.x, app.renderer.width / 2 - player.sprite.x * 4, 0.1 * dt);
        app.stage.y = lerp(app.stage.y, app.renderer.height / 2 - player.sprite.y * 4, 0.1 * dt);
    });

    load_level(level1);

    // Create and run the renderer
    var render = Render.create({
        element: document.body,
        engine: engine
    });
    Render.run(render);
}

function create_entities(resources) {
    // Rendering is inside player.
    window.player = new Player(app.stage, getSpawn(level1));

    let gameObjects = getGameObjects(level1);
    let gameObjectBodies = Object.values(gameObjects).map(obj => obj.body);
    Object.values(gameObjects).forEach(obj => app.stage.addChild(obj.sprite));

    World.add(engine.world, [
        player.body,
        ...gameObjectBodies
    ]);

    return new Set([player, ...gameObjects]);
}
