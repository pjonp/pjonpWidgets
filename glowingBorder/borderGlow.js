/*
Set Master Widget to true if you want to export
the settings eventSettings to another instance of this widget
*/
const masterWidget = false;
/*
Set Secondary Widget to true if you want to import
the settings eventSettings from the master instance of this widget
*/
let secondaryWidget = false;

//Can't be both; sanity check
if (masterWidget) secondaryWidget = false;

let eventSettings = {},
  queue = [],
  currentEvent,
  running = false;

function onWidgetLoad(obj) {
  const fieldData = obj.detail.fieldData;

  /* The following is not used
     Each event has an Object { enabled: true/false, duration: SECONDS, color1: COLOR, color2: color }
     To enable an event change the false to true;
     set the duration of the event to show those colors, default is 10 (seconds)
     color1 & color2 are the glow colors that will override the defaul colors for the duration
     colors can be named reference: https://www.w3schools.com/cssref/css_colors.asp
     	hex#'s, rgb, or rgba.
     tips and raids have a minimum amount; so tips/cheers over that limit will trigger the color switch
  */
  eventSettings.default = {
    color1: fieldData.glowColor1_FD,
    color2: fieldData.glowColor2_FD
  };
  eventSettings.follow = {
    enabled: false,
    duration: 10,
    color1: 'red',
    color2: 'pink'
  };
  eventSettings.tip = {
    min: 1,
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.host = {
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.raid = {
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.sub = { //1st time sub (not gifted)
    enabled: false,
    duration: 10,
    color1: '#40E0D0',
    color2: 'rgb(250,100,200)'
  };
  eventSettings.subGift = { //user gifts a sub to target user (DOES NOT trigger a sub or resub)
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.resub = { //user resubs (not gifted)
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.subBomb = { //users gifts a number of subs to random users
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  //communityGift WARING ; gift of 50 subs will last 50 * duration seconds; so if set to 60 seconds, will last 50 minutes!
  eventSettings.communityGift = { //a sub from subBomb
    enabled: false,
    duration: 10,
    color1: 'blue',
    color2: 'gold'
  };
  eventSettings.cheer = {
    min: 100,
    enabled: false,
    duration: 10,
    color1: 'orange',
    color2: 'purple'
  };
  if (masterWidget) SE_API.store.set('glowingBorderSettings', eventSettings);
  else if (secondaryWidget) SE_API.store.get('glowingBorderSettings').then(obj => eventSettings = obj).catch();
};

/* Reboot0's SE Tools
see https://reboot0-de.github.io/se-tools/tutorial-Events.html
for more information on each event
*/
function onFollow(data) {
  if (eventSettings.follow.enabled) checkQueue('follow');
};
function onTip(data) {
  if (eventSettings.tip.enabled && data.amount > eventSettings.tip.min) checkQueue('tip');
};
function onHost(data) {
  if (eventSettings.host.enabled) checkQueue('host');
};
function onRaid(data) {
  if (eventSettings.raid.enabled) checkQueue('raid');
};
function onSubscriber(data) {
  if (eventSettings.sub.enabled) checkQueue('sub');
};
function onSubGift(data) {
  if (eventSettings.subGift.enabled) checkQueue('subGift');
};
function onResub(data) {
  if (eventSettings.resub.enabled) checkQueue('resub');
};
function onSubBomb(data) {
  if (eventSettings.subBomb.enabled) checkQueue('subBomb');
};
function onCommunityGift(data) {
  if (eventSettings.communityGift.enabled) checkQueue('communityGift');
};
function onCheer(data) {
  if (eventSettings.cheer.enabled && data.amount > eventSettings.cheer.min) checkQueue('cheer');
};
function onKVStoreUpdate(data)
{
    if(data.key === 'customWidget.glowingBorderSettings' && secondaryWidget) eventSettings = data.value;
};

//queue
function checkQueue(type) {
  if (type) queue.push(type); //if a type was sent; add it to the queue Array
  if (queue.length > 0) { //check queue length (always > 0 on new events)
    if (!running) setColors(queue[0]); //if NOT running then setColors for 1st item in queue Array
  } else setColors('default'); //no queue, set to default colors
};

function setColors(type) {
  if (currentEvent !== type) { //no need to change the colors if colors match existing event (10 subs in a row)
    document.documentElement.style.setProperty('--glowColor1', eventSettings[type].color1); //set color 1
    document.documentElement.style.setProperty('--glowColor2', eventSettings[type].color2); //set color 2
    currentEvent = type; //if event type changed; update global variable
  };
  if (type === 'default') { //if default type (end of queue) set running off
    running = false;
  } else {
    running = true; //else, set running True for....
    setTimeout(_ => {
      queue.shift(); //remove event from queue
      running = false; //turn off running
      checkQueue(); //check queue for next event or set to default colors
    }, eventSettings[type].duration * 1000); //... after settings time converted to seconds
  };
  return;
};

/* DEFAULT SETTINGS:
FULLSCREEN BORDER:
  1920x1080; centered
  DATA TAB: {"glowStyle_FD":"inset","borderRadius_FD":0,"xSize_FD":450,"ySize_FD":300,"xShift_FD":0,"yShift_FD":30,"glowColor1_FD":"chartreuse","glowColor2_FD":"black","glowSpeed_FD":10,"blur_FD":150,"blurMax_FD":10,"spread_FD":120,"spreadMax_FD":10,"borderThickness_FD":0,"borderColor_FD":"#000"}
CAMERA GLOW:
  600x600; Top: 600px; Left: 1400px
  DATA TAB: {"glowStyle_FD":" ","borderRadius_FD":49.6,"xSize_FD":-799,"ySize_FD":-887,"xShift_FD":0,"yShift_FD":30,"glowColor1_FD":"chartreuse","glowColor2_FD":"black","glowSpeed_FD":10,"blur_FD":160,"blurMax_FD":48,"spread_FD":75,"spreadMax_FD":50,"borderThickness_FD":0,"borderColor_FD":"#000"}
*/
