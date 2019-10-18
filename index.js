import * as PIXI from 'pixi.js';
import update from './src/update.js';

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add('pika', require('./img/pikachu.png'))
    .load(setup);

function setup(loader, resources) {
    const bunny = new PIXI.Sprite(resources.pika.texture);
    bunny.anchor.set(0.5);

    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    let state = {bunny};

    app.ticker.add((dt) => {
        update(dt, state);
    });
}
