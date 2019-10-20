import tileset from "../levels/tileset.json";

export const TILES_MAP = tileset.tiles.reduce(
  (accum, tileDef) => ({ ...accum, [tileDef.id]: tileDef }),
  {}
);
