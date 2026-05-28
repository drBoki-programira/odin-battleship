const makeChildOf = function(parent, tag, properties) {
  const child = document.createElement(tag);

  for (const [property, value] of Object.entries(properties)) {
    child[property] = value;
  }

  parent.appendChild(child);

  return child;
}
