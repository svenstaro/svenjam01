import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';
import lerp from 'lerp';
import { loadAnimation } from "./src/animations.js";

import Box from './src/entities/box';

// Base stuff
import {getSpawn, getGameObjects} from './src/map';
import update from './src/update';

// Physics
import Body from './src/physics/body';
import PhysicsZone from './src/physics/zone';
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
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('tileset', require("./img/0x72_16x16RobotTileset.v1.png"))
    .load(setup);

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);
    collisions(engine, state);

    app.stage.scale = {x: 4, y: 4};

    app.ticker.add((dt) => {
        Engine.update(engine, 1000 / 60);
        update(dt, state);
        app.stage.x = lerp(app.stage.x, app.renderer.width / 2 - player.sprite.x * 4, 0.1 * dt);
        app.stage.y = lerp(app.stage.y, app.renderer.height / 2 - player.sprite.y * 4, 0.1 * dt);
    });

    load_level(level1);
}

function create_entities(resources) {
    // Rendering is inside player.
    window.player = new Player(app.stage, getSpawn(level1));

    let zone = new PhysicsZone(600, 250, 500, 600, 'antigravity');

    let gameObjects = getGameObjects(level1);
    let gameObjectBodies = Object.values(gameObjects).map(obj => obj.body);
    Object.values(gameObjects).forEach(obj => app.stage.addChild(obj.sprite));

    World.add(engine.world, [
        player.body, zone.body,
        ...gameObjectBodies
    ]);

    return new Set([player, zone, ...gameObjects]);
}

function load_level(level) {
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
    const atlas = PIXI.BaseTexture.from('tileset');
    const atlas_width = 32
    const atlas_height = 32

    for (let j = 0; j < level.layers.length; j++) {

        if (level.layers[j].name === "Game Objects") {
            continue;
        }
        for (let i = 0; i < level.layers[j].data.length; i++) {
            let data = level.layers[j].data;
            if (data[i] === 0) {
                continue;
            }
            let extracted_data = get_flipping_and_id(data[i]);
            let atlas_id = extracted_data.global_id - 1;

            let current_sprite = undefined;
            if (TILESET_ATLAS[atlas_id].animation) {
                current_sprite = loadAnimation([atlas_id]);
            } else {
                const atlas_row = Math.floor(atlas_id / atlas_width);
                const atlas_col = atlas_id % atlas_width
                const rect = new PIXI.Rectangle(atlas_col*16, atlas_row*16, 16, 16);
                const current_texture = new PIXI.Texture(atlas, rect);
                current_sprite = new PIXI.Sprite(current_texture);
            }


            const canvas_position_x = (i * 16) % (level.width * 16);
            const canvas_position_y = Math.floor(i / 100) * 16;

            current_sprite.position.x = canvas_position_x;
            current_sprite.position.y = canvas_position_y;

            app.stage.addChild(current_sprite);
        }
    }
}

function get_flipping_and_id(id) {
    let horizontal_bit = 0b10000000000000000000000000000000;
    let vertical_bit = 0b01000000000000000000000000000000;
    let diagonal_bit = 0b00100000000000000000000000000000;

    let clean_bits = 0b00011111111111111111111111111111;

    let horizontal = (horizontal & id) == horizontal;
    let vertical = (vertical_bit & id) == vertical_bit;
    let diagonal = (diagonal_bit & id) == diagonal_bit;

    let normalized_id = clean_bits & id;

    return {
        horizontal: horizontal,
        vertical: vertical,
        diagonal: diagonal,
        global_id: normalized_id,
    }
}
