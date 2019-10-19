import * as Matter from 'matter-js';

export default class PhysicsZone {
    constructor(x, y, width, height, type) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            sleepThreshold: Infinity,
            isSensor: true,
            isStatic: true,
        });
        this.body.physicsZone = this;
        this.type = type;
        this.containedBodies = {};
    }

    update(dt) {
        for (let body of Object.values(this.containedBodies)) {
            if (this.type === 'antigravity') {
                body.parent.force.y -= 0.005 * dt;
                console.log(body.parent.force.y);
            }
        }
    }

    onCollisionEnter(collidingBody) {
        if (this.type === 'slowmotion') {
            collidingBody.parent.timeScale = 0.5;
        }
        console.log('enter', collidingBody.id);
        this.containedBodies[collidingBody.id] = collidingBody;
    }

    onCollisionExit(collidingBody) {
        if (this.type === 'slowmotion') {
            collidingBody.parent.timeScale = 1;
        }
        delete this.containedBodies[collidingBody.id];
        console.log('exit', collidingBody.label);
    }
}
