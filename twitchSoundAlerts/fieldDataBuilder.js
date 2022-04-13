const fs = require('fs'),
  path = require('path');
  //Master Field Data Object:
  //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
let FieldDataMaster = {
    testingMode: ['Testing Mode', 'Main', 'checkbox'],
    alertSize: ['Alert Size', 'Main', 'slider', 150,10,400,1],
    alertSpawnLocation: ['Alert Start Location', 'Main', 'dropdown', {'flex-start': 'Left', center: 'Center', 'flex-end': 'Right'}],
    alertImageLocation: ['Alert Image Location', 'Main', 'dropdown', {'row-reverse': 'Right', 'row': 'Left'}],
    fontFamily: ['Font', 'Font', 'googleFont', 'Balsamiq Sans'],
    fontSize: ['Font Size', 'Font', 'slider', 50,5,200,1],
    fontAlignment: ['Font Alignment', 'Font', 'dropdown', {center: 'Center', 'flex-start': 'Left', 'flex-end': 'Right'}],
    fontPaddingLeft: ['Font Spacing Left (px)', 'Font', 'number', 50,0,2000],
    fontPaddingRight: ['Font Spacing Right (px)', 'Font', 'number', 50,0,2000],
};
let outputObject = {};
//NEED DEFAULT SOUND
//FIX IMAGE URL
  const preLoadData = {
    1: {
        reward: 'Test Reward 1',
        audio: 'tbd',
        image: 'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/streamElementsLogo.gif',
        color: '#790d9b'
      },
  };


