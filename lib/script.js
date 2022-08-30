// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 40, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand().range([0, width]).padding(0.1);
var y = d3.scaleLinear().range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3
  .select(".bar-graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// title
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", 0 - margin.top / 2 + 15)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("text-decoration", "underline")
  .text("Code Execution Graphs");

// x axis
svg
  .append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width - 380)
  .attr("y", height + 36)
  .text("Start Times");

svg
  .append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Execution Times");

// get the data
d3.csv("data.csv").then(function (data) {
  // format the data
  console.log(data);
  data.forEach(function (d) {
    d.executionTimes = +d.executionTimes;
  });

  // Scale the range of the data in the domains
  x.domain(
    data.map(function (d) {
      return d.codeFunction;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d.executionTimes;
    }),
  ]);

  // append the rectangles for the bar chart
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return x(d.codeFunction);
    })
    .attr("width", x.bandwidth())
    .attr("y", function (d) {
      return y(d.executionTimes);
    })
    .attr("height", function (d) {
      return height - y(d.executionTimes);
    });

  // add the x Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));
});
