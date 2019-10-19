import Box from './entities/box';

export function getSpawn(level) {
    let layer = getLayer(level, 'Game Objects');

    return layer.objects.find((obj) => obj.name === 'spawn');
}

export function getLayer(level, name) {
    return level.layers.find((layer) => layer.name === name);
}

export function getGameObjects(level) {
    let layer = getLayer(level, 'Game Objects');

    let entities = [];
    for (let obj of layer.objects) {
        if (obj.type === 'box') {
            entities.push(new Box(obj.x, obj.y, obj.width, obj.height));
        }
    }

    return entities;
}
