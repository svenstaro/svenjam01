import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import keyboard from './keyboard';
import key from './key';

export default class Player {
    constructor(texture) {
        let pikachu_main_body = Matter.Bodies.rectangle(0, 0, 50, 50);
        this.groundSensor = Matter.Bodies.rectangle(0, 46, 50, 6, {
            sleepThreshold: Infinity,
            isSensor: true,
        });

        this.body = Matter.Body.create({
            parts: [pikachu_main_body, this.groundSensor],
            friction: 0.01,
            frictionAir: 0.01,
            restitution: 0
        });

        Matter.Body.setPosition(this.body, Matter.Vector.create(200, 100));

        this.sprite = new PIXI.Sprite(texture);
        this.sprite.height = 50;
        this.sprite.width = 50;

        this.onGround = false;
    }

    update(dt) {
        if (keyboard.isPressed(key.A)) {
            this.body.force.x = -0.01 * dt;
        } else if (keyboard.isPressed(key.D)) {
            this.body.force.x = 0.01 * dt;
        }  else {
            this.body.force.x = 0;
        }

        if (keyboard.isPressed(key.W) && this.onGround) {
            this.body.force.y = -0.01 * dt;
        }

        this.update_position();
    }

    update_position() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
    }
}
