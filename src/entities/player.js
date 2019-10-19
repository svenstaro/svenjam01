import * as Matter from "matter-js";
import * as PIXI from "pixi.js";

import tileset from "../../levels/tileset.json";
import keyboard from "../events/keyboard";
import key from "../events/key";
import { loadAnimationAtlas } from "../animations";

export default class Player {
  constructor(stage, spawn) {
    // Globals.
    this.spawn = spawn;
    this.stage = stage;
    this.onGround = false;

    // Physics.
    let player_body = Matter.Bodies.circle(0, 0, 8);
    this.groundSensor = Matter.Bodies.circle(0, 6, 6, {
      sleepThreshold: Infinity,
      isSensor: true
    });
    this.body = Matter.Body.create({
      parts: [player_body, this.groundSensor],
      inertia: Infinity,
      friction: 0.004,
      frictionAir: 0.001,
      restitution: 0,
      label: "player"
    });

    // Graphics.
    const TILE_WIDTH = 16;
    const TILE_HEIGHT = 16;
    const TILES_PER_ROW = 512 / TILE_WIDTH;

    this.sprites = loadAnimationAtlas(
      {
        idle: [492, 524],
        walking: [497, 529]
      },
      1,
      2
    );

    this.reset();
  }

  setSprite(animationName) {
    if (this.current_sprite_name === animationName) {
      return;
    }

    if (this.sprite) {
      this.sprite.stop();
      this.stage.removeChild(this.sprite);
    }
    this.current_sprite_name = animationName;
    this.sprite = this.sprites[animationName];
    this.sprite.anchor.set(0.5);
    this.sprite.play();
    this.stage.addChild(this.sprite);
  }

  update(dt) {
    if (keyboard.isPressed(key.A)) {
      this.body.force.x = -0.0002 * dt;
    } else if (keyboard.isPressed(key.D)) {
      this.body.force.x = 0.0002 * dt;
    } else {
      if (
        this.body.velocity.y == 0 &&
        this.body.velocity.x != 0 &&
        Math.abs(this.body.velocity.x) > 0.7
      ) {
        // this.body.force.x =
        // Math.sign(this.body.velocity.x) * -0.01 * dt;
      }
    }

    if (keyboard.isPressed(key.W) && this.onGround) {
      this.body.force.y = -0.005 * dt;
    }

    if (this.body.position.y > 2000) {
      this.reset();
    }

    // Set the animation.
    // if (this.onGround && this.body.velocity.x !== 0) {
    //     this.setSprite("walking");
    // }
    // if (this.onGround && this.body.velocity.x === 0) {
    //     this.setSprite("idle");
    // }
    // this.setSprite("walking");

    this.update_position();
  }

  update_position() {
    const body = this.body;
    this.sprite.x = body.position.x + 5;
    this.sprite.y = body.position.y - 2;
    this.sprite.rotation = body.angle;
  }

  reset() {
    this.setSprite("idle");
    Matter.Body.setPosition(this.body, this.spawn);
    Matter.Body.setVelocity(this.body, Matter.Vector.create(0, 0));
  }
}
