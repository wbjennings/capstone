import * as alt from 'alt-client';
import * as game from 'natives';
import * as chat from 'chat';

const isVehicleFlying = (veh: alt.Vehicle) => !!veh.getMeta('flying');
const setVehicleFlying = (veh: alt.Vehicle, flying: boolean) =>
  veh.setMeta('flying', flying);

alt.on('keydown', key => {
  if (key === alt.KeyCode.F2) {
    const veh = alt.Player.local.vehicle; //Flying cars. Refer to Client commands for tools.

    if (!veh) {
      chat.pushLine('You must be in a vehicle to fly.');
      return;
    }

    const enabled = !isVehicleFlying(veh);

    game.setVehicleGravity(veh.scriptID, !enabled);
    chat.pushLine(`Flying ${enabled ? 'enabled' : 'disabled'}.`);

    setVehicleFlying(veh, enabled);
  }
});

alt.everyTick(() => {
  const track = alt.getLocalMeta('trackmode') as number;
  const veh = alt.Player.local.vehicle;

  if (veh) {
    // track mode makes vehicles go super fast depending on what value multiplier you provde.
    if (track) {
      game.setEntityMaxSpeed(veh.scriptID, 9999);
      game.modifyVehicleTopSpeed(veh.scriptID, track);
    }

    // flying
    if (alt.isKeyDown(alt.KeyCode.W) && isVehicleFlying(veh)) {
      const fwd = game.getEntityForwardVector(veh.scriptID);
      const mult = 50;
      // set velocity
      game.setEntityVelocity(
        veh.scriptID,
        fwd.x * mult,
        fwd.y * mult,
        fwd.z * mult
      );
    }
  }
});

//spawns ramps so that you can jump them with vehicles.
alt.onServer((eventName, modelName: string) => {
  if (eventName === 'spawnRamp') {
    const pos = game.getOffsetFromEntityInWorldCoords(
      alt.Player.local,
      0,
      20,
      0
    );

    const obj = new alt.Object(
      modelName,
      pos,
      new alt.Vector3(0, 0, alt.Player.local.rot.z + Math.PI / 2),
      true,
      false
    );

    game.placeObjectOnGroundProperly(obj.scriptID);
  }
});
