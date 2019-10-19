import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import tileset from '../../levels/tileset.json';
import keyboard from '../events/keyboard';
import key from '../events/key';

export default class Player {
  constructor(stage, texture, spawn) {
    // Globals.
    this.spawn = spawn;
    this.stage = stage;
    this.onGround = false;

    // Physics.
    let pikachu_main_body = Matter.Bodies.rectangle(0, 0, 50, 60);
    this.groundSensor = Matter.Bodies.rectangle(0, 25, 50, 20, {
      sleepThreshold: Infinity,
      isSensor: true,
    });
    this.body = Matter.Body.create({
      parts: [pikachu_main_body, this.groundSensor],
      inertia: Infinity,
      friction: 0.001,
      frictionAir: 1.0005,
      restitution: 0,
      label: 'player',
    });

    // Graphics.
    const TILE_WIDTH = 16;
    const TILE_HEIGHT = 16;
    const TILES_PER_ROW = 512 / TILE_WIDTH;

    this.sprites = {};
    const animationIdLists = {
      "idle": [492, 524],
      "walking": [497, 529],
    };
    const tileAtlas = tileset.tiles.reduce(
      (accum, tileDef) => ({...accum, [tileDef.id]: tileDef }), {}
    );

    const getRectForId = id => {
      const row = Math.floor(id / TILES_PER_ROW);
      const column = id % TILES_PER_ROW;
      return {
        x: column * TILE_WIDTH,
        y: row * TILE_HEIGHT,
      };
    };

    const getRectForIds = (ids, num_tiles_x, num_tiles_y) => {
      const rects = ids.map(getRectForId);
      const minX = rects.map(rect => rect.x).reduce((a, b) => Math.min(a, b), 10000000000);
      const minY = rects.map(rect => rect.y).reduce((a, b) => Math.min(a, b), 10000000000);
      return new PIXI.Rectangle(
        minX,
        minY,
        num_tiles_x * TILE_WIDTH,
        num_tiles_y * TILE_HEIGHT
      );
    };

    const loadAnimationType = animationType => {
      const animationIds = animationIdLists[animationType];
      const tileIdsPerAnimation = animationIds.map(id => tileAtlas[id].animation.map(tileDef => tileDef.tileid));
      const tileIdsPerFrame = []
      tileIdsPerAnimation.forEach(ids => ids.map((id, index) => tileIdsPerFrame[index] = [...(tileIdsPerFrame[index] || []), id]));
      const textures = tileIdsPerFrame.map(ids => {
        const thisTexture = texture.clone();
        thisTexture.frame = getRectForIds(ids, 1, 2);
        console.log(animationType, thisTexture.frame)
        thisTexture.updateUvs();
        return thisTexture;
      });

      const sprite = new PIXI.AnimatedSprite(textures);
      sprite.animationSpeed = 0.125;
      sprite.anchor.set(0.5);
      sprite.width = 1 * TILE_WIDTH;
      sprite.height = 2 * TILE_HEIGHT;
      return sprite;
    };

    this.sprites = Object.keys(animationIdLists).reduce((accum, animationType) => (
      {...accum, [animationType]: loadAnimationType(animationType) }
    ), {});

    this.setSprite("walking");
    this.reset();
  }

  setSprite(animationType) {
    if (this.sprite) {
      this.sprite.stop();
      this.stage.removeChild(this.sprite);
    }
    this.sprite = this.sprites[animationType];
    this.stage.addChild(this.sprite);
    this.sprite.play()
  }

  update(dt) {
    if (keyboard.isPressed(key.A)) {
      this.body.force.x = -0.005 * dt;
    } else if (keyboard.isPressed(key.D)) {
      this.body.force.x = 0.005 * dt;
    }  else {
      if (this.body.velocity.y == 0 &&
        this.body.velocity.x != 0 &&
        Math.abs(this.body.velocity.x) > 0.7
      ) {
        this.body.force.x = Math.sign(this.body.velocity.x) * -0.01 * dt;
      }
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
    this.sprite.x = body.position.x;
    this.sprite.y = body.position.y;
    this.sprite.rotation = body.angle;
  }

  reset() {
    Matter.Body.setPosition(this.body, this.spawn);
    Matter.Body.setVelocity(this.body, Matter.Vector.create(0, 0));
  }
}

