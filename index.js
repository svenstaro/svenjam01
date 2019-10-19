import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';

import PhysicsZone from './src/physics_zone';
import update from './src/update';
import Player from './src/player';
import keyboard from './src/keyboard';
import collisions from './src/collisions';

const app = new PIXI.Application({
    backgroundColor: 0x1099bb,
    width: 600,
    height: 600
});

var engine = Matter.Engine.create();
const Engine = Matter.Engine;
const World = Matter.World;
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('pika', require('./img/pikachu.png'))
    .add('tileset', require('./img/0x72_16x16RobotTileset.v1.png'))
    .load(setup);

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);
    collisions(engine, state);

    app.ticker.add((dt) => {
        Engine.update(engine, 1000/60 * dt);
        update(dt, state);
        app.stage.x = app.renderer.width/2 - state.player.sprite.x;
        app.stage.y = app.renderer.height/2 - state.player.sprite.y;
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
    ground_rect.drawRect(0, 380 - 60/2, 600, 60);
    ground_rect.endFill();

    console.log(resources.tileset);
    let pika = new Player(app.stage, resources.tileset.texture);
    app.stage.addChild(ground_rect);

    let zone = new PhysicsZone(600, 250, 500, 600, 'antigravity');

    World.add(engine.world, [pika.body, ground_body, zone.body]);

    return {player: pika, zone};
}

function load_level(level) {
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
}
