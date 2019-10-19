import keyboard from './keyboard';
import key from './key';

export default function update(dt, state) {
    for (let [key, entity] of Object.entries(state)) {
        entity.update(dt);
    }

    if (keyboard.isPressed(key.A)) {
        state.pika.body.force.x = -0.1 * dt;
    } else if (keyboard.isPressed(key.D)) {
        state.pika.body.force.x = 0.1 * dt;

    } else if (keyboard.isPressed(key.W)) {
        state.pika.body.force.y = -0.1 * dt;
    } else {
        state.pika.body.force.x = 0;
    }
}
