export default class Entity {
    constructor(sprite, body) {
        this.sprite = sprite;
        this.body = body;
    }

    update(dt) {
        this.update_position();
    }

    update_position() {
        console.log(this.body);
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
    }
}
