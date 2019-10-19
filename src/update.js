import keyboard from './keyboard';
import key from './key';

export default function update(dt, state) {
    for (let [key, entity] of Object.entries(state)) {
        entity.update(dt);
    }
}
