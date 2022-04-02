/*
Copyright 2022 pjonp
This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

//requires sePubSub.js
const TwitchRewardsPubSubLoader = (obj) => {
  const infoContainer = document.createElement('ul');
  infoContainer.id = 'TpsInfo';

  const htmlString = `<li>Note: This box only shows in the editor.</li>
   <li id='TpsStatus'>CONNECTING....</li>
   <li>Last Reward Seen: <span id='TpsLastReward' style='font-weight: bold'>None Yet</span></li>`;
  infoContainer.innerHTML = htmlString;

  const infoContainerStyle = 'position: fixed;bottom: 0;left: 0;width: 100vw;background-color: black;color: white;display: none;'
  infoContainer.style.cssText = infoContainerStyle;

  document.body.appendChild(infoContainer);
  if (obj.detail.overlay.isEditorMode) infoContainer.style.display = 'block'; //show the status bar

  const msg = 'Connected; Test a reward on your Twitch channel';
  const tpsStatusContainer = document.getElementById('TpsStatus')

  new TwitchRewardsPubSub(obj.detail.channel.providerId).connect().then(_ => tpsStatusContainer.innerText = msg).catch(_ => tpsStatusContainer.innerText = 'Error connecting to pubsub'); //replace 'connecting' with msg once connected;

  window.addEventListener('onEventReceived', obj => { //on event
    const data = obj.detail.event.data;
    if (obj.detail.listener !== 'reward-redeemed') return;
    console.log('SE REWARD DATA Output: ', data); //Console event for Object reference
    document.getElementById('TpsLastReward').innerText = data.rewardTitle; //update info bar header with last channel point
  });
};

const WidgetInfoMessage = (msg, warn = false, critical = false) => { //funciton to add items to the info panel
  console.log('WidgetInfoMessage: ', msg); //log the msg and error if there is one in the console
  msg = msg.error ? msg.error : msg;
  let infoContainer = document.getElementById('TpsInfo'), //get info container
    newMsg = document.createElement('li'); //create a new list item node

  newMsg.innerText = msg; //set the text of the list item
  if (warn || critical) {
    newMsg.style.color = 'red'; //set text color to red if it's a warning
    newMsg.style.fontWeight = 'bold';
  };
  infoContainer.appendChild(newMsg); //add the message to the list
  if (!critical) setTimeout(_ => newMsg.remove(), 5000); //remove the message after 5 seconds if not critical
};

/*
window.addEventListener('onWidgetLoad', obj => { //on the widget load
  TwitchRewardsPubSubLoader(obj);
});

window.addEventListener('onEventReceived', obj => {
  const event = obj.detail.event;
  if (obj.detail.listener === 'reward-redeemed') {
    if (event.data.rewardTitle === 'REWARD_NAME') {
      //DO SOMETHING
      //.....
    };
  } else if (event.listener === 'widget-button' && event.field === 'TEST_BUTTON_NAME') { //test button
      sendTPSRewardEvent('REWARD_NAME'); //Emulate reward
  };
});
*/
