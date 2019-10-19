import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import keyboard from './keyboard';
import key from './key';
import tileset from '../levels/tileset.json';

export default class Player {
  constructor(stage, texture) {
    this.stage = stage;

    // Physics.
    let pikachu_main_body = Matter.Bodies.rectangle(0, 0, 50, 60);
    this.groundSensor = Matter.Bodies.rectangle(0, 25, 50, 20, {
        sleepThreshold: Infinity,
        isSensor: true,
    });

    this.body = Matter.Body.create({
        parts: [pikachu_main_body, this.groundSensor],
        inertia: Infinity,
        friction: 0.002,
        frictionAir: 0.002,
        restitution: 0,
        label: 'player',
    });

    // Graphics.
    this.sprites = {};
    const animationIds = {
      "idle": 203,
      "walking": 202,
    }
    const tileAtlas = tileset.tiles.reduce(
      (accum, tileDef) => ({...accum, [tileDef.id]: tileDef }), {}
    );
    const baseTexture = texture.baseTexture;
    const sprites = Object.keys(animationIds).reduce((accum, animationType) => {
      const animationId = animationIds[animationType];
      const animationTiles = tileAtlas[animationId].animation;

      const width = 16;
      const height = 16;

      const textureArray = animationTiles.map(tile => {
        const id = tile.tileid;
        const tiles_per_row = 512 / width;
        const row = Math.floor(id / tiles_per_row);
        const column = id % tiles_per_row;

        const thisTexture = texture.clone();
        thisTexture.frame = new PIXI.Rectangle(column * width, row * height, width, height);
        thisTexture.updateUvs();
        return thisTexture;
      });

      const sprite = new PIXI.AnimatedSprite(textureArray);
      sprite.animationSpeed = 0.25;
      sprite.anchor.set(0.5);
      sprite.width = width;
      sprite.height = height;

      return {...accum, [animationType]: sprite };
    }, {});

    console.log(sprites);
    this.sprite = sprites["idle"];
    this.stage.addChild(this.sprite);
    this.sprite.play()

    this.onGround = false;

    this.reset();
  }

    update(dt) {
        if (keyboard.isPressed(key.A)) {
            this.body.force.x = -0.005 * dt;
        } else if (keyboard.isPressed(key.D)) {
            this.body.force.x = 0.005 * dt;
        }  else {
            this.body.force.x = 0;
        }

        if (keyboard.isPressed(key.W) && this.onGround) {
            this.body.force.y = -0.055 * dt;
        }

        if (this.body.position.y > 2000) {
            this.reset();
        }

        this.sprite.update(dt);
    }

    update_position() {
        const body = this.entity.body;
        console.log(body);
        this.sprite.x = body.position.x;
        this.sprite.y = body.position.y;
        this.sprite.rotation = body.angle;
    }

    reset() {
        Matter.Body.setPosition(this.body, Matter.Vector.create(200, 100));
        Matter.Body.setVelocity(this.body, Matter.Vector.create(0, 0));
    }
}
