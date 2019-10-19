export function getSpawn(level) {
    let layer = getLayer(level, 'Game Objects');

    return layer.objects.find((obj) => obj.name === 'spawn');
}

export function getLayer(level, name) {
    return level.layers.find((layer) => layer.name === name);
}
