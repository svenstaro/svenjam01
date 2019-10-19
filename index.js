import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';
import lerp from 'lerp';

// Base stuff
import {getSpawn} from './src/map';
import update from './src/update';

// Physics
import Body from './src/physics/body';
import PhysicsZone from './src/physics/zone';
import collisions from './src/physics/collisions';

// Entities
import Player from './src/entities/player';

// Event handling
import keyboard from './src/events/keyboard';

const app = new PIXI.Application({
    backgroundColor: 0x1099bb,
    width: 1700,
    height: 1700
});

var engine = Matter.Engine.create();
const Engine = Matter.Engine;
const World = Matter.World;
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('pika', require('./img/pikachu.png'))
    .add('tileset', require("./img/0x72_16x16RobotTileset.v1.png"))
    .load(setup);

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);
    collisions(engine, state);

    app.ticker.add((dt) => {
        Engine.update(engine, 1000 / 60 * dt);
        update(dt, state);
        // app.stage.x = lerp(app.stage.x, app.renderer.width/2 - state.player.sprite.x, 0.1 * dt);
        // app.stage.y = lerp(app.stage.y, app.renderer.height/2 - state.player.sprite.y, 0.1 * dt);
    });

    load_level(level1);
}

function create_entities(resources) {
    let ground_body = Matter.Bodies.rectangle(app.renderer.width/2, 380, 600, 60, {
        isStatic: true,
        label: 'ground',
    });
    let ground_rect = new PIXI.Graphics();
    ground_rect.beginFill(0xFFFFFF);
    ground_rect.drawRect(0, 380 - 60 / 2, 600, 60);
    ground_rect.endFill();

    let pika = new Player(resources.pika.texture, getSpawn(level1));
    app.stage.addChild(pika.sprite);
    app.stage.addChild(ground_rect);

    let zone = new PhysicsZone(600, 250, 500, 600, 'antigravity');

    World.add(engine.world, [pika.body, ground_body, zone.body]);

    return {player: pika, zone};
}

function load_level(level) {
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
    const atlas = PIXI.BaseTexture.from('tileset');

    console.log(level);
    for (let j = 0; j < level.layers.length; j++) {

        if (level.layers[j].name === "Game Objects") {
            continue;
        }

        for (let i = 0; i < level.layers[j].data.length; i++) {
            let data = level.layers[1].data;
            if (data[i] === 0) {
                continue;
            }
            let extracted_data = get_flipping_and_id(data[i]);
            let atlas_id = extracted_data.global_id - 1;

            const atlas_row = Math.floor(atlas_id / level.width);
            const atlas_col = atlas_id % level.height;

            let current_texture = new PIXI.Texture(atlas, new PIXI.Rectangle(atlas_row, atlas_col, 16, 16));
            let current_sprite = new PIXI.Sprite(current_texture);

            const canvas_position_x = (i * 16) % (level.width * 16);
            const canvas_position_y = Math.floor(i / 100) * 16;

            current_sprite.position.x = canvas_position_x;
            current_sprite.position.y = canvas_position_y;

            app.stage.addChild(current_sprite);
        }
    }
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
