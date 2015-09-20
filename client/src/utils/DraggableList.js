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

class DraggableList {
    /**
     * Makes the given element draggable.
     * @param {HTMLElement} container the element to make children draggable.
     * @param {String} draggableClass the class for draggable children.
     * @param {String} shadowClass the class for the shadow.
     * @param {String} draggingClass the class when dragging.
     */
    constructor(container, draggableClass, shadowClass, draggingClass) {
        this.container = container;
        this.draggableClass = draggableClass;
        this.shadowClass = shadowClass;
        this.draggingClass = draggingClass;
        this.dragTime = 300;

        this._target = null;
        this._shadow = null;
        this._isDragging = false;
        this._diffWidth = 0;
        this._diffHeight = 0;

        this.container.addEventListener('mousedown', this.onDown.bind(this));
        // Unfocus if mouse released
        document.addEventListener('mouseup', this.onUp.bind(this));
        // Unfocus if mouse goes out
        document.addEventListener('mouseout', this.onOut.bind(this));
        document.addEventListener('mousemove', this.onMove.bind(this));
    }

    onDown(e) {
        if (!isLeftButton(e)) return;

        // Check if item is draggable
        var item = getFirstElementWithClass(e.target, this.draggableClass);
        if (!item) return;

        console.log(getRelativeBounds(item, this.container));

        // Set as item to be dragged
        this._target = item;
        var initialTarget = this._target;
        // Drag if target still the focus
        var self = this;
        setTimeout(function() {
            if (self._target === initialTarget) {
                console.log('dragging');
                self._isDragging = true;
                // Replace the dragging object with a shadow and make same dimensions
                self._shadow = self._target.cloneNode();
                self._shadow.className += " " + self.shadowClass;
                var width = self._target.clientWidth;
                var height = self._target.clientHeight;
                self._shadow.style.width = width + 'px';
                self._shadow.style.height = height + 'px';
                self._target.parentNode.replaceChild(self._shadow, self._target);

                // Remove padding from width and height
                self._diffWidth = self._shadow.offsetWidth - width;
                var finalWidth = width - self._diffWidth;
                self._shadow.style.width = finalWidth + 'px';
                self._diffHeight = self._shadow.offsetHeight - height;
                var finalHeight = height - self._diffHeight;
                self._shadow.style.height = finalHeight + 'px';

                // Float the dragging object
                self._target.className += ' ' + self.draggingClass;
                self._target.style.width = finalWidth + 'px';
                self._target.style.height = finalHeight + 'px';
                self._target.style.position = 'absolute';
                self.container.appendChild(self._target);
                self._target.style.top = (e.clientY - self._target.offsetHeight / 2) + 'px';
                // Align the element with the original position including padding
                var bounds = self._shadow.getBoundingClientRect();
                self._target.style.left = (bounds.left + self._diffWidth / 2) + 'px';
            }
        }, this.dragTime);
    }

    onUp(e) {
        console.log('up');
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
        }
        this._target = null;
        this._isDragging = false;
        this._shadow = null;
    }

    onOut(e) {
        if (!this._isDragging && this._target != null && !isInElement(this._target, e.target)) {
            console.log('out');
            this._target = null;
        }
    }

    onMove(e) {
        var listBounds = this.container.getBoundingClientRect();
        var topOffset = this.container.scrollTop;
        var ex = e.clientX - listBounds.left;
        var ey = e.clientY - listBounds.top + topOffset;

        /*
         document.getElementById('cx').innerHTML = e.clientX;
         document.getElementById('cy').innerHTML = e.clientY;
         document.getElementById('ex').innerHTML = ex;
         document.getElementById('ey').innerHTML = ey;
         */

        if (!this._isDragging) return;

        // Keep the dragged item in the right place
        this._target.style.top = (e.clientY - this._target.offsetHeight / 2) + 'px';

        // Get all the bounds
        var children = getChildrenWithClass(this.container, this.draggableClass);

        var checked = [];
        var i;
        for (i = 0; i < children.length; i++) {
            var child = children[i];
            if (hasClass(child, this.shadowClass) || hasClass(child, this.draggingClass)) continue;
            checked.push({
                element: child,
                bounds: getRelativeBounds(child, this.container)
            });
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
        if (inside) {
            var shadowBounds = getRelativeBounds(this._shadow, this.container);
            var isShadowOnTop = shadowBounds.top < inside.bounds.top;
            var parent = inside.element.parentNode;
            if (isShadowOnTop) {
                console.log("top");
                // Insert before the hovered element and place shadow in original element position.
                if (inside.index < checked.length - 1) {
                    parent.removeChild(this._shadow);
                    parent.insertBefore(this._shadow, checked[inside.index + 1].element);
                } else {
                    parent.removeChild(inside.element);
                    parent.insertBefore(inside.element, this._shadow);
                }
            } else {
                console.log("bottom");
                parent.removeChild(this._shadow);
                parent.insertBefore(this._shadow, inside.element);
            }
        }
    }
}

export default DraggableList;