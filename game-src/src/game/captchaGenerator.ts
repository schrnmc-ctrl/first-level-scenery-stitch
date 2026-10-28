import { CaptchaChallenge, CaptchaType, CircuitTile } from '../types';

export const CAPTCHA_CATEGORIES = [
  { key: 'traffic_light', label: 'Traffic Lights', icon: '🚦' },
  { key: 'crosswalk', label: 'Crosswalks', icon: '🦓' },
  { key: 'bicycle', label: 'Bicycles', icon: '🚲' },
  { key: 'hydrant', label: 'Fire Hydrants', icon: '🧯' },
  { key: 'car', label: 'Glitch Cars', icon: '🚗' },
  { key: 'bus', label: 'Buses', icon: '🚌' },
  { key: 'firewall', label: 'Security Firewalls', icon: '🛡️' },
] as const;

export const FUNNY_REASONS = [
  {
    icon: '🚨',
    reason: 'CLOUDFLARE RAY-ID #9942: Suspiciously fast human sprint detected on 5th Avenue!',
  },
  {
    icon: '📦',
    reason: 'PRIME AIR DRONE: Verifying bio-heartbeat before parcel drop-off!',
  },
  {
    icon: '🛒',
    reason: 'LIMITED SNEAKERS DROP: Scalper bot prevention activated at checkout!',
  },
  {
    icon: '🔋',
    reason: 'POWER BANK DRM LOCK: Station demands human verification to charge battery!',
  },
  {
    icon: '🍪',
    reason: 'COOKIE AUDIT WARNING: 47 tracking cookies ingested simultaneously!',
  },
  {
    icon: '📶',
    reason: '5G SPEED THROTTLE: ISP detected automated 4K cat video downloading!',
  },
  {
    icon: '🚦',
    reason: 'CROSSWALK OVERRIDE: Pedestrian button hacked by autonomous delivery rovers!',
  },
  {
    icon: '💳',
    reason: 'CONTACTLESS PAY LOCK: Accidental tap detected while dodging glitch traffic!',
  },
  {
    icon: '🤖',
    reason: 'AI DEFENSE SENTINEL: High-accuracy reflex pattern resembles machine intelligence!',
  },
  {
    icon: '📧',
    reason: 'GMAIL SPAM GUARD: Incoming delivery notification flagged as suspiciously urgent!',
  },
];

export function getRandomReason(): { icon: string; reason: string } {
  return FUNNY_REASONS[Math.floor(Math.random() * FUNNY_REASONS.length)];
}

export function generateRandomCaptcha(preferredType?: CaptchaType): CaptchaChallenge {
  const types: CaptchaType[] = [
    'TRAFFIC_RUNNER',
    'WHACK_A_BOT',
    'CIRCUIT_CONNECT',
    'CATCH_THE_COOKIES',
    'LASER_DEFLECTOR',
    'COLOR_STROOP_TEST',
    'TYPING_CHALLENGE',
    'EMOJI_EQUATION',
    'PATTERN_DRAW',
    'MEMORY_SEQUENCE',
    'SLIDER_PUZZLE',
    'ROTATION_PUZZLE',
    'GRID_SELECT',
    'SLICED_IMAGE',
  ];

  const type = preferredType || types[Math.floor(Math.random() * types.length)];
  const rewards: ('BATTERY' | 'WIFI' | 'SPEED_BOOST')[] = ['BATTERY', 'WIFI', 'SPEED_BOOST'];
  const rewardType = rewards[Math.floor(Math.random() * rewards.length)];
  const { icon: triggerIcon, reason: triggerReason } = getRandomReason();

  let challenge: CaptchaChallenge;

  switch (type) {
    case 'CIRCUIT_CONNECT':
      challenge = generateCircuitConnectCaptcha(rewardType);
      break;
    case 'CATCH_THE_COOKIES':
      challenge = generateCatchCookiesCaptcha(rewardType);
      break;
    case 'LASER_DEFLECTOR':
      challenge = generateLaserDeflectorCaptcha(rewardType);
      break;
    case 'COLOR_STROOP_TEST':
      challenge = generateColorStroopCaptcha(rewardType);
      break;
    case 'TYPING_CHALLENGE':
      challenge = generateTypingChallengeCaptcha(rewardType);
      break;
    case 'EMOJI_EQUATION':
      challenge = generateEmojiEquationCaptcha(rewardType);
      break;
    case 'PATTERN_DRAW':
      challenge = generatePatternDrawCaptcha(rewardType);
      break;
    case 'MEMORY_SEQUENCE':
      challenge = generateMemorySequenceCaptcha(rewardType);
      break;
    case 'TRAFFIC_RUNNER':
      challenge = generateTrafficRunnerCaptcha(rewardType);
      break;
    case 'WHACK_A_BOT':
      challenge = generateWhackABotCaptcha(rewardType);
      break;
    case 'SLICED_IMAGE':
      challenge = generateSlicedImageCaptcha(rewardType);
      break;
    case 'SLIDER_PUZZLE':
      challenge = generateSliderCaptcha(rewardType);
      break;
    case 'ROTATION_PUZZLE':
      challenge = generateRotationCaptcha(rewardType);
      break;
    case 'GRID_SELECT':
    default:
      challenge = generateGridSelectCaptcha(rewardType);
      break;
  }

  challenge.triggerReason = triggerReason;
  challenge.triggerIcon = triggerIcon;
  return challenge;
}

