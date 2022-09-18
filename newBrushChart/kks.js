// https://observablehq.com/@julesblm/most-populous-dutch-municipalities-brushable-bar-chart@790
function _1(md) {
  return md`
# Most Populous Dutch Municipalities Brushable Bar Chart
  `;
}

function _percentage(
  focus,
  md,
  d3,
  data,
  format,
  totalPopulation,
  ordinalSuffix
) {
  if (!focus.length) {
    return md`
## Select some bars man
    `;
  }

  const [minIndex, maxIndex] = d3.extent(focus);
  const focusPopulation = d3.sum(
    data.slice(minIndex, maxIndex + 1),
    (d) => d.population
  );
  const people = `${format(focusPopulation)} people`;
  const percentage = d3.format('.1%')(focusPopulation / totalPopulation);

  if (minIndex === 0) {
    return md`### ${percentage} of the Dutch population (${people}) lives in the in the ${
      maxIndex + 1
    } most populous municipalities`;
  }

  if (maxIndex + 1 === data.length) {
    return md`### ${percentage} of the Dutch population (${people}) lives in the in the ${
      data.length - minIndex
    } least populous municipalities`;
  }
  return md`### ${percentage} of the Dutch population lives  (${people}) in the in the ${ordinalSuffix(
    minIndex + 1
  )} to ${ordinalSuffix(maxIndex + 1)} most populous municipalities`;
}

function _chart(d3, width, height, bars, x, y, data, yAxis, xAxis) {
  const svg = d3.create('svg').attr('viewBox', [0, 0, width, height]);

  const gx = svg.append('g');

  const gy = svg.append('g');

  const barGroup = svg.append('g').call((g) => bars(g, x, y, data));

  return Object.assign(svg.node(), {
    update(focusX, focusY, focusData) {
      barGroup.call((g) => bars(g, focusX, focusY, focusData));
      gy.call(yAxis, focusY, height);
      gx.call(xAxis, focusX, height);
      if (focusData.length < 85) {
        console.log(focusData.length);
      }
    },
  });
}

function _focus(d3, width, focusHeight, margin, bars, x, y, marginFocus, data) {
  const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, width, focusHeight])
    .style('display', 'block');

  const brush = d3
    .brushX()
    .extent([
      [margin.left, 0.5],
      [width - margin.right, focusHeight - 10],
    ])
    .on('brush', brushed)
    .on('end', brushended);

  const initialBrushMax = 10;

  const barGroup = svg
    .append('g')
    .attr('fill', 'steelblue')
    .call((g) =>
      bars(g, x, y.copy().range([focusHeight - marginFocus.bottom, 4]), data)
    );
  const dx = (x.bandwidth() * x.paddingInner()) / 2;
  const defaultSelection = [
    x.range()[0] + dx,
    x.range()[0] + x.bandwidth() * initialBrushMax + dx,
  ];

  const gb = svg.append('g').call(brush).call(brush.move, defaultSelection);

  function brushed({ selection }) {
    if (selection) {
      const range = x.domain().map(x);
      const i0 = d3.bisectRight(range, selection[0]);
      const i1 = d3.bisectRight(range, selection[1]);

      barGroup
        .selectAll('rect')
        .attr('fill', (d, i) => (i0 <= i && i < i1 ? 'orange' : null));

      // set the brushed bar indices as the value of the 'focus' view
      svg.property('value', x.domain().slice(i0, i1)).dispatch('input');
    } else {
      barGroup.selectAll('rect').attr('fill', 'steelblue');

      svg.property('value', []).dispatch('input');
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

  return svg.node();
}

function _update(d3, focus, data, x, y, chart) {
  const [minIndex, maxIndex] = d3.extent(focus);
  const maxY = d3.max(data, (d, i) =>
    minIndex <= i && i <= maxIndex ? d.population : NaN
  );
  const focusData = data.slice(minIndex, maxIndex + 1); // relies on array sort order
  const focusX = x.copy().domain(focus);
  const focusY = y.copy().domain([0, maxY]);

  chart.update(focusX, focusY, focusData);
}

function _x(d3, data, margin, width) {
  return d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.2);
}

function _y(d3, data, height, margin) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.population)])
    .nice()
    .range([height - margin.bottom, margin.top]);
}

function _xAxis(margin, d3, data) {
  return (g, x, height) =>
    g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((i) =>
            x.domain().length < 90 ? data[i].municipality : null
          ) // hide labels when x domain becomes too wide
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
}

function _yAxis(margin, d3, data) {
  return (g, y, title) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
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
          .text(data.y)
      );
}

function _bars(format) {
  return (g, x, y, data) =>
    g
      .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(data, (d) => d.municipality)
      .join('rect')
      .attr('x', (d) => x(d.rank))
      .attr('y', (d) => y(d.population))
      .attr('height', (d) => y(0) - y(d.population))
      .attr('width', x.bandwidth())
      .append('title')
      .text((d) => `${d.municipality}: Population ${format(d.population)}`);
}

function _height() {
  return 500;
}

function _focusHeight() {
  return 100;
}

function _margin() {
  return { top: 30, right: 0, bottom: 80, left: 50 };
}

function _marginFocus() {
  return { bottom: 10 };
}

