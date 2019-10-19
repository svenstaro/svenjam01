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
            friction: 0.001,
            frictionAir: 0.001,
            restitution: 0
        });

        Matter.Body.setMass(pikachu_main_body,500);

        console.log(pikachu_main_body);

        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.height = 50;
        this.sprite.width = 50;

        this.onGround = false;
    }

    update(dt) {
        if (keyboard.isPressed(key.A)) {
            this.body.force.x = -0.1 * dt;
        } else if (keyboard.isPressed(key.D)) {
            this.body.force.x = 0.1 * dt;
        } else if (keyboard.isPressed(key.W) && this.onGround) {
            this.body.force.y = -0.5 * dt;
        } else {
            this.body.force.x = 0;
        }

        this.update_position();
    }

    update_position() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
    }
}
