const fs = require('fs'),
  path = require('path');
//Master Field Data Object:
//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]

let FieldDataMaster = {},
  outputObject = {};

`
Bits.webm
Coin and Dollar.webm
Coin.webm
Confetti.webm
Dollar.webm
Gift.webm
`
const gHubRepoLink = `https://raw.githubusercontent.com/pjonp/pjonpWidgets/main/fatSacksMakeItRain/assets/`

const events = [ {event: 'follow', name: 'Tip', link: `${gHubRepoLink}Confetti.webm`},
{event: 'tip', name: 'Tip', link: `${gHubRepoLink}Coin.webm`},
{event: 'cheer', name: 'Cheer', link: `${gHubRepoLink}Bits.webm`},
{event: 'host', name: 'Host', link: `${gHubRepoLink}Confetti.webm`},
{event: 'raid', name: 'Raid', link: `${gHubRepoLink}Confetti.webm`},
{event: 'sub', name: 'New Sub', link: `${gHubRepoLink}Confetti.webm`},
{event: 'subGift', name: 'Sub Gift', link: `${gHubRepoLink}Gift.webm`},
{event: 'resub', name: 'Re-Sub', link: `${gHubRepoLink}Confetti.webm`},
{event: 'subBomb', name: 'Sub Bomb', link: `${gHubRepoLink}Gift.webm`},
{event: 'communityGift', name: 'Comunity Gifts', link: `${gHubRepoLink}Confetti.webm`},
];
//Inject Rewards at end of Master List from the Main code
events.forEach(i => {
  group = i.event, //not used
    //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
    FieldDataMaster[`${i.event}_enabled`] = [`${i.name} Enabled`, i.name, 'checkbox']

  if (i.event === 'tip' || i.event === 'cheer') {
    for (j = 0; j < 3; j++) {
      FieldDataMaster[`${i.event}_level${j}_amount`] = [`${i.name} Level ${j+1} Amount`, i.name, 'number', 100 * (j+1), 0, 10000];
      FieldDataMaster[`${i.event}_level${j}_video`] = [`${i.name} Level ${j+1} Video`, i.name, 'video-input'];
    };
  } else {
    FieldDataMaster[`${i.event}_level0_video`] = [`${i.event} Event Video`, i.name, 'video-input'];
  }
});

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