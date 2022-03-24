/*
Base widget and code from Annedorko's Level-up Goal; Thank you :)
Updated by pjonp:
1.0.0:
- Goal types: Tips, Cheers, Bits, Chats, or combined
- Level amounts are independent
- Platform currency added: cheers, elixer, stars, superchats
- Custom styling, colors, fonts, container positioning
- Level End Sound effects
*/
//Hidden Settings
const goalPeriod = 'goal'; //goal period: 'goal', 'session', 'month', 'total'
//Global Variables
let loaded = false,
  platformCurrency,
  progress = 0, // Track overall progress
  currentLevel = 0, //levels are at index 1
  maxLevel = 5, // Maximum levels to break through
  fields, // Global fieldData Object from widgetOnLoad
  goalTiers = {
    0: {
      amount: 0
    }
  }; //Global Object of the goal tiers; Objects of {amount: Number, audio: Audio/String color: Color} (Color not used); maybe 2.0?

const platformCurrencies = { //swap goal prefix depending on platform
  facebook: 'stars',
  trovo: 'elixir',
  twitch: 'cheer',
  youtube: 'superchat',
};

//** LOAD IN INITIAL WIDGET DATA
window.addEventListener('onWidgetLoad', async obj => {
  platformCurrency = await fetch(`https://api.streamelements.com/kappa/v2/channels/${obj.detail.channel.id}`).then(res => res.json()).then(profile => platformCurrencies[profile.provider.toLowerCase()]).catch(_ => 'cheer'); //platform check
  const data = obj.detail.session.data; //set data
  fields = obj["detail"]["fieldData"]; //set fielddata to global variable
  maxLevel = fields["num_goals"]; //number of goals to cycle through; max 10

  let amountOrCount = goalPeriod === 'goal' ? 'amount' : 'count'; //"goal" uses amount; all others uses count...
  if (fields.goalType === 'combined') { //Check if doing a combined goal; tips+subs
    progress = data[`tip-${goalPeriod}`]['amount']; //base amount is tips, always 'amount'
    progress += (data[`${platformCurrency}-${goalPeriod}`][amountOrCount] * fields.cheerMultiplier) || 0; //add 'cheer' amount multiplied by the factor (if undefined then add 0)...
    progress += (data[`subscriber-${goalPeriod}`][amountOrCount] * fields.subMultiplier) || 0; //add sub amount multiplied by the factor
    progress += (data[`follower-${goalPeriod}`][amountOrCount] * fields.followerMultiplier) || 0; //add sub amount multiplied by the factor
  } else if (fields.goalType === 'chats') progress = 0;
  else {
    const goal = fields.goalType === 'cheer' ? platformCurrency : fields.goalType; //platform check; swap 'cheer' or 'exlier', stars, superchat if needed
    progress = data[`${goal}-${goalPeriod}`].amount || data[`${goal}-${goalPeriod}`].count || 0; //if not combined; check each; ?? still broke in .Live :(
  };
  for (i = 1; i <= maxLevel; i++) { //loop through the Levels in the field data
    const levelAmount = fields[`level_${i}_amount`], //amount for this (i) level
      levelColor = fields[`level_${i}_barColor`], //color for this (i) level; not used
      levelAudio = fields[`level_${i}_audio`], //audio for this (i) level; not used
      previousAmount = goalTiers[i - 1].amount; //check length of goalTiers; if first one the previous is 0;
    goalTiers[i] = {
      amount: levelAmount + previousAmount,
      color: levelColor,
      audio: levelAudio,
    }; //add the level to the global goalTiers Object
  };
  reloadGoal(); //call function to reload;
  loaded = true;
});

//** UPDATE INFO WIDGET INFORMATION on new events
window.addEventListener('onEventReceived', obj => {
  const listener = obj.detail.listener;
  const event = obj["detail"]["event"];
  let adder = 0; //figure out what to add to the goal
  if (listener == 'tip-latest' && (fields.goalType === 'tip' || fields.goalType === 'combined')) adder = event["amount"]; //if a tip, then 1 to 1
  else if (listener == `${platformCurrency}-latest`) {
    if (fields.goalType === 'cheer') adder = event["amount"]; //if cheer only bar then 1 to 1
    else if (fields.goalType === 'combined') adder = event["amount"] * fields.cheerMultiplier; //if combined use the multiplier
  } else if (listener == 'subscriber-latest') {
    if (event.bulkGifted) return; //skip 'user gifted X subs' events (ignore the gifter)
    //Sub tiers not used
    if (fields.goalType === 'subscriber') adder = 1; //if sub only bar then 1 to 1
    else if (fields.goalType === 'combined') adder = fields.subMultiplier; //if combined use the adder
  } else if (listener == 'follower-latest') {
    if (fields.goalType === 'follower') adder = 1; //if follow only bar then 1 to 1
    else if (fields.goalType === 'combined') adder = fields.followerMultiplier; //if combined use the adder
  } else if (listener === 'message') {
    if (fields.goalType === 'chats') adder = 1; //if chat only bar then 1 to 1
    else if (fields.goalType === 'combined') adder = fields.chatsMultiplier; //if combined use the adder
  } else return;
  if (adder > 0) {
    progress += adder; //current progress + event adder
    reloadGoal(); //call reload function
  };
  return;
});


//** CALCULATION FUNCTIONS FOR DONATIONS BAR
function reloadGoal() {
  level = getLevel(progress); //level is index = 1
  label = levelLabel(level, fields);
  const previousGoal = goalTiers[level - 1].amount;
  const progressAtLevel = progress - previousGoal; //if level is >1 then subtract the previous goal to get current progress
  const levelGoal = goalTiers[level].amount - previousGoal; //get current goal; (goal Object is additive, so subtract the previous amount)

  // Get goal segment amount
  $('#endgame .amount').text(fields.prefix + levelGoal.toFixed(fields.decimals));
  // Update goal bar
  $('#loading .amount').text(fields.prefix + progressAtLevel.toFixed(fields.decimals));
  // Set percent
  percent = doPercent(progressAtLevel, levelGoal);
  $('#loading').css({
    'width': percent + '%'
  });
  $('#progress #current_level').text(level);
  $('#progress #current_goal').text(label);
  //do something with the color here...
};

function getLevel(totalDonated) { //get level from the progress
  if (currentLevel > maxLevel) return maxLevel; //max level already acheived;
  // Determine segment
  var level = 1;
  for (var cycle = 1; cycle <= maxLevel; cycle++) {
    if (totalDonated >= goalTiers[cycle].amount) {
      level = cycle + 1;
    };
  };
  if (level > currentLevel) levelUp(level);
  currentLevel = level;
  return level > maxLevel ? maxLevel : level;
};

function levelUp(level) {
  if (level <= maxLevel) document.documentElement.style.setProperty('--barColor', `${goalTiers[level].color.length > 2 ? goalTiers[level].color : "{{default_barColor}}"}`); //update CSS var for barColor
  if (loaded && goalTiers[level - 1].audio) { //widget loaded check; prevent audio on spawn/scene switch
    const heyListen = new Audio(goalTiers[level - 1].audio);
    heyListen.play();
  };
};

function levelLabel(level, fields) {
  var labelName = 'level_' + level;
  var label = fields[labelName];
  return label;
};

function doPercent(donated, goal) {
  var perc = donated / goal;
  var amount = perc * 100;
  if (amount < 10) {
    amount = 10;
  }
  if (amount > 100) {
    amount = 100;
  }
  return amount;
};
