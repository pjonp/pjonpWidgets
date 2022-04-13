let fieldData,
  eventTriggers = {},
  queue = [],
  running = false,
  animationTotalTime;

window.addEventListener('onWidgetLoad', async obj => {
  fieldData = obj.detail.fieldData;
  await (_=> new Promise(r => setTimeout(r, 500)))(); //debounce
  TwitchRewardsPubSubLoader(obj); //loader + error display: https://cdn.jsdelivr.net/gh/pjonp/pjonpWidgets@main/utilities/seTwitchRewardsPubSubLoader.js

  animationTotalTime = (fieldData.fadeinTime + fieldData.expandTime + fieldData.shrinkTime + fieldData.fadeoutTime) * 1000;


  loadUserSettings(obj.detail).then(status => {
    WidgetInfoMessage(status, false);
    if(obj.detail.overlay.isEditorMode && fieldData.testingMode) {
      const loadedRewardKeys = Object.keys(eventTriggers);
      (function loopRewardEvents(rewardKeyIndex=0) {
        const testRewardName = loadedRewardKeys[rewardKeyIndex];
        const testRewardObj = eventTriggers[testRewardName];

        rewardKeyIndex++;
        if(rewardKeyIndex >= loadedRewardKeys.length) rewardKeyIndex = 0;
        sendTPSRewardEvent(testRewardName);
        setTimeout(_=> {
          loopRewardEvents(rewardKeyIndex);
        }, testRewardObj.duration * 1000 + animationTotalTime);
      })();
    };
  }).catch(e => {
    WidgetInfoMessage(e, true, true);
  }); //send visual error: https://cdn.jsdelivr.net/gh/pjonp/pjonpWidgets@main/utilities/seTwitchRewardsPubSubLoader.js
});

window.addEventListener('onEventReceived', obj => {
  const event = obj.detail.event;
  if (obj.detail.listener === 'reward-redeemed') { //custom listener from imported code see: https://cdn.jsdelivr.net/gh/pjonp/pjonpWidgets@main/utilities/seTwitchRewardsPubSub.js
    if (eventTriggers[event.data.rewardTitle]) checkQueue(event.data);
  } else if (event.listener === 'widget-button') { //test buttons
    Object.keys(eventTriggers)
      .filter(i => eventTriggers[i].testButton === event.field)
      .forEach(i => sendTPSRewardEvent(i)); //send custom SE event: https://cdn.jsdelivr.net/gh/pjonp/pjonpWidgets@main/utilities/seTwitchRewardsPubSub.js
  };
});

function loadUserSettings(detail) {
  return new Promise((res, rej) => {
    const verifySettings = () => {
      const amountLoaded = Object.keys(eventTriggers).length;
      if (amountLoaded > 0) res(`${amountLoaded} Sound Rewards Loaded`);
      else rej('No rewards are filled in or sound is missing.');
    };

    (function formatFieldData(fieldDataIndex = 0) { //recursive function to loop and build master Object
      fieldDataIndex++;
      if (fieldDataIndex > 11) return verifySettings();
      const rewardText = fieldData[`reward${fieldDataIndex}_rewardText`];
      const rewardAudio = fieldData[`reward${fieldDataIndex}_audio`];
      let res = '';
      if (!rewardText) return formatFieldData(fieldDataIndex);
      if (!rewardAudio) res = `${rewardText} skipped because there is no sound.`;
      if (eventTriggers[rewardText]) res = `${rewardText} is a duplicate, reward #${fieldDataIndex} skipped`;
      if (res) {
        WidgetInfoMessage(res, true, true);
        return formatFieldData(fieldDataIndex);
      };

      const rewardObject = {
        index: fieldDataIndex,
        name: rewardText,
        audio: rewardAudio,
        volume: fieldData[`reward${fieldDataIndex}_audioVolume`],
        duration: fieldData[`reward${fieldDataIndex}_duration`],
        audioPlayDelay: fieldData[`reward${fieldDataIndex}_audioPlayDelay`],
        image: fieldData[`reward${fieldDataIndex}_imageOverride`].length > 3 ? fieldData[`reward${fieldDataIndex}_imageOverride`] : fieldData[`reward${fieldDataIndex}_image`],
        imageSize: fieldData[`reward${fieldDataIndex}_imageSize`],
        imageBgColor: fieldData[`reward${fieldDataIndex}_imageBgColor`],
        backgroundColor: fieldData[`reward${fieldDataIndex}_backgroundColor`],
        fontColor: fieldData[`reward${fieldDataIndex}_fontColor`],
        testButton: `reward${fieldDataIndex}_testButton`,
      };
      eventTriggers[rewardText] = rewardObject;
      formatFieldData(fieldDataIndex);
    })(); //start recursive function
  });
};

function checkQueue(data) {
  if (data) queue.push(data);
  if (queue.length > 0 && !running) {
    running = true;
    playAlert(queue[0]);
  };
  return;
};

async function playAlert( {displayName,rewardTitle} ) {
  const alertSettings = eventTriggers[rewardTitle];
  const audio = new Audio(alertSettings.audio);

  if (alertSettings.duration === 0) alertSettings.duration = await new Promise((res, rej) => $(audio).on("loadedmetadata", _ => res(audio.duration)));
  document.documentElement.style.setProperty('--alertDuration', `${alertSettings.duration}s`);
  audio.volume = alertSettings.volume / 100;

  const runtime = alertSettings.duration * 1000 + animationTotalTime;

  let audioPlayDelay = (alertSettings.audioPlayDelay || (fieldData.fadeinTime + fieldData.expandTime)) * 1000;

  if(audioPlayDelay >= (runtime - 100)) {
    audioPlayDelay = (fieldData.fadeinTime + fieldData.expandTime) * 1000;
    WidgetInfoMessage(`Audio Delay for ${rewardTitle} is to long and is set to default value`, true);
  };
  setTimeout(_ => audio.play(), audioPlayDelay);

  const eventHtml = `
    <div class='event animate' style='background-color: ${alertSettings.backgroundColor};color: ${alertSettings.fontColor} '>
      <div class='eventImgContainer' style="background-image: url('${alertSettings.image}'); background-size: ${alertSettings.imageSize}%; background-color:${alertSettings.imageBgColor};"></div>
      <div class='eventText'>
    		<div>${displayName}</div>
    		<div>${rewardTitle}</div>
	    </div>
    </div>`;

  const mainContainer = document.getElementById("main");
  mainContainer.insertAdjacentHTML("beforeend", eventHtml);
  const alertContainer = mainContainer.lastElementChild

  WidgetInfoMessage(`Playing: ${rewardTitle}: Total Time: ${runtime/1000}s`, false);

  setTimeout(_ => {
    alertContainer.remove()
    audio.pause();
    queue.shift();
    running = false;
    checkQueue();
  }, runtime);
  return;
};
