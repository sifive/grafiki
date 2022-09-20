let exeKey = 'executions';

d3.json('test_prime_20.json', function (error, data) {
  if (error) throw error;
  data = data[exeKey];
  console.log(data);

  // margins for both the bars
  var margin = { top: 30, right: 30, bottom: 100, left: 40 },
    margin2 = { top: 430, right: 30, bottom: 20, left: 40 },
    width = window.innerWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

  // scales for both the bars
  var x = d3.scale.ordinal().rangeBands([0, width], 0.1),
    x2 = d3.scale.ordinal().rangeBands([0, width], 0.1),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom'),
    xAxis2 = d3.svg.axis().scale(x2).orient('bottom').tickValues([]), // this is why the tick values are not show in mini map
    yAxis = d3.svg.axis().scale(y).orient('left');

  x.domain(
    data.map(function (d) {
      return d.iteration;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d.duration;
    }),
  ]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  var brush = d3.svg.brush().x(x2).on('brush', brushed);

  var svg = d3
    .select('#cegGraph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  var focus = svg
    .append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // x axis label
  svg
    .append('text') // text label for the x axis
    .attr(
      'transform',
      'translate(' + width / 2 + ' ,' + (height + margin.bottom + 25) + ')'
    )
    .style('text-anchor', 'middle')
    .style('font', '14px times')
    .text('Iterations');

  // Add the text label for the Y axis
  svg
    .append('text')
    .attr('y', margin.top + 10)
    .attr('x', margin.left + 28)
    .style('text-anchor', 'middle')
    .style('font', '14px times')
    .text('Duration');

  // title of the graph exp name
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('text-decoration', 'underline')
    .text('Experiment 1');

  // context is the draggable mini bar
  // focus is the bars

  var context = svg
    .append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

  focus
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  focus.append('g').attr('class', 'y axis').call(yAxis);

  tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background', 'rgba(0,0,0,0.6)')
    .style('border-radius', '4px')
    .style('color', '#fff')
    .text('a simple tooltip');

  var bars = focus.selectAll('.bar').data(data);
  bars
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr({
      height: function (d, i) {
        return 0;
      },
      width: function (d) {
        return x.rangeBand();
      },
      x: function (d) {
        return x(d.iteration);
      },
      y: function (d) {
        return y(d.duration);
      },
    })
    // .style('fill', 'green')
    .on('mouseover', function (d) {
      d3.select(this).style('fill', 'green');
      tooltip
        .html(
          `<div>Duration: ${d.duration}</div><div>Iteration: ${d.iteration}</div>`
        )
        .style('visibility', 'visible');
    })
    .on('mousemove', function () {
      tooltip
        .style('top', d3.event.pageY - 10 + 'px')
        .style('left', d3.event.pageX + 10 + 'px');
    })
    .on('mouseout', function (d) {
      tooltip.html(``).style('visibility', 'hidden');
      d3.select(this)
        .transition('colorfade')
        .duration(250)
        .style('fill', 'lightcoral');
    });

  bars
    .transition()
    .duration(600)
    .delay(function (d, i) {
      return i * 7;
    })
    .attr({
      height: function (d, i) {
        return height - y(d.duration);
      },
    });

  enter(data);
  updateScale(data);

  // smaller mini map bars
  var subBars = context.selectAll('.subBar').data(data);

  subBars
    .enter()
    .append('rect')
    .classed('subBar', true)
    .attr({
      height: function (d) {
        return height2 - y2(d.duration);
      },
      width: function (d) {
        return x.rangeBand();
      },
      x: function (d) {
        return x2(d.iteration);
      },
      y: function (d) {
        return y2(d.duration);
      },
    });

  context
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height2 + ')')
    .call(xAxis2);

  context
    .append('g')
    .attr('class', 'x brush')
    .call(brush)
    .selectAll('rect')
    .attr('y', -6)
    .attr('height', height2 + 7);

  function brushed() {
    var selected = null;
    selected = x2.domain().filter(function (d) {
      return brush.extent()[0] <= x2(d) && x2(d) <= brush.extent()[1];
    });

    var start;
    var end;

    if (brush.extent()[0] != brush.extent()[1]) {
      start = selected[0];
      end = selected[selected.length - 1] + 1;
    } else {
      start = 0;
      end = data.length;
    }

    var updatedData = data.slice(start, end);

    update(updatedData);
    enter(updatedData);
    exit(updatedData);
    updateScale(updatedData);
  }

  function updateScale(data) {
    var tickScale = d3.scale
      .pow()
      .range([data.length / 10, 0])
      .domain([data.length, 0])
      .exponent(0.5);

    var brushValue = brush.extent()[1] - brush.extent()[0];
    if (brushValue === 0) {
      brushValue = width;
    }

    var tickValueMultiplier = Math.ceil(Math.abs(tickScale(brushValue)));
    var filteredTickValues = data
      .filter(function (d, i) {
        return i % tickValueMultiplier === 0;
      })
      .map(function (d) {
        return d.iteration;
      });

    focus.select('.x.axis').call(xAxis.tickValues(filteredTickValues));
    focus.select('.y.axis').call(yAxis);
  }

  function update(data) {
    x.domain(
      data.map(function (d) {
        return d.iteration;
      })
    );
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.duration;
      }),
    ]);

    var bars = focus.selectAll('.bar').data(data);
    bars
      .attr({
        height: function (d, i) {
          return height - y(d.duration);
        },
        width: function (d) {
          return x.rangeBand();
        },
        x: function (d) {
          return x(d.iteration);
        },
        y: function (d) {
          return y(d.duration);
        },
      })
      .on('mouseover', function (d) {
        d3.select(this).style('fill', 'green');
        tooltip
          .html(
            `<div>Duration: ${d.duration}</div><div>Iteration: ${d.iteration}</div>`
          )
          .style('visibility', 'visible');
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px');
      })
      .on('mouseout', function (d) {
        tooltip.html(``).style('visibility', 'hidden');
        d3.select(this)
          .transition('colorfade')
          .duration(250)
          .style('fill', 'lightcoral');
      });
  }

  function exit(data) {
    var bars = focus.selectAll('.bar').data(data);
    bars.exit().remove();
  }

  function enter(data) {
    // create data scales and domain
    x.domain(
      data.map(function (d) {
        return d.iteration;
      })
    );
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.duration;
      }),
    ]);

    // build bars
    var bars = focus.selectAll('.bar').data(data);

    bars
      .enter()
      .append('rect')
      .classed('bar', true)
      .attr({
        height: function (d, i) {
          return 0;
        },
        width: function (d) {
          return x.rangeBand();
        },
        x: function (d) {
          return x(d.iteration);
        },
        y: function (d) {
          return y(d.duration);
        },
      })
      .on('mouseover', function (d) {
        d3.select(this).style('fill', 'green');
        tooltip
          .html(
            `<div>Duration: ${d.duration}</div><div>Iteration: ${d.iteration}</div>`
          )
          .style('visibility', 'visible');
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px');
      })
      .on('mouseout', function (d) {
        tooltip.html(``).style('visibility', 'hidden');
        d3.select(this)
          .transition('colorfade')
          .duration(250)
          .style('fill', 'lightcoral');
      });
  }

  // sorting
  //Sorting logic
  d3.select('#sortAscending').on('click', function () {
    console.log('this button was clicked');
    bars
      .sort(function (a, b) {
        return d3.ascending(a.duration, b.duration);
      })
      .transition()
      .delay(function (d, i) {
        return i * 5; // gives it a smoother effect
      })
      .duration(500)
      .attr('x', function (d, i) {
        return x(d.iteration);
      });
  });
});
// end function
