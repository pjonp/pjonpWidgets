/*
RotatorS AKA Rotator-a-Saurus AKA Roar-A-Tator-Saurus AKA Goals-R-Saur-Us AKA Ruben's Rotating Thingy AKA

AiO RotatoGoal 4.0.0 by pjonp

inspired by RubenSaurus
with help from JayniusGamingTV

The MIT License (MIT)
Copyright (c) 2021 pjonp
*/
const currencySetting = ['{{FD_currencyLocale}}', 'Set_OnWidgetLoad', `{{FD_currencyDecimals}}`]; //example: ['en-US', 'USD', decimals] / ['de-DE', 'EUR', 2] / ['ja-JP', 'JPY', 2]

/*
['LOCALE', 'CURRECNYCODE', 'DECIMALS TO SHOW']
locale is made up of:
language: https://www.w3schools.com/tags/ref_language_codes.asp
-
Country: https://www.w3schools.com/tags/ref_country_codes.asp
i.e LOCALE: 'en-CA' for English Canada CURRECNY: 'CAD' for Canadian Dollar
- Decimals: 0 -> $10 ; 2 -> $10.50
*/
let allGoals = {}, //set empty goal object. KEYs: goal names; VALUES: progress, goal, label, currency (true/false)
  goalList = [], //KEYs for above allGoals Object to rotate through
  maxFontSize = 100,
  vertBar = false,
  tipCount = 0,
  formatLargeNumbers = false,
  formatLargeNumbersDec = 0;

//move to FIELDS
let time = 10; //seconds

//Grab HTML DOM nodes for moving stuff around
const card = document.getElementById('card'),
  hiddenContainer = document.getElementById('hiddenBars'),
  sides = ['front', 'back'];

//main animation function; Animation is handled by CSS animation classes.
//this code takes the information on the "back side" and moves it into the hidden area.
//then grabs the next goal and puts it on the backsid e, then trigger the flip animation
//so everything is hidden on the back of the card out of view

//goalIndex[0] & [1] are prebuilt by buildBarHTML();
function flip(goalIndex = 2, side = 1) {
  //if there is only 1 or 2 sides; there is no need to move things around... just flip.
  if (goalList.length < 2) return
  else if (goalList.length > 2) {

    let hiddenSide = document.getElementById(`${sides[side]}`),
      newGoal = document.getElementById(`${goalList[goalIndex]}`);

    hiddenContainer.appendChild(hiddenSide.firstChild); //move back side content to hidden contatiner
    hiddenSide.appendChild(newGoal); //move new goal onto backside

    goalIndex++;
    goalIndex = goalIndex >= goalList.length ? 0 : goalIndex;
    side++;
    side = side >= sides.length ? 0 : side;
  };

  card.classList.toggle("rot-x-1");
  card.classList.toggle("rot-x-2");
  //card.classList.toggle("rot-y-1");
  //card.classList.toggle("rot-y-2");

  setTimeout(() => flip(goalIndex, side), time * 1000);
};

function visualError(e) {
  console.log('Error: ', e);
  sides.forEach(i => document.getElementById(i).innerText = e);
}

window.addEventListener('onWidgetLoad', obj => {
  let data = obj.detail.session.data,
    fieldData = obj.detail.fieldData;

  currencySetting[1] = obj.detail.currency.code || 'USD'; //set currency code
  formatLargeNumbers = fieldData[`FD_formatLargeNumbers`] === 'yes';
  formatLargeNumbersDec = fieldData[`FD_formatLargeNumbersDec`] || 2;
  time = fieldData[`FD_showTime`] || 30;
  maxFontSize = fieldData[`FD_maxFontSize`] || 100;
  vertBar = fieldData[`FD_vertBar`] === 'yes';

  platformCheck(data, fieldData).then(() => buildHTML(data, fieldData)).catch((e) => visualError(e));
});

function platformCheck(data, fieldData) {
  return new Promise((resolve, reject) => {
    let platformFilter = { //platform specific filter; i.e. only facebook has a 'stars' goal;
        Facebook: 'stars-goal',
        Twitch: 'cheer-goal',
        Youtube: 'superchat-goal',
        Trovo: 'elixir-goal'
      },
      fieldDataPlatform = fieldData[`FD_platform`]; //get expected platform from field data.
    currentPlatform = Object.keys(platformFilter).filter(i => data[platformFilter[i]])[0]; //Check each of the platformFilter goal against the goals that loaded into the data on widget load; and return the first element (platform or undefined)

    if (!fieldDataPlatform) reject('No Platform Set In Field Data. See Docs.') //error if no platform set in field data
    else if (currentPlatform && fieldDataPlatform === currentPlatform) resolve() //if match build the widget
    else reject(`The field data settings are for ${fieldDataPlatform} and you are logged into a ${currentPlatform} account`) //error if mismatch
  });
};

