import * as Matter from 'matter-js';
import PhysicsZone from './zone';
import dispatchParticles from '../particle.js';

function updatePlayerGroundStatus(event, player, status) {
    let oldOnGround = player.onGround;
    for (let pair of event.pairs) {
        if (pair.bodyA === player.groundSensor) {
            player.onGround = status;
        } else if (pair.bodyB === player.groundSensor) {
            player.onGround = status;
        }
    }
    if (player.onGround && !oldOnGround) dispatchParticles(player)
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
        updatePlayerGroundStatus(event, state.player, true);
    });

    Matter.Events.on(engine, 'collisionEnd', (event) => {
        dispatchToPhysicsZones(event, 'onCollisionExit');
        updatePlayerGroundStatus(event, state.player, false);
    });
}
