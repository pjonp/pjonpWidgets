let count = 0,
  fieldData, platform, chatters = {},
  running = true;

  /*waring: comment all the things! below*/

window.addEventListener('onWidgetLoad', obj => {
  fetch(`https://api.streamelements.com/kappa/v2/channels/${obj.detail.channel.id}`)
    .then(res => res.json())
    .then(profile => platform = profile.provider).catch(_ => platform = 'twitch'); //platform check
  fieldData = obj.detail.fieldData; //set fielddata to global variable
  if (fieldData.FD_trigger.length < 1) fieldData.FD_triggerOverride = true; //if no trigger, then set to all chat mode
  buildCounters(); //do counter CSS overrides and start
});

function buildCounters(i = 0) { //handling multiple counters in same widget [removed]
  const emoteSrc = fieldData.FD_emote ? fieldData.FD_emote : fieldData.FD_emoteOverride; //check if user uploaded image or input link
  if (emoteSrc) document.getElementById(`emote_${i}`).src = emoteSrc; //if there is an image, set the src
  const counterNode = document.getElementById(`odometer_${i}`); //The counter
  let newCssObject = ``; //set-up CSS style object (String); !important to override the package styles.
  //check if bG override
  if (fieldData.FD_backgroundOverride) newCssObject += `background-image: linear-gradient(${fieldData.FD_backgroundColor1}, ${fieldData.FD_backgroundColor2}) !important;`;
  //check if color override
  if (fieldData.FD_fontColorOverride) newCssObject += `color: ${fieldData.FD_fontColor} !important;`;
  //check if font override
  if (fieldData.FD_fontFamilyOverride) newCssObject += `font-family: ${fieldData.FD_fontFamily}, sans-serif !important;`;
  const newCssClass = document.createElement('style'); //create a 'css style'
  newCssClass.type = 'text/css'; //define it as a css style
  newCssClass.innerHTML = `.counterClass_${i} { ${newCssObject} }`; //create the HTML CSS string
  document.getElementsByTagName('head')[0].appendChild(newCssClass); //inject the new CSS style
  counterNode.classList.add(`counterClass_${i}`) //add the new style to the ".odmeter" element (using i for easy loop)
  setInterval(_ => counterNode.innerText = count, (fieldData.FD_refreshDelay * 1000) + 2000); //start the counter update
};

window.addEventListener('onEventReceived', obj => {
  const listener = obj.detail.listener;
  const data = obj.detail.event.data;
  if (listener === 'message') {
    if (platform === 'twitch') {
      if (data.tags.badges.includes('broadcaster') || data.tags.mod === '1') data.hasPerm = true; //twitch role check
      handleMessage(data);
    } else if (platform === 'trovo' && data.content_data) {
      if (data.roles.some(i => i === 'streamer' || i === 'mod')) data.hasPerm = true; //trovo role check
      data.text = data.content
      handleMessage(data);
    } else if (platform === 'youtube') {
      //??? data.hasPerm = true; //unsure of streamer/mod check
      handleMessage(data); //?? good luck
    };
  } else if (obj.detail.event.field === 'FD_TestButton') setInterval(_ => count += 3, 1123); //test button
});

//{ USERID: { count: ###, displayName: STRING }
class chatter { //create a "chatter Object";
  constructor(displayName) {
    this.displayName = displayName;
    this.count = 0;
  };
};

function handleMessage({
  text,
  userId,
  displayName,
  hasPerm
}) { //handle messages
  if (!chatters[userId]) chatters[userId] = new chatter(displayName); //check if user has already chatted; if not create user
  let skip = false;
  if (hasPerm) skip = commandCheck(text); //check for streamer/mod command usage
  if (!running || skip) return;
  if (fieldData.FD_triggerOverride) {
    count++; //if counting all messages, add 1
    chatters[userId].count++; //+1 to the user
  } else {
    const rX = new RegExp(`${fieldData.FD_trigger}`, `g${fieldData.FD_triggerCase?'':'i'}`); //set up regEx for trigger; check if to enforce case
    const matchCountArray = text.match(rX) || []; //get array of matches
    const adder = fieldData.FD_triggerLimit && matchCountArray.length > 0 ? 1 : matchCountArray.length; //get 'adder'. if "limited" to 1 per message, add 1; else add all
    count += adder; //add to counter
    chatters[userId].count += adder; //add to user counter
  };
};

function commandCheck(text) {
  if (text.startsWith(fieldData.FD_resetCommand)) { //reset command check
    count = 0; //reset the counter
    chatters = {}; //clear chatter list
    return true; //skip the message check if command is used
  } else if (text.startsWith(fieldData.FD_newTriggerCommand)) { //new trigger command check
    const newTrigger = text.replace(fieldData.FD_newTriggerCommand, '').trim(); //remove the "!command" and space
    if (newTrigger.length > 0) { //if a trigger was added....
      fieldData.FD_triggerOverride = newTrigger === 'ALL'; //command to enable "ALL" messages
      fieldData.FD_trigger = newTrigger;
      count = 0; //reset the counter
      chatters = {}; //clear chatter list
    };
    return true; //skip the message check if command is used
  } else if (text.startsWith(fieldData.FD_pauseCommand)) running = !running;
  return false; //don't skip messages if a command is not used
};

/*Load Odometer Package (custom)
SEE: https://github.com/HubSpot/odometer for information
Copyright (c) 2013 HubSpot, Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const VALUE_HTML = '<span class="odometer-value"></span>',

  RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>',

  DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>',

  FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>',

  DIGIT_FORMAT = 'd',

  MIN_INTEGER_LEN = {{FD_minLength}},

  FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(D*)(d*))?$/,

  FRAMERATE = 30,

  DURATION = 2000,

  COUNT_FRAMERATE = 20,

  FRAMES_PER_VALUE = 2,

  DIGIT_SPEEDBOOST = .5;

loadOdometer(VALUE_HTML,
  RIBBON_HTML,
  DIGIT_HTML,
  FORMAT_MARK_HTML,
  DIGIT_FORMAT,
  MIN_INTEGER_LEN,
  FORMAT_PARSER,
  FRAMERATE,
  DURATION,
  COUNT_FRAMERATE,
  FRAMES_PER_VALUE,
  DIGIT_SPEEDBOOST);
