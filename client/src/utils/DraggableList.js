/**
 * Makes a list draggable vertically.
 */

/**
 * Checks if the left button is clicked in an event.
 * @param {Event} event the event.
 * @returns {boolean} true if the left button is clicked.
 */
function isLeftButton(event) {
    if ('buttons' in event) {
        return event.buttons === 1;
    } else if ('which' in event) {
        return event.which === 1;
    } else {
        return event.button === 1;
    }
}

/**
 * Get first element with the given class.
 * @param {HTMLElement} ele the element to walk up from.
 * @param {String} cls the class to match.
 * @returns {HTMLElement} the element with the matching class.
 */
function getFirstElementWithClass(ele, cls) {
    var item = ele;
    while (item) {
        if (item.className) {
            var classes = item.className.split(' ');
            if (classes.indexOf(cls) >= 0) {
                return item;
            }
        }
        item = item.parentNode;
    }
    return null;
}

/**
 * Check if an item is in an element.
 * @param {HTMLElement} ele the element to check if the item is inside.
 * @param {HTMLElement} item the item to check up from.
 * @returns {boolean} true if the item is in the element.
 */
function isInElement(ele, item) {
    var node = item;
    while (node) {
        if (node === ele) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * Check if the element has the given class.
 * @param {HTMLElement} ele the element to check.
 * @param {String} cls the class to find.
 * @returns {boolean} true if the element has the class.
 */
function hasClass(ele, cls) {
    if (!ele.className) return false;
    return ele.className.split(' ').indexOf(cls) >= 0;
}

/**
 * Retrieve children with the given class in an element.
 * @param {HTMLElement} ele the element to retrieve from.
 * @param {String} cls the class to find.
 * @returns {Array} the children with the class.
 */
function getChildrenWithClass(ele, cls) {
    var children = [];
    var nodes = ele.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (hasClass(nodes[i], cls)) children.push(nodes[i]);
    }
    return children;
}

/**
 * Retrieve the relative bounds of an element.
 * @param {HTMLElement} ele the element to retrieve the bounds for.
 * @param {HTMLElement} relative the element that is relative to ele.
 * @returns {{top: Number, left: Number, bottom: Number, right: Number}}
 */
function getRelativeBounds(ele, relative) {
    var rbounds = relative.getBoundingClientRect();
    var bounds = ele.getBoundingClientRect();
    var top = bounds.top - rbounds.top + relative.scrollTop;
    var left = bounds.left - rbounds.left;
    return {
        top: top,
        left: left,
        bottom: top + ele.offsetHeight,
        right: left + ele.offsetWidth
    };
}

function clearSelection() {
    // http://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
}

class DraggableList {
    /**
     * Makes the given element draggable.
     * @param {HTMLElement} container the element to make children draggable.
     * @param {String} draggableClass the class for draggable children.
     */
    constructor(container, draggableClass) {
        this.container = container;
        this.draggableClass = draggableClass;
        this.shadowClass = '';
        this.draggingClass = '';
        this.dragTime = 300;
        this.onSwap = null;
        /**
         * Callback with the target being moved, the element that was swapped with, and true if swapping from above.
         * @type {function(HTMLElement, HTMLElement, Boolean)}
         */
        this.onDrop = null;

        this._target = null;
        this._shadow = null;
        this._isDragging = false;
        this._diffWidth = 0;
        this._diffHeight = 0;
        this._lastSwapElement = null;
        this._isLastSwapUp = false;

        // Add events
        this._onDown = this.onDown.bind(this);
        this._onUp = this.onUp.bind(this);
        this._onOut = this.onOut.bind(this);
        this._onMove = this.onMove.bind(this);

        this.container.addEventListener('mousedown', this._onDown);
        // Unfocus if mouse released
        document.addEventListener('mouseup', this._onUp);
        // Unfocus if mouse goes out
        document.addEventListener('mouseout', this._onOut);
        document.addEventListener('mousemove', this._onMove);
    }

    /**
     * Start dragging the target.
     * @param {Number} y the Y location of the mouse.
     * @private
     */
    _startDrag(y) {
        //console.log('dragging');
        this._isDragging = true;
        this._lastSwapElement = null;
        this._isLastSwapUp = false;

        // Replace the dragging object with a shadow and make same dimensions
        this._shadow = this._target.cloneNode(false);
        this._shadow.className += " " + this.shadowClass;
        var width = this._target.clientWidth;
        var height = this._target.clientHeight;
        this._shadow.style.width = width + 'px';
        this._shadow.style.height = height + 'px';
        this._target.parentNode.replaceChild(this._shadow, this._target);

        // Remove padding from width and height
        this._diffWidth = this._shadow.offsetWidth - width;
        var finalWidth = width - this._diffWidth;
        this._shadow.style.width = finalWidth + 'px';
        this._diffHeight = this._shadow.offsetHeight - height;
        var finalHeight = height - this._diffHeight;
        this._shadow.style.height = finalHeight + 'px';

        // Float the dragging object
        this._target.className += ' ' + this.draggingClass;
        this._target.style.width = finalWidth + 'px';
        this._target.style.height = finalHeight + 'px';
        this._target.style.position = 'absolute';
        this.container.appendChild(this._target);
        this._target.style.top = (y - this._target.offsetHeight / 2) + 'px';
        // Align the element with the original position including padding
        var bounds = this._shadow.getBoundingClientRect();
        this._target.style.left = (bounds.left + this._diffWidth / 2) + 'px';
    }

    _move(x, y) {
        if (!this._isDragging) return;

        clearSelection();

        var containerBounds = this.container.getBoundingClientRect();
        var topOffset = this.container.scrollTop;
        var ex = x - containerBounds.left;
        var ey = y - containerBounds.top + topOffset;

        // Keep the dragged item in the right place
        this._target.style.top = (y - this._target.offsetHeight / 2) + 'px';

        // Get all the bounds
        var children = getChildrenWithClass(this.container, this.draggableClass);

        var checked = [];
        var i;
        var index = 0;
        for (i = 0; i < children.length; i++) {
            var child = children[i];
            if (hasClass(child, this.shadowClass) || hasClass(child, this.draggingClass)) continue;
            checked.push({
                index: index,
                element: child,
                bounds: getRelativeBounds(child, this.container)
            });
            index += 1;
        }

        // Check what bounds the pointer is in
        var inside = null;
        for (i = 0; i < checked.length; i++) {
            var check = checked[i];
            if (ey > check.bounds.top && ey < check.bounds.bottom) {
                inside = check;
                break;
            }
        }

        // Check if from top or bottom and then swap
        // Take scrolling into account
        // TODO: Fix large item height from bouncing
        // TODO: If over edge make it go to edge
        if (checked.length > 0 && ey <= 0) {
            // Swap if dragged over top
            this._shadow.parentNode.removeChild(this._shadow);
            checked[0].element.parentNode.insertBefore(this._shadow, checked[0].element);
        } else if (checked.length > 0 && ey >= this.container.scrollHeight) {
            this._shadow.parentNode.removeChild(this._shadow);
            checked[0].element.parentNode.appendChild(this._shadow);
        } else if (inside) {
            var shadowBounds = getRelativeBounds(this._shadow, this.container);
            var isShadowOnTop = shadowBounds.top < inside.bounds.top;
            var parent = inside.element.parentNode;
            if (isShadowOnTop) {
                //console.log("top");
                // Insert before the hovered element and place shadow in original element position.
                this._isLastSwapUp = false;
                this._lastSwapElement = inside.element;
                if (inside.index < checked.length - 1) {
                    parent.removeChild(this._shadow);
                    parent.insertBefore(this._shadow, checked[inside.index + 1].element);
                } else {
                    parent.removeChild(this._shadow);
                    parent.appendChild(this._shadow);
                }
            } else {
                //console.log("bottom");
                this._isLastSwapUp = true;
                this._lastSwapElement = inside.element;
                parent.removeChild(this._shadow);
                parent.insertBefore(this._shadow, inside.element);
            }
        }
    }

    onDown(e) {
        if (!isLeftButton(e)) return;

        // Check if item is draggable
        var item = getFirstElementWithClass(e.target, this.draggableClass);
        if (!item) return;

        //console.log(getRelativeBounds(item, this.container));

        // Set as item to be dragged
        this._target = item;
        var initialTarget = this._target;
        // Drag if target still the focus
        var self = this;
        setTimeout(function() {
            if (self._target === initialTarget) {
                self._startDrag(e.clientY);
            }
        }, this.dragTime);
    }

    onUp(e) {
        //console.log('up');
        // Reset or move the items
        if (this._isDragging) {
            // Reset the style of the dragged element
            var self = this;
            this._target.className = this._target.className.split(' ').reduce(function(p, v) {
                if (v !== self.draggingClass) {
                    return p += ' ' + v;
                }
                return p
            });
            this._target.parentNode.removeChild(this._target);
            this._target.style.position = '';
            this._target.style.width = '';
            this._target.style.height = '';
            this._target.style.transform = '';
            this._shadow.parentNode.replaceChild(this._target, this._shadow);
            // Call the callback with the target, swapped element, and if it was swapping from above
            if (this.onDrop) {
                this.onDrop(this._target, this._lastSwapElement, this._isLastSwapUp);
            }
        }
        this._target = null;
        this._isDragging = false;
        this._shadow = null;
    }

    onOut(e) {
        if (!this._isDragging && this._target != null && !isInElement(this._target, e.target)) {
            //console.log('out');
            this._target = null;
        }
    }

    onMove(e) {
        this._move(e.clientX, e.clientY);
    }

    destroy() {
        this.container.removeEventListener('mousedown', this._onDown);
        // Unfocus if mouse released
        document.removeEventListener('mouseup', this._onUp);
        // Unfocus if mouse goes out
        document.removeEventListener('mouseout', this._onOut);
        document.removeEventListener('mousemove', this._onMove);
    }
}

export default DraggableList;