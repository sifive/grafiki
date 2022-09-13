let yAxisLabel = 'Execution Times';
let xAxisLabel = 'Iteration Times';
let exeKey = 'executionTimes';

// functions for various parts
let buildXY = (data) => {
  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.exeTime + 10)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  x = d3
    .scaleBand()
    .domain(data.map((d) => d.startTime))
    .range([margin.left, width - margin.right])
    .padding(0.1);
};

let buildAxis = () => {
  yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter([5]))
      .call((g) => g.select('.domain').remove());

  // x axis
  xAxis = (g) =>
    g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter([15]));
};

let barAnimation = (svg) => {
  svg
    .selectAll('rect')
    .transition()
    .duration(800)
    .attr('y', function (d) {
      return y(d.exeTime);
    })
    .attr('height', function (d) {
      return y(0) - y(d.exeTime);
    })
    .attr('opacity', 1)
    .delay(function (d, i) {
      return i * 15;
    });
};
function zoom(svg) {
  const extent = [
    [margin.left, margin.top],
    [width - margin.right, height - margin.top],
  ];

  svg.call(
    d3
      .zoom()
      .scaleExtent([1, 20])
      .translateExtent(extent)
      .extent(extent)
      .on('zoom', zoomed)
  );

  function zoomed(event) {
    x.range(
      [margin.left, width - margin.right].map((d) => event.transform.applyX(d))
    );
    svg
      .selectAll('.bars rect')
      .attr('x', (d) => x(d.startTime))
      .attr('width', x.bandwidth());
    svg.selectAll('.x-axis').call(xAxis);
  }
}

let addAxis = (svg) => {
  svg.append('g').attr('class', 'x-axis').call(xAxis);

  svg.append('g').attr('class', 'y-axis').call(yAxis);
};

let addBarAxisLabel = (svg, data) => {
  svg
    .selectAll('.text')
    .data(data)
    .enter()
    .append('text')
    .transition()
    .duration(600)
    .delay(function (d, i) {
      // console.log(i);
      return i * 10;
    })
    .attr('class', 'label')
    .attr('x', function (d) {
      return x(d.startTime);
    })
    .attr('y', function (d) {
      return y(d.exeTime) - 20;
    })
    .attr('dy', '2.75em')
    .attr('dx', '3')
    .text(function (d) {
      return d.exeTime;
    });
};

let addAxisLabel = (svg) => {
  svg
    .append('g')
    .append('text')
    .attr('class', 'x label')
    .attr('text-anchor', 'end')
    .attr('x', width / 2)
    .attr('y', height - 46)
    .text(xAxisLabel);

  // text label for the y axis

  svg
    .append('text')
    .attr('id', 'yAxisLabel')
    .attr('class', 'y label')
    .attr('text-anchor', 'end')
    .attr('y', 23) //closer to the graph
    .attr('x', -25)
    .attr('dy', '.75em')
    .attr('transform', 'rotate(-90)')
    .text(yAxisLabel);
};

let buildBars = (data, svg) => {
  svg
    .append('g')
    .attr('class', 'bars')
    .attr('fill', 'steelblue')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(d.startTime))
    .attr('y', (d) => y(0))
    .attr('width', x.bandwidth());
};

let margin = { top: 20, right: 30, bottom: 80, left: 60 },
  width = 860 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

// read json data
d3.json('output.json').then(function (data) {
  data = data['executionTimes'];

  // build XY scales
  buildXY(data);

  const svg = d3
    .select('#cegDiv') // div to be attached to
    .append('svg')
    .attr('viewBox', [0, 0, width, height])
    .call(zoom);

  // -------- Tooltip CODE ---------
  // /* Initialize tooltip */
  var tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .html((EVENT, d) => console.log('sss'));

  // /* Invoke the tip in the context of your visualization */
  // svg.call(tip);

  // // ------------- Showing tip on particular element, but based on other DOM element's data -------------
  // svg
  //   .selectAll('g')
  //   .on('mouseover', function (event, d) {
  //     const element = d3.select(this).select('.particular-element');
  //     tip.show(event, d, element.node());
  //   })
  //   .on('mouseout', tip.hide);
  // -----

  //  build the bars of the graph
  buildBars(data, svg);
  // build axis
  buildAxis();
  // animation
  barAnimation(svg);
  //  call both the axis and add them
  addAxis(svg);
  // text label for x axis
  addAxisLabel(svg);
  // this is the bar axis label
  addBarAxisLabel(svg, data);
});
