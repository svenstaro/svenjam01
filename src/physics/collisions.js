import * as Matter from 'matter-js';
import PhysicsZone from './zone';

function updatePlayerGroundStatus(event, player, status) {
    for (let pair of event.pairs) {
        if (pair.bodyA === player.groundSensor) {
            player.onGround = status;
        } else if (pair.bodyB === player.groundSensor) {
            player.onGround = status;
        }
    }
}

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
    Matter.Events.on(engine, 'collisionStart', (event) => {
        dispatchToPhysicsZones(event, 'onCollisionEnter');
        updatePlayerGroundStatus(event, player, true);
    });

    Matter.Events.on(engine, 'collisionEnd', (event) => {
        dispatchToPhysicsZones(event, 'onCollisionExit');
        updatePlayerGroundStatus(event, player, false);
    });
}
