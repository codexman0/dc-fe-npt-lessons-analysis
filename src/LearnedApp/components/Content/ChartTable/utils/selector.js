
export const createOrSelectElem = (parentElem, elem) => {
  const exElem = parentElem.select(elem);
  return exElem.empty() ? parentElem.append(elem) : exElem;
};
