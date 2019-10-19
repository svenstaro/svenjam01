import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';
import {TILES_MAP} from "./src/tileset_helper";
import lerp from 'lerp';
import { TILE_ATLAS, loadAnimation } from "./src/animations.js";

import Box from './src/entities/box';

// Base stuff
import {getSpawn, getGameObjects} from './src/map';
import update from './src/update';

// Physics
import Body from './src/physics/body';
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

window.addEventListener("resize", function() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});

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

    let gameObjects = getGameObjects(level1);
    let gameObjectBodies = Object.values(gameObjects).map(obj => obj.body);
    Object.values(gameObjects).forEach(obj => app.stage.addChild(obj.sprite));

    World.add(engine.world, [
        player.body,
        ...gameObjectBodies
    ]);

    return new Set([player, ...gameObjects]);
}

function load_level(level) {
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
    const atlas = PIXI.BaseTexture.from('tileset');
    const atlas_width = 32
    const atlas_height = 32

    // Iterate through each layer
    for (let j = 0; j < level.layers.length; j++) {
        let layer = level.layers[j];

        // Ignore the GameObjects layer. We need to handle this individually.
        if (layer.name === "Game Objects") {
            continue;
        }
        for (let i = 0; i < layer.data.length; i++) {
            if (layer.data[i] === 0) {
                continue;
            }
            let extracted_data = get_flipping_and_id(layer.data[i]);
            // Calculate atlas_id (global_id - tileset_id)
            let atlas_id = extracted_data.global_id - 1;

            let current_sprite = undefined;
            // if (TILE_ATLAS[atlas_id] && TILE_ATLAS[atlas_id].animation) {
            //     current_sprite = loadAnimation([atlas_id]);
            // } else {
            //
            // }

            // Calculate position in tileset
            const atlas_row = Math.floor(atlas_id / atlas_width);
            const atlas_col = atlas_id % atlas_width

            // Create textures
            const rect = new PIXI.Rectangle(atlas_col*16, atlas_row*16, 16, 16);
            const current_texture = new PIXI.Texture(atlas, rect);
            current_sprite = new PIXI.Sprite(current_texture);

            // Calculation and set positions
            const canvas_position_x = (i * 16) % (level.width * 16);
            const canvas_position_y = Math.floor(i / 100) * 16;
            current_sprite.position.x = canvas_position_x;
            current_sprite.position.y = canvas_position_y;

            // Add prite
            app.stage.addChild(current_sprite);

            /// Create static physics objects for foreground tiles
            if (layer.name === "Foreground Tiles") {
                create_static_body(atlas_id, canvas_position_x, canvas_position_y);
            }
        }
    }

    add_background_colors(app)
}


function create_static_body(atlas_id, pos_x, pos_y) {
    //    console.log("Id and map");
    //    console.log(atlas_id);
    //    console.log(TILES_MAP);
    let tile = TILES_MAP[atlas_id];
    // Ignore this for now. Debug lol
    if (tile === undefined) {
        return
    }
    // Ignore animation tiles. These are handled elsewhere
    if (tile.animation !== undefined) {
        return
    }
    let objects = tile.objectgroup.objects;

    //    console.log("tile and objects");
    //    console.log(tile);
    //    console.log(objects);
    // There can be multiple objects per tile (we usually have one)
    for (const object of objects) {
        // We got a simple box object
        if (object.polygon !== undefined) {
            // Calculate physic body offset to tile
            let position_x = pos_x + object.x;
            let position_y = pos_y + object.y;

            let body = Matter.Bodies.rectangle(
                position_x,
                position_y,
                object.width,
                object.height,
            {
                isStatic: true,
                label: 'ground',
            });
            //            console.log("Create body")
            //            console.log(position_x, position_y)
            //            console.log(object.height, object.width)
            World.add(engine.world, [body]);

        } else {
            // Rectangle for everything else for debugging
            let body = Matter.Bodies.rectangle(
                pos_x,
                pos_y,
                16,
                16,
            {
                isStatic: true,
                label: 'ground',
            });
            //            console.log("Create body")
            //            console.log(pos_x, pos_y)
            //            console.log(object.height, object.width)
            World.add(engine.world, [body]);
        }
    }
}

function add_background_colors(app) {
    let first_sprite = new PIXI.Graphics();
    first_sprite.beginFill(0xFF0000);
    first_sprite.drawRect(0, 0, 16, 16);
    first_sprite.endFill();

    app.stage.addChild(first_sprite);

    let last_sprite = new PIXI.Graphics();
    last_sprite.beginFill(0xFF0000);
    last_sprite.drawRect(1600, 1600, 16, 16);
    last_sprite.endFill();

    app.stage.addChild(last_sprite);
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
