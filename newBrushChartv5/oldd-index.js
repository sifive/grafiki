let margin = { top: 20, right: 30, bottom: 80, left: 60 },
  width = 860 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

mainMargin = { top: 48, right: 0, bottom: 24, left: 0 };
mainHeight = 450;
miniMargin = { top: 12, right: 0, bottom: 48, left: 0 };

let miniWidth = width - miniMargin.left - miniMargin.right;
let miniHeight = 100;
let mainWidth = width - mainMargin.left - mainMargin.right;

let exeKey = 'executions';

let barColor = '#766FAE';
let inactiveColor = '#E6E5F0';
let activeColor = '#534e7a';

let initialBrushXSelection = [0, 200];

let mainXAxis = (g) => {
  g.attr('transform', `translate(0,${mainHeight})`).call(
    d3
      .axisBottom(mainXScale)
      .tickSizeOuter(0)
      .tickFormat((d) => d3.timeFormat('%a')(d).substring(0, 1))
  );
};

mainXZoom = d3.scaleLinear().range([0, mainWidth]).domain([0, mainWidth]);

// put these inside the d3 json data------------------------------

// "iteration"
// :2},{"entryTime":19336,
// "duration":148

d3.json('test_prime_20.json').then(function (data) {
  data = data[exeKey];
  console.log(data);

  miniYScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.duration) + 20])
    .nice()
    .range([0, miniHeight]);

  mainYScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.duration) + 20])
    .nice()
    .range([mainMargin.top, mainHeight - mainMargin.bottom]);

  miniXScale = d3
    .scaleBand()
    .domain(data.map((d) => d.iteration))
    .range([0, miniWidth])
    .paddingInner(0.4);

  mainXScale = d3
    .scaleBand()
    .domain(data.map((d) => d.iteration))
    .range([mainMargin.left, width - mainMargin.right])
    .paddingInner(0.4);

  minimapPositionTranslate =
    '' +
    miniMargin.left +
    ',' +
    parseFloat(
      mainMargin.top + mainHeight + mainMargin.bottom + miniMargin.top
    );

  // -----------update----------

  function update() {
    const bar = d3
      .select('.mainBarsGroup')
      .selectAll('.bar')
      .data(data, (d) => d.dayCount)
      .attr('x', (d) => mainXScale(d.iteration))
      .attr('y', (d) => mainHeight - mainYScale(d.y))
      .attr('width', mainXScale.bandwidth())
      .attr('height', (d) => mainYScale(d.y));
  }
  // --------------------------

  // ------brush move----------
  function brushmove() {
    const extentX = d3.event.selection;
    const selected = miniXScale
      .domain()
      .filter(
        (d) =>
          extentX[0] - miniXScale.bandwidth() + 1e-2 <= miniXScale(d) &&
          miniXScale(d) <= extentX[1] - 1e-2
      );

    d3.select('.miniGroup')
      .selectAll('.bar')
      .style('fill', (d) =>
        selected.indexOf(d.iteration) > -1 ? barColor : inactiveColor
      );

    let originalRange = mainXZoom.range();
    mainXZoom.domain(extentX);

    mainXScale.domain(data.map((d) => d.iteration));
    mainXScale
      .range([mainXZoom(originalRange[0]), mainXZoom(originalRange[1])])
      .paddingInner(0.4);

    d3.select('.wrapperGroup').select('.x-axis').call(mainXAxis);

    update();
  }

  // ---------brush center-----------
  function brushcenter(self) {
    let selection = d3.brushSelection(brushGroup.node()),
      size = selection[1] - selection[0],
      range = miniXScale.range(),
      cx = d3.mouse(self)[0],
      x0 = cx - size / 2,
      x1 = cx + size / 2,
      y1 = d3.max(range) + miniXScale.bandwidth(),
      pos = x1 > y1 ? [y1 - size, y1] : x0 < 0 ? [0, size] : [x0, x1];

    brushGroup.call(brush.move, pos);
  }

  // ------------brush---------------
  brush = d3
    .brushX()
    .extent([
      [0, 0],
      [miniWidth, miniHeight],
    ])
    .on('brush', brushmove);

  // ---------------------------

  const svg = d3
    .select('#mainGraph') // div to be attached to
    .append('svg')
    .attr('class', 'svgWrapper')
    .attr('width', width)
    .attr('height', height)
    .on('wheel.zoom', scroll);
  // view box
  const wrapperGroup = svg.append('g').attr('class', 'wrapperGroup');

  const mainBarsGroup = wrapperGroup
    .append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('class', 'mainBarsGroup');

  const miniGroup = svg
    .append('g')
    .attr('class', 'miniGroup')
    .attr('transform', 'translate(' + minimapPositionTranslate + ')');

  const brushGroup = svg
    .append('g')
    .attr('class', 'brushWrapper')
    .attr('transform', 'translate(' + minimapPositionTranslate + ')')
    .append('g')
    .attr('class', 'brush')
    .call(brush);

  brushGroup.selectAll('rect').attr('width', miniWidth);

  brushGroup
    .select('.overlay')
    .each((d) => (d.type = 'selection'))
    .on('mousedown touchstart', function () {
      brushcenter(this);
    });

  const miniBars = miniGroup
    .selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', (d) => miniXScale(d.iteration))
    .attr('y', (d) => miniHeight - miniYScale(d.duration))
    .attr('width', miniXScale.bandwidth())
    .attr('height', (d) => miniYScale(d.duration))
    .style('fill', barColor);

  wrapperGroup.append('g').attr('class', 'x-axis').call(mainXAxis);

  const mainBars = mainBarsGroup
    .append('g')
    .attr('class', 'bars')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('role', 'presentation')
    .attr('class', 'bar')
    .attr('fill', barColor);

  // yield svg.node();
  brushGroup.call(brush.move, initialBrushXSelection);

  // end of function
});

// ---------------------------------------------------------------
