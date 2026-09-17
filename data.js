/* VaultBreak — game data
 * Everything gameplay-numeric lives here so new content can be added
 * without touching engine code. Pure data + a few generator helpers.
 */
(function (APP) {
  'use strict';

  // ---------------------------------------------------------------------
  // RARITIES — single source of truth for color, glow and value weight.
  // Odds shown to the player are always derived from these same weights
  // used by the RNG (see systemsCore.rollRarity) — nothing is hidden.
  // ---------------------------------------------------------------------
  const RARITIES = [
    { key: 'common',     label: 'Common',     order: 0, color: '#8b93a4', glow: 'rgba(139,147,164,0.5)',  valueMult: 1,    dust: 1 },
    { key: 'uncommon',   label: 'Uncommon',   order: 1, color: '#46c26f', glow: 'rgba(70,194,111,0.55)',  valueMult: 3,    dust: 3 },
    { key: 'rare',       label: 'Rare',       order: 2, color: '#2f9fef', glow: 'rgba(47,159,239,0.55)',  valueMult: 9,    dust: 10 },
    { key: 'epic',       label: 'Epic',       order: 3, color: '#b34bf0', glow: 'rgba(179,75,240,0.6)',   valueMult: 27,   dust: 35 },
    { key: 'legendary',  label: 'Legendary',  order: 4, color: '#f0932f', glow: 'rgba(240,147,47,0.65)',  valueMult: 90,   dust: 120 },
    { key: 'mythic',     label: 'Mythic',     order: 5, color: '#f0397e', glow: 'rgba(240,57,126,0.7)',   valueMult: 300,  dust: 450 },
    { key: 'ancient',    label: 'Ancient',    order: 6, color: '#29e0d1', glow: 'rgba(41,224,209,0.8)',   valueMult: 1200, dust: 1800 },
    { key: 'contraband', label: 'Contraband', order: 7, color: '#ffd23f', glow: 'rgba(255,90,60,0.85)',   valueMult: 5000, dust: 8000, prismatic: true, special: true },
  ];
  const RARITY_BY_KEY = Object.fromEntries(RARITIES.map(r => [r.key, r]));

  // ---------------------------------------------------------------------
  // WEAPON CATEGORIES — drives which procedural silhouette is drawn.
  // ---------------------------------------------------------------------
  const CATEGORIES = {
    rifle:   { label: 'Rifle' },
    smg:     { label: 'SMG' },
    pistol:  { label: 'Pistol' },
    shotgun: { label: 'Shotgun' },
    lmg:     { label: 'LMG' },
    sniper:  { label: 'Sniper' },
    blade:   { label: 'Blade' },
  };

  // ---------------------------------------------------------------------
  // WEAPONS — original fictional armory, no copyrighted names/designs.
  // ---------------------------------------------------------------------
  const WEAPONS = [
    { id: 'ar47',      name: 'AR-47',           cat: 'rifle',   base: 22 },
    { id: 'nova',      name: 'Nova Rifle',      cat: 'rifle',   base: 24 },
    { id: 'phantom',   name: 'Phantom Rifle',   cat: 'rifle',   base: 26 },
    { id: 'spectre',   name: 'Spectre SMG',     cat: 'smg',     base: 14 },
    { id: 'viper9',    name: 'Viper-9',         cat: 'smg',     base: 15 },
    { id: 'comet',     name: 'Comet SMG',       cat: 'smg',     base: 13 },
    { id: 'ghost',     name: 'Ghost Pistol',    cat: 'pistol',  base: 8 },
    { id: 'talon',     name: 'Talon Sidearm',   cat: 'pistol',  base: 9 },
    { id: 'reaper',    name: 'Reaper Shotgun',  cat: 'shotgun', base: 18 },
    { id: 'widow',     name: 'Widowmaker',      cat: 'shotgun', base: 19 },
    { id: 'titanlmg',  name: 'Titan LMG',       cat: 'lmg',     base: 27 },
    { id: 'juggernaut',name: 'Juggernaut LMG',  cat: 'lmg',     base: 29 },
    { id: 'vectorx',   name: 'Vector-X',        cat: 'sniper',  base: 30 },
    { id: 'longshot',  name: 'Longshot MK2',    cat: 'sniper',  base: 32 },
    // Blades only ever roll from the Contraband slot — the "special item" pulls.
    { id: 'tacblade',  name: 'Tactical Blade',  cat: 'blade',   base: 38 },
    { id: 'shadowblade',name:'Shadow Blade',    cat: 'blade',   base: 40 },
    { id: 'energyblade',name:'Energy Blade',    cat: 'blade',   base: 42 },
    { id: 'plasmaknife',name:'Plasma Knife',    cat: 'blade',   base: 44 },
    { id: 'voidblade', name: 'Void Blade',      cat: 'blade',   base: 46 },
    { id: 'goldblade', name: 'Golden Blade',    cat: 'blade',   base: 50 },
    { id: 'ancientdagger', name: 'Ancient Dagger', cat: 'blade', base: 55 },
  ];
  const WEAPON_BY_ID = Object.fromEntries(WEAPONS.map(w => [w.id, w]));

  // ---------------------------------------------------------------------
  // SKIN THEMES — each theme belongs to exactly one rarity tier and maps
  // to a procedural pattern generator (see svg.js).
  // ---------------------------------------------------------------------
  const THEMES = [
    { id: 'static',    name: 'Static',       rarity: 'common',     mult: 1.00, pattern: 'brushed' },
    { id: 'urban',     name: 'Urban',        rarity: 'common',     mult: 1.15, pattern: 'camo' },
    { id: 'crimson',   name: 'Crimson',      rarity: 'uncommon',   mult: 1.15, pattern: 'stripe' },
    { id: 'toxic',     name: 'Toxic',        rarity: 'uncommon',   mult: 1.30, pattern: 'splatter' },
    { id: 'frostbite', name: 'Frostbite',    rarity: 'rare',       mult: 1.10, pattern: 'crystal' },
    { id: 'cyberpunk', name: 'Cyberpunk',    rarity: 'rare',       mult: 1.25, pattern: 'circuit' },
    { id: 'neoncircuit',name:'Neon Circuit', rarity: 'epic',       mult: 1.10, pattern: 'circuitglow' },
    { id: 'inferno',   name: 'Inferno',      rarity: 'epic',       mult: 1.30, pattern: 'flame' },
    { id: 'void',      name: 'Void',         rarity: 'legendary',  mult: 1.05, pattern: 'nebula' },
    { id: 'galaxy',    name: 'Galaxy',       rarity: 'legendary',  mult: 1.25, pattern: 'galaxy' },
    { id: 'plasma',    name: 'Plasma',       rarity: 'mythic',     mult: 1.10, pattern: 'plasma' },
    { id: 'royalgold', name: 'Royal Gold',   rarity: 'mythic',     mult: 1.35, pattern: 'filigree' },
    { id: 'prismatic', name: 'Prismatic',    rarity: 'ancient',    mult: 1.30, pattern: 'holo' },
    { id: 'doomsday',  name: 'Doomsday',     rarity: 'contraband', mult: 1.40, pattern: 'obsidian' },
  ];
  const THEME_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const THEMES_BY_RARITY = RARITIES.reduce((acc, r) => {
    acc[r.key] = THEMES.filter(t => t.rarity === r.key);
    return acc;
  }, {});

  // ---------------------------------------------------------------------
  // SKIN CATALOG — generated from weapons x themes. Guns pair with every
  // non-contraband theme that matches their category range; blades pair
  // only with the Contraband theme. This is what makes the catalog
  // "data-driven": add one weapon or theme and dozens of new skins exist.
  // ---------------------------------------------------------------------
  function buildSkins() {
    const skins = [];
    WEAPONS.forEach(w => {
      if (w.cat === 'blade') {
        THEMES_BY_RARITY.contraband.forEach(t => {
          skins.push({ id: w.id + '__' + t.id, weaponId: w.id, themeId: t.id, rarity: t.rarity });
        });
      } else {
        THEMES.filter(t => t.rarity !== 'contraband').forEach(t => {
          skins.push({ id: w.id + '__' + t.id, weaponId: w.id, themeId: t.id, rarity: t.rarity });
        });
      }
    });
    return skins;
  }
  const SKINS = buildSkins();
  const SKIN_BY_ID = Object.fromEntries(SKINS.map(s => [s.id, s]));
  const SKINS_BY_RARITY = RARITIES.reduce((acc, r) => {
    acc[r.key] = SKINS.filter(s => s.rarity === r.key);
    return acc;
  }, {});

  // Condition / float bands, in the exact wording requested.
  const WEAR_BANDS = [
    { key: 'ff', label: 'Factory Fresh', max: 0.07 },
    { key: 'mw', label: 'Minimal Wear',  max: 0.15 },
    { key: 'ft', label: 'Field Tested',  max: 0.38 },
    { key: 'ww', label: 'Well Worn',     max: 0.45 },
    { key: 'bs', label: 'Battle Scarred',max: 1.001 },
  ];
  function wearForFloat(f) {
    return WEAR_BANDS.find(b => f <= b.max) || WEAR_BANDS[WEAR_BANDS.length - 1];
  }
  // Lower float = crisper/rarer looking = worth more, mirroring the brief.
  function floatValueFactor(f) {
    return 1.35 - f * 0.6; // f=0 -> 1.35x, f=1 -> 0.75x
  }

  function computeBaseValue(weaponId, themeId) {
    const w = WEAPON_BY_ID[weaponId];
    const t = THEME_BY_ID[themeId];
    const r = RARITY_BY_KEY[t.rarity];
    return w.base * r.valueMult * t.mult;
  }

  // ---------------------------------------------------------------------
  // CASES — price, unlock level, and an odds table (weights, NOT locked
  // percentages) that is the single source used both to roll AND to
  // display odds, so the two can never drift apart.
  // ---------------------------------------------------------------------
  const ALL_CATS = ['rifle', 'smg', 'pistol', 'shotgun', 'lmg', 'sniper'];
  const CASES = [
    {
      id: 'starter', name: 'Starter Case', tagline: 'Everyone starts somewhere.',
      price: 50, unlockLevel: 1, weapons: ALL_CATS,
      odds: [['common', 62], ['uncommon', 29], ['rare', 8], ['epic', 1]],
    },
    {
      id: 'tactical', name: 'Tactical Case', tagline: 'Standard-issue, dependable pulls.',
      price: 150, unlockLevel: 3, weapons: ALL_CATS,
      odds: [['common', 56], ['uncommon', 31], ['rare', 11], ['epic', 2]],
    },
    {
      id: 'shadow', name: 'Shadow Case', tagline: 'Favors close-quarters loadouts.',
      price: 500, unlockLevel: 6, weapons: ['smg', 'pistol', 'shotgun'],
      odds: [['common', 50], ['uncommon', 30], ['rare', 14], ['epic', 5], ['legendary', 1]],
    },
    {
      id: 'neon', name: 'Neon Case', tagline: 'The circuits are always humming.',
      price: 1500, unlockLevel: 10, weapons: ALL_CATS,
      odds: [['common', 45], ['uncommon', 30], ['rare', 16], ['epic', 7], ['legendary', 1.8], ['mythic', 0.2]],
    },
    {
      id: 'phantom', name: 'Phantom Case', tagline: 'Quiet on the outside, loud inside.',
      price: 5000, unlockLevel: 15, weapons: ALL_CATS,
      odds: [['common', 40], ['uncommon', 28], ['rare', 18], ['epic', 10], ['legendary', 3.5], ['mythic', 0.5]],
    },
    {
      id: 'eclipse', name: 'Eclipse Case', tagline: 'Something rare is always in shadow.',
      price: 15000, unlockLevel: 20, weapons: ALL_CATS,
      odds: [['common', 35], ['uncommon', 27], ['rare', 19], ['epic', 13], ['legendary', 5], ['mythic', 0.9], ['ancient', 0.1]],
    },
    {
      id: 'royal', name: 'Royal Case', tagline: 'Heavy-hitting favorites, gilded finishes.',
      price: 50000, unlockLevel: 27, weapons: ['rifle', 'lmg', 'sniper'],
      odds: [['common', 30], ['uncommon', 25], ['rare', 20], ['epic', 15], ['legendary', 7], ['mythic', 2.5], ['ancient', 0.4], ['contraband', 0.1]],
    },
    {
      id: 'inferno', name: 'Inferno Case', tagline: 'Burns through the odds fast.',
      price: 150000, unlockLevel: 35, weapons: ALL_CATS,
      odds: [['common', 25], ['uncommon', 24], ['rare', 21], ['epic', 17], ['legendary', 9], ['mythic', 3.4], ['ancient', 0.5], ['contraband', 0.1]],
    },
    {
      id: 'quantum', name: 'Quantum Case', tagline: 'Every outcome exists until you open it.',
      price: 500000, unlockLevel: 45, weapons: ALL_CATS,
      odds: [['common', 20], ['uncommon', 22], ['rare', 21], ['epic', 19], ['legendary', 11], ['mythic', 5], ['ancient', 1.7], ['contraband', 0.3]],
    },
    {
      id: 'titan', name: 'Titan Case', tagline: 'Only the biggest loadouts qualify.',
      price: 2000000, unlockLevel: 55, weapons: ['rifle', 'lmg', 'sniper'],
      odds: [['common', 15], ['uncommon', 19], ['rare', 20], ['epic', 20], ['legendary', 14], ['mythic', 8], ['ancient', 3.5], ['contraband', 0.5]],
    },
    {
      id: 'mythic', name: 'Mythic Case', tagline: 'The vault gets nervous around this one.',
      price: 10000000, unlockLevel: 70, weapons: ALL_CATS,
      odds: [['common', 10], ['uncommon', 15], ['rare', 18], ['epic', 22], ['legendary', 18], ['mythic', 12], ['ancient', 4.3], ['contraband', 0.7]],
    },
    {
      id: 'blackmarket', name: 'Black Market Case', tagline: 'No questions asked. No refunds either.',
      price: 50000000, unlockLevel: 90, weapons: ALL_CATS,
      odds: [['common', 5], ['uncommon', 10], ['rare', 15], ['epic', 22], ['legendary', 22], ['mythic', 17], ['ancient', 7], ['contraband', 2]],
    },
  ];
  const CASE_BY_ID = Object.fromEntries(CASES.map(c => [c.id, c]));

  // A prestige-only case: bought with Prestige Points, always Legendary+.
  const PRESTIGE_CASE = {
    id: 'prestige', name: 'Veteran Case', tagline: 'Only available after your first Prestige.',
    priceType: 'prestige', price: 5, unlockLevel: 1, weapons: ALL_CATS,
    odds: [['legendary', 55], ['mythic', 30], ['ancient', 12], ['contraband', 3]],
  };

  function oddsTotal(caseDef) {
    return caseDef.odds.reduce((s, [, w]) => s + w, 0);
  }
  function oddsPercent(caseDef) {
    const total = oddsTotal(caseDef);
    return caseDef.odds.map(([key, w]) => ({ key, weight: w, pct: (w / total) * 100 }));
  }

  // ---------------------------------------------------------------------
  // RANKS
  // ---------------------------------------------------------------------
  const RANKS = [
    { key: 'recruit',    label: 'Recruit',    minLevel: 1 },
    { key: 'operator',   label: 'Operator',   minLevel: 10 },
    { key: 'specialist', label: 'Specialist', minLevel: 20 },
    { key: 'elite',      label: 'Elite',      minLevel: 35 },
    { key: 'master',     label: 'Master',     minLevel: 50 },
    { key: 'legend',     label: 'Legend',     minLevel: 75 },
    { key: 'titan',      label: 'Titan',      minLevel: 100 },
  ];
  function rankForLevel(level) {
    let best = RANKS[0];
    for (const r of RANKS) if (level >= r.minLevel) best = r;
    return best;
  }

  function xpForLevel(level) {
    return Math.floor(40 * Math.pow(level, 1.55));
  }

  // ---------------------------------------------------------------------
  // UPGRADES
  // ---------------------------------------------------------------------
  const UPGRADES = [
    { id: 'trigger',   name: 'Sharper Trigger',    desc: 'Increases cash earned per WORK click.',
      baseCost: 25, growth: 1.16, maxLevel: 60, perLevel: 2,
      effectLabel: lvl => `+$${(lvl * 2).toLocaleString()} per click` },
    { id: 'contracts', name: 'Contract Work',      desc: 'Generates steady passive income every second.',
      baseCost: 100, growth: 1.18, maxLevel: 60, perLevel: 1.5,
      effectLabel: lvl => `+$${(lvl * 1.5).toLocaleString()}/sec` },
    { id: 'overtime',  name: 'Overtime Protocol',  desc: 'Multiplies all passive income.',
      baseCost: 5000, growth: 1.22, maxLevel: 40, perLevel: 0.08,
      effectLabel: lvl => `+${Math.round(lvl * 8)}% passive income` },
    { id: 'training',  name: 'Field Training',     desc: 'Increases XP earned from clicking and cases.',
      baseCost: 150, growth: 1.15, maxLevel: 50, perLevel: 0.05,
      effectLabel: lvl => `+${Math.round(lvl * 5)}% XP gain` },
    { id: 'payouts',   name: 'Mission Payouts',    desc: 'Increases cash and XP rewards from missions.',
      baseCost: 300, growth: 1.17, maxLevel: 50, perLevel: 0.06,
      effectLabel: lvl => `+${Math.round(lvl * 6)}% mission rewards` },
    { id: 'broker',    name: "Broker's Discount",  desc: 'Reduces the price of every case (max 30%).',
      baseCost: 1000, growth: 1.25, maxLevel: 20, perLevel: 0.015,
      effectLabel: lvl => `-${Math.min(30, Math.round(lvl * 1.5))}% case price` },
    { id: 'instincts', name: 'Market Instincts',   desc: 'Increases cash received when selling items.',
      baseCost: 800, growth: 1.20, maxLevel: 30, perLevel: 0.02,
      effectLabel: lvl => `+${Math.round(lvl * 2)}% sell value` },
  ];
  const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
  function upgradeCost(upg, level) {
    return Math.round(upg.baseCost * Math.pow(upg.growth, level));
  }

  // ---------------------------------------------------------------------
  // MISSIONS — templates. Exactly 5 are active at any time; claiming one
  // immediately rolls a fresh mission so there's always something next.
  // ---------------------------------------------------------------------
  const MISSION_TEMPLATES = [
    { id: 'open_cases',   type: 'open_cases',   base: 5,    text: n => `Open ${n} cases`,                         rewardCash: 200,  rewardXp: 50 },
    { id: 'earn_cash',    type: 'earn_cash',    base: 2000, text: n => `Earn $${n.toLocaleString()}`,             rewardCash: 300,  rewardXp: 60 },
    { id: 'sell_items',   type: 'sell_items',   base: 3,    text: n => `Sell ${n} item${n > 1 ? 's' : ''}`,       rewardCash: 250,  rewardXp: 50 },
    { id: 'find_rare',    type: 'find_rare',    base: 2,    text: n => `Find ${n} Rare+ item${n > 1 ? 's' : ''}`, rewardCash: 400,  rewardXp: 80 },
    { id: 'find_epic',    type: 'find_epic',    base: 1,    text: n => `Find ${n} Epic+ item${n > 1 ? 's' : ''}`, rewardCash: 800,  rewardXp: 150 },
    { id: 'find_legendary',type:'find_legendary',base: 1,   text: () => `Find a Legendary+ item`,                 rewardCash: 2000, rewardXp: 400 },
    { id: 'market_trade',  type:'market_trade', base: 3,    text: n => `Trade ${n} items on the Market`,          rewardCash: 350,  rewardXp: 70 },
    { id: 'click_work',    type:'click_work',   base: 100,  text: n => `Click WORK ${n} times`,                   rewardCash: 150,  rewardXp: 40 },
    { id: 'open_premium',  type:'open_premium', base: 1,    text: n => `Open ${n} case${n > 1 ? 's' : ''} worth $1,000+`, rewardCash: 600, rewardXp: 120 },
    { id: 'spend_cash',    type:'spend_cash',   base: 1500, text: n => `Spend $${n.toLocaleString()} on upgrades or cases`, rewardCash: 300, rewardXp: 60 },
  ];

  // ---------------------------------------------------------------------
  // DAILY REWARDS — 7 day cycle, repeats.
  // ---------------------------------------------------------------------
  const DAILY_REWARDS = [
    { day: 1, type: 'cash', amount: 100,  label: '$100' },
    { day: 2, type: 'xp',   amount: 150,  label: '150 XP' },
    { day: 3, type: 'case', caseId: 'starter', label: 'Starter Case' },
    { day: 4, type: 'cash', amount: 750,  label: '$750' },
    { day: 5, type: 'case', caseId: 'shadow',  label: 'Shadow Case' },
    { day: 6, type: 'case', caseId: 'phantom', label: 'Phantom Case' },
    { day: 7, type: 'cash', amount: 5000, label: '$5,000 Jackpot' },
  ];

  // ---------------------------------------------------------------------
  // ACHIEVEMENTS — id, name, desc, test(stats) -> bool
  // ---------------------------------------------------------------------
  const ACHIEVEMENTS = [
    { id: 'first_case',  name: 'First Case',    desc: 'Open your first case.',            test: s => s.casesOpened >= 1 },
    { id: 'first_skin',  name: 'First Skin',    desc: 'Obtain your first skin.',           test: s => s.itemsObtained >= 1 },
    { id: 'case_reg',    name: 'Regular',       desc: 'Open 100 cases.',                   test: s => s.casesOpened >= 100 },
    { id: 'case_addict', name: 'Case Addict',   desc: 'Open 1,000 cases.',                 test: s => s.casesOpened >= 1000 },
    { id: 'case_fanatic',name: 'Case Fanatic',  desc: 'Open 10,000 cases.',                test: s => s.casesOpened >= 10000 },
    { id: 'lucky',       name: 'Lucky',         desc: 'Obtain a Legendary item.',          test: s => s.rarityCounts.legendary > 0 },
    { id: 'jackpot',     name: 'Jackpot',       desc: 'Obtain a Mythic item.',             test: s => s.rarityCounts.mythic > 0 },
    { id: 'ancient_find',name: 'Ancient Find',  desc: 'Obtain an Ancient item.',           test: s => s.rarityCounts.ancient > 0 },
    { id: 'contraband_find', name: 'Contraband!', desc: 'Pull a special Contraband item.', test: s => s.rarityCounts.contraband > 0 },
    { id: 'collector',   name: 'Collector',     desc: 'Own 50 unique skins at once.',      test: (s, st) => uniqueOwned(st) >= 50 },
    { id: 'hoarder',     name: 'Hoarder',       desc: 'Own 200 items at once.',            test: (s, st) => st.inventory.length >= 200 },
    { id: 'museum',      name: 'Museum',        desc: 'Own 500 items at once.',            test: (s, st) => st.inventory.length >= 500 },
    { id: 'thousandaire',name: 'Thousandaire',  desc: 'Reach $1,000.',                     test: (s, st) => st.cash >= 1000 },
    { id: 'ten_k',       name: 'Five Figures',  desc: 'Reach $10,000.',                    test: (s, st) => st.cash >= 10000 },
    { id: 'hundred_k',   name: 'Six Figures',   desc: 'Reach $100,000.',                   test: (s, st) => st.cash >= 100000 },
    { id: 'millionaire', name: 'Millionaire',   desc: 'Reach $1,000,000.',                 test: (s, st) => st.cash >= 1000000 },
    { id: 'multi_millionaire', name: 'Multi-Millionaire', desc: 'Reach $10,000,000.',      test: (s, st) => st.cash >= 10000000 },
    { id: 'billionaire', name: 'Billionaire',   desc: 'Reach $1,000,000,000.',             test: (s, st) => st.cash >= 1000000000 },
    { id: 'first_sale',  name: 'First Sale',    desc: 'Sell an item on the Market.',       test: s => s.itemsSold >= 1 },
    { id: 'market_trader', name: 'Market Trader', desc: 'Make $10,000 in market profit.',  test: s => s.marketProfit >= 10000 },
    { id: 'market_master', name: 'Market Master', desc: 'Make $1,000,000 in market profit.', test: s => s.marketProfit >= 1000000 },
    { id: 'level_10',    name: 'Rising Star',   desc: 'Reach Level 10.',                   test: (s, st) => st.level >= 10 },
    { id: 'level_25',    name: 'Veteran',       desc: 'Reach Level 25.',                   test: (s, st) => st.level >= 25 },
    { id: 'level_50',    name: 'Master Operator', desc: 'Reach Level 50.',                 test: (s, st) => st.level >= 50 },
    { id: 'level_100',   name: 'Titan Status',  desc: 'Reach Level 100.',                  test: (s, st) => st.level >= 100 },
    { id: 'clicker_1k',  name: 'Busy Hands',    desc: 'Click WORK 1,000 times.',           test: s => s.totalClicks >= 1000 },
    { id: 'clicker_100k',name: 'Repetitive Strain', desc: 'Click WORK 100,000 times.',     test: s => s.totalClicks >= 100000 },
    { id: 'first_prestige', name: 'Reborn',     desc: 'Prestige for the first time.',      test: (s, st) => st.prestigeCount >= 1 },
    { id: 'prestige_5',  name: 'Cycle Breaker', desc: 'Prestige 5 times.',                 test: (s, st) => st.prestigeCount >= 5 },
  ];
  function uniqueOwned(state) {
    return new Set(state.inventory.map(i => i.skinId)).size;
  }

  APP.data = {
    RARITIES, RARITY_BY_KEY,
    CATEGORIES,
    WEAPONS, WEAPON_BY_ID,
    THEMES, THEME_BY_ID, THEMES_BY_RARITY,
    SKINS, SKIN_BY_ID, SKINS_BY_RARITY,
    WEAR_BANDS, wearForFloat, floatValueFactor,
    computeBaseValue,
    CASES, CASE_BY_ID, PRESTIGE_CASE, oddsTotal, oddsPercent,
    RANKS, rankForLevel, xpForLevel,
    UPGRADES, UPGRADE_BY_ID, upgradeCost,
    MISSION_TEMPLATES,
    DAILY_REWARDS,
    ACHIEVEMENTS, uniqueOwned,
  };
})(window.APP = window.APP || {});
