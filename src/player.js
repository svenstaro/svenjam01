import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import keyboard from './keyboard';
import key from './key';

export default class Player {
    constructor(texture) {
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
        });

        Matter.Body.setPosition(this.body, Matter.Vector.create(200, 100));

        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.height = 50;
        this.sprite.width = 50;

        this.onGround = false;
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

        this.update_position();
    }

    update_position() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        this.sprite.rotation = this.body.angle;
    }
}
