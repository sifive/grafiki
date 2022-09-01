'use strict';

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
module.exports = windowLoader;
