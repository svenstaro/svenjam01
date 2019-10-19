import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';

export default class Box {
    constructor(x, y, width, height) {
        this.body = Matter.Bodies.rectangle(x + width/2, y + height/2, width, height);
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xFFFFFF);
        this.sprite.drawRect(-width/2, -height/2, width, height);
    }

    update(dt) {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        this.sprite.rotation = this.body.angle;

        if (this.body.position.y > 3000) {
            Matter.World.remove(engine.world, this.body);
            app.stage.removeChild(this.sprite);
            this.destroyed = true;
        }
    }
}
