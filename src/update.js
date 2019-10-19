import keyboard from './events/keyboard';
import key from './events/key';

export default function update(dt, state) {
    for (let entity of state.values()) {
        entity.update(dt);
        if (entity.destroyed) {
            state.delete(entity);
        }
    }
}
