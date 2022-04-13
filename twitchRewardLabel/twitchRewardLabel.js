console.log('load');
const dataBaseName = 'twitchRewardLabel_1'; //SE KV store database Object 'twitchRewardLabel_1' preloaded
/* ref database object:
rewardLabelData = {
  lastEventDataObj: {},
  users: {
    USERID: {
      count: 1
  //    last: DATE
    },
  },
};
*/
let fieldData;
window.addEventListener('onWidgetLoad', async obj => {
  fieldData = obj.detail.fieldData;

  // return SE_API.store.set(dataBaseName, {});

  await (_=> new Promise(r => setTimeout(r, 1000)))(); //debounce
  TwitchRewardsPubSubLoader(obj); //load, from "seTwitchRewardsPubSubLoader" https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSubLoader.js
  SE_API.store.get(dataBaseName).then(rewardLabelData => {
    if(!rewardLabelData || !rewardLabelData.lastEventDataObj) rewardLabelData = {lastEventDataObj: {}, users: {}};
    rewardLabelData.users["001"] = {count: 0, last: 0}; //gonna get an error here when filtering for leaderboard
    SE_API.store.set(dataBaseName, rewardLabelData);
    updateLabel(rewardLabelData);
  }).catch();
});

window.addEventListener('onEventReceived', obj => {
  const eventData = obj.detail.event.data;
  if (obj.detail.event.field === "fd_twitchRewardButton") return sendTPSRewardEvent(fieldData.fd_RewardTrigger); //from "seTwitchRewardsPubSub" see: https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSub.js
  if (obj.detail.listener !== 'reward-redeemed') return; //from "seTwitchRewardsPubSub" see: https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSub.js
  	if (eventData.rewardTitle === fieldData.fd_RewardTrigger) {
        SE_API.store.get(dataBaseName).then(rewardLabelData => {
          if(!rewardLabelData || !rewardLabelData.lastEventDataObj) rewardLabelData = {lastEventDataObj: {}, users: {}};
          obj.detail.isTest ? eventData.userId = '001' : rewardLabelData.lastEventDataObj = eventData; //use testId when testing and don't override last real event
          if (!rewardLabelData.users[eventData.userId]) rewardLabelData.users[eventData.userId] = {count: 0};
          rewardLabelData.users[eventData.userId].count++;
          rewardLabelData.users[eventData.userId].last = new Date(); //not used
          SE_API.store.set(dataBaseName, rewardLabelData);
          if(obj.detail.isTest) rewardLabelData.lastEventDataObj = eventData; //bring test event data back after saving
          updateLabel(rewardLabelData);
        }).catch();
      };
});

function updateLabel({ lastEventDataObj = {}, users = {} }) {
  const target = document.getElementById('twitchRewardLabel');

  let labelText = '...........';
  if(users[lastEventDataObj.userId]) labelText = `${lastEventDataObj.displayName} | #${users[lastEventDataObj.userId].count}`;

  target.innerHTML = labelText;
};
