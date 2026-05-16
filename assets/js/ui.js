/**
 * Aptispace OJS UI Library
 * Centralized atomic components for pedagogical simulations.
 * (c) 2026 Aptitek
 */

export const theme = (function() {
  const style = getComputedStyle(document.documentElement);
  const getVar = (name) => style.getPropertyValue(name).trim();
  return {
    blue: getVar('--sol-blue'),
    red: getVar('--sol-red'),
    green: getVar('--sol-green'),
    orange: getVar('--sol-orange'),
    yellow: getVar('--sol-yellow'),
    violet: getVar('--sol-violet'),
    cyan: getVar('--sol-cyan'),
    magenta: getVar('--sol-magenta'),
    base03: getVar('--sol-base03'),
    base02: getVar('--sol-base02'),
    base01: getVar('--sol-base01'),
    base00: getVar('--sol-base00'),
    base0: getVar('--sol-base0'),
    base1: getVar('--sol-base1'),
    base2: getVar('--sol-base2'),
    base3: getVar('--sol-base3'),
    bg: getVar('--bg-color'),
    font_code: getVar('--font-code')
  };
})();

export const ui = {
  atom: {},
  mol: {},
  org: {}
};

// =============================================================================
// ATOMS (Pure UI Elements)
// =============================================================================

ui.atom.button = (content, {status = 'primary', icon} = {}) => {
  const btn = document.createElement('button');
  btn.className = `atom-btn ${status === 'secondary' ? 'is-secondary' : ''}`;
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.innerText = icon;
    btn.appendChild(iconSpan);
  }
  const text = document.createElement('span');
  text.innerText = content;
  btn.appendChild(text);
  return btn;
};

ui.atom.label = (text) => {
  const label = document.createElement('span');
  label.className = 'atom-label';
  label.innerText = text;
  return label;
};

ui.atom.badge = (text) => {
  const badge = document.createElement('span');
  badge.className = 'atom-badge';
  badge.innerText = text;
  return badge;
};

ui.atom.input = ({value = '', placeholder = '', type = 'text'} = {}) => {
  const input = document.createElement('input');
  input.className = 'atom-input';
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  return input;
};

ui.atom.textarea = ({value = '', rows = 3, placeholder = ''} = {}) => {
  const textarea = document.createElement('textarea');
  textarea.className = 'atom-textarea';
  textarea.rows = rows;
  textarea.value = value;
  textarea.placeholder = placeholder;
  return textarea;
};

ui.atom.select = ({options, value} = {}) => {
  const select = document.createElement('select');
  select.className = 'atom-select';
  const isObjectOptions = !Array.isArray(options);
  const keys = isObjectOptions ? Object.keys(options) : options;
  keys.forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = isObjectOptions ? options[key] : key;
    if (key == value) option.selected = true;
    select.appendChild(option);
  });
  return select;
};

// --- TERMINAL ---
ui.atom.terminal = ({header, height = '250px'} = {}) => {
  const container = document.createElement('div');
  container.className = 'atom-terminal';

  const head = document.createElement('div');
  head.className = 'terminal-header';

  ['red', 'yellow', 'green'].forEach(c => {
    const dot = document.createElement('span');
    dot.className = `terminal-dot is-${c}`;
    head.appendChild(dot);
  });

  if (header) {
    const title = document.createElement('span');
    title.className = 'terminal-title';
    title.innerText = header;
    head.appendChild(title);
  }

  const body = document.createElement('div');
  body.className = 'terminal-body';
  body.style.setProperty('--terminal-height', height);

  container.appendChild(head);
  container.appendChild(body);
  container.body = body;

  const scrollToBottom = () => {
    body.scrollTop = body.scrollHeight;
  };

  container.addLine = (text, type = '') => {
    const line = document.createElement('span');
    line.className = `terminal-line ${type}`;
    line.innerHTML = text;
    body.appendChild(line);
    scrollToBottom();
    return line;
  };

  container.addLabel = (text, type = '') => {
    const typeClass = type ? `is-${type}` : '';
    return `<span class="terminal-label ${typeClass}">${text}</span>`;
  };

  container.addProgress = (label, initialPercentage = 0, type = 'scan') => {
    const line = document.createElement('span');
    line.className = `terminal-line ${type}`;
    body.appendChild(line);
    scrollToBottom();

    const render = (percentage, text = '') => {
      const bars = 12;
      const p = Math.max(0, Math.min(100, percentage));
      const activeBars = Math.floor((p / 100) * bars);
      const progressStr = "█".repeat(activeBars) + "░".repeat(bars - activeBars);
      line.innerHTML = `> [${label}] ${progressStr} ${p}% ${text}`;
    };

    render(initialPercentage);

    return {
      update: (percentage, text = '') => {
        render(percentage, text);
      },
      remove: () => line.remove()
    };
  };

  container.addSpinner = (label, type = 'system') => {
    const line = document.createElement('span');
    line.className = `terminal-line ${type}`;
    body.appendChild(line);
    scrollToBottom();

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    line.innerHTML = `> ${frames[i]} ${label}`;

    const interval = setInterval(() => {
      i = (i + 1) % frames.length;
      line.innerHTML = `> ${frames[i]} ${label}`;
    }, 80);

    return {
      update: (newLabel) => { label = newLabel; },
      stop: (finalText = '', finalType = type) => {
        clearInterval(interval);
        if (finalText) {
          line.innerHTML = `> ${finalText}`;
          line.className = `terminal-line ${finalType}`;
        } else {
          line.remove();
        }
      }
    };
  };

  container.clear = () => {
    body.innerHTML = '';
  };

  return container;
};

