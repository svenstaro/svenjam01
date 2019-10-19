import keyboard from './events/keyboard';
import key from './events/key';

export default function update(dt, state) {
    window.app.stage.filters[0].time += dt;
    for (let entity of state.values()) {
        entity.update(dt);
        if (entity.destroyed) {
            state.delete(entity);
        }
    }
}
