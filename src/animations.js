import * as PIXI from "pixi.js";
import { TILES_MAP } from "./tileset_helper";

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const TILES_PER_ROW = 512 / TILE_WIDTH;

function getRectForId(id) {
    const row = Math.floor(id / TILES_PER_ROW);
    const column = id % TILES_PER_ROW;
    return {
        x: column * TILE_WIDTH,
        y: row * TILE_HEIGHT
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

export function loadAnimation(animationIds, num_tiles_x, num_tiles_y) {
    const tileIdsPerAnimation = animationIds.map(id =>
        TILES_MAP[id].animation.map(tileDef => tileDef.tileid)
    );
    const tileIdsPerFrame = [];
    tileIdsPerAnimation.forEach(ids =>
        ids.map(
            (id, index) =>
                (tileIdsPerFrame[index] = [
                    ...(tileIdsPerFrame[index] || []),
                    id
                ])
        )
    );
    const textures = tileIdsPerFrame.map(ids => {
        const thisTexture = PIXI.Texture.from("tileset").clone();
        thisTexture.frame = getRectForIds(ids, num_tiles_x, num_tiles_y);
        thisTexture.updateUvs();
        return thisTexture;
    });

    const sprite = new PIXI.AnimatedSprite(textures);
    sprite.animationSpeed = 0.125;
    sprite.width = num_tiles_x * TILE_WIDTH;
    sprite.height = num_tiles_y * TILE_HEIGHT;
    return sprite;
}

export const loadAnimationAtlas = (animationAtlas, num_tiles_x, num_tiles_y) =>
    Object.keys(animationAtlas).reduce(
        (accum, animationName) => ({
            ...accum,
            [animationName]: loadAnimation(
                animationAtlas[animationName],
                num_tiles_x,
                num_tiles_y
            )
        }),
        {}
    );
