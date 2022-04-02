const fs = require('fs'),
  path = require('path');
//Master Field Data Object:
//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]

let FieldDataMaster = {},
  outputObject = {};

const gHubRepoLink = `https://raw.githubusercontent.com/pjonp/pjonpWidgets/main/fatSacksMakeItRain/assets/`;

const events = [ {event: 'chatGoal', name: 'Chat Messages', link: `${gHubRepoLink}Confetti.webm`},
{event: 'follow', name: 'Follow', link: `${gHubRepoLink}Confetti.webm`},
{event: 'tip', name: 'Tip', link: `${gHubRepoLink}Coin.webm`},
{event: 'cheer', name: 'Cheer/Elixir', link: `${gHubRepoLink}Bits.webm`},
{event: 'host', name: 'Host', link: `${gHubRepoLink}Confetti.webm`},
{event: 'raid', name: 'Raid', link: `${gHubRepoLink}Confetti.webm`},
{event: 'sub', name: 'New Sub', link: `${gHubRepoLink}Confetti.webm`},
{event: 'subGift', name: 'Targeted Sub Gift', link: `${gHubRepoLink}Gift.webm`},
{event: 'resub', name: 'Re-Sub', link: `${gHubRepoLink}Confetti.webm`},
{event: 'subBomb', name: 'Community Gift Sender', link: `${gHubRepoLink}Gift.webm`},
{event: 'communityGift', name: 'Community Gift Subs', link: `${gHubRepoLink}Confetti.webm`},
];
//Inject Rewards at end of Master List from the Main code
events.forEach(i => {
    //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
    if(i.event === 'communityGift') {
      FieldDataMaster[`${i.event}_note1`] = ['Happens for all gifted subs!', i.name, 'hidden'];
      FieldDataMaster[`${i.event}_note2`] = ['50gifts * 3(s) alert = 2.5 mins!', i.name, 'hidden'];
    };
    if (i.event === 'follow') FieldDataMaster[`${i.event}_enabled`] = [`${i.name} Enabled`, i.name, 'checkbox', true];
    else FieldDataMaster[`${i.event}_enabled`] = [`${i.name} Enabled`, i.name, 'checkbox'];

    if (i.event === 'chatGoal') {
      FieldDataMaster[`${i.event}_note1`] = ['Chat word to count', i.name, 'hidden'];
      FieldDataMaster[`${i.event}_triggerWord`] = [`Use ALL to count all chats`, i.name, 'text', 'ALL'];
      FieldDataMaster[`${i.event}_chatUserLimit`] = [`Limit to 1 per user per stream`, i.name, 'checkbox'];
      FieldDataMaster[`${i.event}_chatIgnoredList`] = [`Users to exclude`, i.name, 'text', 'streamElements, nightbot'];
      FieldDataMaster[`${i.event}_triggerWordCase`] = [`Case Check Trigger`, i.name, 'checkbox'];
      FieldDataMaster[`${i.event}_triggerWordLimit`] = [`Trigger is limited to 1 per chat`, i.name, 'checkbox'];
    };

  if (i.event === 'tip' || i.event === 'cheer' || i.event === 'chatGoal') {
    for (j = 0; j < 3; j++) {
      //shit code.... but no one will ever see this :)
      if(j===1 && i.event !== 'chatGoal') i.link = `${gHubRepoLink}Dollar.webm`;
      else if(j>1 && i.event !== 'chatGoal') i.link = `${gHubRepoLink}Coin and Dollar.webm`;
      const baseline = i.event === 'tip' ? 5 : i.event === 'cheer' ? 500 : 50;
      FieldDataMaster[`${i.event}_level${j}_video`] = [`${i.name} Level ${j+1} Video`, i.name, 'video-input', i.link];
      FieldDataMaster[`${i.event}_level${j}_minAmount`] = [`Level ${j+1} Minimum Amount`, i.name, 'number', baseline * (j+1), 0, baseline * 100];
      FieldDataMaster[`${i.event}_level${j}_duration`] = [`Level ${j+1} Duration (s)`, i.name, 'number', 3,0.5,90];
    };
  } else {
    FieldDataMaster[`${i.event}_level0_duration`] = [`${i.name} Duration (s)`, i.name, 'number', 3,0.5,90];
    FieldDataMaster[`${i.event}_level0_video`] = [`${i.name} Event Video`, i.name, 'video-input', i.link];
  }
});


//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
FieldDataMaster[`widget_note1`] = ['assets "stolen" 😂 from Fatsack:', 'About', 'hidden'];
FieldDataMaster[`widget_note2`] = ['https://fatsackfails.com/makeitrain', 'About', 'hidden'];
FieldDataMaster[`widget_note3`] = ['Licensed CC BY 4.0', 'About', 'hidden'];
FieldDataMaster[`widget_note4`] = ['________', 'About', 'hidden'];
FieldDataMaster[`widget_note5`] = ['code by: pjonp#9094 👀', 'About', 'hidden'];
FieldDataMaster[`widgetName`] = ['', 'About', 'hidden', "Fatsack's Make It Rain"];
FieldDataMaster[`widgetAuthor`] = ['', 'About', 'hidden', 'pjonp'];
FieldDataMaster[`widgetVersion`] = ['', 'About', 'hidden', '1.0.0'];
FieldDataMaster[`widgetUpdateUrl`] = ['', 'About', 'hidden', ''];

//Make field data...
for (const [key] of Object.entries(FieldDataMaster)) {
  outputObject[key] = {
    label: FieldDataMaster[key][0],
    group: FieldDataMaster[key][1],
    type: FieldDataMaster[key][2],
    value: FieldDataMaster[key][3]
  };

  if (typeof FieldDataMaster[key][4] === 'number') outputObject[key]['min'] = FieldDataMaster[key][4];
  if (typeof FieldDataMaster[key][5] === 'number') outputObject[key]['max'] = FieldDataMaster[key][5];
  if (typeof FieldDataMaster[key][6] === 'number') outputObject[key]['steps'] = FieldDataMaster[key][6];

  if (outputObject[key]['type'] === 'dropdown') {
    if (typeof outputObject[key]['value'] !== 'object') throw new Error(`Setting for ${key} is set to dropdown but does not have an Object as value`);
    outputObject[key]['options'] = outputObject[key]['value']
    outputObject[key]['value'] = Object.keys(outputObject[key]['value'])[0];
  };
};

fs.writeFileSync(path.resolve(__dirname, './fieldDataMaster.json'), JSON.stringify(outputObject), 'UTF-8')
console.log(outputObject, ' done')
