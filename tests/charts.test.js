if (typeof require !== 'undefined') {
  global.EcoCharts = require('../js/charts.js');
}

describe('EcoCharts Library', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render a DonutChart', () => {
    const container = document.createElement('div');
    container.id = 'donut-container';
    document.body.appendChild(container);

    const data = [
      { label: 'Category A', value: 10, color: '#ff0000' },
      { label: 'Category B', value: 20, color: '#00ff00' }
    ];

    EcoCharts.DonutChart('donut-container', data, { size: 200, thickness: 20 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('width')).toBe('200');
    expect(container.innerHTML).toContain('Category A');
  });

  test('should render a BarChart', () => {
    const container = document.createElement('div');
    container.id = 'bar-container';
    document.body.appendChild(container);

    const data = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 150 }
    ];

    EcoCharts.BarChart('bar-container', data, { height: 200 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.innerHTML).toContain('Jan');
    expect(container.innerHTML).toContain('Feb');
  });

  test('should render a LineChart', () => {
    const container = document.createElement('div');
    container.id = 'line-container';
    document.body.appendChild(container);

    const data = [
      { label: 'Day 1', value: 10 },
      { label: 'Day 2', value: 15 }
    ];

    EcoCharts.LineChart('line-container', data, { height: 200 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.innerHTML).toContain('Day 1');
  });

  test('should render a ProgressRing', () => {
    const container = document.createElement('div');
    container.id = 'ring-container';
    document.body.appendChild(container);

    EcoCharts.ProgressRing('ring-container', 75, { size: 150 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.innerHTML).toContain('75');
  });

  test('should render a SparkLine', () => {
    const container = document.createElement('div');
    container.id = 'spark-container';
    document.body.appendChild(container);

    EcoCharts.SparkLine('spark-container', [10, 20, 15, 30], { height: 40 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  test('should render a HorizontalBarChart', () => {
    const container = document.createElement('div');
    container.id = 'hbar-container';
    document.body.appendChild(container);

    const data = [
      { label: 'Meat', value: 50 },
      { label: 'Veg', value: 10 }
    ];

    EcoCharts.HorizontalBarChart('hbar-container', data, { barHeight: 20 });
    expect(container.innerHTML).toContain('Meat');
    expect(container.innerHTML).toContain('Veg');
  });
});
