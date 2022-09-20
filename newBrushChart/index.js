// margin and mini map focus heights
// -----------------------------------------------
let margin = { top: 20, right: 30, bottom: 80, left: 60 },
  width = 860 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;
marginFocus = { bottom: 10 };
focusHeight = 100;

let exeKey = 'executions';

// -----------------------------------------------

let bars = (g, x, y, data, barColor) => {
  g.attr('fill', barColor)
    .selectAll('rect')
    .data(data, (d) => d.executions)
    .join('rect')
    .attr('x', (d) => x(d.iteration))
    .attr('y', (d) => y(d.duration))
    .attr('height', (d) => y(0) - y(d.duration))
    .attr('width', x.bandwidth());
};
// -----------------------------------------------

let xAxis = (g, x, height) => {
  g.attr('transform', `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((i) => (x.domain().length < 90 ? data[i].iteration : null)) // hide labels when x domain becomes too wide
        .tickSizeOuter(0)
    )
    .call((g) => {
      return g
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('font-size', '0.8em')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
    });
};

let yAxis = (g, y) => {
  g.attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.title')
        .data(['Pop'])
        .join('text')
        .attr('class', 'title')
        .attr('x', -margin.left)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text(data.duration)
    );
};

// -----------------------------------------------
d3.json('test_prime_20.json').then(function (data) {
  data = data[exeKey];

  console.log(data);

  // x and y scales
  x = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  // ---
  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.duration)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  let chart = () => {
    const svg = d3
      .select('#mainGraph') // div to be attached to
      // .create('svg')
      .append('svg')
      .attr('viewBox', [0, 0, width, height]);

    const barGroup = svg
      .append('g')
      .call((g) => bars(svg, x, y, data, 'steelblue'));

    let update = (focusX, focusY, focusData) => {
      barGroup.call((g) => bars(g, focusX, focusY, focusData));
      gy.call(yAxis, focusY, height);
      gx.call(xAxis, focusX, height);
    };

    return Object.assign(svg.node(), { update });
  };

  // object return value

  // -----------------
  let focus = () => {
    const svg1 = d3
      .select('#focusGraph') // div to be attached to
      // .create('svg')
      .append('svg')
      .attr('viewBox', [0, 0, width, focusHeight]);

    // build focus

    // -----------------------------------------------
    // focus brush

    function brushed({ selection }) {
      if (selection) {
        const range = x.domain().map(x);
        const i0 = d3.bisectRight(range, selection[0]);
        const i1 = d3.bisectRight(range, selection[1]);

        barGroup
          .selectAll('rect')
          .attr('fill', (d, i) => (i0 <= i && i < i1 ? 'orange' : null));

        // set the brushed bar indices as the value of the 'focus' view
        svg1.property('value', x.domain().slice(i0, i1)).dispatch('input');
      } else {
        barGroup.selectAll('rect').attr('fill', 'steelblue');

        svg1.property('value', []).dispatch('input');
      }
    }

    function brushended({ selection, sourceEvent }) {
      if (!sourceEvent) {
        return;
      }
      if (!selection) {
        d3.select(this).transition().call(brush.move, defaultSelection);
      }

      const range = x.domain().map(x);
      const x0 = range[d3.bisectRight(range, selection[0])] - dx;
      const x1 =
        range[d3.bisectRight(range, selection[1]) - 1] + x.bandwidth() + dx;

      if (x0 === x1) {
        d3.select(this).transition().call(brush.move, defaultSelection);
      }

      d3.select(this)
        .transition()
        .call(brush.move, x1 > x0 ? [x0, x1] : null);
    }

    const initialBrushMax = 10;

    const brush = d3
      .brushX()
      .extent([
        [margin.left, 0.5],
        [width - margin.right, focusHeight - 10],
      ])
      .on('brush', brushed)
      .on('end', brushended);

    console.log(brush);

    let barGroup = () => {
      svg1
        .append('g')
        // .attr('fill', 'green')
        .call((g) =>
          bars(
            svg1,
            x,
            y.copy().range([focusHeight - marginFocus.bottom, 60]),
            data,
            'red'
          )
        );
    };
    barGroup();

    const dx = (x.bandwidth() * x.paddingInner()) / 2;
    const defaultSelection = [
      x.range()[0] + dx,
      x.range()[0] + x.bandwidth() * initialBrushMax + dx,
    ];

    svg1.append('g').call(brush).call(brush.move, defaultSelection);

    return svg1.node();
  };
  chart();
  focus();

  let update = () => {
    const [minIndex, maxIndex] = d3.extent(focus());
    const maxY = d3.max(data, (d, i) =>
      minIndex <= i && i <= maxIndex ? d.duration : NaN
    );
    const focusData = data.slice(minIndex, maxIndex + 1); // relies on array sort order
    const focusX = x.copy().domain(focus());
    const focusY = y.copy().domain([0, maxY]);

    chart.update(focusX, focusY, focusData);
  };
});
