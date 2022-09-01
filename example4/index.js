// let windowfunc = require('functions.js');
// / data and labels to plot
const data = [30, 10, 50, 20, 35, 45, 25];
const labels = ['1992', '1993', '1994', '1995', '1996', '1997', '1998'];

// bg color of bars
const bar_color = '#FFCB65';
// top and bottom margins
const top_offset = 50;
const bottom_offset = 50;
// maximum height of the svg element
// this will include top and bottom offset
const svg_height = 300;
// maximum width of single bar so bar doesn't look like a box
const max_bar_width = 100;

let shadeColor = (color, percent) => {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
};
let windowLoader = () => {
  window.onload = () => {
    // set animation
    rect
      .transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr('y', (d) => svg_height - bottom_offset - scale(d))
      .attr('height', (d) => scale(d));
  };
};

// append svg
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('fill', 'red')
  .attr('width', '100%')
  .attr('height', svg_height);

// to make graph responsive calcuate we set width 100%
// here we calculate width in pixels
const svg_width = svg.node().getBoundingClientRect().width;
// const svg_width = 1000;
// decide bar width depending upon available space and no. of bars to plot
let bar_width = Math.round((svg_width - 60) / data.length);
if (bar_width > max_bar_width) {
  bar_width = max_bar_width;
}

// spacing between two bars
// instead of having a fixed value we set it dynamically
const spacing = 0.15 * bar_width;

// to center align graph we move it from left to right
// this is applicable if there's any space left
let left_offset = Math.round((svg_width - bar_width * data.length) / 2);
if (left_offset < 0) {
  left_offset = 0;
}

// create scale
const scale = d3
  .scaleLinear()
  .domain([0, Math.max(...data)])
  .range([0, svg_height - top_offset - bottom_offset]);

// create scale for Y-Axis
// we could have used scale above but for Y-Axis we need domain reversed
const scale_y_axis = d3
  .scaleLinear()
  .domain([Math.max(...data), 0])
  .range([0, svg_height - top_offset - bottom_offset]);

// create tooltip element
const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'd3-tooltip')
  .style('position', 'absolute')
  .style('z-index', '10')
  .style('visibility', 'hidden')
  .style('padding', '15px')
  .style('background', 'rgba(0,0,0,0.6)')
  .style('border-radius', '5px')
  .style('color', '#fff')
  .text('a simple tooltip');

// append rect
const rect = svg
  .selectAll('g')
  .data(data)
  .enter()
  .append('rect')
  .attr('fill', bar_color)
  .attr('x', (d, i) => left_offset + bar_width * i)
  .attr('y', (d) => svg_height - bottom_offset)
  .attr('width', bar_width - spacing)
  .on('mouseover', function (d, i) {
    tooltip.html(`Data: ${d}`).style('visibility', 'visible');
    d3.select(this).attr('fill', shadeColor(bar_color, -15));
  })
  .on('mousemove', function () {
    tooltip
      .style('top', event.pageY - 10 + 'px')
      .style('left', event.pageX + 10 + 'px');
  })
  .on('mouseout', function () {
    tooltip.html(``).style('visibility', 'hidden');
    d3.select(this).attr('fill', bar_color);
  });

// append text
svg
  .selectAll('g')
  .data(data)
  .enter()
  .append('text')
  .attr('dominant-baseline', 'text-before-edge')
  .attr('text-anchor', 'middle')
  .attr('fill', '#000000')
  .attr(
    'x',
    (d, i) => left_offset + bar_width * i + bar_width / 2 - spacing / 2
  )
  .attr('y', svg_height - bottom_offset + 5)
  .attr('style', 'font-family:Verdana')
  .text((d, i) => labels[i]);

// append X-Axis
svg
  .append('line')
  .attr('stroke', '#000000')
  .attr('stroke-width', 2)
  .attr('x1', left_offset)
  .attr('y1', svg_height - bottom_offset)
  .attr('x2', bar_width * data.length + left_offset - spacing)
  .attr('y2', svg_height - bottom_offset);

// append Y-Axis
svg
  .append('g')
  .attr('transform', 'translate(7,' + top_offset + ')')
  .call(d3.axisRight(scale_y_axis));

// x axis label
svg
  .append('text')
  .attr('class', 'x label')
  .attr('text-anchor', 'end')
  .attr('x', bar_width * 5 - 50)
  .attr('y', svg_height - 10)
  .attr('fill', 'black')
  .text('execution times');

windowLoader();
