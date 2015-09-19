/**
 * Makes a list draggable vertically.
 */
class DraggableList {
    /**
     * Makes the given element draggable.
     * @param {HTMLElement} element the element to make children draggable.
     * @param {String} draggableClass the class for draggable children.
     */
    function constructor(element, draggableClass) {
        super();

        this.itemClass = draggableClass;

        var list = document.getElementById('list');
        var log = document.getElementById('log');
        var itemClass = 'item';

        // Get first element with the given class
        function getFirstElementWithClass(ele, cls) {
            var item = ele;
            while (item) {
                var classes = item.className.split(' ');
                if (classes.indexOf(cls) >= 0) {
                    return item;
                }
                item = item.parentNode;
            }
            return null;
        }

        // Check if item is in ele
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

        var time = 300;
        var target;
        list.addEventListener('mousedown', function(e) {
            // Check if item is draggable
            var item = getFirstElementWithClass(e.target, itemClass);
            if (!item) return;

            // Set as item to be dragged
            target = item;
            var initialTarget = target;
            // Drag if target still the focus
            setTimeout(function() {
                if (target === initialTarget) {
                    console.log('dragging');
                }
            }, time);
        });

        // Unfocus if mouse released
        list.addEventListener('mouseup', function(e) {
            console.log('up');
            target = null;
        });

        // Unfocus if mouse goes out
        list.addEventListener('mouseout', function(e) {
            if (target != null && !isInElement(target, e.target)) {
                console.log('out');
                target = null;
            }
        });
    }
}

export default DraggableList;

/*
 var list = document.getElementById('list');
 var log = document.getElementById('log');
 var itemClass = 'item';
 var time = 300;
 var target;
 var isDragging = false;
 var shadowClass = 'shadow';
 var shadow = null;
 var diffWidth = 0;
 var diffHeight = 0;

 function getBoundingRect(ele) {
 var bodyRect = document.body.getBoundingClientRect();
 var elemRect = ele.getBoundingClientRect();
 return {
 top: elemRect.top - bodyRect.top,
 left: elemRect.left - bodyRect.left,
 bottom: elemRect.bottom - bodyRect.bottom,
 right: elemRect.right - bodyRect.right
 };
 }

 function isLeftButton(event) {
 if ('buttons' in event) {
 return event.buttons === 1;
 } else if ('which' in event) {
 return event.which === 1;
 } else {
 return event.button === 1;
 }
 }

 // Get first element with the given class
 function getFirstElementWithClass(ele, cls) {
 var item = ele;
 while (item) {
 var classes = item.className.split(' ');
 if (classes.indexOf(cls) >= 0) {
 return item;
 }
 item = item.parentNode;
 }
 return null;
 }

 // Check if item is in ele
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

 function onDown(e) {
 if (!isLeftButton(e)) return;

 // Check if item is draggable
 var item = getFirstElementWithClass(e.target, itemClass);
 if (!item) return;

 // Set as item to be dragged
 target = item;
 var initialTarget = target;
 // Drag if target still the focus
 setTimeout(function() {
 if (target === initialTarget) {
 console.log('dragging');
 isDragging = true;
 // Replace the dragging object with a shadow and make same dimensions
 shadow = target.cloneNode();
 shadow.className += " " + shadowClass;
 var width = target.clientWidth;
 var height = target.clientHeight;
 shadow.style.width = width + 'px';
 shadow.style.height = height + 'px';
 target.parentNode.replaceChild(shadow, target);

 // Remove padding from width and height
 diffWidth = shadow.offsetWidth - width;
 var finalWidth = width - diffWidth;
 shadow.style.width = finalWidth + 'px';
 diffHeight = shadow.offsetHeight - height;
 var finalHeight = height - diffHeight;
 shadow.style.height = finalHeight + 'px';

 // Float the dragging object
 target.style.transform = 'rotate(2deg)';
 target.style.width = finalWidth + 'px';
 target.style.height = finalHeight + 'px';
 target.style.position = 'absolute';
 list.appendChild(target);
 target.style.top = (e.clientY - target.offsetHeight / 2) + 'px';
 // Align the element with the original position including padding
 var bounds = getBoundingRect(shadow);
 target.style.left = (bounds.left + diffWidth / 2) + 'px';
 }
 }, time);
 }

 function onUp(e) {
 console.log('up');
 // Reset or move the items
 if (isDragging) {
 target.parentNode.removeChild(target);
 target.style.position = '';
 target.style.width = '';
 target.style.height = '';
 target.style.transform = '';
 shadow.parentNode.replaceChild(target, shadow);
 }
 target = null;
 isDragging = false;
 shadow = null;
 }

 function onOut(e) {
 if (!isDragging && target != null && !isInElement(target, e.target)) {
 console.log('out');
 target = null;
 }
 }

 function onMove(e) {
 if (!isDragging) return;

 target.style.top = (e.clientY - target.offsetHeight / 2) + 'px';
 }

 list.addEventListener('mousedown', onDown);

 // Unfocus if mouse released
 document.addEventListener('mouseup', onUp);

 // Unfocus if mouse goes out
 document.addEventListener('mouseout', onOut);

 document.addEventListener('mousemove', onMove);
 */