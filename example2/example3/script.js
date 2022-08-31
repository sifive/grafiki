// Get the data
d3.csv('alphabet.csv').then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.letter = d.letter;
    d.frequency = +d.frequency;
  });

  console.log(data);
});