// --- TENSOR (NEW) ---
ui.atom.tensor = ({data, shape, label, color = theme.blue} = {}) => {
  const container = document.createElement('div');
  container.className = 'atom-tensor';
  
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className = 'tensor-label';
    labelEl.innerText = `${label} [${shape.join(' × ')}]`;
    container.appendChild(labelEl);
  }

  const grid = document.createElement('div');
  grid.className = 'tensor-grid';
  
  // Flatten data if needed
  const flatData = data.flat(Infinity);
  const rows = shape[0] || 1;
  const cols = shape[1] || flatData.length / rows;
  
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gap = '2px';
  
  const maxVal = Math.max(...flatData.map(Math.abs)) || 1;

  flatData.forEach(val => {
    const cell = document.createElement('div');
    cell.className = 'tensor-cell';
    const intensity = Math.abs(val) / maxVal;
    cell.style.background = val >= 0 ? color : theme.red;
    cell.style.opacity = 0.2 + (intensity * 0.8);
    cell.title = val.toFixed(4);
    grid.appendChild(cell);
  });

  container.appendChild(grid);
  return container;
};

// =============================================================================
// MOLECULES (Widgets & Controls)
// =============================================================================

ui.mol.slider = ({label, labels, value = 0, min = 0, max = 3, step = 1, state}) => {
  const container = document.createElement('div');
  container.className = 'mol-slider';
  const colorState = state !== undefined ? state : value;
  container.setAttribute('data-state', colorState);

  const header = document.createElement('div');
  header.className = 'slider-header';

  const labelEl = ui.atom.label(label);
  const badgeEl = ui.atom.badge(labels ? labels[value] : value);

  header.appendChild(labelEl);
  header.appendChild(badgeEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.className = 'premium-slider';

  container.appendChild(header);
  container.appendChild(input);

  if (labels) {
    const ticks = document.createElement('div');
    ticks.className = 'slider-ticks';
    labels.forEach(l => {
      const span = document.createElement('span');
      span.innerText = l;
      ticks.appendChild(span);
    });
    container.appendChild(ticks);
  }

  input.oninput = () => {
    container.setAttribute('data-state', state !== undefined ? state : input.value);
    badgeEl.innerText = labels ? labels[input.value] : input.value;
    container.value = step % 1 === 0 ? parseInt(input.value) : parseFloat(input.value);
    container.dispatchEvent(new CustomEvent("input"));
  };

  container.value = value;
  return container;
};

ui.mol.toggle = ({label, options, value, states, layout = 'horizontal'}) => {
  const container = document.createElement('div');
  container.className = `mol-toggle ${layout === 'horizontal' ? 'is-horizontal' : ''}`;

  if (label) container.appendChild(ui.atom.label(label));

  const group = document.createElement('div');
  group.className = 'toggle-group';

  const isObjectOptions = !Array.isArray(options);
  const keys = isObjectOptions ? Object.keys(options) : options;

  keys.forEach(key => {
    const displayValue = isObjectOptions ? options[key] : key;
    const btn = document.createElement('button');
    btn.className = `toggle-option ${key === value ? 'active' : ''}`;

    if (states && states[key]) {
      btn.setAttribute('data-state', states[key]);
    }

    btn.innerText = displayValue;
    btn.onclick = () => {
      group.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.value = key;
      container.dispatchEvent(new CustomEvent("input"));
    };
    group.appendChild(btn);
  });

  container.appendChild(group);
  container.value = value;
  return container;
};

ui.mol.checkbox = ({label, value = false}) => {
  const container = document.createElement('div');
  container.className = 'mol-checkbox';

  const btn = document.createElement('button');
  btn.className = `checkbox-toggle ${value ? 'is-active' : ''}`;

  const icon = document.createElement('span');
  icon.className = 'checkbox-icon';
  icon.innerText = value ? '✓' : '';

  const text = document.createElement('span');
  text.className = 'checkbox-text';
  text.innerText = label;

  btn.appendChild(icon);
  btn.appendChild(text);

  btn.onclick = () => {
    const newValue = !container.value;
    container.value = newValue;
    btn.classList.toggle('is-active', newValue);
    icon.innerText = newValue ? '✓' : '';
    container.dispatchEvent(new CustomEvent("input"));
  };

  container.appendChild(btn);
  container.value = value;
  return container;
};

ui.mol.slider_vertical = ({label, value = 0, min = 0, max = 100, step = 1, color = theme.blue, unit = '', height = '200px'}) => {
  const container = document.createElement('div');
  container.className = 'mol-slider-vertical';
  container.style.minHeight = height;
  container.style.setProperty('--current-color', color);

  const header = document.createElement('div');
  header.className = 'slider-header';
  header.appendChild(ui.atom.label(label));
  
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'slider-value';
  valueDisplay.innerText = value + unit;
  header.appendChild(valueDisplay);
  container.appendChild(header);

  const trackContainer = document.createElement('div');
  trackContainer.className = 'slider-track-container';
  
  const fill = document.createElement('div');
  fill.className = 'slider-fill';
  const updateFill = (v) => {
    const pct = ((v - min) / (max - min)) * 100;
    fill.style.height = pct + '%';
  };
  updateFill(value);
  trackContainer.appendChild(fill);

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'slider-input';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  trackContainer.appendChild(input);
  container.appendChild(trackContainer);

  input.oninput = () => {
    const v = step % 1 === 0 ? parseInt(input.value) : parseFloat(input.value);
    updateFill(v);
    valueDisplay.innerText = (step % 1 === 0 ? v : v.toFixed(2)) + unit;
    container.value = v;
    container.dispatchEvent(new CustomEvent("input"));
  };

  container.value = value;
  return container;
};

ui.mol.thermometer = ({label, value = 0.7, min = 0, max = 2, step = 0.01, height = '220px'}) => {
  const container = document.createElement('div');
  container.className = 'mol-thermometer';
  container.style.minHeight = height;

  const header = document.createElement('div');
  header.className = 'slider-header';
  header.appendChild(ui.atom.label(label));
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'slider-value';
  header.appendChild(valueDisplay);
  container.appendChild(header);

  const trackContainer = document.createElement('div');
  trackContainer.className = 'slider-track-container';
  
  const frost = document.createElement('div');
  frost.className = 'frost-overlay';
  trackContainer.appendChild(frost);

  const ticks = document.createElement('div');
  ticks.className = 'thermometer-ticks';
  for (let i = 0; i < 6; i++) {
    const tick = document.createElement('div');
    tick.className = 'tick';
    ticks.appendChild(tick);
  }
  trackContainer.appendChild(ticks);

  const fill = document.createElement('div');
  fill.className = 'slider-fill';
  trackContainer.appendChild(fill);

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'slider-input';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  trackContainer.appendChild(input);
  container.appendChild(trackContainer);

  const bulb = document.createElement('div');
  bulb.className = 'thermometer-bulb';
  
  const bulbIcon = document.createElement('i');
  bulbIcon.className = 'bi';
  bulbIcon.style.cssText = `
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  `;
  bulb.appendChild(bulbIcon);
  container.appendChild(bulb);

  const update = (v) => {
    const pct = ((v - min) / (max - min)) * 100;
    fill.style.height = Math.max(5, pct) + "%";
    
    if (v < 0.4) {
      container.style.setProperty('--current-color', theme.blue);
      container.classList.add('is-cold');
      bulbIcon.className = 'bi bi-snow';
    } else if (v > 1.4) {
      container.style.setProperty('--current-color', theme.red);
      container.classList.remove('is-cold');
      bulbIcon.className = 'bi bi-fire';
    } else {
      container.style.setProperty('--current-color', theme.green);
      container.classList.remove('is-cold');
      bulbIcon.className = 'bi bi-thermometer-half';
    }

    valueDisplay.innerText = v.toFixed(2);
    container.value = v;
    container.dispatchEvent(new CustomEvent("input"));
  };

  input.oninput = () => update(parseFloat(input.value));
  update(value);

  return container;
};

ui.mol.blade_slider = ({label, value = 8, min = 1, max = 8, height = '220px'}) => {
  const container = document.createElement('div');
  container.className = 'mol-blade-slider';
  container.style.minHeight = height;

  const header = document.createElement('div');
  header.className = 'slider-header';
  header.appendChild(ui.atom.label(label));
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'slider-value';
  header.appendChild(valueDisplay);
  container.appendChild(header);

  const trackContainer = document.createElement('div');
  trackContainer.className = 'slider-track-container';

  const segmentsContainer = document.createElement('div');
  segmentsContainer.className = 'blade-segments';
  const segments = [];
  for (let i = 0; i < max; i++) {
    const seg = document.createElement('div');
    seg.className = 'segment';
    segmentsContainer.appendChild(seg);
    segments.push(seg);
  }
  trackContainer.appendChild(segmentsContainer);

  const blade = document.createElement('div');
  blade.className = 'blade-handle';
  trackContainer.appendChild(blade);

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'slider-input';
  input.min = min;
  input.max = max;
  input.step = 1;
  input.value = value;
  trackContainer.appendChild(input);
  container.appendChild(trackContainer);

  const update = (v) => {
    const pct = (v / max) * 100;
    blade.style.top = pct + '%';
    
    segments.forEach((seg, i) => {
      seg.classList.toggle('is-active', i < v);
    });
    
    valueDisplay.innerText = v;
    container.value = v;
    container.dispatchEvent(new CustomEvent("input"));
  };

  input.oninput = () => update(parseInt(input.value));
  update(value);

  return container;
};

ui.mol.slider_radial = ({label, value = 0, min = 0, max = 100, step = 1, color = theme.yellow, unit = '', size = 100}) => {
  const container = document.createElement('div');
  container.className = 'mol-slider-radial';
  container.style.setProperty('--current-color', color);
  
  if (label) container.appendChild(ui.atom.label(label));

  const radialContainer = document.createElement('div');
  radialContainer.className = 'radial-container';
  radialContainer.style.width = size + 'px';
  radialContainer.style.height = size + 'px';

  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "radial-svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "radial-track");
  track.setAttribute("cx", size / 2);
  track.setAttribute("cy", size / 2);
  track.setAttribute("r", r);
  svg.appendChild(track);

  const progress = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  progress.setAttribute("class", "radial-progress");
  progress.setAttribute("cx", size / 2);
  progress.setAttribute("cy", size / 2);
  progress.setAttribute("r", r);
  progress.style.strokeDasharray = circ;
  
  const updateProgress = (v) => {
    const pct = (v - min) / (max - min);
    progress.style.strokeDashoffset = circ * (1 - pct);
  };
  
  svg.appendChild(progress);
  radialContainer.appendChild(svg);

  const center = document.createElement('div');
  center.className = 'radial-center';
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'radial-value';
  center.appendChild(valueDisplay);
  radialContainer.appendChild(center);
  container.appendChild(radialContainer);

  const update = (v) => {
    v = Math.max(min, Math.min(max, v));
    if (step) v = Math.round(v / step) * step;
    
    updateProgress(v);
    valueDisplay.innerText = (step % 1 === 0 ? v : v.toFixed(2)) + unit;
    container.value = v;
    container.dispatchEvent(new CustomEvent("input"));
  };

  let isDragging = false;
  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = radialContainer.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    const pct = angle / (2 * Math.PI);
    const v = min + pct * (max - min);
    update(v);
  };

  radialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    radialContainer.setPointerCapture(e.pointerId);
    handleMove(e);
  });

  radialContainer.addEventListener('pointermove', handleMove);
  
  radialContainer.addEventListener('pointerup', (e) => {
    isDragging = false;
    radialContainer.releasePointerCapture(e.pointerId);
  });

  update(value);
  return container;
};

