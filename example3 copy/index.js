// set the dimensions and margins of the graph
const margin = { top: 100, right: 30, bottom: 90, left: 90 },
  width = 1660 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]);

// append the svg object to the body of the page
const svg = d3
  .select('#cegGraph')
  .append('svg')
  .attr('width', window.innerWidth - 20)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.json('output.json').then(function (data) {
  data = data.executionTimes;

  // Add the x Axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map((d) => d.startTime))
    .tickFormat([0, 120])
    .padding(0.1);

  // Add the x Axis
  const x1 = d3
    .scaleBand()
    .range([0, width])
    .domain([0, 120])
    .tickFormat([0, 120])
    .padding(0.1);

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x1));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 50]).range([height, 0]);
  svg.append('g').call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll('mybar')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(d.startTime))
    .attr('width', x.bandwidth())
    .attr('fill', '#69b3a2')
    // no bar at the beginning thus:
    .attr('height', (d) => height - y(0)) // always equal to 0
    .attr('y', (d) => y(0));

  // Animation
  svg
    .selectAll('rect')
    .transition()
    .duration(800)
    .attr('y', (d) => y(d.exeTime))
    .attr('height', (d) => height - y(d.exeTime))
    .delay((d, i) => {
      // console.log(i);
      return i * 0.5;
    });

  // text label for the y axis
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 35)
    .attr('x', 0 - height / 2 + 10)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Execution Times');

  // text label for the x axis
  svg
    .append('text')
    // .append('x', 200)
    // .attr('x', window.width)
    // .attr('y', height + 30)
    .attr('transform', 'translate(height/2, 200)')
    .style('text-anchor', 'middle')
    .text('Start Times');
});
