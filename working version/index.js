let yAxisLabel = 'Execution Times';
let xAxisLabel = 'Iteration Times';
let exeKey = 'executions';
let defaultColor = 'lightcoral';

let margin = { top: 20, right: 30, bottom: 80, left: 60 },
  width = 860 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

// functions for various parts
let buildXY = (data) => {
  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.duration + 10)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  x = d3
    .scaleBand()
    .domain(data.map((d) => d.iteration))
    .range([margin.left, width - margin.right])
    .padding(0.1);
};

let buildAxis = () => {
  yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
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
    .duration(250)
    .attr('y', function (d) {
      return y(d.duration);
    })
    .attr('height', function (d) {
      return y(0) - y(d.duration);
    })
    .attr('opacity', 1)
    .delay(function (d, i) {
      return i * 3;
    });
};
function zoom(svg) {
  const extent = [
    [margin.left, margin.top],
    [width - margin.right, height - margin.top],
  ];

  svg.call(
    // d3 zoom behavior
    d3
      .zoom()
      .scaleExtent([1, 50])
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
      .attr('x', (d) => x(d.iteration))
      .attr('width', x.bandwidth());
    svg.selectAll('.x-axis').call(xAxis);
  }
}

let addAxis = (svg) => {
  svg.append('g').attr('class', 'x-axis').call(xAxis);

  svg.append('g').attr('class', 'y-axis').call(yAxis);
};

let addYGridLines = (svg) => {
  function make_y_gridlines() {
    return d3.axisLeft(y).ticks(5);
  }

  svg
    .append('g')
    .attr('class', 'grid')
    .call(
      make_y_gridlines()
        .tickSize(-width - margin.left - margin.right)
        .tickFormat('')
    );
};

let addBarAxisLabel = (svg, data) => {
  const bText = svg
    .selectAll('.text')
    .data(data)
    .enter()
    .append('text')
    .transition()
    .duration(100)
    .delay(function (d, i) {
      return i * 1;
    })
    .attr('class', 'bar label')
    .attr('x', function (d) {
      return x(d.iteration);
      // d.iteration;
    })
    .attr('y', function (d) {
      return y(d.duration) - 20;
    })
    .attr('dy', '2.75em')
    .attr('dx', '3')
    .text(function (d) {
      return d.duration;
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
    .attr('y', 5) //closer to the graph
    .attr('x', -25)
    .attr('dy', '.75em')
    .attr('transform', 'rotate(-90)')
    .text(yAxisLabel);
};

let buildBars = (data, svg, tip) => {
  svg
    .append('g')
    .attr('class', 'bars')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .style('stroke', '#000')
    .attr('x', (d) => x(d.iteration))
    .attr('y', (d) => y(0))
    .attr('width', x.bandwidth())
    .style('fill', function (d) {
      if (d.duration <= 600) {
        return 'yellow';
      } else {
        return defaultColor;
      }
    })
    .on('mouseover', function (event, d) {
      const element = d3.select(this).datum().exeTime;
      d3.select(this)
        .attr('fill', 'red')
        .style('stroke', 'blue')
        .attr('stroke-width', 3);
      tip.show(event, d, element);
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .transition('colorfade')
        .duration(250)
        .attr('fill', defaultColor)
        .style('stroke', '#000')
        .attr('stroke-width', 1);
      tip.hide(d);
    });
};

let listenForThValue = (d3) => {
  d3.select('#thValue').on('input', function () {
    console.log(+this.value);
    let Thr = +this.value;
    // update the whole chart
    // Update the bar if the item in data is modified and already linked to a .bar element
    d3.selectAll('rect')
      .transition()
      .duration(1000)
      .style('fill', function (d) {
        if (d.duration <= Thr) {
          return 'yellow';
        } else {
          return defaultColor;
        }
      });
  });
};

// read json data
d3.json('test_prime_20.json').then(function (data) {
  data = data[exeKey];

  // build XY scales
  buildXY(data);

  // Tooltip
  var tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .html((EVENT, d) => 'Duration: ' + d.duration);

  const svg = d3
    .select('#cegDiv') // div to be attached to
    .append('svg')
    .attr('viewBox', [0, 0, width, height])
    .call(zoom)
    .call(tip);

  //  build the bars of the graph
  buildBars(data, svg, tip);
  // build axis
  buildAxis();

  // animation
  barAnimation(svg);
  //  call both the axis and add them
  addAxis(svg);
  // text label for x axis
  addAxisLabel(svg);
  // this is the bar axis label
  // addBarAxisLabel(svg, data);

  // grid
  // grid lines in y axis function
  addYGridLines(svg);

  // listen for HTML input
  // id =// thValue
  listenForThValue(d3);
});
