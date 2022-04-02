/*
Assets provided by Fatsack: https://fatsackfails.com/posts/free-twitch-assets-make-it-rain/#gumroad Thank you :)
Get them for free: https://fatsackfails.gumroad.com/l/twitch-assets-make-it-rain?wanted=true
Licensed Creative Commons BY 4.0
$0 .... but if you like them and want to tip, please do :)

Code by pjonp
*/
const mainContainer = document.getElementById('main');
let eventSettings = {},
  chatters = {},
  queue = [],
  running = false,
  chatGoalSettings = {};

function onWidgetLoad(obj) {
  const fieldData = obj.detail.fieldData;
  const events = ['chatGoal', 'follow', 'tip', 'host', 'raid', 'cheer', 'sub', 'subGift', 'resub', 'subBomb', 'communityGift'];

  events.forEach(i => {
    eventSettings[i] = {
      enabled: fieldData[`${i}_enabled`],
      levels: {
        0: {
          video: fieldData[`${i}_level0_video`],
          duration: fieldData[`${i}_level0_duration`],
        },
      },
    };
    if (i === 'tip' || i === 'cheer' || i === 'chatGoal') {
      let lastVid;
      for (j = 0; j < 5; j++) {
        if (fieldData[`${i}_level${j}_video`]) lastVid = fieldData[`${i}_level${j}_video`];
        eventSettings[i].levels[j] = {
          minAmount: fieldData[`${i}_level${j}_minAmount`],
          video: lastVid,
          duration: fieldData[`${i}_level${j}_duration`],
        };
      };
      if (i === 'chatGoal') {
        eventSettings[i].chatTrigger = fieldData.chatGoal_triggerWord.length > 0 ? fieldData.chatGoal_triggerWord : 'all'; //chat trigger check; set word and set to 'all' if empty
        eventSettings[i].countAllChats = eventSettings[i].chatTrigger.toLowerCase() === 'all' ? true : false;
        eventSettings[i].chatUserLimit = fieldData.chatGoal_chatUserLimit;
        eventSettings[i].chatIgnoredUsers = (_ => {
          const ignoredList = fieldData.chatGoal_chatIgnoredList;
          const ignoredListArray = ignoredList.toLowerCase().replace(/[^\w]/g, ' ').split(' ').filter(i => i);
          /* Code note:
          take ignoredList String, convert to lower case, replace all non letters with a space, convert to Array, then filter out the empty spaces
            pro: prevents user error; "@name1,name2", "name1, name2", "name1 | @name2" etc all work
            con: it filters all charaters that are not in English alphabet
            alternate filter to replace only the ,'s:
            const ignoredListArray = ignoredList.toLowerCase().replace(/[,]/g, ' ').split(' ').filter(i => i);
          */
          return ignoredListArray;
        })();
        eventSettings[i].triggerWordCase = fieldData.chatGoal_triggerWordCase;
        eventSettings[i].triggerWordLimit = fieldData.chatGoal_triggerWordLimit;
        eventSettings[i].progress = 0;
        chatGoalSettings = eventSettings['chatGoal'];
      };
    };
  });
};

/* Reboot0's SE Tools
see https://reboot0-de.github.io/se-tools/tutorial-Events.html for more information on each event
*/
function onFollow(data) {
  if (eventSettings.follow.enabled) checkQueue({
    eventType: 'follow',
    eventLvlObj: eventSettings['follow'].levels[0]
  });
};

function onTip(data) {
  let lvl;
  if (data.amount >= eventSettings['tip'].levels[2].minAmount) lvl = 2;
  else if (data.amount >= eventSettings['tip'].levels[1].minAmount) lvl = 1;
  else if (data.amount >= eventSettings['tip'].levels[0].minAmount) lvl = 0;
  else return;
  if (eventSettings.tip.enabled) checkQueue({
    eventType: 'tip',
    eventLvlObj: eventSettings['tip'].levels[lvl]
  });
};

function onHost(data) {
  if (eventSettings.host.enabled) checkQueue({
    eventType: 'host',
    eventLvlObj: eventSettings['host'].levels[0]
  });
};

function onRaid(data) {
  if (eventSettings.raid.enabled) checkQueue({
    eventType: 'raid',
    eventLvlObj: eventSettings['raid'].levels[0]
  });
};

function onSubscriber(data) {
  if (eventSettings.sub.enabled) checkQueue({
    eventType: 'sub',
    eventLvlObj: eventSettings['sub'].levels[0]
  });
};

