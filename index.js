import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';

import update from './src/update';
import Body from './src/body';
import Player from './src/player';
import keyboard from './src/keyboard';

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
    .load(setup);

function setup(loader, resources) {
    keyboard.init();
    let state = create_entities(resources);

    app.ticker.add((dt) => {
        Engine.update(engine, dt);
        update(dt, state);
    });

    console.log(level1);
}

function create_entities(resources) {
    let ground_body = Matter.Bodies.rectangle(0, 380, 810, 60, { isStatic: true });
    let ground_rect = new PIXI.Graphics();
    ground_rect.beginFill(0xFFFFFF);
    ground_rect.drawRect(0, 380, 810, 60);
    ground_rect.endFill();
    let pika = new Player(resources.pika.texture);
    app.stage.addChild(pika.sprite);
    app.stage.addChild(ground_rect);
    World.add(engine.world, [pika.body, ground_body]);

    return {player: pika};
}
