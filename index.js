import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import update from './src/update.js';
import Entity from './src/entity.js';

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
var engine = Matter.Engine.create();
const Engine = Matter.Engine
const World = Matter.World;
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('pika', require('./img/pikachu.png'))
    .load(setup);

function setup(loader, resources) {
    let state = create_entities(resources);

    app.ticker.add((dt) => {
        Engine.update(engine, dt);
        update(dt, state);
    });
}


function create_entities(resources) {
    var Bodies = Matter.Bodies;

    var ground_body = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });
    var pikachu_body = Bodies.rectangle(400, 200, 80, 80);

    World.add(engine.world, [pikachu_body, ground_body]);

    const bunny_sprite = new PIXI.Sprite(resources.pika.texture);
    bunny_sprite.anchor.set(0.5);
    app.stage.addChild(bunny_sprite);

    let bunny = new Entity(bunny_sprite, pikachu_body);

    return {bunny};
}