function buildHTML(data, fieldData) {
  Object.keys(data).forEach(i => { //get Goals based on session (only load platform goals, Twitch/fB/yT)
    if (i.includes('goal') && fieldData[`FD_${i}_enabled`] !== 'off') { //filter info for 'goal' & check if enabled


      let goalType = fieldData[`FD_${i}_enabled`]; //Redefine "GOAL" type to option in GUI

      const getIcon = selected => {
        if (selected === 'none') return ''
        else if (selected === 'other') return fieldData[`FD_${i}_iconOther`] || ''
        else return selected
      };

      if (!goalType) return;

      let progress;
      try {
        progress = data[goalType].hasOwnProperty('amount') ? data[goalType].amount : data[goalType].count; //progress on load
        console.log(`${goalType} Loaded!`);
      } catch {
        console.log(`Error loading data for ${goalType}, set to: NaN`);
        progress = 'NaN';
      };

      allGoals[goalType] = { //build goal object with key name of goal i.e. 'tip-goal'
        progress: progress, //progress on load
        target: fieldData[`FD_${i}_target`] || 1000, //default 1000; get target goal amount from field data (use common FD names 'FD_tip-goal_target')
        label: fieldData[`FD_${i}_label`] || '', //default empty
        icon: getIcon(fieldData[`FD_${i}_icon`]),
        currency: goalType.includes('tip') && goalType !== 'tip-count',
        barColor1: fieldData[`FD_${i}_barColor1`],
        barColor2: fieldData[`FD_${i}_barColor2`],
        neverEndingGoal: fieldData[`FD_${i}_neverEndingGoal`] === 'yes',
        neverEndingGoalAdder: fieldData[`FD_${i}_neverEndingGoalAdder`] || 25,
        neverEndingGoalLimit: fieldData[`FD_${i}_neverEndingGoalLimit`] || 90,
        minFontSize: fieldData[`FD_${i}_minFontSize`] || 0,
      };

      /*DELETE THIS LINE
            if(goalType === 'tip-count') {
            	allGoals[goalType].currency = false;
              allGoals[goalType].progress = tipCount;
            };
      DELETE THIS LINE */

      goalList.push(goalType);
    };
  });
  if (goalList.length === 0) return visualError('NO GOALS SET'); //end if no goals to build.
  console.log('allGoals', allGoals);
  //build HTML for each
  buildBarHTML();
};

//when something
window.addEventListener('onSessionUpdate', obj => {
  if (goalList.length === 0) return; //end if no goals to check. to-do: visual error
  let data = obj.detail.session;

  Object.keys(data).forEach(i => { //check session data for the change
    if (allGoals.hasOwnProperty(i)) { //filter info for 'goal' & see if it is in master object (enabled)
      goalAmount = data[i].hasOwnProperty('amount') ? data[i].amount : data[i].count

      /*DELETE THIS LINE  //this is to do NUMBER of tips and not a total amount
            if(i === 'tip-count') {
            	tipCount++;
              goalAmount = tipCount;
            };
      DELETE THIS LINE */

      if (allGoals[i].progress === goalAmount) return; //stop if not changed
      console.log("PROGRESS AMOUNT: ", goalAmount);
      allGoals[i].progress = goalAmount; //update local Object value
      let barTarget = document.getElementById(`${i}_bar`);

      if (allGoals[i].neverEndingGoal && allGoals[i].progress / allGoals[i].target * 100 > allGoals[i].neverEndingGoalLimit) allGoals[i].target = allGoals[i].progress * (1 + allGoals[i].neverEndingGoalAdder / 100)

      barTarget.style.width = `${(allGoals[i].progress/allGoals[i].target)*100}%`;
      setTimeout(() => {
        document.getElementById(`${i}_amount`).querySelector('.textFitted').innerText = allGoals[i].currency ? formatCurrency(allGoals[i].progress) : abbreviateNumber(allGoals[i].progress);
        document.getElementById(`${i}_target`).querySelector('.textFitted').innerText = allGoals[i].currency ? formatCurrency(allGoals[i].target) : abbreviateNumber(allGoals[i].target);
      }, 1000)
    };
  });
});
//format Large Numbers
const SI_SYMBOLS = ["", "k", "M", "B", "T", "Q"];
const abbreviateNumber = (number) => {
    if (number < 1000 || !formatLargeNumbers) return number;
    // determines symbol
    const tier = Math.floor(Math.log10(Math.abs(number)) / 3);
    // get suffix and determine scale
    const suffix = SI_SYMBOLS[tier];
    const scale = 10 ** (tier * 3);
    // scale the number
    const scaled = number / scale;
    // format number to 2 decimal places and add suffix
    return scaled.toFixed(formatLargeNumbersDec) + suffix;
};

