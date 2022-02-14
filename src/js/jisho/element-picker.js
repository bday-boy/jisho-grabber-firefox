/**
 * @file This file contains helper functions to draw a rectangle over a page
 * that contains a single element.
 */

let myCanvas;
let canvasContainer;

/**
 * Creates a new canvas over the entire web page if it does not exist.
 */
const createCanvasOverlay = function () {
  if (myCanvas === undefined) {
    if (canvasContainer === undefined) {
      canvasContainer = document.createElement('div');
      document.body.appendChild(canvasContainer);
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.left = '0px';
      canvasContainer.style.top = '0px';
      canvasContainer.style.width = '100%';
      canvasContainer.style.height = '100%';
      canvasContainer.style.zIndex = 10000;
      canvasContainer.style.pointerEvents = 'none';
    }

    myCanvas = document.createElement('canvas');
    myCanvas.style.width = `${document.body.scrollWidth}px`;
    myCanvas.style.height = `${document.body.scrollHeight}px`;
    myCanvas.width = document.body.scrollWidth;
    myCanvas.height = document.body.scrollHeight;
    myCanvas.style.overflow = 'visible';
    myCanvas.style.position = 'absolute';
    myCanvas.style.pointerEvents = 'none';
    canvasContainer.appendChild(myCanvas);
  } else { myCanvas.parentNode.style.visibility = 'visible'; }
};

/**
 * Hides the canvas to prevent bounding boxes from being drawn.
 */
const hideCanvas = function () {
  if (myCanvas !== undefined && myCanvas.parentNode !== undefined) {
    myCanvas.parentNode.style.visibility = 'hidden';
  }
};

/**
 * This function was adapted from part of the uBlock Origin source code,
 * created by user gorhill (and 93 other contributors) on GitHub.
 * https://github.com/gorhill/uBlock/blob/master/src/js/scriptlets/epicker.js
 * @param {Element} elem - The element to find a bounding box for
 * @returns {Object} The element's bounding box
 */
const getElementBoundingClientRect = function (elem) {
  let rect;
  if (typeof elem.getBoundingClientRect === 'function') {
    rect = elem.getBoundingClientRect();
  } else {
    rect = {
      height: 0,
      left: 0,
      top: 0,
      width: 0,
    };
  }

  // Try not returning an empty bounding rect.
  if (rect.width !== 0 && rect.height !== 0) {
    return rect;
  }

  let { left, top } = rect;
  let right = left + rect.width;
  let bottom = top + rect.height;

  elem.children.forEach((child) => {
    rect = getElementBoundingClientRect(child);
    if (rect.width !== 0 && rect.height !== 0) {
      if (rect.left < left) { left = rect.left; }
      if (rect.right > right) { right = rect.right; }
      if (rect.top < top) { top = rect.top; }
      if (rect.bottom > bottom) { bottom = rect.bottom; }
    }
  });

  // TODO: Delete this? Idk it's working on my Mac but not my Ubuntu distro
  // for (const child of elem.children) {
  //   rect = getElementBoundingClientRect(child);
  //   if (rect.width === 0 || rect.height === 0) { continue; }
  //   if (rect.left < left) { left = rect.left; }
  //   if (rect.right > right) { right = rect.right; }
  //   if (rect.top < top) { top = rect.top; }
  //   if (rect.bottom > bottom) { bottom = rect.bottom; }
  // }

  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
};

/**
 * Draws a translucent green rectangle over the input element.
 * @param {Element} elem - The element to draw a rectangle around
 */
const highlightElement = function (elem) {
  const offsetX = document.body.getBoundingClientRect().left;
  const offsetY = document.body.getBoundingClientRect().top;
  const rect = getElementBoundingClientRect(elem);
  createCanvasOverlay();
  const ctx = myCanvas.getContext('2d', { alpha: true });
  ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
  ctx.fillRect(rect.left - offsetX, rect.top - offsetY, rect.width, rect.height);
};
