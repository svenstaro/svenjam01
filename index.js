import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import level1 from './levels/level1.json';

import update from './src/update';
import Body from './src/body';
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
    .add('tileset', require("./img/0x72_16x16RobotTileset.v1.png"))
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
    let ground_body = Matter.Bodies.rectangle(app.renderer.width/2, 380, 600, 60, { isStatic: true });
    let ground_rect = new PIXI.Graphics();
    ground_rect.beginFill(0xFFFFFF);
    ground_rect.drawRect(0, 380 - 60/2, 600, 60);
    ground_rect.endFill();
    let pika = new Player(resources.pika.texture);
    app.stage.addChild(pika.sprite);
    app.stage.addChild(ground_rect);
    World.add(engine.world, [pika.body, ground_body]);

    return {player: pika};
}

function load_level(level) {
    console.log(level);
    app.renderer.backgroundColor = Number.parseInt(level.backgroundcolor.replace('#', '0x'));
    const atlas = PIXI.BaseTexture.from('tileset');
    // render background layer
    for (let i = 0; i < level.layers[1].data; i++) {
	let line = i % level.width;
	let current_texture = new PIXI.Texture(atlas, new PIXI.Rectangle(Math.ceil(float(data[i]) / 100.0), data[i] % 100, 16, 16));
	let current_sprite = new PIXI.Sprite(current_texture);
	current_sprite.position.x = i * 16;
	current_sprite.position.y = (i % 16) * 16;

        app.stage.addChild(current_sprite);
    }
}
