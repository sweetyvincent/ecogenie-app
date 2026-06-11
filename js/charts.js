/* ============================================================
   EcoGenie — Custom SVG Chart Library
   Animated, responsive, tooltip-enabled SVG charts
   ============================================================ */

const EcoCharts = (() => {
  const colors = {
    primary: '#0d9488',
    primaryLight: '#14b8a6',
    secondary: '#059669',
    accent: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    pink: '#ec4899',
    orange: '#f97316',
    lime: '#84cc16',
    categories: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316']
  };

  function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  function createTooltip(container) {
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      container.style.position = 'relative';
      container.appendChild(tooltip);
    }
    return tooltip;
  }

  function showTooltip(tooltip, x, y, content) {
    tooltip.innerHTML = content;
    tooltip.classList.add('visible');
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip(tooltip) {
    tooltip.classList.remove('visible');
  }

  function animateValue(el, attr, from, to, duration, delay = 0) {
    const anim = createSVGElement('animate', {
      attributeName: attr,
      from: from,
      to: to,
      dur: duration + 'ms',
      begin: delay + 'ms',
      fill: 'freeze',
      calcMode: 'spline',
      keySplines: '0.4 0 0.2 1'
    });
    el.appendChild(anim);
  }

  /* ── Donut Chart ── */
  function DonutChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      size = 220,
      thickness = 28,
      centerText = '',
      centerSubtext = '',
      showLegend = true,
      animated = true
    } = options;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = size / 2;
    const cy = size / 2;

    const svg = createSVGElement('svg', {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      style: 'display: block; margin: 0 auto;'
    });

    // Background circle
    const bgCircle = createSVGElement('circle', {
      cx, cy, r: radius,
      fill: 'none',
      stroke: 'rgba(255,255,255,0.05)',
      'stroke-width': thickness
    });
    svg.appendChild(bgCircle);

    // Data arcs
    let offset = 0;
    data.forEach((d, i) => {
      const percent = d.value / total;
      const dashLength = circumference * percent;
      const dashOffset = circumference - dashLength;

      const circle = createSVGElement('circle', {
        cx, cy, r: radius,
        fill: 'none',
        stroke: d.color || colors.categories[i % colors.categories.length],
        'stroke-width': thickness,
        'stroke-dasharray': `${dashLength} ${circumference - dashLength}`,
        'stroke-dashoffset': animated ? circumference : -offset,
        'stroke-linecap': 'round',
        transform: `rotate(${-90 + (offset / circumference) * 360} ${cx} ${cy})`,
        style: `transition: stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s; cursor: pointer;`,
        'data-label': d.label,
        'data-value': d.value,
        'data-percent': (percent * 100).toFixed(1)
      });

      if (animated) {
        setTimeout(() => {
          circle.setAttribute('stroke-dashoffset', -offset);
        }, 50);
      }

      // Hover effect
      const tooltip = createTooltip(container);
      circle.addEventListener('mouseenter', (e) => {
        circle.setAttribute('stroke-width', thickness + 4);
        const rect = container.getBoundingClientRect();
        showTooltip(tooltip, e.clientX - rect.left + 10, e.clientY - rect.top - 30,
          `<strong>${d.label}</strong><br>${d.value.toFixed(1)} kg CO₂ (${(percent * 100).toFixed(1)}%)`);
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke-width', thickness);
        hideTooltip(tooltip);
      });

      svg.appendChild(circle);
      offset += dashLength;
    });

    // Center text
    if (centerText) {
      const textGroup = createSVGElement('g');
      const mainText = createSVGElement('text', {
        x: cx, y: centerSubtext ? cy - 6 : cy,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: '#f8fafc',
        'font-family': 'Outfit, sans-serif',
        'font-size': '28',
        'font-weight': '800'
      });
      mainText.textContent = centerText;
      textGroup.appendChild(mainText);

      if (centerSubtext) {
        const subText = createSVGElement('text', {
          x: cx, y: cy + 18,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          fill: '#94a3b8',
          'font-family': 'Inter, sans-serif',
          'font-size': '11'
        });
        subText.textContent = centerSubtext;
        textGroup.appendChild(subText);
      }
      svg.appendChild(textGroup);
    }

    container.appendChild(svg);

    // Legend
    if (showLegend) {
      const legend = document.createElement('div');
      legend.className = 'chart-legend';
      data.forEach((d, i) => {
        const item = document.createElement('div');
        item.className = 'chart-legend-item';
        item.innerHTML = `<span class="legend-dot" style="background:${d.color || colors.categories[i % colors.categories.length]}"></span>${d.label}`;
        legend.appendChild(item);
      });
      container.appendChild(legend);
    }

    return { update: (newData) => DonutChart(containerId, newData, options) };
  }

  /* ── Bar Chart ── */
  function BarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      width = container.offsetWidth || 500,
      height = 250,
      barColor = null,
      showValues = true,
      animated = true,
      gridLines = true
    } = options;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.15;
    const barWidth = Math.min(40, (chartW / data.length) * 0.6);
    const barGap = (chartW - barWidth * data.length) / (data.length + 1);

    const svg = createSVGElement('svg', {
      width: '100%',
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet'
    });

    // Defs for gradient
    const defs = createSVGElement('defs');
    const grad = createSVGElement('linearGradient', { id: `barGrad-${containerId}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    const stop1 = createSVGElement('stop', { offset: '0%', 'stop-color': colors.primaryLight });
    const stop2 = createSVGElement('stop', { offset: '100%', 'stop-color': colors.primary });
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Grid lines
    if (gridLines) {
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        const line = createSVGElement('line', {
          x1: padding.left, y1: y,
          x2: width - padding.right, y2: y,
          stroke: 'rgba(255,255,255,0.05)',
          'stroke-width': 1
        });
        svg.appendChild(line);

        const label = createSVGElement('text', {
          x: padding.left - 10, y: y + 4,
          'text-anchor': 'end',
          fill: '#64748b',
          'font-size': '10',
          'font-family': 'Inter, sans-serif'
        });
        label.textContent = Math.round(maxVal * (1 - i / 4));
        svg.appendChild(label);
      }
    }

    const tooltip = createTooltip(container);

    // Bars
    data.forEach((d, i) => {
      const barH = (d.value / maxVal) * chartH;
      const x = padding.left + barGap + i * (barWidth + barGap);
      const y = padding.top + chartH - barH;

      // Bar background
      const bgRect = createSVGElement('rect', {
        x, y: padding.top,
        width: barWidth,
        height: chartH,
        fill: 'rgba(255,255,255,0.02)',
        rx: 4
      });
      svg.appendChild(bgRect);

      // Bar
      const rect = createSVGElement('rect', {
        x,
        y: animated ? padding.top + chartH : y,
        width: barWidth,
        height: animated ? 0 : barH,
        fill: d.color || `url(#barGrad-${containerId})`,
        rx: 4,
        style: `cursor: pointer; transition: all 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s;`
      });

      rect.addEventListener('mouseenter', (e) => {
        rect.setAttribute('opacity', '0.8');
        const rct = container.getBoundingClientRect();
        showTooltip(tooltip, e.clientX - rct.left + 10, e.clientY - rct.top - 30,
          `<strong>${d.label}</strong><br>${d.value.toFixed(1)} kg CO₂`);
      });
      rect.addEventListener('mouseleave', () => {
        rect.setAttribute('opacity', '1');
        hideTooltip(tooltip);
      });

      svg.appendChild(rect);

      if (animated) {
        setTimeout(() => {
          rect.setAttribute('y', y);
          rect.setAttribute('height', barH);
        }, 50);
      }

      // Value label
      if (showValues) {
        const valText = createSVGElement('text', {
          x: x + barWidth / 2,
          y: y - 6,
          'text-anchor': 'middle',
          fill: '#94a3b8',
          'font-size': '10',
          'font-family': 'Inter, sans-serif',
          'font-weight': '600',
          opacity: animated ? 0 : 1,
          style: `transition: opacity 0.5s ease ${i * 0.1 + 0.5}s;`
        });
        valText.textContent = d.value.toFixed(1);
        svg.appendChild(valText);
        if (animated) setTimeout(() => valText.setAttribute('opacity', 1), 50);
      }

      // X-axis label
      const xLabel = createSVGElement('text', {
        x: x + barWidth / 2,
        y: height - padding.bottom + 20,
        'text-anchor': 'middle',
        fill: '#94a3b8',
        'font-size': '10',
        'font-family': 'Inter, sans-serif'
      });
      xLabel.textContent = d.label;
      svg.appendChild(xLabel);
    });

    container.appendChild(svg);
    return { update: (newData) => BarChart(containerId, newData, options) };
  }

  /* ── Line Chart ── */
  function LineChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      width = container.offsetWidth || 500,
      height = 250,
      lineColor = colors.primaryLight,
      fillGradient = true,
      showDots = true,
      animated = true,
      showArea = true,
      gridLines = true
    } = options;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.15;
    const minVal = Math.min(...data.map(d => d.value)) * 0.85;
    const range = maxVal - minVal;

    const svg = createSVGElement('svg', {
      width: '100%',
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet'
    });

    // Defs
    const defs = createSVGElement('defs');
    const areaGrad = createSVGElement('linearGradient', {
      id: `areaGrad-${containerId}`, x1: '0', y1: '0', x2: '0', y2: '1'
    });
    areaGrad.appendChild(createSVGElement('stop', { offset: '0%', 'stop-color': lineColor, 'stop-opacity': '0.3' }));
    areaGrad.appendChild(createSVGElement('stop', { offset: '100%', 'stop-color': lineColor, 'stop-opacity': '0.02' }));
    defs.appendChild(areaGrad);
    svg.appendChild(defs);

    // Grid
    if (gridLines) {
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        svg.appendChild(createSVGElement('line', {
          x1: padding.left, y1: y,
          x2: width - padding.right, y2: y,
          stroke: 'rgba(255,255,255,0.05)',
          'stroke-width': 1
        }));
        const label = createSVGElement('text', {
          x: padding.left - 10, y: y + 4,
          'text-anchor': 'end',
          fill: '#64748b',
          'font-size': '10',
          'font-family': 'Inter, sans-serif'
        });
        label.textContent = Math.round(maxVal - (range * i / 4));
        svg.appendChild(label);
      }
    }

    // Calculate points
    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + ((maxVal - d.value) / range) * chartH,
      value: d.value,
      label: d.label
    }));

    // Smooth line path
    function getSmoothPath(pts) {
      if (pts.length < 2) return '';
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
        const cp1y = pts[i].y;
        const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
        const cp2y = pts[i + 1].y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
      }
      return path;
    }

    const linePath = getSmoothPath(points);

    // Area fill
    if (showArea) {
      const areaPath = linePath +
        ` L ${points[points.length - 1].x} ${padding.top + chartH}` +
        ` L ${points[0].x} ${padding.top + chartH} Z`;
      const area = createSVGElement('path', {
        d: areaPath,
        fill: `url(#areaGrad-${containerId})`,
        opacity: animated ? 0 : 1,
        style: 'transition: opacity 1s ease 0.3s;'
      });
      svg.appendChild(area);
      if (animated) setTimeout(() => area.setAttribute('opacity', 1), 50);
    }

    // Line
    const line = createSVGElement('path', {
      d: linePath,
      fill: 'none',
      stroke: lineColor,
      'stroke-width': 2.5,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });

    if (animated) {
      const lineLength = line.getTotalLength ? 1000 : 1000;
      line.setAttribute('stroke-dasharray', lineLength);
      line.setAttribute('stroke-dashoffset', lineLength);
      line.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
    }

    svg.appendChild(line);
    if (animated) setTimeout(() => line.setAttribute('stroke-dashoffset', 0), 50);

    // Dots
    const tooltip = createTooltip(container);
    if (showDots) {
      points.forEach((p, i) => {
        const outerDot = createSVGElement('circle', {
          cx: p.x, cy: p.y, r: 6,
          fill: 'transparent',
          stroke: 'transparent',
          'stroke-width': 2,
          style: 'cursor: pointer;'
        });

        const dot = createSVGElement('circle', {
          cx: p.x, cy: p.y,
          r: animated ? 0 : 4,
          fill: lineColor,
          stroke: '#0a0f1e',
          'stroke-width': 2,
          style: `transition: r 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1 + 0.8}s;`
        });

        outerDot.addEventListener('mouseenter', (e) => {
          dot.setAttribute('r', 6);
          const rect = container.getBoundingClientRect();
          showTooltip(tooltip, e.clientX - rect.left + 10, e.clientY - rect.top - 30,
            `<strong>${p.label}</strong><br>${p.value.toFixed(1)} kg CO₂`);
        });
        outerDot.addEventListener('mouseleave', () => {
          dot.setAttribute('r', 4);
          hideTooltip(tooltip);
        });

        svg.appendChild(dot);
        svg.appendChild(outerDot);
        if (animated) setTimeout(() => dot.setAttribute('r', 4), 50);
      });
    }

    // X-axis labels
    points.forEach((p, i) => {
      if (i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) {
        const label = createSVGElement('text', {
          x: p.x, y: height - padding.bottom + 20,
          'text-anchor': 'middle',
          fill: '#94a3b8',
          'font-size': '10',
          'font-family': 'Inter, sans-serif'
        });
        label.textContent = p.label;
        svg.appendChild(label);
      }
    });

    container.appendChild(svg);
    return { update: (newData) => LineChart(containerId, newData, options) };
  }

  /* ── Progress Ring ── */
  function ProgressRing(containerId, percentage, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      size = 180,
      thickness = 12,
      color = colors.primaryLight,
      bgColor = 'rgba(255,255,255,0.05)',
      centerText = null,
      centerSubtext = '',
      animated = true,
      showPercentage = true
    } = options;

    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - percentage / 100);
    const cx = size / 2;
    const cy = size / 2;

    const svg = createSVGElement('svg', {
      width: size, height: size,
      viewBox: `0 0 ${size} ${size}`,
      style: 'display: block; margin: 0 auto;'
    });

    // Defs
    const defs = createSVGElement('defs');
    const grad = createSVGElement('linearGradient', {
      id: `ringGrad-${containerId}`, x1: '0', y1: '0', x2: '1', y2: '1'
    });
    grad.appendChild(createSVGElement('stop', { offset: '0%', 'stop-color': color }));
    grad.appendChild(createSVGElement('stop', { offset: '100%', 'stop-color': colors.secondary }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Background ring
    svg.appendChild(createSVGElement('circle', {
      cx, cy, r: radius,
      fill: 'none',
      stroke: bgColor,
      'stroke-width': thickness
    }));

    // Progress ring
    const ring = createSVGElement('circle', {
      cx, cy, r: radius,
      fill: 'none',
      stroke: `url(#ringGrad-${containerId})`,
      'stroke-width': thickness,
      'stroke-dasharray': circumference,
      'stroke-dashoffset': animated ? circumference : dashOffset,
      'stroke-linecap': 'round',
      transform: `rotate(-90 ${cx} ${cy})`,
      style: 'transition: stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1);'
    });

    // Glow
    ring.setAttribute('filter', '');
    svg.appendChild(ring);

    if (animated) {
      setTimeout(() => ring.setAttribute('stroke-dashoffset', dashOffset), 100);
    }

    // Center text
    const displayText = centerText !== null ? centerText : (showPercentage ? percentage : '');
    if (displayText !== '') {
      const text = createSVGElement('text', {
        x: cx, y: centerSubtext ? cy - 6 : cy,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: '#f8fafc',
        'font-family': 'Outfit, sans-serif',
        'font-size': size > 150 ? '32' : '22',
        'font-weight': '800'
      });
      text.textContent = displayText;
      svg.appendChild(text);
    }

    if (centerSubtext) {
      const sub = createSVGElement('text', {
        x: cx, y: cy + 18,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: '#94a3b8',
        'font-family': 'Inter, sans-serif',
        'font-size': '11'
      });
      sub.textContent = centerSubtext;
      svg.appendChild(sub);
    }

    container.appendChild(svg);
    return {
      update: (newPercentage) => ProgressRing(containerId, newPercentage, options),
      ring
    };
  }

  /* ── Spark Line ── */
  function SparkLine(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      width = container.offsetWidth || 120,
      height = 40,
      lineColor = colors.primaryLight,
      fillColor = true,
      animated = true,
      strokeWidth = 2
    } = options;

    const svg = createSVGElement('svg', {
      width: '100%', height,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'none'
    });

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;
    const padding = 4;

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * (width - 2 * padding),
      y: padding + ((maxVal - v) / range) * (height - 2 * padding)
    }));

    // Smooth path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpx1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
      const cpy1 = points[i].y;
      const cpx2 = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
      const cpy2 = points[i + 1].y;
      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    if (fillColor) {
      const defs = createSVGElement('defs');
      const grad = createSVGElement('linearGradient', {
        id: `sparkGrad-${containerId}`, x1: '0', y1: '0', x2: '0', y2: '1'
      });
      grad.appendChild(createSVGElement('stop', { offset: '0%', 'stop-color': lineColor, 'stop-opacity': '0.2' }));
      grad.appendChild(createSVGElement('stop', { offset: '100%', 'stop-color': lineColor, 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const areaPath = path +
        ` L ${points[points.length - 1].x} ${height}` +
        ` L ${points[0].x} ${height} Z`;
      svg.appendChild(createSVGElement('path', {
        d: areaPath,
        fill: `url(#sparkGrad-${containerId})`
      }));
    }

    const line = createSVGElement('path', {
      d: path,
      fill: 'none',
      stroke: lineColor,
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });

    if (animated) {
      line.setAttribute('stroke-dasharray', '500');
      line.setAttribute('stroke-dashoffset', '500');
      line.style.transition = 'stroke-dashoffset 1s ease';
    }

    svg.appendChild(line);

    // End dot
    const lastPt = points[points.length - 1];
    svg.appendChild(createSVGElement('circle', {
      cx: lastPt.x, cy: lastPt.y, r: 3,
      fill: lineColor
    }));

    container.appendChild(svg);
    if (animated) setTimeout(() => line.setAttribute('stroke-dashoffset', 0), 50);

    return { update: (newData) => SparkLine(containerId, newData, options) };
  }

  /* ── Horizontal Bar Chart ── */
  function HorizontalBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const {
      barHeight = 28,
      gap = 12,
      showLabels = true,
      showValues = true,
      animated = true,
      maxValue = null
    } = options;

    const max = maxValue || Math.max(...data.map(d => d.value)) * 1.1;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:' + gap + 'px;';

    data.forEach((d, i) => {
      const pct = (d.value / max) * 100;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;';

      if (showLabels) {
        const label = document.createElement('div');
        label.style.cssText = 'width:80px;font-size:0.8rem;color:#94a3b8;text-align:right;flex-shrink:0;';
        label.textContent = d.label;
        row.appendChild(label);
      }

      const barWrap = document.createElement('div');
      barWrap.style.cssText = `flex:1;height:${barHeight}px;background:rgba(255,255,255,0.05);border-radius:6px;overflow:hidden;position:relative;`;

      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;border-radius:6px;transition:width 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s;background:${d.color || 'linear-gradient(90deg, #0d9488, #059669)'};width:${animated ? 0 : pct}%;`;

      barWrap.appendChild(fill);
      row.appendChild(barWrap);

      if (showValues) {
        const val = document.createElement('div');
        val.style.cssText = 'width:60px;font-size:0.8rem;color:#f8fafc;font-weight:600;';
        val.textContent = d.value.toFixed(1);
        row.appendChild(val);
      }

      wrapper.appendChild(row);
      if (animated) setTimeout(() => { fill.style.width = pct + '%'; }, 50);
    });

    container.appendChild(wrapper);
    return { update: (newData) => HorizontalBarChart(containerId, newData, options) };
  }

  return { DonutChart, BarChart, LineChart, ProgressRing, SparkLine, HorizontalBarChart, colors };
})();