// 1. Circuit Connect
function generateCircuitConnectCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const tiles: CircuitTile[] = [
    { id: 0, type: 'corner', currentRotation: 90, correctRotations: [0] },
    { id: 1, type: 'straight', currentRotation: 90, correctRotations: [0, 180] },
    { id: 2, type: 'corner', currentRotation: 180, correctRotations: [270] },
    { id: 3, type: 'straight', currentRotation: 0, correctRotations: [90, 270] },
  ];

  return {
    type: 'CIRCUIT_CONNECT',
    prompt: 'CIRCUIT BYPASS: Click tiles to align the power line!',
    humorSubtitle: 'Rotate the cyber copper tracks to link the power station to the human receiver.',
    targetCategory: 'circuit',
    circuitConnect: {
      tiles,
      batteryConnected: false,
    },
    timeRemaining: 14,
    rewardType,
  };
}

// 2. Catch the Cookies
function generateCatchCookiesCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  return {
    type: 'CATCH_THE_COOKIES',
    prompt: 'COOKIE HARVEST: Catch 5 real chocolate cookies!',
    humorSubtitle: 'Move your basket with Arrow Keys or Mouse. Dodge red bug spam!',
    targetCategory: 'cookies',
    catchCookies: {
      targetCount: 5,
      timeLimit: 12,
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 3. Laser Deflector
function generateLaserDeflectorCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const targetAngle = 35 + Math.floor(Math.random() * 45); // Target angle ~45 deg
  return {
    type: 'LASER_DEFLECTOR',
    prompt: 'OPTICAL SENSOR: Rotate the mirror to deflect laser into the receptor!',
    humorSubtitle: 'Drag the slider to calibrate the photon beam reflection.',
    targetCategory: 'laser',
    laserDeflector: {
      targetAngle,
      currentAngle: 0,
      tolerance: 6,
      laserColor: '#10b981',
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 4. Color Stroop Test
function generateColorStroopCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const colorPool = [
    { name: 'RED', hex: '#ef4444' },
    { name: 'BLUE', hex: '#3b82f6' },
    { name: 'GREEN', hex: '#10b981' },
    { name: 'YELLOW', hex: '#eab308' },
    { name: 'PURPLE', hex: '#a855f7' },
  ];

  const wordItem = colorPool[Math.floor(Math.random() * colorPool.length)];
  let displayColorItem = colorPool[Math.floor(Math.random() * colorPool.length)];
  while (displayColorItem.name === wordItem.name) {
    displayColorItem = colorPool[Math.floor(Math.random() * colorPool.length)];
  }

  // Options: user must click the DISPLAY COLOR (the ink), not the word text!
  const options = colorPool.map((c) => ({
    label: c.name,
    color: c.hex,
    isCorrect: c.name === displayColorItem.name,
  }));

  return {
    type: 'COLOR_STROOP_TEST',
    prompt: `STROOP REACTION: Select the INK COLOR of the word below!`,
    humorSubtitle: 'Machines read the raw text. Humans can separate visual ink from semantics!',
    targetCategory: 'stroop',
    colorStroop: {
      word: wordItem.name,
      displayColor: displayColorItem.hex,
      options,
    },
    timeRemaining: 10,
    rewardType,
  };
}

// 5. Typing Speed Challenge
function generateTypingChallengeCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const phrases = [
    'I AM A LIVING HUMAN',
    'NOT A ROAMING BOT',
    'VERIFIED BIO CARBON',
    'DELIVER THE PACKAGE',
    'SPEEDY WI-FI CHARGE',
  ];
  const targetPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  return {
    type: 'TYPING_CHALLENGE',
    prompt: `TYPING VELOCITY: Type the exact phrase before time expires!`,
    humorSubtitle: 'Keyboard latency analysis ensures organic thumb/finger articulation.',
    targetCategory: 'typing',
    typingChallenge: {
      targetPhrase,
      timeLimit: 11,
    },
    timeRemaining: 11,
    rewardType,
  };
}

// 6. Emoji Visual Equation
function generateEmojiEquationCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const item1Val = 2 + Math.floor(Math.random() * 5); // e.g. 4
  const item2Val = 1 + Math.floor(Math.random() * 6); // e.g. 3
  const eq1 = `${item1Val + item1Val}`; // 8
  const eq2 = `${item1Val + item2Val}`; // 7

  const items = [
    { emoji: '🚗', name: 'Car' },
    { emoji: '🚲', name: 'Bicycle' },
    { emoji: '🚦', name: 'Traffic Light' },
    { emoji: '📦', name: 'Package' },
  ];
  const item1 = { ...items[0], value: item1Val };
  const item2 = { ...items[1], value: item2Val };

  const equationText = `${item1.emoji} + ${item1.emoji} = ${eq1}\n${item1.emoji} + ${item2.emoji} = ${eq2}\nWhat is ${item2.emoji} ?`;
  const correctAnswer = item2Val;

  const options = [correctAnswer];
  while (options.length < 4) {
    const wrong = Math.max(1, correctAnswer + (Math.floor(Math.random() * 5) - 2));
    if (!options.includes(wrong)) options.push(wrong);
  }
  options.sort(() => Math.random() - 0.5);

  return {
    type: 'EMOJI_EQUATION',
    prompt: `VISUAL LOGIC: Solve the Cyber Equation!`,
    humorSubtitle: 'Standard elementary arithmetic calibration for verified bipeds.',
    targetCategory: 'emoji',
    emojiEquation: {
      equation: equationText,
      options,
      correctAnswer,
      item1,
      item2,
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 7. Pattern Draw
function generatePatternDrawCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const patterns = [
    {
      name: 'Firewall Gate',
      nodes: [0, 3, 6, 7, 8, 5, 2],
      description: 'Follow the Gateway Arch: Node 1 ➔ 4 ➔ 7 ➔ 8 ➔ 9 ➔ 6 ➔ 3',
    },
    {
      name: 'Z-Wave Pattern',
      nodes: [0, 1, 2, 4, 6, 7, 8],
      description: 'Follow the Zig-Zag: Node 1 ➔ 2 ➔ 3 ➔ 5 ➔ 7 ➔ 8 ➔ 9',
    },
    {
      name: 'Cyber Triangle',
      nodes: [1, 6, 8, 4],
      description: 'Follow the Prism: Node 2 ➔ 7 ➔ 9 ➔ 5',
    },
    {
      name: 'Diagonal Check',
      nodes: [0, 4, 8, 5, 2],
      description: 'Follow the Mark: Node 1 ➔ 5 ➔ 9 ➔ 6 ➔ 3',
    },
  ];
  const choice = patterns[Math.floor(Math.random() * patterns.length)];

  return {
    type: 'PATTERN_DRAW',
    prompt: `PATTERN UNLOCK: Connect the nodes for ${choice.name}`,
    humorSubtitle: choice.description,
    targetCategory: 'pattern',
    patternDraw: {
      targetPattern: choice.nodes,
      nodeCount: 9,
      patternName: choice.name,
      description: choice.description,
    },
    timeRemaining: 14,
    rewardType,
  };
}

// 8. Memory Sequence
function generateMemorySequenceCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const sequence = [
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
  ];

  return {
    type: 'MEMORY_SEQUENCE',
    prompt: 'Firewall Sequence: Watch the light pulses & repeat the order',
    humorSubtitle: 'Biological short-term memory verification matrix.',
    targetCategory: 'memory',
    memorySequence: {
      sequence,
      flashSpeed: 450,
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 9. Traffic Runner
function generateTrafficRunnerCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  return {
    type: 'TRAFFIC_RUNNER',
    prompt: 'CROSSWALK RUNNER: Cross the street without getting hit!',
    humorSubtitle: 'Direct your character across active traffic lanes to the green sidewalk.',
    targetCategory: 'crosswalk',
    trafficRunner: {
      playerLane: 0,
      cars: [
        { lane: 1, x: 20, speed: 200, color: '#facc15' },
        { lane: 1, x: 230, speed: 200, color: '#ef4444' },
        { lane: 2, x: 120, speed: -240, color: '#38bdf8' },
        { lane: 2, x: 340, speed: -240, color: '#10b981' },
      ],
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 10. Whack-a-Bot
function generateWhackABotCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  return {
    type: 'WHACK_A_BOT',
    prompt: 'HUMAN REFLEX TEST: Tap 5 Spam-Bots before time runs out!',
    humorSubtitle: 'Rapidly neutralize glitch spam bots popping out of security holes.',
    targetCategory: 'bot',
    whackABot: {
      targetsRequired: 5,
      currentHits: 0,
    },
    timeRemaining: 10,
    rewardType,
  };
}

// 11. Grid Select
function generateGridSelectCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const targetIndex = Math.floor(Math.random() * CAPTCHA_CATEGORIES.length);
  const target = CAPTCHA_CATEGORIES[targetIndex];

  const targetCount = 3 + Math.floor(Math.random() * 2);
  const targetIndices = new Set<number>();
  while (targetIndices.size < targetCount) {
    targetIndices.add(Math.floor(Math.random() * 9));
  }

  const otherCategories = CAPTCHA_CATEGORIES.filter((c) => c.key !== target.key);

  const grid = Array.from({ length: 9 }, (_, i) => {
    const isTarget = targetIndices.has(i);
    const category = isTarget
      ? target.key
      : otherCategories[Math.floor(Math.random() * otherCategories.length)].key;

    return {
      id: i,
      imageType: category as any,
      isTarget,
      selected: false,
    };
  });

  const funnyQuotes = [
    'If none, do you even live in this cyber city?',
    'Select all images. Yes, even the one with 2% asphalt.',
    'Only a real human would know what this is.',
    'Please do not train our autonomous delivery drones incorrectly.',
  ];

  return {
    type: 'GRID_SELECT',
    prompt: `Select all squares with ${target.label}`,
    humorSubtitle: funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)],
    targetCategory: target.key,
    grid,
    timeRemaining: 12,
    rewardType,
  };
}

// 12. Sliced Image
function generateSlicedImageCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const themes: ('BUS_ON_STREET' | 'TRAFFIC_LIGHT_POLE' | 'CROSSWALK_CROSSING' | 'BICYCLE_RACK')[] = [
    'BUS_ON_STREET',
    'TRAFFIC_LIGHT_POLE',
    'CROSSWALK_CROSSING',
    'BICYCLE_RACK',
  ];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  let prompt = 'Select all squares containing parts of the Bus';
  let targetIndices: number[] = [];
  let tileDefs: { label: string; icon: string; isTarget: boolean }[] = [];

  if (theme === 'BUS_ON_STREET') {
    prompt = 'Select all squares containing parts of the Bus';
    targetIndices = [5, 6, 7, 9, 10, 11, 13, 14];
    tileDefs = [
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Building', icon: '🏢', isTarget: false },
      { label: 'Streetlamp', icon: '💡', isTarget: false },

      { label: 'Tree', icon: '🌳', isTarget: false },
      { label: 'Bus Roof', icon: '🚌', isTarget: true },
      { label: 'Bus Window', icon: '🪟', isTarget: true },
      { label: 'Bus Front', icon: '🚌', isTarget: true },

      { label: 'Sidewalk', icon: '🧱', isTarget: false },
      { label: 'Bus Door', icon: '🚪', isTarget: true },
      { label: 'Bus Body', icon: '🚌', isTarget: true },
      { label: 'Bus Lamp', icon: '💡', isTarget: true },

      { label: 'Road', icon: '🛣️', isTarget: false },
      { label: 'Bus Wheel', icon: '🛞', isTarget: true },
      { label: 'Bus Wheel', icon: '🛞', isTarget: true },
      { label: 'Road', icon: '🛣️', isTarget: false },
    ];
  } else if (theme === 'TRAFFIC_LIGHT_POLE') {
    prompt = 'Select all squares containing the Traffic Light Signal';
    targetIndices = [2, 6, 10, 14];
    tileDefs = [
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Cloud', icon: '☁️', isTarget: false },
      { label: 'Red Signal', icon: '🔴', isTarget: true },
      { label: 'Building', icon: '🏢', isTarget: false },

      { label: 'Tree', icon: '🌳', isTarget: false },
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Yellow Signal', icon: '🟡', isTarget: true },
      { label: 'Signpost', icon: '🪧', isTarget: false },

      { label: 'Sidewalk', icon: '🧱', isTarget: false },
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Green Signal', icon: '🟢', isTarget: true },
      { label: 'Firewall', icon: '🛡️', isTarget: false },

      { label: 'Road', icon: '🛣️', isTarget: false },
      { label: 'Curb', icon: '🧱', isTarget: false },
      { label: 'Signal Pole', icon: '💈', isTarget: true },
      { label: 'Road', icon: '🛣️', isTarget: false },
    ];
  } else if (theme === 'CROSSWALK_CROSSING') {
    prompt = 'Select all squares containing the Crosswalk zebra stripes';
    targetIndices = [8, 9, 10, 11, 12, 13, 14, 15];
    tileDefs = [
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Building', icon: '🏢', isTarget: false },
      { label: 'Traffic Light', icon: '🚦', isTarget: false },
      { label: 'Sky', icon: '☁️', isTarget: false },

      { label: 'Sidewalk', icon: '🧱', isTarget: false },
      { label: 'Pedestrian', icon: '🚶', isTarget: false },
      { label: 'Curb', icon: '🧱', isTarget: false },
      { label: 'Tree', icon: '🌳', isTarget: false },

      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },

      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
      { label: 'Zebra Stripe', icon: '🦓', isTarget: true },
    ];
  } else {
    prompt = 'Select all squares containing parts of the Bicycle';
    targetIndices = [5, 6, 9, 10];
    tileDefs = [
      { label: 'Sky', icon: '☁️', isTarget: false },
      { label: 'Wall', icon: '🧱', isTarget: false },
      { label: 'Building', icon: '🏢', isTarget: false },
      { label: 'Tree', icon: '🌳', isTarget: false },

      { label: 'Sidewalk', icon: '🧱', isTarget: false },
      { label: 'Handlebars', icon: '🚲', isTarget: true },
      { label: 'Bike Frame', icon: '🚲', isTarget: true },
      { label: 'Sign', icon: '🪧', isTarget: false },

      { label: 'Sidewalk', icon: '🧱', isTarget: false },
      { label: 'Front Wheel', icon: '🛞', isTarget: true },
      { label: 'Rear Wheel', icon: '🛞', isTarget: true },
      { label: 'Curb', icon: '🧱', isTarget: false },

      { label: 'Road', icon: '🛣️', isTarget: false },
      { label: 'Road', icon: '🛣️', isTarget: false },
      { label: 'Road', icon: '🛣️', isTarget: false },
      { label: 'Road', icon: '🛣️', isTarget: false },
    ];
  }

  const tiles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    row: Math.floor(i / 4),
    col: i % 4,
    isTarget: tileDefs[i]?.isTarget || targetIndices.includes(i),
    selected: false,
    label: tileDefs[i]?.label,
    icon: tileDefs[i]?.icon,
  }));

  return {
    type: 'SLICED_IMAGE',
    prompt,
    humorSubtitle: 'Select only the squares containing target slices.',
    targetCategory: theme,
    slicedImage: {
      theme,
      totalRows: 4,
      totalCols: 4,
      targetIndices,
      tiles,
    },
    timeRemaining: 14,
    rewardType,
  };
}