//format into currency if needed (called from bulidingHTML or updating a value)
const formatCurrency = num => new Intl.NumberFormat(currencySetting[0], {
  style: 'currency',
  currency: currencySetting[1],
  minimumFractionDigits: currencySetting[2],
  maximumFractionDigits: currencySetting[2]
}).format(num);

//build the HTML (called onLoad to build ALL the bars)
function buildBarHTML() {
  //where to hide the bars (if not on front or back... hide it)
  let hiddenContainer = document.getElementById('hiddenBars'),
    fontSizeDefault = {
      minFontSize: 10,
      maxFontSize: maxFontSize
    };
  //create each bar HTML based on the options. Only create the bars needed
  Object.keys(allGoals).forEach((goal, index) => {
    //make a new DOM node
    const goalContainer = document.createElement('div');
    //3.0 'never ending goal' add on
    if (allGoals[goal].neverEndingGoal && allGoals[goal].progress / allGoals[goal].target * 100 > allGoals[goal].neverEndingGoalLimit) allGoals[goal].target = allGoals[goal].progress * (1 + allGoals[goal].neverEndingGoalAdder / 100);
    //copy-pasta HTML code for each bar
    let barStyle = `
    width: ${(allGoals[goal].progress/allGoals[goal].target)*100}%;
    background: linear-gradient(90deg, ${allGoals[goal].barColor1}, ${allGoals[goal].barColor2});
    background-size: 400% 400%;
    animation: barBgShift var(--glowTime) ease-out infinite;
    `,
      barHTML = `
      <div id='${goal}_bar' class='bar' style='${barStyle}'></div>
      <div id='${goal}_amount' class='content contentLeft'></div>
      <div id='${goal}_icon' class='content contentCenter'></div>
      <div id='${goal}_target' class='content contentRight'></div>
      <div id='${goal}_text' class='content goalText'></div>
`;
    //set basic HTML/CSS values, id & class
    goalContainer.setAttribute('id', `${goal}`);
    goalContainer.classList.add('goalContainer');
    goalContainer.innerHTML = barHTML;
    //add to DOM
    document.getElementById(`main`).appendChild(goalContainer);
    //get target locations
    let a = document.getElementById(`${goal}_amount`),
      b = document.getElementById(`${goal}_icon`),
      c = document.getElementById(`${goal}_target`),
      d = document.getElementById(`${goal}_text`),
      //check if value should be a currency type
      goalAmountString = `${allGoals[goal].currency ? formatCurrency(allGoals[goal].target) : abbreviateNumber(allGoals[goal].target)}`;
    //set values from settings/progress
    a.innerText = goalAmountString; //set the amount to max goal to match size;
    //check if icon input is valid fontAweome or switch to text
    let textFitIcon = true;
    if (allGoals[goal].icon.includes('fa-')) b.innerHTML = `<i class="${allGoals[goal].icon.replace(/<i class=\"/g, '').replace(/\">/g, '').replace(/<\/i>/g, '')}"></i>`
    else if (allGoals[goal].icon.includes('https://static-cdn.jtvnw.net/')) {
      b.innerHTML = `<img style="height:var(--iconSize);" src="${allGoals[goal].icon}">`
      textFitIcon = false;
    } else b.innerText = allGoals[goal].icon;
    c.innerText = goalAmountString;
    d.innerText = allGoals[goal].label;
    //rotate stuff?
    if (vertBar) {
      const main = document.getElementById('main')
      a.classList.add('rot90');
      b.classList.add('rot90');
      c.classList.add('rot90');
      main.classList.add('rot270');
    };
    //
    //Font size Override; 4.0.0
    let fontSizeOverride = {
      minFontSize: allGoals[goal].minFontSize,
      maxFontSize: allGoals[goal].minFontSize
    };
    //fit values using textFit CDN (imported in HTML)
    textFit(a, allGoals[goal].minFontSize > 0 ? fontSizeOverride : fontSizeDefault);
    if (textFitIcon) textFit(b, fontSizeDefault);
    textFit(c, allGoals[goal].minFontSize > 0 ? fontSizeOverride : fontSizeDefault);
    textFit(d, fontSizeDefault);
    //update goal progress after sizing to max
    a.querySelector('.textFitted').innerText = `${allGoals[goal].currency ? formatCurrency(allGoals[goal].progress) : abbreviateNumber(allGoals[goal].progress)}`;
    //move into position; front of card, back or in holding area
    if (index == 0) document.getElementById(`${sides[0]}`).appendChild(goalContainer);
    else if (index == 1 && goalList.length === 2) document.getElementById(`${sides[1]}`).appendChild(goalContainer);
    else hiddenContainer.appendChild(goalContainer);
  });
  //start the rotating
  flip();
};