async function _data(d3, FileAttachment) {
  return Object.assign(
    d3
      .csvParse(
        await FileAttachment('bevolking.csv').text(),
        ({ regios, aantal }) => ({ municipality: regios, population: +aantal })
      )
      .sort((a, b) => d3.descending(a.population, b.population))
      .map((d, i) => {
        d.rank = i;
        return d;
      }),
    { format: ',', y: '↑ Population' }
  );
}

function _format(d3, data) {
  return d3.format(data.format);
}

function _totalPopulation(d3, data) {
  return d3.sum(data, (d) => d.population);
}

function _ordinalSuffix() {
  return function ordinalSuffix(i) {
    const remainder = i % 10,
      k = i % 100;

    if (remainder == 1 && k != 11) {
      return i + 'st';
    }
    if (remainder == 2 && k != 12) {
      return i + 'nd';
    }
    if (remainder == 3 && k != 13) {
      return i + 'rd';
    }
    return i + 'th';
  };
}

function _19(md) {
  return md`
---
  `;
}

function _20(md) {
  return md`
## Make

Using [xsv](https://github.com/BurntSushi/xsv) and data downloaded from the [CBS Open Data Portal](https://opendata.cbs.nl/statline/)

~~~bash
regiokerncijfersclean.csv : Regionale_kerncijfers_Nederland.csv
	xsv fmt -d ";" Regionale_kerncijfers_Nederland.csv | \
  xsv search -s "Totale bevolking" "[0-9]" -o regiokerncijfersclean.csv
	touch regiokerncijfersclean.csv
~~~

Or as a oneliner

\`xsv fmt -d ";" Regionale_kerncijfers_Nederland.csv | xsv search -s "Totale bevolking" "[0-9]" -o regiokerncijfersclean.csv\`
  `;
}

function _21(md) {
  return md`
### Credits

- [Focus + Context](https://observablehq.com/@d3/focus-context?collection=@d3/d3-brush)
- [Ordinal Brushing](https://observablehq.com/@d3/ordinal-brushing)

<details>
<summary><strong>To Do</strong></summary>
<ul>
  <li> X-axis labels should rotate more, become smaller then hide on large domains</li>
  <li> CBS data on stedelijkheid & migratieachtergrond</li>
  <li> Prevent empty selection on empty brush</li>
</ul>
</details>
  `;
}

function _d3() {
  return import('https://unpkg.com/d3@v6?module');
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      'bevolking.csv',
      {
        url: new URL(
          './files/fb28c599c869c0945de691321c5996bf5d493702fd2e73046b7af8f63f176788c208bbaf39aafe7941186aa6e3a106a2eba7417f30f02caac756120026fae7ea.csv',
          import.meta.url
        ),
        mimeType: 'text/csv',
        toString,
      },
    ],
  ]);
  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  main.variable(observer()).define(['md'], _1);
  main
    .variable(observer('percentage'))
    .define(
      'percentage',
      [
        'focus',
        'md',
        'd3',
        'data',
        'format',
        'totalPopulation',
        'ordinalSuffix',
      ],
      _percentage
    );
  main
    .variable(observer('chart'))
    .define(
      'chart',
      ['d3', 'width', 'height', 'bars', 'x', 'y', 'data', 'yAxis', 'xAxis'],
      _chart
    );
  main
    .variable(observer('viewof focus'))
    .define(
      'viewof focus',
      [
        'd3',
        'width',
        'focusHeight',
        'margin',
        'bars',
        'x',
        'y',
        'marginFocus',
        'data',
      ],
      _focus
    );
  main
    .variable(observer('focus'))
    .define('focus', ['Generators', 'viewof focus'], (G, _) => G.input(_));
  main
    .variable(observer('update'))
    .define('update', ['d3', 'focus', 'data', 'x', 'y', 'chart'], _update);
  main
    .variable(observer('x'))
    .define('x', ['d3', 'data', 'margin', 'width'], _x);
  main
    .variable(observer('y'))
    .define('y', ['d3', 'data', 'height', 'margin'], _y);
  main
    .variable(observer('xAxis'))
    .define('xAxis', ['margin', 'd3', 'data'], _xAxis);
  main
    .variable(observer('yAxis'))
    .define('yAxis', ['margin', 'd3', 'data'], _yAxis);
  main.variable(observer('bars')).define('bars', ['format'], _bars);
  main.variable(observer('height')).define('height', _height);
  main.variable(observer('focusHeight')).define('focusHeight', _focusHeight);
  main.variable(observer('margin')).define('margin', _margin);
  main.variable(observer('marginFocus')).define('marginFocus', _marginFocus);
  main
    .variable(observer('data'))
    .define('data', ['d3', 'FileAttachment'], _data);
  main.variable(observer('format')).define('format', ['d3', 'data'], _format);
  main
    .variable(observer('totalPopulation'))
    .define('totalPopulation', ['d3', 'data'], _totalPopulation);
  main
    .variable(observer('ordinalSuffix'))
    .define('ordinalSuffix', _ordinalSuffix);
  main.variable(observer()).define(['md'], _19);
  main.variable(observer()).define(['md'], _20);
  main.variable(observer()).define(['md'], _21);
  main.variable(observer('d3')).define('d3', _d3);
  return main;
}
