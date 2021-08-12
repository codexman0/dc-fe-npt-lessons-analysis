const getDefs = parentElem => {
  const isDefsEmpty = parentElem.select('defs').empty();

  const defs = isDefsEmpty ? parentElem.append('defs') : parentElem.select('defs');

  return defs;
};

export const defineClip = (assetId, parentElem, idPrefix, contentWidth, contentHeight) => {
  const defs = getDefs(parentElem);

  const id = `clip-path-for-${idPrefix}-${assetId}`;

  const clipDefinition = defs.select(`#${id}`);
  if (!clipDefinition.empty()) {
    clipDefinition.remove();
  }

  defs
    .append('SVG:clipPath')
    .attr('id', id)
    .append('SVG:rect')
    .attr('width', contentWidth)
    .attr('height', contentHeight)
    .attr('x', 0)
    .attr('y', 0);

  return id;
};
