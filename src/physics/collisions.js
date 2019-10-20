import * as Matter from "matter-js";
import PhysicsZone from "./zone";

function dispatchToPhysicsZones(event, method) {
    for (let pair of event.pairs) {
        if (pair.bodyA.physicsZone instanceof PhysicsZone) {
            pair.bodyA.physicsZone[method](pair.bodyB);
        } else if (pair.bodyB.physicsZone instanceof PhysicsZone) {
            pair.bodyB.physicsZone[method](pair.bodyA);
        }
    }
}

export default function setupCollisionEvents(engine, state) {
    Matter.Events.on(engine, "collisionStart", event => {
        dispatchToPhysicsZones(event, "onCollisionEnter");
        player.onCollisionEnter(event);
    });

    Matter.Events.on(engine, "collisionEnd", event => {
        dispatchToPhysicsZones(event, "onCollisionExit");
        player.onCollisionExit(event, player, false);
    });
}
