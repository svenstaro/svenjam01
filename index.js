import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

import update from './src/update';
import Entity from './src/entity';
import keyboard from './src/keyboard';

const app = new PIXI.Application({
    backgroundColor: 0x1099bb,
    width: 600,
    height: 800
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
}


function create_entities(resources) {
    var Bodies = Matter.Bodies;

    var ground_body = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });
    var pikachu_body = Bodies.rectangle(400, 200, 50, 50);

    World.add(engine.world, [pikachu_body, ground_body]);

    const pika_sprite = new PIXI.Sprite(resources.pika.texture);
    pika_sprite.anchor.set(0.5);
    pika_sprite.height = 50;
    pika_sprite.width = 50;
    app.stage.addChild(pika_sprite);

    let pika = new Entity(pika_sprite, pikachu_body);

    return {pika};
}
