/*
   widget.container.classList.remove('hide') //remove hide class
   widget.container.classList.add('show'); //add show class
*/
const TwitchPubSubLoader = (obj) => {
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
 new TwitchPubSub(obj.detail.channel.providerId).connect().then(_ => document.getElementById('TpsStatus').innerText = msg); //replace 'connecting' with msg once connected;
 window.addEventListener('onEventReceived', obj => { //on event
   if(obj.detail.listener !== 'reward-redeemed') return;
     console.log('SE Event Output: ', event); //Console event for Object reference
     document.getElementById('TpsLastReward').innerText = event.data.rewardTitle; //update info bar header with last channel point
 });
};
const WidgetInfoMessage = (msg, warn = false, critical = false) => { //funciton to add items to the info panel
 console.log('WidgetInfoMessage: ', msg); //log the msg and error if there is one in the console
 msg = msg.error ? msg.error : msg;
 let infoContainer = document.getElementById('TpsInfo'), //get info container
   newMsg = document.createElement('li'); //create a new list item node
 newMsg.innerText = msg; //set the text of the list item
 if (warn) {
   newMsg.style.color = 'red'; //set text color to red if it's a warning
   newMsg.style.fontWeight = 'bold';
 };
 infoContainer.appendChild(newMsg); //add the message to the list
 if (!critical) setTimeout(_ => newMsg.remove(), 5000); //remove the message after 5 seconds if not critical
};
const exampleTpsEvent = (name) => {
  return (
{
    "service": "twitch",
    "data": {
        "time": 1633579908448,
        "tags": {
            "id": "b7ae9286-01f1-4ea1-a0bc-f9ba66944ad5",
            "timestamp": "2021-10-07T04:11:48.448Z",
            "type": "channel_points_custom_reward_redemption",
            "channel_points_redemption_id": "367e4ce2-d240-48d3-8ada-22c0a7aa2a7c",
            "channel_points_redeeming_user": {
                "id": "43165806",
                "login": "pjonp",
                "display_name": "pjonp"
            },
            "channel_points_reward_id": "e140a91b-7df1-4d11-a19e-e8e313e2e07d",
            "channel_points_reward_title": name,
            "channel_points_user_input": ""
        },
        "nick": "pjonp",
        "userId": "43165806",
        "displayName": "pjonp",
        "text": "",
        "rewardId": "e140a91b-7df1-4d11-a19e-e8e313e2e07d",
        "rewardTitle": name,
        "id": "367e4ce2-d240-48d3-8ada-22c0a7aa2a7c"
    },
});
};






//


let eventTriggers = {}, queue = [], running = false;

window.addEventListener('onWidgetLoad', obj => { //on the widget load
   TwitchPubSubLoader(obj);
   loadSoundData(obj.detail).then(status => WidgetInfoMessage(status, false)).catch();
});

window.addEventListener('onEventReceived', obj => { //on event
  const event = obj.detail.event; //variables for event & listener
  if (event.listener === 'reward-redeemed') { //custom listener from imported code
    if (eventTriggers[event.data.rewardTitle])  checkQueue( event.data );// eventTriggers[event.data.rewardTitle].run(event.data);
  } else if (event.listener === 'widget-button') { //test buttons
    Object.keys(eventTriggers)
      .filter(i => eventTriggers[i].testButton === event.field) //filter the Array to get the correct reward. eventTrigger button is an "index" value; pass on...
      .forEach(i => checkQueue(exampleTpsEvent(i))); //play the event that matches the button clicked. Dupliates are handled onLoad, so only 1 event will exist
  };
});


function loadSoundData(detail) { //emojiRotator module builder, called on widgetload
 return new Promise((res, rej) => { //return promise; verify that user added at least 1 reward;
    const verifyRewards = () => { //function to check amount of rewards
     const amountLoaded = Object.keys(eventTriggers).length;
     if (amountLoaded > 0) res(`${amountLoaded} Sound Rewards Loaded`); //if 1 or more reward, resolve
     else rej('No Rewards Are Filled In'); //if no rewards then reject and prevent websocket connection
   };

   const fieldData = detail.fieldData; //field data passed from widgetLoad

   function formatFieldData(i = 0) { //function to loop and build master Object
     console.log(i);
     i++; //reward and loop counter
     if (i > 11) return verifyRewards(); //get reward info; field data locked to 5 only, but headroom for users that try to sneek in more
     const rewardText = fieldData[`reward${i}_rewardText`];
     const rewardAudio = fieldData[`reward${i}_audio`];

     if (!rewardText) return formatFieldData(i) //skip empty segments
     else if (eventTriggers[rewardText]) { //check if a duplicate
       WidgetInfoMessage(`${rewardText} is a duplicate, reward #${i} skipped`, true); //send message to info panel
       return formatFieldData(i);
     } else if (rewardText && !rewardAudio) {
       WidgetInfoMessage(`${rewardText} skipped because there is sound included.`, true);
       return formatFieldData(i) //skip empty segments
     };

     const rewardObject = { //build Object that 'emojiRotator' is looking for
       index: i,
       name: rewardText, //reward name
       audio: rewardAudio,
       volume: fieldData[`reward${i}_audioVolume`],
       duration: fieldData[`reward${i}_duration`],
       image: fieldData[`reward${i}_imageOverride`].length > 3 ? fieldData[`reward${i}_imageOverride`] : fieldData[`reward${i}_image`],
       color: fieldData[`reward${i}color`],
       testButton: `reward${i}_testButton`,
     };
     eventTriggers[rewardText] = rewardObject;
     formatFieldData(i);
   };
   formatFieldData(); //call function above
 });
};

//queue
function checkQueue(event) {
  if (event) queue.push(event);
  if (queue.length > 0 && !running) {
    running = true;
    playAlert(queue[0]);
  };
  return;
};

async function playAlert(event) {
  const type = eventTriggers[event.data.rewardTitle].name;
  console.log('alert: ', type);
  let alertDuration = eventTriggers[type].duration;
  const audio = new Audio(eventTriggers[type].audio);
  audio.volume = eventTriggers[type].volume / 100;
  if(!alertDuration) alertDuration = await new Promise((res,rej) => $(audio).on("loadedmetadata", _=> res(audio.duration))); // :shrug:
  console.log(alertDuration);
  audio.play();

  /*
  const eventHtml = `
    <div class="toast show" style='background-color: ${eventTriggers[type].color}'>
      <div class="img" style="background-image: url('${eventTriggers[type].image}')"></div>
      <div class="desc">${USERNAME}<br>${"EVENT"}</div>
    </div>
`
  let container = document.getElementById("main");
  container.insertAdjacentHTML("beforeend", newEvent);
  let targetContainer = container.lastElementChild
    setTimeout(() => {
      targetContainer.remove()
    }, 10000);
};
  */

  setTimeout(_ => {
      audio.pause();
      queue.shift(); //remove event from queue
      running = false; //turn off running
      checkQueue(); //check queue for next event or set to default colors
    }, alertDuration * 1000); //... after settings time converted to seconds
  return;
};
