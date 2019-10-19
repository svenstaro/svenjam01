export default class Body {
    constructor(sprite, body) {
        this.sprite = sprite;
        this.body = body;
    }

    update(dt) {
        this.update_position();
    }

    update_position() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
    }
}
