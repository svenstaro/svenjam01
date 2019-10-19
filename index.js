import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';
import lerp from 'lerp';

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

window.app = new PIXI.Application({
    backgroundColor: 0x1099bb,
    width: 600,
    height: 600
});

window.engine = Matter.Engine.create();
const Engine = Matter.Engine;
const World = Matter.World;
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('pika', require('./img/pikachu.png'))
    .load(setup);

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);
    collisions(engine, state);

    app.ticker.add((dt) => {
        Engine.update(engine, 1000/60);
        update(dt, state);
        app.stage.x = lerp(app.stage.x, app.renderer.width/2 - player.sprite.x, 0.1 * dt);
        app.stage.y = lerp(app.stage.y, app.renderer.height/2 - player.sprite.y, 0.1 * dt);
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

    window.player = new Player(resources.pika.texture, getSpawn(level1));
    app.stage.addChild(player.sprite);
    app.stage.addChild(ground_rect);

    let zone = new PhysicsZone(600, 250, 500, 600, 'antigravity');

    let gameObjects = getGameObjects(level1);
    let gameObjectBodies = Object.values(gameObjects).map(obj => obj.body);
    Object.values(gameObjects).forEach(obj => app.stage.addChild(obj.sprite));

    World.add(engine.world, [
        player.body, ground_body, zone.body,
        ...gameObjectBodies
    ]);

    return new Set([player, zone, ...gameObjects]);
}

function load_level(level) {
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
}
