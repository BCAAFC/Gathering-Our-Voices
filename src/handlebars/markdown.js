var marked = require('marked');

var renderer = new marked.Renderer();
renderer.image = function (href, title, text) {
  return `
    <figure>
      <img alt="${text}" title="${title}" src="${href}" />
      <figcaption>${text}</figcaption>
    </figure>
  `;
}
marked.setOptions({
  renderer: renderer,
  smartypants: true,
});

module.exports = function (hbs) {
  hbs.registerHelper("markdown", function (options) {
    var content = options.fn(this);
    // Scan for start indentation level.
    var i = 0;
    while (content[i] == ' ') { i += 1; }
    // Trim all lines with the appropriate indent level.
    var lines = content.split('\n').map(line => line.slice(i)).join('\n');
    return `<div class='markdown'>${marked(lines)}</div>`;
  });

  return hbs;
}