function onSubGift(data) {
  if (eventSettings.subGift.enabled) checkQueue({
    eventType: 'subGift',
    eventLvlObj: eventSettings['subGift'].levels[0]
  });
};

function onResub(data) {
  if (eventSettings.resub.enabled) checkQueue({
    eventType: 'resub',
    eventLvlObj: eventSettings['resub'].levels[0]
  });
};

function onSubBomb(data) {
  if (eventSettings.subBomb.enabled) checkQueue({
    eventType: 'subBomb',
    eventLvlObj: eventSettings['subBomb'].levels[0]
  });
};

function onCommunityGift(data) {
  if (eventSettings.communityGift.enabled) checkQueue({
    eventType: 'communityGift',
    eventLvlObj: eventSettings['communityGift'].levels[0]
  });
};

function onCheer(data) {
  let lvl;
  if (data.amount >= eventSettings['cheer'].levels[2].minAmount) lvl = 2;
  else if (data.amount >= eventSettings['cheer'].levels[1].minAmount) lvl = 1;
  else if (data.amount >= eventSettings['cheer'].levels[0].minAmount) lvl = 0;
  else return;
  if (eventSettings.cheer.enabled) checkQueue({
    eventType: 'cheer',
    eventLvlObj: eventSettings['cheer'].levels[lvl]
  });
};

window.addEventListener('onEventReceived', obj => { //trigger cheer event on elixir event
  if (obj.detail.listener === 'elixir-latest') onCheer(obj.detail.event); //{amount, name, sessionTop}
});

//{ USERID: { count: ###, displayName: STRING }
class chatter { //create a "chatter Object";
  constructor(displayName) {
    this.displayName = displayName;
    this.count = 0;
  };
};

function onMessage(chatMessage) {
  if (chatGoalSettings.enabled) {
    const chatMessageData = chatMessage.data || chatMessage.raw.data, //check .data  for Trovo or use Twitch data
      text = chatMessageData.text || chatMessageData.content, //use content for Trovo
      userId = chatMessageData.userId,
      displayName = chatMessageData.displayName,
      nick = chatMessageData.nick || chatMessageData.nick_name.toLowerCase(); //Trovo nick_name need lowercase

    if (chatMessageData.content && !chatMessageData.content_data) return; //Prevent old Trovo messages from counting on Load
    else if (chatGoalSettings.chatIgnoredUsers.indexOf(nick) >= 0) return;
    else if (!chatters[userId]) chatters[userId] = new chatter(displayName); //check if user has already chatted; if not create user
    else if (chatGoalSettings.chatUserLimit && chatters[userId].count > 0) return; //chat limit check
    if (chatGoalSettings.countAllChats) {
      chatGoalSettings.progress++; //if counting all messages, add 1
      chatters[userId].count++;
    } else {
      const rX = new RegExp(`${chatGoalSettings.chatTrigger}`, `g${chatGoalSettings.triggerWordCase?'':'i'}`); //set up regEx for trigger; check if to enforce case
      const matchCountArray = text.match(rX) || []; //get array of matches
      const adder = chatGoalSettings.triggerWordLimit && matchCountArray.length > 0 ? 1 : matchCountArray.length; //get 'adder'. if "limited" to 1 per message, add 1; else add all
      if (adder === 0) return;
      chatGoalSettings.progress += adder; //add to counter
      chatters[userId].count += adder;
    };

    for (let i = 2; i >= 0; i--) {
      if (chatGoalSettings.progress >= chatGoalSettings.levels[i].minAmount && !chatGoalSettings.levels[i].played) {
        chatGoalSettings.levels[i].played = true;
        checkQueue({
          eventType: 'chatGoal',
          eventLvlObj: chatGoalSettings.levels[i]
        });
      };
    };
  };
  return;
};

function checkQueue(event) {
  console.log('queue: ', queue);
  if (event) queue.push(event);
  if (queue.length > 0) {
    if (!running) playEvent(queue[0]);
  };
};

function playEvent({
  eventType,
  eventLvlObj
}) {
  running = true;
  const video = document.createElement('video');
  video.src = eventLvlObj.video;
  video.autoplay = true;
  main.appendChild(video);
  setTimeout(_ => {
    video.remove();
    queue.shift();
    running = false;
    checkQueue();
  }, eventLvlObj.duration * 1000);
  return;
};
