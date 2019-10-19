import keyboard from './events/keyboard';
import key from './events/key';

export default function update(dt, state) {
    for (let [key, entity] of Object.entries(state)) {
        entity.update(dt);
    }
}
