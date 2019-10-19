import * as PIXI from 'pixi.js';

export default function dispatchParticles(player) {
   console.log("dispatching particle function");
   let particle = new PIXI.Text("oof"); 
   particle.position.set(player.body.x, player.body.y);
   app.stage.addChild(particle);
}
