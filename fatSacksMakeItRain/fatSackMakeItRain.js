/*
Assests provided by Fatsack: https://fatsackfails.com/posts/free-twitch-assets-make-it-rain/#gumroad Thank you :)
Get them for free: https://fatsackfails.gumroad.com/l/twitch-assets-make-it-rain?wanted=true
$0 .... but if you like them and and want tip, please do :)
*/

let eventSettings = {},
  queue = [],
  currentEvent,
  running = false;

const tipMin = 1;
const cheerMin = 100;

function onWidgetLoad(obj) {
  const fieldData = obj.detail.fieldData;

  const events = ['follow', 'tip', 'host', 'raid', 'sub', 'subGift', 'resub', 'subBomb', 'communityGift', 'cheer'];

  events.forEach(i => {
    eventSettings[i] = {
      enabled: fieldData[`${i}_enabled`],
      levels: {
        0: {
          amount: 0,
          video: fieldData[`${i}_level0_video`]
        }
      },
    };
    if (i === 'tip' || i == 'cheer') {
      let lastVid = fieldData[`${i}_level0_video`];
      for (j = 0; j < 10; j++) {
        if(fieldData[`${i}_level${j}_video`]) lastVid = fieldData[`${i}_level${j}_video`];
        eventSettings[i].levels[j] = {
          amount: fieldData[`${i}_level${j}_amount`],
          video: lastVid
        };
      };
    };
  });

  console.log(eventSettings);

};

/* Reboot0's SE Tools
see https://reboot0-de.github.io/se-tools/tutorial-Events.html
for more information on each event
*/
function onFollow(data) {
  if (eventSettings.follow.enabled) checkQueue({type: 'follow', level:0});
};

function onTip(data) {
  let lvl = 0;
  if(data.amount > eventSettings['tip'].levels[2].amount) lvl = 2;
  else if(data.amount > eventSettings['tip'].levels[1].amount) lvl = 1;
  else if(data.amount > eventSettings['tip'].levels[0].amount) lvl = 0;
  else return;
  if (eventSettings.tip.enabled) checkQueue({type: 'tip', level: lvl});
};

function onHost(data) {
  if (eventSettings.host.enabled) checkQueue({type: 'host', level:0});
};

function onRaid(data) {
  if (eventSettings.raid.enabled) checkQueue({type: 'raid', level:0});
};

function onSubscriber(data) {
  if (eventSettings.sub.enabled) checkQueue({type: 'sub', level:0});
};

function onSubGift(data) {
  if (eventSettings.subGift.enabled) checkQueue({type: 'subGift', level:0});
};

function onResub(data) {
  if (eventSettings.resub.enabled) checkQueue({type: 'resub', level:0});
};

function onSubBomb(data) {
  if (eventSettings.subBomb.enabled) checkQueue({type: 'subBomb', level:0});
};

function onCommunityGift(data) {
  if (eventSettings.communityGift.enabled) checkQueue({type: 'communityGift', level:0});
};

function onCheer(data) {
  let lvl = 0;
  if(data.amount > eventSettings['cheer'].levels[2].amount) lvl = 2;
  else if(data.amount > eventSettings['cheer'].levels[1].amount) lvl = 1;
  else if(data.amount > eventSettings['cheer'].levels[0].amount) lvl = 0;
  else return;

  if (eventSettings.cheer.enabled) checkQueue({type: 'cheer', level: lvl});
};


function checkQueue(type) {
  console.log('queue: ', queue);
  if (type) queue.push(type);
  if (queue.length > 0) {
    if (!running) playEvent(queue[0]);
  };
};
const mainContainer = document.getElementById('main');

function playEvent(event) {
    console.log('event; ', event);

  const type = event.type, level = event.level;
  if (!eventSettings[type].enabled) return;
  running = true;

  const video = document.createElement('video');
  video.src = eventSettings[type]['levels'][level].video;
  video.autoplay = true;
  main.appendChild(video);

  setTimeout(_ => {
    video.remove();
    queue.shift();
    running = false;
    checkQueue();
  }, 3 * 1000);
  return;
};
