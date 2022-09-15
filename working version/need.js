// https://observablehq.com/@lemonode/a-bar-chart-with-an-unnecessary-ammount-of-features@185
function _1(md) {
  return md`
# A Bar Chart with an unnecessary ammount of features
  `;
}

function _2(md) {
  return md`
I'll have to change up a few things so that it's more idiomatic to the notebook syntax, but all the logic is still there and seems to be working fine.
  `;
}

function _3(html) {
  return html`<i
    >You can <b>zoom</b>, <b>sort</b> and <b>filter</b> through the dataset</i
  >`;
}

function _4(html) {
  return html`Choose Value
    <select class="opt">
      <option value="_1">Value 1</option>
      <option value="_2">Value 2</option></select
    ><br />

    <svg id="chart" width="400" height="420"></svg>
    <div>
      Sort Values
      <input class="sort" type="checkbox" id="checkBox" />
    </div>`;
}

function _load(d3, chart, data) {
  var opt = d3.select('.opt').on('change', function () {
    chart.update(data, this.value);
  });

  d3.select('.sort').on('change', function () {
    chart.update(data, opt.property('value'));
  });

  chart(data, opt.property('value'));
}

function _chart(d3) {
  return function chart(data, input) {
    var speed = 0;

    var svg = d3.select('#chart'),
      margin = { top: 35, left: 35, bottom: 5, right: -15 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    var x = d3
      .scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .paddingOuter(0.2);

    var y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    var xAxis = (g) =>
      g
        .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
        .call(d3.axisBottom(x).tickSizeOuter(0));

    var yAxis = (g) =>
      g
        .attr('transform', 'translate(' + margin.left + ',0)')
        .call(d3.axisLeft(y));

    var yGrid = (g) =>
      g
        .attr('transform', 'translate(' + margin.left + ',0)')
        .call(d3.axisLeft(y).tickSize(-width + margin.right))
        .call((g) => g.selectAll('text').remove());

    svg.append('g').attr('class', 'x-axis');

    svg
      .append('rect')
      .attr('class', 'block')
      .attr('x', 0)
      .attr('y', 0 + margin.top)
      .attr('height', height - margin.bottom)
      .attr('width', margin.left)
      .attr('fill', '#fff');

    svg.append('g').attr('class', 'y-axis');
    svg.append('g').attr('class', 'y-grid');

    var sorted = data.map((d) => d.name);

    update(data, input);

    function update(data, input) {
      data.sort(
        d3.select('#checkBox').property('checked')
          ? (a, b) => b['value' + input] - a['value' + input]
          : (a, b) => sorted.indexOf(a.name) - sorted.indexOf(b.name)
      );

      x.domain(data.map((d) => d.name));

      svg.selectAll('.x-axis').transition().duration(speed).call(xAxis);

      y.domain([0, d3.max(data, (d) => d['value' + input])]).nice();

      svg.selectAll('.y-axis').transition().duration(speed).call(yAxis);
      svg.selectAll('.y-grid').transition().duration(speed).call(yGrid);

      var bar = svg.selectAll('.bar').data(data, (d) => d.name);

      bar.exit().remove();

      bar = bar
        .enter()
        .insert('g', '.block')
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', 'steelblue')
        .attr('width', x.bandwidth())
        .merge(bar);

      bar
        .transition()
        .duration(speed)
        .attr('x', (d) => x(d.name))
        .attr('y', (d) => y(d['value' + input]))
        .attr('height', (d) => y(0) - y(d['value' + input]));

      var text = svg.selectAll('.text').data(data, (d) => d.name);

      text.exit().remove();

      text = text
        .enter()
        .insert('g', '.block')
        .append('text')
        .attr('class', 'text')
        .attr('text-anchor', 'middle')
        .merge(text);

      text
        .transition()
        .duration(speed)
        .attr('x', (d) => x(d.name) + x.bandwidth() / 2)
        .attr('y', function (d) {
          return y(d['value' + input]) > height - margin.top
            ? y(d['value' + input]) - 5
            : y(d['value' + input]) + 15;
        })
        .attr('fill', function (d) {
          return y(d['value' + input]) > height - margin.top ? '#333' : '#fff';
        })
        .text((d) => d['value' + input]);

      svg.call(zoom);

      function zoom(svg) {
        const extent = [
          [margin.left, margin.top],
          [width - margin.right, height - margin.top],
        ];

        var zooming = d3
          .zoom()
          .scaleExtent([1, 2])
          .translateExtent(extent)
          .extent(extent)
          .on('zoom', zoomed);

        svg.call(zooming);

        function zoomed() {
          x.range(
            [margin.left, width - margin.right].map((d) =>
              d3.event.transform.applyX(d)
            )
          );

          svg
            .selectAll('.bar')
            .attr('x', (d) => x(d.name))
            .attr('width', x.bandwidth());
          svg
            .selectAll('.text')
            .attr('x', (d) => x(d.name) + x.bandwidth() / 2)
            .attr('y', function (d) {
              return y(d['value' + input]) > height - margin.top
                ? y(d['value' + input]) - 5
                : y(d['value' + input]) + 15;
            })
            .attr('fill', function (d) {
              return y(d['value' + input]) > height - margin.top
                ? '#333'
                : '#fff';
            })
            .attr('font-size', (_) => (x.bandwidth() > 50 ? 14 : 12));

          svg.selectAll('.x-axis').call(xAxis);
        }
      }
    }

    speed = 750;

    chart.update = update;
  };
}

function _css(html) {
  return html` <style>
    #chart {
      font: 11px arial;
    }
    .y-grid line {
      opacity: 0.15;
    }
    .y-grid path {
      display: none;
    }
  </style>`;
}

function _data() {
  return [
    { name: 'A', value_1: '67', value_2: '16' },
    { name: 'B', value_1: '92', value_2: '49' },
    { name: 'C', value_1: '82', value_2: '78' },
    { name: 'D', value_1: '53', value_2: '25' },
    { name: 'E', value_1: '2', value_2: '70' },
    { name: 'F', value_1: '88', value_2: '28' },
    { name: 'G', value_1: '15', value_2: '1' },
    { name: 'H', value_1: '94', value_2: '09' },
    { name: 'I', value_1: '66', value_2: '86' },
    { name: 'J', value_1: '53', value_2: '15' },
    { name: 'K', value_1: '72', value_2: '77' },
  ];
}

function _d3(require) {
  return require('https://d3js.org/d3.v5.min.js');
}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(['md'], _1);
  main.variable(observer()).define(['md'], _2);
  main.variable(observer()).define(['html'], _3);
  main.variable(observer()).define(['html'], _4);
  main
    .variable(observer('load'))
    .define('load', ['d3', 'chart', 'data'], _load);
  main.variable(observer('chart')).define('chart', ['d3'], _chart);
  main.variable(observer('css')).define('css', ['html'], _css);
  main.variable(observer('data')).define('data', _data);
  main.variable(observer('d3')).define('d3', ['require'], _d3);
  return main;
}
