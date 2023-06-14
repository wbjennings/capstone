import * as alt from 'alt-server';
import * as chat from 'chat';

function makeBlip(player: alt.Player) {
  const blip = new alt.PointBlip(player);

  blip.name = player.name;
}

alt.Player.all.forEach(makeBlip);

alt.on('vehicleDamage', (veh, att) => {
  if (att instanceof alt.Vehicle) {
    // send attacker flying wip if this is activated and we make contact it sends the player flying across the map
  }
});

alt.on('weaponDamage', (src, target, weapon, damage, offset, body) => {
  console.log('weaponDamage', [
    src.id,
    target.id,
    weapon,
    damage,
    offset,
    body,
  ]);

  return false;
});

//this is the server settrack command to multiply vehicle horsepower using Alt-v built in commands.
chat.registerCmd('settrack', (player, args) => {
  const track = +args[0];

  if (!track) {
    chat.send(player, 'Not a valid track value.');
  }

  player.setLocalMeta('trackmode', track);
});

//this command spawns a vehicle of your choice.
chat.registerCmd('veh', (player, [model]) => {
  if (!model) {
    chat.send(player, 'Usage: /veh <vehicleModel>');

    return;
  }

  try {
    const veh = new alt.Vehicle(model, player.pos, player.rot);

    player.setIntoVehicle(veh, 1);
  } catch (e) {
    chat.send(player, `Vehicle model "${model}" doesn't exist.`);
  }
});

//This command edits the vehicle to allow it to drift.
chat.registerCmd('drift', player => {
  if (!player.vehicle) {
    chat.send(player, 'Not in a vehicle.');
    return;
  }

  player.vehicle.driftModeEnabled = !player.vehicle.driftModeEnabled;

  chat.send(
    player,
    `Drift mode ${player.vehicle.driftModeEnabled ? 'disabled' : 'enabled'}.`
  );
});

//this command spawns you at the top of the game engine and gives you a parachute.
chat.registerCmd('skydive', (player: alt.Player) => {
  player.giveWeapon(alt.hash('gadget_parachute'), 1, true);
  player.pos = new alt.Vector3(player.pos.x, player.pos.y, 1500);
});

chat.registerCmd('ramp', (player: alt.Player, [modelName]) => {
  if (!modelName) {
    chat.send(player, 'Enter a valid model name.');
    return;
  }

  player.emit('spawnRamp', modelName);
});
