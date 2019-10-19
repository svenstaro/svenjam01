import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import Box from './entities/box';
import {TILES_MAP} from "./tileset_helper";
import PhysicsZone from './physics/zone';

const World = Matter.World;

const physicsZoneMapping = {
    antigrav_beam1: 'antigravity',
    slowmotion_beam1: 'slowmotion'
};

export function getSpawn(level) {
    let layer = getLayer(level, 'Game Objects');

    return layer.objects.find((obj) => obj.name === 'spawn');
}

export function getLayer(level, name) {
    return level.layers.find((layer) => layer.name === name);
}

export function getGameObjects(level) {
    let layer = getLayer(level, 'Game Objects');

    let entities = [];
    for (let obj of layer.objects) {
        if (obj.type === 'box') {
            entities.push(new Box(obj.x, obj.y, obj.width, obj.height));
        } else if (Object.keys(physicsZoneMapping).includes(obj.name)) {
            entities.push(new PhysicsZone(obj.x, obj.y, obj.width, obj.height, physicsZoneMapping[obj.name]));
        }
    }

    return entities;
}


export function load_level(level) {
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

            // Calculate position in tileset
            const atlas_row = Math.floor(parseFloat(atlas_id) / parseFloat(atlas_width));
            const atlas_col = atlas_id % atlas_width

            // Create textures
            let current_texture = new PIXI.Texture(atlas, new PIXI.Rectangle(atlas_col*16, atlas_row*16, 16, 16));
            let current_sprite = new PIXI.Sprite(current_texture);

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
