const dataBaseName = 'twitchRewardLabel_1'; //SE KV store database Object

let dbObject = {
  lastEventObj: {},
  users: {
    1: {
      count: 1
    },
  },
};

//Track viewers total count of usages?

let fieldData; //global fieldData, set on widget load
window.addEventListener('onWidgetLoad', obj => {
  fieldData = obj.detail.fieldData; //set fieldData object
  TwitchRewardsPubSubLoader(obj); //load, from "seTwitchRewardsPubSubLoader" https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSubLoader.js
  SE_API.store.get(dataBaseName).then(dbData => { //load object from database
    updateLabel(dbData); //update label
  }).catch();
});

window.addEventListener('onEventReceived', obj => {
  const event = obj.detail.event;
  if (obj.detail.listener === 'reward-redeemed') { //from "seTwitchRewardsPubSub" see: https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSub.js
    if (event.data.rewardTitle === fieldData.fd_RewardTrigger) { //see if Reward matches label event
      if (!obj.detail.isTest) SE_API.store.set(dataBaseName, event); //if not a test event then save to KV store
      updateLabel(event); //update label
    };
  } else if (obj.detail.event.field === "fd_twitchRewardButton") {
    sendTPSRewardEvent(fieldData.fd_RewardTrigger); //from "seTwitchRewardsPubSub" see: https://github.com/pjonp/pjonpWidgets/blob/main/utilities/seTwitchRewardsPubSub.js
  };
});

function updateLabel(event) {
  const data = event ? event.data : null; //no one will see this. i can use bad code ;)
  const target = document.getElementById('twitchRewardLabel');
  target.innerHTML = data ? data.displayName : '???';
};