ui.mol.field = ({label, element}) => {
  const container = document.createElement('div');
  container.className = 'mol-field';
  if (label) container.appendChild(ui.atom.label(label));
  container.appendChild(element);

  element.oninput = () => {
    container.value = element.value;
    container.dispatchEvent(new CustomEvent("input"));
  };
  container.value = element.value;
  return container;
};

// =============================================================================
// ORGANISMS (Complex Layouts & Monitors)
// =============================================================================

ui.org.card = (content, {title, status = 'debug'} = {}) => {
  const container = document.createElement('div');
  container.className = `org-card is-${status}`;
  if (title) {
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerText = title;
    container.appendChild(header);
  }
  const body = document.createElement('div');
  body.className = 'card-body';
  if (content instanceof HTMLElement) {
    body.appendChild(content);
  } else {
    body.innerHTML = content;
  }
  container.appendChild(body);
  return container;
};

ui.org.canvas = ({width: initialWidth, height = 400, shadow = true, bg = theme.base3, margin = "10px 0"} = {}) => {
  const id = "canvas_" + Math.random().toString(36).substr(2, 9);
  const root = document.createElement("div");
  root.id = id;
  root.className = "ui-canvas-root";
  root.style.cssText = `
    position: relative;
    width: ${initialWidth ? (typeof initialWidth === 'number' ? initialWidth + 'px' : initialWidth) : '100%'};
    max-width: 100%;
    height: ${height}px;
    background: ${bg};
    border-radius: 16px;
    overflow: hidden;
    box-sizing: border-box;
    display: block;
    margin: ${margin};
    ${shadow ? `box-shadow: inset 0 2px 15px rgba(0,0,0,0.1);` : ''}
  `;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible;";
  
  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);

  const filter = document.createElementNS(svgNS, "filter");
  filter.id = id + "_blur";
  const blur = document.createElementNS(svgNS, "feGaussianBlur");
  blur.setAttribute("stdDeviation", "25");
  filter.appendChild(blur);
  defs.appendChild(filter);

  const svgMain = document.createElementNS(svgNS, "g");
  svg.appendChild(svgMain);
  root.appendChild(svg);

  const htmlLayer = document.createElement("div");
  htmlLayer.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;";
  root.appendChild(htmlLayer);

  let renderedWidth = 0;
  const ro = new ResizeObserver(entries => {
    for (let entry of entries) { renderedWidth = entry.contentRect.width; }
  });
  ro.observe(root);

  const getWidth = () => renderedWidth || root.offsetWidth || (typeof initialWidth === 'number' ? initialWidth : 0) || 800;

  const clear = () => {
    while (svgMain.firstChild) svgMain.removeChild(svgMain.firstChild);
    htmlLayer.innerHTML = "";
  };

  return {
    id, node: root, svgMain, defsNode: defs, htmlLayer, height, getWidth, clear,
    legend: (items, { x = 40, y = height - 40, gap = 160, type = "discrete", width = 120 } = {}) => {
      const container = document.createElement("div");
      container.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; display: flex; align-items: center; gap: ${gap}px; font-family: var(--font-base, sans-serif); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; pointer-events: none; color: ${theme.base01};`;
      if (type === "gradient") {
        const colors = items.map(i => i.color).join(", ");
        container.innerHTML = `<span style="opacity:0.7">${items[0].label}</span><div style="width: ${width}px; height: 6px; border-radius: 3px; background: linear-gradient(to right, ${colors}); margin: 0 10px;"></div><span style="opacity:0.7">${items[items.length-1].label}</span>`;
      } else {
        items.forEach(item => {
          const div = document.createElement("div");
          div.style.cssText = "display: flex; align-items: center; gap: 8px;";
          div.innerHTML = `<div style="width:12px; height:12px; border-radius:3px; background:${item.color}"></div><span>${item.label}</span>`;
          container.appendChild(div);
        });
      }
      htmlLayer.appendChild(container);
      return container;
    },
    atom: {
      node: ({ x, y, radius = 25, color = theme.blue, label = '', labelColor = theme.base3, labelSize = "1.2rem", aura = false, auraRadius = 40, auraOpacity = 0.2 }) => {
        if (aura) {
          const auraEl = document.createElementNS(svgNS, "circle");
          auraEl.setAttribute("cx", x); auraEl.setAttribute("cy", y); auraEl.setAttribute("r", auraRadius);
          if (aura === 'blur') {
            auraEl.setAttribute("fill", color); auraEl.setAttribute("opacity", auraOpacity); auraEl.setAttribute("filter", `url(#${id}_blur)`);
          } else if (aura === 'gradient') {
            const gradId = id + "_grad_" + color.replace(/[^a-zA-Z0-9]/g, "");
            if (!defs.querySelector(`#${gradId}`)) {
              const g = document.createElementNS(svgNS, "radialGradient"); g.id = gradId;
              const s1 = document.createElementNS(svgNS, "stop"); s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", color); s1.setAttribute("stop-opacity", auraOpacity);
              const s2 = document.createElementNS(svgNS, "stop"); s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", color); s2.setAttribute("stop-opacity", 0);
              g.appendChild(s1); g.appendChild(s2); defs.appendChild(g);
            }
            auraEl.setAttribute("fill", `url(#${gradId})`);
          } else {
            auraEl.setAttribute("fill", color); auraEl.setAttribute("opacity", auraOpacity);
          }
          svgMain.appendChild(auraEl);
        }
        const nodeDiv = document.createElement("div");
        nodeDiv.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${radius * 2}px; height: ${radius * 2}px; margin-left: ${-radius}px; margin-top: ${-radius}px; border-radius: 50%; background: ${color}; pointer-events: all; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
        if (label) {
          const textSpan = document.createElement("span");
          textSpan.style.cssText = `font-family: var(--font-base, sans-serif); font-size: ${labelSize}; font-weight: 900; color: ${labelColor}; pointer-events: none; user-select: none;`;
          textSpan.textContent = label; nodeDiv.appendChild(textSpan);
        }
        htmlLayer.appendChild(nodeDiv);
        return { _el: nodeDiv, style: (k, v) => { nodeDiv.style[k] = v; return this; } };
      },
      link: ({ source, target, color = theme.base01, width = 3, dashed = false, curve = 0 }) => {
        const path = document.createElementNS(svgNS, "path");
        let d = curve === 0 ? `M ${source.x} ${source.y} L ${target.x} ${target.y}` : (function(){
          const midX = (source.x + target.x) / 2, midY = (source.y + target.y) / 2;
          const dx = target.x - source.x, dy = target.y - source.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const controlX = midX - (dy * curve), controlY = midY + (dx * curve) - (dist * 0.1);
          return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
        })();
        path.setAttribute("d", d); path.setAttribute("stroke", color); path.setAttribute("stroke-width", width); path.setAttribute("fill", "none");
        if (dashed) path.setAttribute("stroke-dasharray", "8,6");
        svgMain.appendChild(path); return path;
      },
      label: ({ x, y, text, color = theme.base00, size = "1.2rem", weight = "800" }) => {
        const div = document.createElement("div");
        div.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%); font-family: var(--font-base, sans-serif); font-size: ${size}; font-weight: ${weight}; color: ${color}; white-space: nowrap;`;
        div.textContent = text; htmlLayer.appendChild(div); return div;
      }
    }
  };
};

ui.org.monitor = ({ header, height = 'auto' } = {}) => {
  const container = document.createElement('div');
  container.className = 'org-monitor';
  if (height !== 'auto') container.style.minHeight = height;

  if (header) {
    const head = document.createElement('div');
    head.className = 'monitor-header';
    const title = document.createElement('span');
    title.className = 'monitor-title';
    title.innerText = header;
    head.appendChild(title);
    container.appendChild(head);
  }

  const grid = document.createElement('div');
  grid.className = 'monitor-grid';
  container.appendChild(grid);
  container.body = grid;

  container.addValue = (label, value, { comment = '', color = theme.blue } = {}) => {
    const el = document.createElement('div');
    el.className = 'mol-stat-card';
    el.style.setProperty('--card-color', color);
    const labelEl = document.createElement('div'); labelEl.className = 'stat-label'; labelEl.innerText = label;
    const valueEl = document.createElement('div'); valueEl.className = 'stat-value'; valueEl.style.color = color; valueEl.innerText = value;
    el.appendChild(labelEl); el.appendChild(valueEl);
    const commentEl = document.createElement('div'); commentEl.className = 'stat-comment'; commentEl.innerText = comment; el.appendChild(commentEl);
    grid.appendChild(el);
    return { el, update: (newVal, newComment) => { valueEl.innerText = newVal; if (newComment !== undefined) commentEl.innerText = newComment; } };
  };

  container.addVersus = (label, valA, valB, { labelA = 'A', labelB = 'B', colorA = theme.blue, colorB = theme.red } = {}) => {
    const el = document.createElement('div'); el.className = 'mol-versus-card';
    const header = document.createElement('div'); header.className = 'versus-header'; header.innerText = label;
    const valuesCont = document.createElement('div'); valuesCont.className = 'versus-values';
    const left = document.createElement('div'); left.className = 'v-left'; left.style.color = colorA; left.innerHTML = `<span class="v-val">${valA}</span><span class="v-lbl">${labelA}</span>`;
    const right = document.createElement('div'); right.className = 'v-right'; right.style.color = colorB; right.innerHTML = `<span class="v-lbl">${labelB}</span><span class="v-val">${valB}</span>`;
    valuesCont.appendChild(left); valuesCont.appendChild(right);
    const bar = document.createElement('div'); bar.className = 'versus-bar';
    const fillA = document.createElement('div'); fillA.className = 'v-fill-a'; fillA.style.background = colorA;
    const fillB = document.createElement('div'); fillB.className = 'v-fill-b'; fillB.style.background = colorB;
    bar.appendChild(fillA); bar.appendChild(fillB);
    const updateBars = (a, b) => { const total = (a + b) || 1; const pctA = (a / total) * 100; fillA.style.width = pctA + '%'; fillB.style.width = (100 - pctA) + '%'; };
    updateBars(valA, valB);
    el.appendChild(header); el.appendChild(valuesCont); el.appendChild(bar);
    grid.appendChild(el);
    return { el, update: (newA, newB) => { left.querySelector('.v-val').innerText = newA; right.querySelector('.v-val').innerText = newB; updateBars(newA, newB); } };
  };

  container.addStatus = (label, statusText, level = 'info', { comment = '' } = {}) => {
    const el = document.createElement('div'); el.className = `mol-status-card is-${level}`;
    const labelEl = document.createElement('div'); labelEl.className = 'status-label'; labelEl.innerText = label;
    const textEl = document.createElement('div'); textEl.className = 'status-text'; textEl.innerText = statusText;
    const commentEl = document.createElement('div'); commentEl.className = 'stat-comment'; commentEl.style.marginTop = '4px'; commentEl.innerText = comment;
    el.appendChild(labelEl); el.appendChild(textEl); el.appendChild(commentEl);
    grid.appendChild(el);
    return { el, update: (newText, newLevel, newComment) => { if (newText !== undefined) textEl.innerText = newText; if (newLevel) el.className = `mol-status-card is-${newLevel}`; if (newComment !== undefined) commentEl.innerText = newComment; } };
  };

  container.addProgressBar = (label, value, { min = 0, max = 1, threshold = 0.5, colorGood = theme.green, colorBad = theme.red } = {}) => {
    const el = document.createElement('div'); el.className = 'mol-progressbar-card';
    const labelCont = document.createElement('div'); labelCont.className = 'progress-label-cont';
    const labelEl = document.createElement('span'); labelEl.className = 'progress-label'; labelEl.innerText = label;
    const valueEl = document.createElement('span'); valueEl.className = 'progress-value';
    labelCont.appendChild(labelEl); labelCont.appendChild(valueEl);
    const track = document.createElement('div'); track.className = 'progress-track';
    const fill = document.createElement('div'); fill.className = 'progress-fill';
    track.appendChild(fill);
    const update = (v) => {
      const pct = Math.max(0, Math.min(1, (v - min) / (max - min)));
      valueEl.innerText = (pct * 100).toFixed(1) + '%'; fill.style.width = (pct * 100) + '%';
      const isGood = pct >= threshold; fill.style.background = isGood ? colorGood : colorBad; fill.style.boxShadow = `0 0 10px ${isGood ? colorGood : colorBad}44`;
    };
    update(value);
    el.appendChild(labelCont); el.appendChild(track); grid.appendChild(el);
    return { el, update: (newVal) => update(newVal) };
  };

  container.clear = () => { grid.innerHTML = ''; };
  return container;
};

// =============================================================================
// BACKWARD COMPATIBILITY & ALIASES
// =============================================================================

ui.org.terminal = ui.atom.terminal;
ui.atom.monitor = ui.org.monitor;
ui.mol.stats = ui.org.monitor;

// Attach to window for legacy code if necessary, but preferred use is via import
if (typeof window !== 'undefined') {
  window.ui = ui;
  window.theme = theme;
}