// 13. Slider Puzzle
function generateSliderCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const targetPosition = 30 + Math.floor(Math.random() * 50);
  return {
    type: 'SLIDER_PUZZLE',
    prompt: 'Slide the puzzle piece to complete the security key',
    humorSubtitle: 'Drag smoothly like a carbon-based lifeform with organic hands.',
    targetCategory: 'slider',
    sliderPuzzle: {
      targetPosition,
      currentPosition: 5,
      tolerance: 6.0,
      backgroundTheme: 'CITY_GRID',
    },
    timeRemaining: 12,
    rewardType,
  };
}

// 14. Rotation Puzzle
function generateRotationCaptcha(rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST'): CaptchaChallenge {
  const items = [
    { icon: '🚗', label: 'Glitch Car' },
    { icon: '🚲', label: 'Bicycle' },
    { icon: '🚦', label: 'Traffic Light' },
    { icon: '📦', label: 'Urgent Delivery Package' },
  ];
  const item = items[Math.floor(Math.random() * items.length)];
  const wrongAngles = [90, 180, 270];
  const initialAngle = wrongAngles[Math.floor(Math.random() * wrongAngles.length)];

  return {
    type: 'ROTATION_PUZZLE',
    prompt: `Rotate the ${item.label} upright (0°)`,
    humorSubtitle: 'Ensure the orientation is physically grounded.',
    targetCategory: 'rotation',
    rotationPuzzle: {
      targetAngle: 0,
      initialAngle,
      currentAngle: initialAngle,
      icon: item.icon,
      label: item.label,
    },
    timeRemaining: 11,
    rewardType,
  };
}
