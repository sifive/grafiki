margin = { top: 20, right: 0, bottom: 30, left: 40 };
height = 500 - margin.top - margin.bottom;
width = 460 - margin.left - margin.right;

d3.csv('alphabet.csv').then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.letter = d.letter;
    d.frequency = +d.frequency;
  });

  console.log(data);

  // x axis -------
  x = d3
    .scaleBand()
    .domain(data.map((d) => d.letter))
    //Here the domain is the letters in the our data and that's what will be written on the Axis
    .range([margin.left, width - margin.right])
    // margin.left and width-margin.right are respectively the minimum and maximum extents of the bands and that's where the axis will be placed.
    .padding(0.1);

  // y axis
  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.frequency)])
    .nice()
    //Here the domain of y will vary between 0 and the maximum frequency of the letters and that's what will be written on the Axis
    .range([height - margin.bottom, margin.top]);

  // --
  xAxis = (g) =>
    g
      .attr('transform', `translate(0,${height - margin.bottom})`) // This controls the vertical position of the Axis
      .call(d3.axisBottom(x).tickSizeOuter(0)); //Creates bottom horizontal axis with an  outer tick size equal to 0

  //
  yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`) // This controls the horizontal position of the Axis
      .call(d3.axisLeft(y)) //Creates left vertical axis
      .call((g) => g.select('.domain').remove()); //This removes the domain from the DOM API.

  // ----
  var svg = d3
    .select('#cegGraph')
    .append('svg')
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
    .attr('viewBox', [0, 0, width, height]);

  svg
    .append('g')
    .attr('transform', 'translate(-20,' + height + ')')
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append('g').call(d3.axisLeft(y));

  // svg.append('g').attr('class', 'x-axis').call(xAxis);

  // //   //Add the y-Axis
  // svg.append('g').attr('class', 'y-axis').call(yAxis);

  // this is the end of the function
});

// let JustAxis = () => {
//   // creating of the svg object in the body of the page
//   const svg = d3.create('svg').attr('viewBox', [0, 0, width, height]); //This is the viewBox that we will be seeing (size of our svg)
//   //Add the x-Axis
//   svg.append('g').attr('class', 'x-axis').call(xAxis);

//   //Add the y-Axis
//   svg.append('g').attr('class', 'y-axis').call(yAxis);

//   d3.select('#cegGraph').append(svg);

// return svg.node();
// };
