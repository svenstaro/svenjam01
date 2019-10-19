import * as Matter from 'matter-js';

function updatePlayerGroundStatus(event, player, status) {
    for (let pair of event.pairs) {
        if (pair.bodyA === player.groundSensor) {
            player.onGround = status;
        } else if (pair.bodyB === player.groundSensor) {
            player.onGround = status;
        }
        console.log(player.onGround);
    }
}

export default function setupCollisionEvents(engine, state) {
    Matter.Events.on(engine, 'collisionStart', (event) => {
        updatePlayerGroundStatus(event, state.player, true);
    });

    Matter.Events.on(engine, 'collisionEnd', (event) => {
        updatePlayerGroundStatus(event, state.player, false);
    });
}
