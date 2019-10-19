import * as PIXI from 'pixi.js';

export default function dispatchParticles(player) {
   let pos = player.body.position;
   console.log("dispatching particle function at ", pos.x, pos.y);
   let particle = new PIXI.Text("oof"); 
   particle.position.set(pos.x, pos.y);
   app.stage.addChild(particle);
}
