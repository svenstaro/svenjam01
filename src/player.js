import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import keyboard from './keyboard';
import key from './key';

export default class Player {
    constructor(texture) {
        let player_body = Matter.Bodies.rectangle(0, 0, 50, 60);
        this.groundSensor = Matter.Bodies.rectangle(0, 25, 50, 20, {
            sleepThreshold: Infinity,
            isSensor: true,
        });

        this.body = Matter.Body.create({
            parts: [player_body, this.groundSensor],
            inertia: Infinity,
            friction: 0.001,
            frictionAir: 0.0005,
            restitution: 0,
            label: 'player',
        });

        this.reset();

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
            if (this.body.velocity.y == 0 &&
                this.body.velocity.x != 0 &&
                Math.abs(this.body.velocity.x) > 0.7
            ) {
                this.body.force.x = Math.sign(this.body.velocity.x) * -0.01 * dt
            }
        }

        if (keyboard.isPressed(key.W) && this.onGround) {
            this.body.force.y = -0.055 * dt;
        }

        if (this.body.position.y > 2000) {
            this.reset();
        }

        this.update_position();
    }

    update_position() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        this.sprite.rotation = this.body.angle;
    }

    reset() {
        Matter.Body.setPosition(this.body, Matter.Vector.create(200, 100));
        Matter.Body.setVelocity(this.body, Matter.Vector.create(0, 0));
    }
}
