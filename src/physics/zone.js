import * as Matter from "matter-js";
import * as PIXI from "pixi.js";

export default class PhysicsZone {
  constructor(x, y, width, height, type) {
    this.body = Matter.Bodies.rectangle(
      x - width / 2,
      y - height / 2,
      width,
      height,
      {
        sleepThreshold: Infinity,
        isSensor: true,
        isStatic: true
      }
    );
    this.body.physicsZone = this;
    this.type = type;
    this.containedBodies = {};
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xffff88, 0.5);
    this.sprite.drawRect(x - width / 2, y - height / 2, width, height);
  }

  update(dt) {
    for (let body of Object.values(this.containedBodies)) {
      if (this.type === "antigravity") {
        body.parent.force.y -= 0.005 * dt;
      }
    }
  }

  onCollisionEnter(collidingBody) {
    if (this.type === "slowmotion") {
      collidingBody.parent.timeScale = 0.5;
    }
    this.containedBodies[collidingBody.id] = collidingBody;
  }

  onCollisionExit(collidingBody) {
    if (this.type === "slowmotion") {
      collidingBody.parent.timeScale = 1;
    }
    delete this.containedBodies[collidingBody.id];
  }
}
