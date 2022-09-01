// Get the data
d3.csv('alphabet.csv').then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.letter = d.letter;
    d.frequency = +d.frequency;
  });

  console.log(data);
});

// set up dimensions and margins
margin = { top: 20, right: 0, bottom: 30, left: 40 };
height = 500;

// x axis
xAxis = (g) => {
  g.attr('transform', `translate(0,${height - margin.bottom})`) // This controls the vertical position of the Axis
    .call(d3.axisBottom(x).tickSizeOuter(0)); //Creates bottom horizontal axis with an  outer tick size equal to 0
};

yAxis = (g) => {
  g.attr('transform', `translate(${margin.left},0)`) // This controls the horizontal position of the Axis
    .call(d3.axisLeft(y)) //Creates left vertical axis
    .call((g) => g.select('.domain').remove());
};

const svg = d3.create('svg').attr('viewBox', [0, 0, width, height]); //This is the viewBox that we will be seeing (size of our svg)

svg.append('g').attr('class', 'x-axis').call(xAxis);

// JustAxis = {
//   // creating of the svg object in the body of the page
//   const svg = d3.create("svg")
//       .attr("viewBox", [0, 0, width, height]) //This is the viewBox that we will be seeing (size of our svg)
//       ;

// //Add the x-Axis
// svg.append("g")
//     .attr("class", "x-axis")
//     .call(xAxis);

// //Add the y-Axis
// svg.append("g")
//     .attr("class", "y-axis")
//     .call(yAxis);

// return svg.node();
// };
