/* VaultBreak — state shape + save system */
(function (APP) {
  'use strict';
  const D = APP.data;
  const U = APP.utils;

  const SAVE_KEY = 'vaultbreak_save_v1';
  const SAVE_VERSION = 1;
  const BASE_CLICK = 3;
  const BASE_PASSIVE = 0;
  const START_CASH = 10;
  const PRESTIGE_MIN_LEVEL = 50;

  // Curated set of skins actually listed on the Market page.
  const MARKET_SKIN_IDS = [
    'ghost__static', 'ar47__urban', 'spectre__crimson', 'reaper__toxic',
    'vectorx__frostbite', 'nova__cyberpunk', 'titanlmg__neoncircuit', 'phantom__inferno',
    'longshot__void', 'juggernaut__galaxy', 'ar47__plasma', 'nova__royalgold',
    'vectorx__prismatic', 'voidblade__doomsday', 'goldblade__doomsday', 'ancientdagger__doomsday',
  ];

  function emptyRarityCounts() {
    const o = {};
    D.RARITIES.forEach(r => { o[r.key] = 0; });
    return o;
  }

  function createDefaultState() {
    const now = Date.now();
    return {
      version: SAVE_VERSION,
      cash: START_CASH,
      xp: 0,
      level: 1,
      prestigeCount: 0,
      prestigePoints: 0,
      upgrades: Object.fromEntries(D.UPGRADES.map(u => [u.id, 0])),
      inventory: [],
      missions: { active: [] },
      achievements: { unlocked: {} },
      daily: { streak: 0, lastClaimDate: null },
      market: {
        items: Object.fromEntries(MARKET_SKIN_IDS.map(id => [id, { priceMult: 1, history: [1] }])),
        event: null,
      },
      stats: {
        totalEarned: 0, totalSpent: 0, totalClicks: 0,
        casesOpened: 0, itemsObtained: 0, itemsSold: 0,
        marketProfit: 0, marketBuys: 0,
        bestItemValue: 0,
        rarityCounts: emptyRarityCounts(),
        playTimeSeconds: 0,
      },
      settings: { muted: false },
      meta: { createdAt: now, lastSavedAt: now, lastActiveAt: now },
    };
  }

  // Fills in any fields missing from an older save without wiping progress.
  function migrate(state) {
    const fresh = createDefaultState();
    function deepFill(target, base) {
      for (const k in base) {
        if (target[k] === undefined) target[k] = base[k];
        else if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof target[k] === 'object') {
          deepFill(target[k], base[k]);
        }
      }
    }
    deepFill(state, fresh);
    state.version = SAVE_VERSION;
    return state;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch (e) {
      console.warn('VaultBreak: save could not be read, starting fresh.', e);
      return createDefaultState();
    }
  }

  function save(state) {
    try {
      state.meta.lastSavedAt = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('VaultBreak: save failed (storage full or unavailable).', e);
      return false;
    }
  }

  function exportSave(state) {
    state.meta.lastSavedAt = Date.now();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `vaultbreak-save-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function importSaveFromFile(file, onDone) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== 'object' || parsed === null || !('cash' in parsed)) {
          throw new Error('This file does not look like a VaultBreak save.');
        }
        const state = migrate(parsed);
        save(state);
        onDone(null, state);
      } catch (e) {
        onDone(e, null);
      }
    };
    reader.onerror = () => onDone(new Error('Could not read file.'), null);
    reader.readAsText(file);
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    return createDefaultState();
  }

  // ---------------------------------------------------------------
  // Derived getters — the single source of truth for every formula
  // shared between the engine and the UI, so displayed numbers and
  // actual effects can never drift apart.
  // ---------------------------------------------------------------
  function upgradeLevel(state, id) { return state.upgrades[id] || 0; }
  function upgradeCost(state, id) {
    const u = D.UPGRADE_BY_ID[id];
    return D.upgradeCost(u, upgradeLevel(state, id));
  }
  function upgradeMaxed(state, id) {
    const u = D.UPGRADE_BY_ID[id];
    return upgradeLevel(state, id) >= u.maxLevel;
  }

  function prestigeMultiplier(state) {
    return 1 + state.prestigePoints * 0.02;
  }

  function clickPower(state) {
    const lvl = upgradeLevel(state, 'trigger');
    const base = BASE_CLICK + lvl * D.UPGRADE_BY_ID.trigger.perLevel;
    return base * prestigeMultiplier(state);
  }

  function passiveIncomePerSec(state) {
    const lvl = upgradeLevel(state, 'contracts');
    const flat = BASE_PASSIVE + lvl * D.UPGRADE_BY_ID.contracts.perLevel;
    const overtimeLvl = upgradeLevel(state, 'overtime');
    const overtimeMult = 1 + overtimeLvl * D.UPGRADE_BY_ID.overtime.perLevel;
    return flat * overtimeMult * prestigeMultiplier(state);
  }

  function xpGainMultiplier(state) {
    const lvl = upgradeLevel(state, 'training');
    return 1 + lvl * D.UPGRADE_BY_ID.training.perLevel;
  }

  function missionRewardMultiplier(state) {
    const lvl = upgradeLevel(state, 'payouts');
    return 1 + lvl * D.UPGRADE_BY_ID.payouts.perLevel;
  }

  function caseDiscount(state) {
    const lvl = upgradeLevel(state, 'broker');
    const u = D.UPGRADE_BY_ID.broker;
    return Math.min(0.30, lvl * u.perLevel);
  }

  function caseEffectivePrice(state, caseDef) {
    if (caseDef.priceType === 'prestige') return caseDef.price; // prestige currency, no discount
    return Math.max(1, Math.round(caseDef.price * (1 - caseDiscount(state))));
  }

  function sellBonusMultiplier(state) {
    const lvl = upgradeLevel(state, 'instincts');
    return 1 + lvl * D.UPGRADE_BY_ID.instincts.perLevel;
  }

  function marketMultiplierFor(state, skinId) {
    const entry = state.market.items[skinId];
    const base = entry ? entry.priceMult : 1;
    const ev = state.market.event;
    if (ev && ev.affectedSkinIds && ev.affectedSkinIds.includes(skinId)) return base * ev.mult;
    return base;
  }

  function itemSellPrice(state, item) {
    const mult = marketMultiplierFor(state, item.skinId);
    return Math.max(1, Math.round(item.baseValue * mult * sellBonusMultiplier(state)));
  }

  function rankInfo(state) { return D.rankForLevel(state.level); }

  function netWorth(state) {
    const invValue = state.inventory.reduce((s, it) => s + itemSellPrice(state, it), 0);
    return state.cash + invValue;
  }

  APP.state = {
    SAVE_KEY, START_CASH, PRESTIGE_MIN_LEVEL, MARKET_SKIN_IDS,
    createDefaultState, migrate, load, save, exportSave, importSaveFromFile, resetSave,
    upgradeLevel, upgradeCost, upgradeMaxed,
    prestigeMultiplier, clickPower, passiveIncomePerSec, xpGainMultiplier,
    missionRewardMultiplier, caseDiscount, caseEffectivePrice, sellBonusMultiplier,
    marketMultiplierFor, itemSellPrice, rankInfo, netWorth,
  };
})(window.APP = window.APP || {});
