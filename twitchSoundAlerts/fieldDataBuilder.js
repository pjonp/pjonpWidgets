const fs = require('fs'),
  path = require('path');
  //Master Field Data Object:
  //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
let FieldDataMaster = {
    _info1: ['Twitch Channel Points Example', 'Main', 'hidden'],
    emojiSize: ['Emoji Size (255px Max)', 'Main', 'slider', 255, 5,255,1],

  },
  outputObject = {};



//Inject Rewards at end of Master List from the Main code
for(let i = 0; i < 5; i++) {
  let rewardId = i+1,
      group = i, //not used
//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
      groupText = `Reward #${rewardId}`;//set common values

      FieldDataMaster[`reward${rewardId}_testButton`] = [`Reward ${rewardId} Test Button`, groupText, 'button'];
      FieldDataMaster[`reward${rewardId}_rewardText`] = [`Reward ${rewardId} Text Name: (EXACT)`, groupText, 'text', ''];
      FieldDataMaster[`reward${rewardId}_duration`] = [`Reward ${rewardId} Duration (s)`, groupText, 'slider', 0, 0, 300];
      FieldDataMaster[`reward${rewardId}_audio`] = [`Reward ${rewardId} Audio`, groupText, 'sound-input'];
      FieldDataMaster[`reward${rewardId}_audioVolume`] = [`Reward ${rewardId} Audio Volume`, groupText, 'slider', 100, 10, 100, 1];
      FieldDataMaster[`reward${rewardId}_color`] = [`Reward ${rewardId} Color`, groupText, 'colorpicker'];
      FieldDataMaster[`reward${rewardId}_image`] = [`Reward ${rewardId} Image`, groupText, 'image-input'];
      FieldDataMaster[`reward${rewardId}_imageOverride`] = [`Reward ${rewardId} Image Override`, groupText, 'text', ''];
};


//Make field data...
for (const [key] of Object.entries(FieldDataMaster)) {
  outputObject[key] = {
    label: FieldDataMaster[key][0],
    group: FieldDataMaster[key][1],
    type: FieldDataMaster[key][2],
    value: FieldDataMaster[key][3]
  };

  if(typeof FieldDataMaster[key][4] === 'number') outputObject[key]['min'] = FieldDataMaster[key][4];
  if(typeof FieldDataMaster[key][5] === 'number') outputObject[key]['max'] = FieldDataMaster[key][5];
  if(typeof FieldDataMaster[key][6] === 'number') outputObject[key]['steps'] = FieldDataMaster[key][6];

  if(outputObject[key]['type'] === 'dropdown') {
    if(typeof outputObject[key]['value'] !== 'object') throw new Error(`Setting for ${key} is set to dropdown but does not have an Object as value`);
      outputObject[key]['options'] = outputObject[key]['value']
      outputObject[key]['value'] = Object.keys(outputObject[key]['value'])[0];
  };
};

fs.writeFileSync(path.resolve(__dirname, './fieldDataMaster.json'),  JSON.stringify(outputObject), 'UTF-8')
console.log(outputObject, ' done')
