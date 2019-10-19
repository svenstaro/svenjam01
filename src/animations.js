import * as PIXI from "pixi.js";

import tileset from "../levels/tileset.json";

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const TILES_PER_ROW = 512 / TILE_WIDTH;

const TILE_ATLAS = tileset.tiles.reduce(
    (accum, tileDef) => ({ ...accum, [tileDef.id]: tileDef }),
    {}
);

function getRectForId(id) {
    const row = Math.floor(id / TILES_PER_ROW);
    const column = id % TILES_PER_ROW;
    return {
        x: column * TILE_WIDTH,
        y: row * TILE_HEIGHT,
    };
}

function getRectForIds(ids, num_tiles_x, num_tiles_y) {
    const rects = ids.map(getRectForId);
    const minX = rects
        .map(rect => rect.x)
        .reduce((a, b) => Math.min(a, b), 10000000000);
    const minY = rects
        .map(rect => rect.y)
        .reduce((a, b) => Math.min(a, b), 10000000000);
    return new PIXI.Rectangle(
        minX,
        minY,
        num_tiles_x * TILE_WIDTH,
        num_tiles_y * TILE_HEIGHT
    );
}

export function loadAnimation(animationIds) {
    const tileIdsPerAnimation = animationIds.map(id =>
        TILE_ATLAS[id].animation.map(tileDef => tileDef.tileid)
    );
    const tileIdsPerFrame = [];
    tileIdsPerAnimation.forEach(ids =>
        ids.map(
            (id, index) =>
                (tileIdsPerFrame[index] = [
                    ...(tileIdsPerFrame[index] || []),
                    id,
                ])
        )
    );
    const textures = tileIdsPerFrame.map(ids => {
        const thisTexture = PIXI.Texture.from('tileset');
        thisTexture.frame = getRectForIds(ids, 1, 2);
        thisTexture.updateUvs();
        return thisTexture;
    });

    const sprite = new PIXI.AnimatedSprite(textures);
    sprite.animationSpeed = 0.125;
    sprite.anchor.set(0.5);
    sprite.width = 1 * TILE_WIDTH;
    sprite.height = 2 * TILE_HEIGHT;
    return sprite;
}

export const loadAnimationAtlas = animationAtlas =>
    Object.keys(animationAtlas).reduce(
        (accum, animationName) => ({
            ...accum,
            [animationName]: loadAnimation(animationAtlas[animationName]),
        }),
        {}
    );
