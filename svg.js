/* VaultBreak — procedural art
 * Every weapon, skin and case is drawn with SVG primitives + generated
 * gradients/patterns, seeded per item so results are stable but unique.
 * No external images, no copyrighted silhouettes or textures.
 */
(function (APP) {
  'use strict';
  const U = APP.utils;

  // -----------------------------------------------------------------
  // Weapon silhouettes, per category. Shapes use fill:"SLOT" to mean
  // "use the skin's generated fill"; anything else is a literal color
  // (used sparingly, e.g. dark lens glass).
  // -----------------------------------------------------------------
  function shapesForCategory(cat) {
    const S = 'SLOT';
    switch (cat) {
      case 'rifle': return [
        { t: 'polygon', points: '10,55 34,46 34,64', fill: S },
        { t: 'rect', x: 34, y: 42, w: 108, h: 18, rx: 3, fill: S },
        { t: 'rect', x: 58, y: 37, w: 44, h: 5, rx: 2, fill: S },
        { t: 'polygon', points: '70,60 83,60 79,84 68,84', fill: S },
        { t: 'polygon', points: '96,60 113,60 108,92 98,92', fill: S },
        { t: 'rect', x: 142, y: 48, w: 72, h: 8, rx: 2, fill: S },
        { t: 'rect', x: 206, y: 40, w: 4, h: 10, fill: S },
        { t: 'rect', x: 48, y: 34, w: 4, h: 8, fill: S },
      ];
      case 'smg': return [
        { t: 'rect', x: 8, y: 51, w: 30, h: 6, rx: 2, fill: S, transform: 'rotate(-6 23 54)' },
        { t: 'rect', x: 36, y: 44, w: 72, h: 20, rx: 5, fill: S },
        { t: 'polygon', points: '54,64 68,64 64,86 52,86', fill: S },
        { t: 'polygon', points: '78,64 95,64 88,98 74,93', fill: S },
        { t: 'rect', x: 106, y: 50, w: 34, h: 7, rx: 2, fill: S },
        { t: 'rect', x: 44, y: 39, w: 30, h: 5, rx: 2, fill: S },
      ];
      case 'pistol': return [
        { t: 'rect', x: 40, y: 47, w: 70, h: 15, rx: 4, fill: S },
        { t: 'rect', x: 108, y: 50, w: 16, h: 8, rx: 2, fill: S },
        { t: 'polygon', points: '48,62 74,62 68,92 55,92', fill: S },
        { t: 'rect', x: 55, y: 41, w: 34, h: 6, rx: 2, fill: S },
      ];
      case 'shotgun': return [
        { t: 'polygon', points: '10,50 60,44 60,66 10,64', fill: S },
        { t: 'rect', x: 58, y: 47, w: 36, h: 19, rx: 4, fill: S },
        { t: 'rect', x: 90, y: 45, w: 104, h: 15, rx: 7, fill: S },
        { t: 'rect', x: 96, y: 61, w: 84, h: 6, rx: 3, fill: S },
      ];
      case 'lmg': return [
        { t: 'polygon', points: '10,45 42,41 42,63 10,60', fill: S },
        { t: 'rect', x: 40, y: 39, w: 122, h: 22, rx: 4, fill: S },
        { t: 'circle', cx: 88, cy: 82, r: 20, fill: S },
        { t: 'rect', x: 160, y: 46, w: 62, h: 10, rx: 2, fill: S },
        { t: 'rect', x: 172, y: 43, w: 5, h: 5, fill: S },
        { t: 'rect', x: 188, y: 43, w: 5, h: 5, fill: S },
        { t: 'line', x1: 202, y1: 56, x2: 216, y2: 82, fill: S },
        { t: 'line', x1: 202, y1: 56, x2: 218, y2: 48, fill: S },
      ];
      case 'sniper': return [
        { t: 'polygon', points: '10,48 55,44 55,68 10,64', fill: S },
        { t: 'rect', x: 53, y: 44, w: 72, h: 16, rx: 3, fill: S },
        { t: 'rect', x: 68, y: 28, w: 52, h: 10, rx: 5, fill: S },
        { t: 'circle', cx: 72, cy: 33, r: 6, fill: '#090910' },
        { t: 'circle', cx: 116, cy: 33, r: 6, fill: '#090910' },
        { t: 'rect', x: 118, y: 50, w: 102, h: 6, rx: 2, fill: S },
        { t: 'circle', cx: 96, cy: 60, r: 4, fill: S },
      ];
      case 'blade': return [
        { t: 'polygon', points: '22,72 150,20 160,27 46,82', fill: S },
        { t: 'polygon', points: '10,80 34,67 46,86 22,98', fill: S },
        { t: 'polygon', points: '32,70 44,63 49,71 37,78', fill: S },
      ];
      default: return [];
    }
  }

  function shapeMarkup(shape, fillId) {
    const fill = shape.fill === 'SLOT' ? fillId : shape.fill;
    const tf = shape.transform ? ` transform="${shape.transform}"` : '';
    switch (shape.t) {
      case 'rect':
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${shape.rx || 0}" fill="${fill}"${tf}/>`;
      case 'polygon':
        return `<polygon points="${shape.points}" fill="${fill}"${tf}/>`;
      case 'circle':
        return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${fill}"${tf}/>`;
      case 'line':
        return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${fill}" stroke-width="3" stroke-linecap="round"${tf}/>`;
      default: return '';
    }
  }

  // -----------------------------------------------------------------
  // Pattern/gradient family renderers. Each returns { defs, fillUrl, cls }
  // -----------------------------------------------------------------
  let uidCounter = 0;
  function nextId(prefix) { uidCounter++; return prefix + uidCounter + '_' + Math.random().toString(36).slice(2, 7); }

  function metallicShine(rnd, colors) {
    const id = nextId('mg');
    const ang = 100 + rnd() * 40;
    return {
      defs: `<linearGradient id="${id}" gradientTransform="rotate(${ang.toFixed(0)} 0.5 0.5)">
        <stop offset="0%" stop-color="${colors[2]}"/>
        <stop offset="45%" stop-color="${colors[1]}"/>
        <stop offset="55%" stop-color="${colors[0]}"/>
        <stop offset="100%" stop-color="${colors[1]}"/>
      </linearGradient>`,
      fillUrl: `url(#${id})`, cls: '',
    };
  }

  function gradientDiagonal(rnd, colors, cls) {
    const id = nextId('gd');
    const ang = 30 + rnd() * 40;
    return {
      defs: `<linearGradient id="${id}" gradientTransform="rotate(${ang.toFixed(0)} 0.5 0.5)">
        <stop offset="0%" stop-color="${colors[0]}"/>
        <stop offset="55%" stop-color="${colors[1]}"/>
        <stop offset="100%" stop-color="${colors[2]}"/>
      </linearGradient>`,
      fillUrl: `url(#${id})`, cls: cls || '',
    };
  }

  function blotchPattern(rnd, colors) {
    const id = nextId('bp');
    const W = 46, H = 46;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    const n = 5 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const cx = rnd() * W, cy = rnd() * H, rx = 6 + rnd() * 10, ry = 5 + rnd() * 8;
      const rot = Math.floor(rnd() * 180);
      const c = rnd() > 0.5 ? colors[1] : colors[2];
      shapes += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${c}" opacity="${(0.55 + rnd() * 0.35).toFixed(2)}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
    }
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse" patternTransform="rotate(${Math.floor(rnd() * 45)})">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: '',
    };
  }

  function gridLinesPattern(rnd, colors, glow) {
    const id = nextId('gl');
    const W = 26, H = 26;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    shapes += `<line x1="0" y1="${(H * 0.5).toFixed(1)}" x2="${W}" y2="${(H * 0.5).toFixed(1)}" stroke="${colors[1]}" stroke-width="1" opacity="0.6"/>`;
    shapes += `<line x1="${(W * 0.5).toFixed(1)}" y1="0" x2="${(W * 0.5).toFixed(1)}" y2="${H}" stroke="${colors[1]}" stroke-width="1" opacity="0.6"/>`;
    if (rnd() > 0.4) shapes += `<rect x="${(W * 0.5 - 2).toFixed(1)}" y="${(H * 0.5 - 2).toFixed(1)}" width="4" height="4" fill="${colors[2]}"/>`;
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: glow ? 'vb-fx-pulse' : '',
    };
  }

  function crystalShardPattern(rnd, colors) {
    const id = nextId('cs');
    const W = 36, H = 36;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    for (let i = 0; i < 4; i++) {
      const x = rnd() * W, y = rnd() * H, s = 6 + rnd() * 8;
      const c = rnd() > 0.5 ? colors[1] : colors[2];
      shapes += `<polygon points="${x},${y} ${(x + s).toFixed(1)},${(y + s * 0.4).toFixed(1)} ${(x + s * 0.3).toFixed(1)},${(y + s).toFixed(1)}" fill="${c}" opacity="${(0.5 + rnd() * 0.4).toFixed(2)}"/>`;
    }
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: '',
    };
  }

  function starfieldPattern(rnd, colors, planet) {
    const id = nextId('sf');
    const W = 60, H = 60;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    const n = 10 + Math.floor(rnd() * 8);
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H, r = rnd() * 1.4 + 0.3;
      shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffffff" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`;
    }
    if (planet) {
      const px = W * (0.3 + rnd() * 0.4), py = H * (0.3 + rnd() * 0.4);
      shapes += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="${colors[1]}"/>`;
      shapes += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="none" stroke="${colors[1]}" stroke-width="4" opacity="0.35"/>`;
    }
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: '',
    };
  }

  function plasmaPulse(rnd, colors) {
    const id = nextId('pl');
    return {
      defs: `<radialGradient id="${id}" cx="${(0.3 + rnd() * 0.4).toFixed(2)}" cy="0.4" r="0.8">
        <stop offset="0%" stop-color="${colors[2]}"/>
        <stop offset="55%" stop-color="${colors[1]}"/>
        <stop offset="100%" stop-color="${colors[0]}"/>
      </radialGradient>`,
      fillUrl: `url(#${id})`, cls: 'vb-fx-pulse',
    };
  }

  function filigreePattern(rnd, colors) {
    const id = nextId('fg');
    const W = 50, H = 50;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    for (let i = 0; i < 2; i++) {
      const x1 = rnd() * W, y1 = rnd() * H;
      shapes += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} q ${(10 + rnd() * 10).toFixed(1)},${(-10 - rnd() * 10).toFixed(1)} ${(20 + rnd() * 10).toFixed(1)},0 t ${(15).toFixed(1)},8" stroke="${colors[2]}" stroke-width="1.4" fill="none" opacity="0.75"/>`;
    }
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: '',
    };
  }

  function holoFoil(rnd) {
    const id = nextId('hf');
    const stops = ['#ff5f6d', '#ffc371', '#f6ff71', '#71ffb0', '#71d4ff', '#b571ff', '#ff71c9'];
    const ang = Math.floor(rnd() * 60) + 20;
    let stopMarkup = stops.map((c, i) => `<stop offset="${(i / (stops.length - 1) * 100).toFixed(0)}%" stop-color="${c}"/>`).join('');
    return {
      defs: `<linearGradient id="${id}" gradientTransform="rotate(${ang} 0.5 0.5)">${stopMarkup}</linearGradient>`,
      fillUrl: `url(#${id})`, cls: 'vb-fx-holo',
    };
  }

  function obsidianCrack(rnd, colors) {
    const id = nextId('oc');
    const W = 44, H = 44;
    let shapes = `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    shapes += `<rect width="${W}" height="${H}" fill="${colors[1]}" opacity="0.5"/>`;
    for (let i = 0; i < 3; i++) {
      let x = rnd() * W, y = rnd() * H;
      let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
      for (let j = 0; j < 3; j++) {
        x += (rnd() - 0.5) * 18; y += (rnd() - 0.5) * 18;
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      shapes += `<path d="${d}" stroke="${colors[2]}" stroke-width="1.2" fill="none" opacity="0.85"/>`;
    }
    return {
      defs: `<pattern id="${id}" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${shapes}</pattern>`,
      fillUrl: `url(#${id})`, cls: 'vb-fx-crackglow',
    };
  }

  const THEME_COLORS = {
    static:      ['#4b515c', '#8b93a4', '#c7ccd6'],
    urban:       ['#232a2e', '#39424a', '#5c6b63'],
    crimson:     ['#3a0509', '#7a0f1c', '#c81c34'],
    toxic:       ['#0a3d16', '#0d2b12', '#5be05a'],
    frostbite:   ['#0b2733', '#2f8fb0', '#bfeeff'],
    cyberpunk:   ['#160a24', '#22e6ff', '#ff2bd6'],
    neoncircuit: ['#06140f', '#19c2ff', '#33ff9c'],
    inferno:     ['#2a0700', '#ff7a1a', '#ffe066'],
    void:        ['#05040c', '#2a1a4d', '#8a6bff'],
    galaxy:      ['#050318', '#7d4bff', '#241653'],
    plasma:      ['#1a0022', '#7b2bff', '#ff3ec8'],
    royalgold:   ['#1a1305', '#caa53a', '#fff1c2'],
    prismatic:   ['#0a0a12', '#ffffff', '#ffffff'],
    doomsday:    ['#050203', '#170303', '#ff3b1f'],
  };

  function fillForPattern(pattern, rnd, colors) {
    switch (pattern) {
      case 'brushed': return metallicShine(rnd, colors);
      case 'camo': return blotchPattern(rnd, colors);
      case 'stripe': return gradientDiagonal(rnd, colors, '');
      case 'splatter': return blotchPattern(rnd, colors);
      case 'crystal': return crystalShardPattern(rnd, colors);
      case 'circuit': return gridLinesPattern(rnd, colors, false);
      case 'circuitglow': return gridLinesPattern(rnd, colors, true);
      case 'flame': return gradientDiagonal(rnd, colors, 'vb-fx-flicker');
      case 'nebula': return starfieldPattern(rnd, colors, false);
      case 'galaxy': return starfieldPattern(rnd, colors, true);
      case 'plasma': return plasmaPulse(rnd, colors);
      case 'filigree': return filigreePattern(rnd, colors);
      case 'holo': return holoFoil(rnd);
      case 'obsidian': return obsidianCrack(rnd, colors);
      default: return metallicShine(rnd, colors);
    }
  }

  // -----------------------------------------------------------------
  // Public: render a weapon+skin item as an <svg> string.
  // item: { weaponId, themeId, float, seed }
  // -----------------------------------------------------------------
  function itemArt(item, opts) {
    opts = opts || {};
    const w = APP.data.WEAPON_BY_ID[item.weaponId];
    const theme = APP.data.THEME_BY_ID[item.themeId];
    if (!w || !theme) return '';
    const seed = item.seed != null ? item.seed : U.seedFromString(item.weaponId + item.themeId);
    const rnd = U.makeSeededRandom(seed);
    const themeColors = THEME_COLORS[theme.id] || ['#444444', '#888888', '#cccccc'];
    const { defs, fillUrl, cls } = fillForPattern(theme.pattern, rnd, themeColors);
    const shapes = shapesForCategory(w.cat).map(s => shapeMarkup(s, fillUrl)).join('');
    const float = item.float != null ? item.float : 0.2;
    const wearFilter = `saturate(${(1.05 - float * 0.3).toFixed(2)}) brightness(${(1.03 - float * 0.12).toFixed(2)})`;
    let scratches = '';
    if (float > 0.15) {
      const scRnd = U.makeSeededRandom(seed ^ 0x5bd1e995);
      const n = Math.round((float - 0.15) * 10);
      for (let i = 0; i < n; i++) {
        const x1 = 40 + scRnd() * 140, y1 = 42 + scRnd() * 20;
        const x2 = x1 + (scRnd() - 0.5) * 30, y2 = y1 + (scRnd() - 0.5) * 12;
        scratches += `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="#0a0a0f" stroke-width="1" opacity="0.35" stroke-linecap="round"/>`;
      }
    }
    const size = opts.size || 200;
    return `<svg viewBox="0 0 226 100" width="${size}" height="${Math.round(size * 100 / 226)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${w.name} ${theme.name}">
      <defs>${defs}</defs>
      <g class="${cls}" style="filter:${wearFilter}">${shapes}${scratches}</g>
    </svg>`;
  }

  // -----------------------------------------------------------------
  // Public: case crate artwork.
  // -----------------------------------------------------------------
  function caseArt(caseDef, opts) {
    opts = opts || {};
    const rarities = APP.data.RARITIES;
    const topKey = caseDef.odds.reduce((best, [k]) => {
      const r = APP.data.RARITY_BY_KEY[k];
      const b = APP.data.RARITY_BY_KEY[best];
      return r.order > b.order ? k : best;
    }, caseDef.odds[0][0]);
    const top = APP.data.RARITY_BY_KEY[topKey];
    const seed = U.seedFromString(caseDef.id);
    const rnd = U.makeSeededRandom(seed);
    const glowId = nextId('caseglow');
    const lidId = nextId('lid');
    const bodyId = nextId('body');
    const sparkles = top.order >= 5 ? Array.from({ length: 6 }, () => {
      const x = 30 + rnd() * 100, y = 20 + rnd() * 90, r = 0.6 + rnd() * 1.2;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${top.color}" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`;
    }).join('') : '';
    return `<svg viewBox="0 0 160 120" width="${opts.size || 160}" height="${Math.round((opts.size || 160) * 0.75)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${caseDef.name}">
      <defs>
        <linearGradient id="${bodyId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#20222c"/>
          <stop offset="100%" stop-color="#101117"/>
        </linearGradient>
        <linearGradient id="${lidId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${top.color}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${top.color}" stop-opacity="0.45"/>
        </linearGradient>
        <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polygon points="140,30 150,20 150,90 140,100" fill="#0b0c11"/>
      <rect x="20" y="30" width="120" height="70" rx="6" fill="url(#${bodyId})" stroke="#05050a" stroke-width="2"/>
      <polygon points="20,30 140,30 150,20 40,10" fill="url(#${lidId})"/>
      <rect x="16" y="26" width="12" height="12" rx="2" fill="#05050a"/>
      <rect x="132" y="26" width="12" height="12" rx="2" fill="#05050a"/>
      <rect x="16" y="86" width="12" height="12" rx="2" fill="#05050a"/>
      <rect x="132" y="86" width="12" height="12" rx="2" fill="#05050a"/>
      <rect x="30" y="58" width="100" height="20" fill="${top.color}" opacity="0.14"/>
      <g filter="url(#${glowId})">
        <polygon points="80,50 92,65 80,80 68,65" fill="${top.color}" opacity="0.92"/>
      </g>
      ${sparkles}
    </svg>`;
  }

  // -----------------------------------------------------------------
  // Public: tiny rarity gem icon (used in odds tables, badges, etc).
  // -----------------------------------------------------------------
  function rarityGem(rarityKey, size) {
    const r = APP.data.RARITY_BY_KEY[rarityKey];
    if (!r) return '';
    size = size || 14;
    return `<svg viewBox="0 0 20 20" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="10,1 18,7 15,19 5,19 2,7" fill="${r.color}" opacity="0.9"/>
      <polygon points="10,1 18,7 10,10 2,7" fill="${r.color}"/>
    </svg>`;
  }

  APP.svg = { itemArt, caseArt, rarityGem };
})(window.APP = window.APP || {});
