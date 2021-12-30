/*
** Author:      Andrew Smith (and GitHub user gorhill and stackoverflow user
**              Borre Mosch)
** File:        element-picker.js
** Project:     jisho-grabber-firefox
** Description: This file contains helper functions to draw a rectangle over
**              a page that contains a single element.
*/

const getElementBoundingClientRect = function(elem) {
    /*
    ** This function was adapted from part of the uBlock Origin source code,
    ** created by user gorhill (and 93 other contributors) on GitHub.
    ** Date retrieved: Dec 29, 2021
    ** https://github.com/gorhill/uBlock/blob/master/src/js/scriptlets/epicker.js
    */

    let rect = typeof elem.getBoundingClientRect === 'function'
        ? elem.getBoundingClientRect()
        : { height: 0, left: 0, top: 0, width: 0 };

    // Try not returning an empty bounding rect.
    if ( rect.width !== 0 && rect.height !== 0 ) {
        return rect;
    }

    let left = rect.left,
        right = rect.right,
        top = rect.top,
        bottom = rect.bottom;

    for ( const child of elem.children ) {
        rect = getElementBoundingClientRect(child);
        if ( rect.width === 0 || rect.height === 0 ) {
            continue;
        }
        if ( rect.left < left ) { left = rect.left; }
        if ( rect.right > right ) { right = rect.right; }
        if ( rect.top < top ) { top = rect.top; }
        if ( rect.bottom > bottom ) { bottom = rect.bottom; }
    }

    return {
        height: bottom - top,
        left,
        top,
        width: right - left
    };
};

const highlightElement = function(elem) {
    /*
    ** This function is taken from an answer (from user Borre Mosch) on
    ** stackoverflow about how to draw a canvas over a web page.
    ** Date retrieved: Dec 29, 2021
    ** https://stackoverflow.com/questions/19840907/draw-rectangle-over-html-with-javascript
    */

    // Get bounding rectangle of element to highlight
    const rect = getElementBoundingClientRect(elem);

    // Create canvas over entire webpage
    let canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.zIndex = 100000;
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    // Draw rectangle on canvas
    let context = canvas.getContext('2d');
    context.rect(rect.left, rect.top, rect.width, rect.height);
    context.fillstyle = "rgba(144, 238, 144, 0.1)";
    context.fill();
};