//Inject Rewards at end of Master List from the Main code
for(let i = 0; i < 5; i++) {
  let rewardId = i+1,
      group = i, //not used
//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
      groupText = `Reward #${rewardId}`;//set common values

      FieldDataMaster[`reward${rewardId}_testButton`] = [`Reward ${rewardId} Test Button`, groupText, 'button'];
      FieldDataMaster[`reward${rewardId}_rewardText`] = [`Reward ${rewardId} Text Name: (EXACT)`, groupText, 'text', preLoadData[rewardId]?.reward || ''];
      FieldDataMaster[`reward${rewardId}_note1`] = [`Duration 0 = Audio File Length`, groupText, 'hidden'];
      FieldDataMaster[`reward${rewardId}_duration`] = [`Reward ${rewardId} Duration (s)`, groupText, 'slider', 0, 0, 60, 0.5];
      FieldDataMaster[`reward${rewardId}_audio`] = [`Reward ${rewardId} Audio`, groupText, 'sound-input', preLoadData[rewardId]?.audio || ''];
      FieldDataMaster[`reward${rewardId}_audioVolume`] = [`Reward ${rewardId} Audio Volume`, groupText, 'slider', 100, 10, 100, 1];
      FieldDataMaster[`reward${rewardId}_note2`] = [`Audio Delay 0 = Intro Animation`, groupText, 'hidden'];
      FieldDataMaster[`reward${rewardId}_audioPlayDelay`] = [`Reward ${rewardId} Audio Delay (s)`, groupText, 'slider', 0, 0, 10, 0.1];
      FieldDataMaster[`reward${rewardId}_backgroundColor`] = [`Reward ${rewardId} Background Color`, groupText, 'colorpicker', preLoadData[rewardId]?.color || 'black'];
      FieldDataMaster[`reward${rewardId}_fontColor`] = [`Reward ${rewardId} Font Color`, groupText, 'colorpicker', 'white'];
      FieldDataMaster[`reward${rewardId}_image`] = [`Reward ${rewardId} Image`, groupText, 'image-input', preLoadData[rewardId]?.image || ''];
      FieldDataMaster[`reward${rewardId}_imageOverride`] = [`Reward ${rewardId} Image Override`, groupText, 'text', ''];
      FieldDataMaster[`reward${rewardId}_imageSize`] = [`Reward ${rewardId} Image Size (%)`, groupText, 'slider', 100, 50, 200, 1];
      FieldDataMaster[`reward${rewardId}_imageBgColor`] = [`Reward ${rewardId} Image Background Color`, groupText, 'colorpicker', 'rgba(0,0,0,.3)'];
};

  FieldDataMaster[`radiusType`] = ['Alert Radius Type', 'Alert Radius Settings', 'dropdown', {'imageRadius': 'Morph From/To Image', 'alertRadius': 'Fixed'}],
  FieldDataMaster[`alertRadiusUL`] = ['Alert Upper Left Radius', 'Alert Radius Settings', 'slider', 25,0,200,1];
  FieldDataMaster[`alertRadiusUR`] = ['Alert Upper Right Radius', 'Alert Radius Settings', 'slider', 10,0,200,1];
  FieldDataMaster[`alertRadiusLR`] = ['Alert Lower Right Radius', 'Alert Radius Settings', 'slider', 75,0,200,1];
  FieldDataMaster[`alertRadiusLL`] = ['Alert Lower Left Radius', 'Alert Radius Settings', 'slider', 0,0,200,1];

  FieldDataMaster[`imageRadiusUL`] = ['Image Upper Left Radius', 'Image Radius Settings', 'slider', 75,0,200,1];
  FieldDataMaster[`imageRadiusUR`] = ['Image Upper Right Radius', 'Image Radius Settings', 'slider', 75,0,200,1];
  FieldDataMaster[`imageRadiusLR`] = ['Image Lower Right Radius', 'Image Radius Settings', 'slider', 75,0,200,1];
  FieldDataMaster[`imageRadiusLL`] = ['Image Lower Left Radius', 'Image Radius Settings', 'slider', 0,0,200,1];

  FieldDataMaster['fadeinFunction'] = ['Fade In Style', 'Animation Settings', 'dropdown', {'linear': 'Linear', 'ease': 'Ease',
  'ease-in': 'Ease In', 'ease-out': 'Ease Out', 'ease-in-out': 'Ease In-Out'}];
  FieldDataMaster[`fadeinTime`] = ['Fade In Time', 'Animation Settings', 'number', 0.5,0,30];



  FieldDataMaster['expandFunction'] = ['Expand Style', 'Animation Settings', 'dropdown', {'linear': 'Linear', 'ease': 'Ease',
  'ease-in': 'Ease In', 'ease-out': 'Ease Out', 'ease-in-out': 'Ease In-Out'}];
  FieldDataMaster[`expandTime`] = ['Expand Time', 'Animation Settings', 'number', 0.5,0,30];



  FieldDataMaster['shrinkFunction'] = ['Shrink Style', 'Animation Settings', 'dropdown', {'linear': 'Linear', 'ease': 'Ease',
  'ease-in': 'Ease In', 'ease-out': 'Ease Out', 'ease-in-out': 'Ease In-Out'}];
  FieldDataMaster[`shrinkTime`] = ['Shrink Time', 'Animation Settings', 'number', 0.5,0,30];


  FieldDataMaster['fadeoutFunction'] = ['Fade Out Style', 'Animation Settings', 'dropdown', {'linear': 'Linear', 'ease': 'Ease',
  'ease-in': 'Ease In', 'ease-out': 'Ease Out', 'ease-in-out': 'Ease In-Out'}];
  FieldDataMaster[`fadeoutTime`] = ['Fade Out Time', 'Animation Settings', 'number', 0.5,0,30];


  FieldDataMaster[`widgetName`] = ['', 'Animation Settings', 'hidden', "Twitch Sound Alerts"];
  FieldDataMaster[`widgetAuthor`] = ['', 'Animation Settings', 'hidden', 'pjonp'];
  FieldDataMaster[`widgetVersion`] = ['', 'Animation Settings', 'hidden', '1.0.0'];
  FieldDataMaster[`widgetUpdateUrl`] = ['', 'Animation Settings', 'hidden', ''];


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
