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
        let player_body = Matter.Bodies.rectangle(0, 0, 50, 60);
        this.groundSensor = Matter.Bodies.rectangle(0, 25, 50, 20, {
            sleepThreshold: Infinity,
            isSensor: true,
        });
        this.body = Matter.Body.create({
            parts: [player_body, this.groundSensor],
            inertia: Infinity,
            friction: 0.001,
            frictionAir: 1.0005,
            restitution: 0,
            label: "player",
        });

        // Graphics.
        const TILE_WIDTH = 16;
        const TILE_HEIGHT = 16;
        const TILES_PER_ROW = 512 / TILE_WIDTH;

        this.sprites = loadAnimationAtlas({
            idle: [492, 524],
            walking: [497, 529],
        });

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
        this.sprite = this.sprites[animationName];
        this.stage.addChild(this.sprite);
        this.sprite.play();
    }

    update(dt) {
        if (keyboard.isPressed(key.A)) {
            this.body.force.x = -0.005 * dt;
        } else if (keyboard.isPressed(key.D)) {
            this.body.force.x = 0.005 * dt;
        } else {
            if (
                this.body.velocity.y == 0 &&
                this.body.velocity.x != 0 &&
                Math.abs(this.body.velocity.x) > 0.7
            ) {
                this.body.force.x =
                    Math.sign(this.body.velocity.x) * -0.01 * dt;
            }
        }

        if (keyboard.isPressed(key.W) && this.onGround) {
            this.body.force.y = -0.055 * dt;
        }

        if (this.body.position.y > 2000) {
            this.reset();
        }

        // Set the animation.
        if (this.onGround && this.body.velocity.x !== 0) {
            this.setSprite("walking");
        }
        if (this.onGround && this.body.velocity.x === 0) {
            this.setSprite("idle");
        }

        this.update_position();
    }

    update_position() {
        const body = this.body;
        this.sprite.x = body.position.x;
        this.sprite.y = body.position.y;
        this.sprite.rotation = body.angle;
    }

    reset() {
        this.setSprite("idle");
        Matter.Body.setPosition(this.body, this.spawn);
        Matter.Body.setVelocity(this.body, Matter.Vector.create(0, 0));
    }
}
