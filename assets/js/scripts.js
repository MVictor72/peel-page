var PAGEPEEL = {
	init: function() {
        PAGEPEEL.peel.init();
        PAGEPEEL.turnJS.init();
		PAGEPEEL.peelLogic.init();

	},
    peelLogic: {
        init: function() {
            var p = new Peel('#peel-path');
            p.setPeelPath(200, 200, -200, -200);
            p.handleDrag(function(evt, x, y) {
                var t = (x - p.width) / -p.width;
                this.setTimeAlongPath(t);
            });

            
            $('#magazine').turn({
            display: 'single',
                acceleration: true,
                gradients: !$.isTouch,
                elevation:50,
                when: {
                    turned: function(e, page) {
                        /*console.log('Current view: ', $(this).turn('view'));*/
                    }
                }
            });    
            
            
            
        $(window).bind('keydown', function(e){
            
            if (e.keyCode==37)
                $('#magazine').turn('previous');
            else if (e.keyCode==39)
                $('#magazine').turn('next');
                
        });
        }
    }
}

jQuery(document).ready(function() {
	PAGEPEEL.init();
});
PAGEPEEL.peel = {

    init: function() {
        (function(win) {

            // Constants
          
            var PRECISION       = 1e2; // 2 decimals
            var VENDOR_PREFIXES = ['webkit','moz', ''];
            var SVG_NAMESPACE   = 'http://www.w3.org/2000/svg';
            var CSS_PREFIX      = 'peel-';
          
            var clipProperty, transformProperty, boxShadowProperty, filterProperty;
            var backgroundGradientSupport;
            var docEl = document.documentElement;
            var style = docEl.style;
          
          
            // Support
          
            function getCssProperty(name) {
              var prefix, str;
              for (var i = 0; i < VENDOR_PREFIXES.length; i++) {
                prefix = VENDOR_PREFIXES[i];
                str = prefix ? prefix + capitalize(name) : name;
                if (str in style) {
                  return str;
                }
              }
            }
          
            function setCssProperties() {
              clipProperty      = getCssProperty('clipPath');
              transformProperty = getCssProperty('transform');
              boxShadowProperty = getCssProperty('boxShadow');
              filterProperty    = getCssProperty('filter');
              setBackgroundGradientSupport();
              Peel.supported = !!(clipProperty && transformProperty);
              Peel.effectsSupported = backgroundGradientSupport;
            }
          
            function setBackgroundGradientSupport() {
              var el = document.createElement('div');
              var style = el.style;
              style.cssText = 'background:linear-gradient(45deg,#9f9,white);';
              backgroundGradientSupport = (style.backgroundImage || '').indexOf('gradient') > -1;
            }
          
          
          
            // General helpers
          
            function round(n) {
              return Math.round(n * PRECISION) / PRECISION;
            }
          
            // Clamps the number to be between 0 and 1.
            function clamp(n) {
              return Math.max(0, Math.min(1, n));
            }
          
            function normalize(n, min, max) {
              return (n - min) / (max - min);
            }
          
            // Distributes a number between 0 and 1 along a bell curve.
            function distribute(t, mult) {
              return (mult || 1) * 2 * (.5 - Math.abs(t - .5));
            }
          
            function capitalize(str) {
              return str.slice(0,1).toUpperCase() + str.slice(1);
            }
          
            function camelize(str) {
              return str.replace(/-(\w)/g, function(a, b) {
                return b.toUpperCase();
              });
            }
          
            function prefix(str) {
              return CSS_PREFIX + str;
            }
          
            // CSS Helpers
          
            function setCSSClip(el, clip) {
              el.style[clipProperty] = clip;
            }
          
            function setTransform(el, t) {
              el.style[transformProperty] = t;
            }
          
            function setBoxShadow(el, x, y, blur, spread, intensity) {
              el.style[boxShadowProperty] = getShadowCss(x, y, blur, spread, intensity);
            }
          
            function setDropShadow(el, x, y, blur, intensity) {
              el.style[filterProperty] = 'drop-shadow(' + getShadowCss(x, y, blur, null, intensity) + ')';
            }
          
            function getShadowCss(x, y, blur, spread, intensity) {
              return round(x) + 'px ' +
                     round(y) + 'px ' +
                     round(blur) + 'px ' +
                     (spread ? round(spread) + 'px ' : '') +
                     'rgba(0,0,0,' + round(intensity) + ')';
            }
          
            function setOpacity(el, t) {
              el.style.opacity = t;
            }
          
            function setBackgroundGradient(el, rotation, stops) {
              if (!backgroundGradientSupport) return;
              var css;
              if (stops.length === 0) {
                css = 'none';
              } else {
                css = 'linear-gradient(' + round(rotation) + 'deg,' + stops.join(',') + ')';
              }
              el.style.backgroundImage = css;
            }
          
            // Event Helpers
          
            function addEvent(el, type, fn) {
              el.addEventListener(type, fn)
            }
          
            function removeEvent(el, type, fn) {
              el.removeEventListener(type, fn);
            }
          
            function getEventCoordinates(evt, el) {
              var pos = evt.changedTouches ? evt.changedTouches[0] : evt;
              return {
                'x': pos.clientX - el.offsetLeft + window.scrollX,
                'y': pos.clientY - el.offsetTop + window.scrollY
              }
            }
          
            function bindWithEvent(fn, scope, arg1, arg2) {
              return function(evt) {
                fn.call(scope, evt, arg1, arg2);
              }
            }
          
            // Color Helpers
          
            function getBlackStop(a, pos) {
              return getColorStop(0, 0, 0, a, pos);
            }
          
            function getWhiteStop(a, pos) {
              return getColorStop(255, 255, 255, a, pos);
            }
          
            function getColorStop(r, g, b, a, pos) {
              a = round(clamp(a));
              return 'rgba('+ r +','+ g +','+ b +','+ a +') ' + round(pos * 100) + '%';
            }
          
          
            // DOM Element Helpers
          
            function getElement(obj, node) {
              if (typeof obj === 'string') {
                obj = (node || document).querySelector(obj);
              }
              return obj;
            }
          
            function createElement(parent, className) {
              var el = document.createElement('div');
              addClass(el, className);
              parent.appendChild(el);
              return el;
            }
          
            function removeClass(el, str) {
              el.classList.remove(str);
            }
          
            function addClass(el, str) {
              el.classList.add(str);
            }
          
            function getZIndex(el) {
              return el.style.zIndex;
            }
          
            function setZIndex(el, index) {
              el.style.zIndex = index;
            }
          
          
            // SVG Helpers
          
            function createSVGElement(tag, parent, attributes) {
              parent = parent || docEl;
              var el = document.createElementNS(SVG_NAMESPACE, tag);
              parent.appendChild(el);
              for (var key in attributes) {
                if (!attributes.hasOwnProperty(key)) continue;
                setSVGAttribute(el, key, attributes[key]);
              }
              return el;
            }
          
            function setSVGAttribute(el, key, value) {
              el.setAttributeNS(null, key, value);
            }
          
          
            /**
             * Main class that controls the peeling effect.
             * @param {HTMLElement|string} el The main container element (can be query).
             * @param {object} options Options for the effect.
             * @constructor
             * @public
             */
            function Peel (el, opt) {
              this.setOptions(opt);
              this.el = getElement(el, docEl);
              this.constraints = [];
              this.events = [];
              this.setupLayers();
              this.setupDimensions();
              this.setCorner(this.getOption('corner'));
              this.setMode(this.getOption('mode'));
              this.init();
            }
          
            /**
             * Four constants representing the corners of the element from which peeling can occur.
             * @constant
             * @public
             */
            Peel.Corners = {
              TOP_LEFT:     0x0,
              TOP_RIGHT:    0x1,
              BOTTOM_LEFT:  0x2,
              BOTTOM_RIGHT: 0x3
            }
          
            /**
             * Defaults
             * @constant
             */
            Peel.Defaults = {
              'topShadow': true,
              'topShadowBlur': 5,
              'topShadowAlpha': .5,
              'topShadowOffsetX': 0,
              'topShadowOffsetY': 1,
              'topShadowCreatesShape': true,
          
              'backReflection': false,
              'backReflectionSize': .02,
              'backReflectionOffset': 0,
              'backReflectionAlpha': .15,
              'backReflectionDistribute': true,
          
              'backShadow': true,
              'backShadowSize': .04,
              'backShadowOffset': 0,
              'backShadowAlpha': .1,
              'backShadowDistribute': true,
          
              'bottomShadow': true,
              'bottomShadowSize': 1.5,
              'bottomShadowOffset': 0,
              'bottomShadowDarkAlpha': .7,
              'bottomShadowLightAlpha': .1,
              'bottomShadowDistribute': true,
          
              'setPeelOnInit': true,
              'clippingBoxScale': 4,
              'flipConstraintOffset': 5,
              'dragPreventsDefault': true
            }
          
            /**
             * Sets the corner for the peel effect to happen from (default is bottom right).
             * @param {Mixed} [...] Either x,y or a corner id.
             * @public
             */
            Peel.prototype.setCorner = function() {
              var args = arguments;
              if (args[0] === undefined) {
                args = [Peel.Corners.BOTTOM_RIGHT];
              } else if (args[0].length) {
                args = args[0];
              }
              this.corner = this.getPointOrCorner(args);
            }
          
            /**
             * Sets a pre-defined "mode".
             * @param {string} mode The mode to set.
             * @public
             */
            Peel.prototype.setMode = function(mode) {
              if (mode === 'book') {
                // The order of constraints is important here so that the peel line
                // approaches the horizontal smoothly without jumping.
                this.addPeelConstraint(Peel.Corners.BOTTOM_LEFT);
                this.addPeelConstraint(Peel.Corners.TOP_LEFT);
                // Removing effect distribution will make the book still have some
                // depth to the effect while fully open.
                this.setOption('backReflection', false);
                this.setOption('backShadowDistribute', false);
                this.setOption('bottomShadowDistribute', false);
              } else if (mode === 'calendar') {
                this.addPeelConstraint(Peel.Corners.TOP_RIGHT);
                this.addPeelConstraint(Peel.Corners.TOP_LEFT);
              }
            }
          
            /**
             * Sets a path along which the peel will follow.
             * Can be a flat line segment or a bezier curve.
             * @param {...number} x/y Points along the path. 4 arguments indicates a
             *     linear path along 2 points (p1 to p2), while 8 arguments indicates a
             *     bezier curve from p1 to p2 using control points c1 and c2. The first
             *     and last two arguments represent p1 and p2, respectively.
             * @public
             */
            Peel.prototype.setPeelPath = function(x1, y1) {
              var args = arguments, p1, p2, c1, c2;
              p1 = new Point(x1, y1);
              if (args.length === 4) {
                p2 = new Point(args[2], args[3]);
                this.path = new LineSegment(p1, p2);
              } else if (args.length === 8) {
                c1 = new Point(args[2], args[3]);
                c2 = new Point(args[4], args[5]);
                p2 = new Point(args[6], args[7]);
                this.path = new BezierCurve(p1, c1, c2, p2);
              }
            }
          
            /**
             * Sets a function to be called when the user drags, either with a mouse or
             * with a finger (touch events).
             * @param {Function} fn The function to be called on drag. This function will
             *     be called with the Peel instance as the "this" keyword, the original
             *     event as the first argument, and the x, y coordinates of the drag as
             *     the 2nd and 3rd arguments, respectively.
             * @param {HTMLElement} el The element to initiate the drag on mouse/touch start.
             *     If not passed, this will be the element associated with the Peel
             *     instance. Allowing this to be passed lets another element serve as a
             *     "hit area" that can be larger than the element itself.
             * @public
             */
            Peel.prototype.handleDrag = function(fn, el) {
              this.dragHandler = fn;
              this.setupDragEvents(el);
            }
          
            /**
             * Sets a function to be called when the user either clicks with a mouse or
             * taps with a finger (touch events).
             * @param {Function} fn The function to be called on press. This function will
             *     be called with the Peel instance as the "this" keyword, the original
             *     event as the first argument, and the x, y coordinates of the event as
             *     the 2nd and 3rd arguments, respectively.
             * @param {HTMLElement} el The element to initiate the event.
             *     If not passed, this will be the element associated with the Peel
             *     instance. Allowing this to be passed lets another element serve as a
             *     "hit area" that can be larger than the element itself.
             * @public
             */
            Peel.prototype.handlePress = function(fn, el) {
              this.pressHandler = fn;
              this.setupDragEvents(el);
            }
          
            /**
             * Sets up the drag events needed for both drag and press handlers.
             * @param {HTMLElement} el The element to initiate the dragStart event on.
             * @private
             */
            Peel.prototype.setupDragEvents = function(el) {
              var self = this, isDragging, moveName, endName;
          
              if (this.dragEventsSetup) {
                return;
              }
          
              el = el || this.el;
          
              function dragStart (touch, evt) {
                if (self.getOption('dragPreventsDefault')) {
                  evt.preventDefault();
                }
                moveName = touch ? 'touchmove' : 'mousemove';
                endName  = touch ? 'touchend' : 'mouseup';
          
                addEvent(docEl, moveName, dragMove);
                addEvent(docEl, endName, dragEnd);
                isDragging = false;
              }
          
              function dragMove (evt) {
                if (self.dragHandler) {
                  callHandler(self.dragHandler, evt);
                }
                isDragging = true;
              }
          
              function dragEnd(evt) {
                if (!isDragging && self.pressHandler) {
                  callHandler(self.pressHandler, evt);
                }
                removeEvent(docEl, moveName, dragMove);
                removeEvent(docEl, endName, dragEnd);
              }
          
              function callHandler(fn, evt) {
                var coords = getEventCoordinates(evt, self.el);
                fn.call(self, evt, coords.x, coords.y);
              }
          
              this.addEvent(el, 'mousedown', dragStart.bind(this, false));
              this.addEvent(el, 'touchstart', dragStart.bind(this, true));
              this.dragEventsSetup = true;
            }
          
            /**
             * Remove all event handlers previously added to the instance.
             * @public
             */
            Peel.prototype.removeEvents = function() {
              this.events.forEach(function(e, i) {
                removeEvent(e.el, e.type, e.handler);
              });
              this.events = [];
            }
          
            /**
             * Sets the peel effect to a point in time along a previously
             * specified path. Will throw an error if no path exists.
             * @param {number} n The time value (between 0 and 1).
             * @public
             */
            Peel.prototype.setTimeAlongPath = function(t) {
              t = clamp(t);
              var point = this.path.getPointForTime(t);
              this.timeAlongPath = t;
              this.setPeelPosition(point.x, point.y);
            }
          
            /**
             * Sets a threshold above which the top layer (including the backside) layer
             * will begin to fade out. This is calculated based on the visible clipped
             * area of the polygon. If a peel path is set, it will use the progress along
             * the path instead.
             * @param {number} n A point between 0 and 1.
             * @public
             */
            Peel.prototype.setFadeThreshold = function(n) {
              this.fadeThreshold = n;
            }
          
            /**
             * Sets the position of the peel effect. This point is the position
             * of the corner that is being peeled back.
             * @param {Mixed} [...] Either x,y or a corner id.
             * @public
             */
            Peel.prototype.setPeelPosition = function() {
              var pos = this.getPointOrCorner(arguments);
              pos = this.getConstrainedPeelPosition(pos);
              if (!pos) {
                return;
              }
              this.peelLineSegment = this.getPeelLineSegment(pos);
              this.peelLineRotation = this.peelLineSegment.getAngle();
              this.setClipping();
              this.setBackTransform(pos);
              this.setEffects();
            }
          
            /**
             * Sets a constraint on the distance of the peel. This can be thought of as a
             * point on the layers that are connected and cannot be torn apart. Typically
             * this only makes sense as a point on the outer edge, such as the left edge
             * of an open book, or the top edge of a calendar. In this case, simply using
             * 2 constraint points (top-left/bottom-left for a book, etc) will create the
             * desired effect. An arbitrary point can also be used with an effect like a
             * thumbtack holding the pages together.
             * @param {Mixed} [...] Either x,y or a corner id.
             * @public
             */
            /**
             * Sets the corner for the peel effect to happen from.
             * @public
             */
            Peel.prototype.addPeelConstraint = function() {
              var p = this.getPointOrCorner(arguments);
              var radius = this.corner.subtract(p).getLength();
              this.constraints.push(new Circle(p, radius));
              this.calculateFlipConstraint();
            }
          
            /**
             * Sets an option to use for the effect.
             * @param {string} key The option to set.
             * @param {Mixed} value The value for the option.
             * @public
             */
            Peel.prototype.setOption = function(key, value) {
              this.options[key] = value;
            }
          
            /**
             * Gets an option set by the user.
             * @param {string} key The key of the option to get.
             * @returns {Mixed}
             * @public
             */
            Peel.prototype.getOption = function(key) {
              return this.options[camelize(key)];
            }
          
            /**
             * Gets the ratio of the area of the clipped top layer to the total area.
             * @returns {number} A value between 0 and 1.
             * @public
             */
            Peel.prototype.getAmountClipped = function() {
              var topArea = this.getTopClipArea();
              var totalArea = this.width * this.height;
              return normalize(topArea, totalArea, 0);
            }
          
            /**
             * Adds an event listener to the element and keeps track of it for later
             * removal.
             * @param {Element} el The element to add the handler to.
             * @param {string} type The event type.
             * @param {Function} fn The handler function.
             * @private
             */
            Peel.prototype.addEvent = function(el, type, fn) {
              addEvent(el, type, fn);
              this.events.push({
                el: el,
                type: type,
                handler: fn
              });
              return fn;
            }
            /**
             * Gets the area of the clipped top layer.
             * @returns {number}
             * @private
             */
            Peel.prototype.getTopClipArea = function() {
              var top  = new Polygon();
              this.elementBox.forEach(function(side) {
                this.distributeLineByPeelLine(side, top);
              }, this);
              return Polygon.getArea(top.getPoints());
            }
          
            /**
             * Determines which of the constraints should be used as the flip constraint
             * by checking which has a y value closes to the corner (because the
             * constraint operates relative to the vertical midline). Only one constraint
             * should be required - changing the order of the constraints can help to
             * achieve the proper effect and more than one will interfere with each other.
             * @private
             */
            Peel.prototype.calculateFlipConstraint = function() {
              var corner = this.corner, arr = this.constraints.concat();
              this.flipConstraint = arr.sort(function(a, b) {
                var aY = corner.y - a.center.y;
                var bY = corner.y - b.center.y;
                return a - b;
              })[0];
            }
          
            /**
             * Called when the drag event starts.
             * @param {Event} evt The original DOM event.
             * @param {string} type The event type, "mouse" or "touch".
             * @param {Function} fn The handler function to be called on drag.
             * @private
             */
            Peel.prototype.dragStart = function(evt, type, fn) {
            }
          
            /**
             * Calls an event handler using the coordinates of the event.
             * @param {Event} evt The original event.
             * @param {Function} fn The handler to call.
             * @private
             */
            Peel.prototype.fireHandler = function(evt, fn) {
              var coords = getEventCoordinates(evt, this.el);
              fn.call(this, evt, coords.x, coords.y);
            }
          
            /**
             * Sets the clipping points of the top and back layers based on a line
             * segment that represents the peel line.
             * @private
             */
            Peel.prototype.setClipping = function() {
              var top  = new Polygon();
              var back = new Polygon();
              this.clippingBox.forEach(function(side) {
                this.distributeLineByPeelLine(side, top, back);
              }, this);
          
              this.topClip.setPoints(top.getPoints());
              this.backClip.setPoints(back.getPoints());
            }
          
            /**
             * Distributes the first point in the given line segment and its intersect
             * with the peel line, if there is one.
             * @param {LineSegment} seg The line segment to check against.
             * @param {Polygon} poly1 The first polygon.
             * @param {Polygon} [poly2] The second polygon.
             * @private
             */
            Peel.prototype.distributeLineByPeelLine = function(seg, poly1, poly2) {
              var intersect = this.peelLineSegment.getIntersectPoint(seg);
              this.distributePointByPeelLine(seg.p1, poly1, poly2);
              this.distributePointByPeelLine(intersect, poly1, poly2);
            }
          
            /**
             * Distributes the given point to one of two polygons based on which side of
             * the peel line it falls upon (if it falls directly on the line segment
             * it is added to both).
             * @param {Point} p The point to be distributed.
             * @param {Polygon} poly1 The first polygon.
             * @param {Polygon} [poly2] The second polygon.
             * @private
             */
            Peel.prototype.distributePointByPeelLine = function(p, poly1, poly2) {
              if (!p) return;
              var d = this.peelLineSegment.getPointDeterminant(p);
              if (d <= 0) {
                poly1.addPoint(p);
              }
              if (d >= 0 && poly2) {
                poly2.addPoint(this.flipPointHorizontally(p));
              }
            }
          
            /**
             * Sets the options for the effect, merging in defaults.
             * @param {Object} opt User options.
             * @private
             */
            Peel.prototype.setOptions = function(opt) {
              var options = opt || {}, defaults = Peel.Defaults;
              for (var key in defaults) {
                if (!defaults.hasOwnProperty(key) || key in options) {
                  continue;
                }
                options[key] = defaults[key];
              }
              this.options = options;
            }
          
            /**
             * Finds or creates a layer in the dom.
             * @param {string} id The internal id of the element to be found or created.
             * @param {HTMLElement} parent The parent if the element needs to be created.
             * @param {numer} zIndex The z index of the layer.
             * @returns {HTMLElement}
             * @private
             */
            Peel.prototype.findOrCreateLayer = function(id, parent, zIndex) {
              var optId = id + '-element';
              var domId = prefix(id);
              var el = getElement(this.getOption(optId) || '.' + domId, parent);
              if (!el) {
                el = createElement(parent, domId);
              }
              addClass(el, prefix('layer'));
              setZIndex(el, zIndex);
              return el;
            }
          
            /**
             * Returns either a point created from 2 arguments (x/y) or a corner point
             * created from the first argument as a corner id.
             * @param {Arguments} args The arguments object from the original function.
             * @returns {Point}
             * @private
             */
            Peel.prototype.getPointOrCorner = function(args) {
              if (args.length === 2) {
                return new Point(args[0], args[1]);
              } else if(typeof args[0] === 'number') {
                return this.getCornerPoint(args[0]);
              }
              return args[0];
            }
          
            /**
             * Returns a corner point based on an id defined in Peel.Corners.
             * @param {number} id The id of the corner.
             * @private
             */
            Peel.prototype.getCornerPoint = function(id) {
              var x = +!!(id & 1) * this.width;
              var y = +!!(id & 2) * this.height;
              return new Point(x, y);
            }
          
            /**
             * Gets an optional clipping shape that may be set by the user.
             * @returns {Object}
             * @private
             */
            Peel.prototype.getOptionalShape = function() {
              var shapes = ['rect', 'polygon', 'path', 'circle'], found;
              shapes.some(function(type) {
                var attr = this.getOption(type), obj;
                if (attr) {
                  obj = {};
                  obj.attributes = attr;
                  obj.type = type;
                  found = obj;
                }
                return found;
              }, this);
              return found;
            }
          
            /**
             * Sets up the main layers used for the effect that may include a possible
             * subclip shape.
             * @private
             */
            Peel.prototype.setupLayers = function() {
              var shape = this.getOptionalShape();
          
              // The inner layers may be wrapped later, so keep a reference to them here.
              var topInnerLayer  = this.topLayer  = this.findOrCreateLayer('top', this.el, 2);
              var backInnerLayer = this.backLayer = this.findOrCreateLayer('back', this.el, 3);
          
              this.bottomLayer = this.findOrCreateLayer('bottom', this.el, 1);
          
              if (shape) {
                // If there is an SVG shape specified in the options, then this needs to
                // be a separate clipped element because Safari/Mobile Safari can't handle
                // nested clip-paths. The current top/back element will become the shape
                // clip, so wrap them with an "outer" clip element that will become the
                // new layer for the peel effect. The bottom layer does not require this
                // effect, so the shape clip can be set directly on it.
                this.topLayer  = this.wrapShapeLayer(this.topLayer, 'top-outer-clip');
                this.backLayer = this.wrapShapeLayer(this.backLayer, 'back-outer-clip');
          
                this.topShapeClip    = new SVGClip(topInnerLayer, shape);
                this.backShapeClip   = new SVGClip(backInnerLayer, shape);
                this.bottomShapeClip = new SVGClip(this.bottomLayer, shape);
          
                if (this.getOption('topShadowCreatesShape')) {
                  this.topShadowElement = this.setupDropShadow(shape, topInnerLayer);
                }
              } else {
                this.topShadowElement = this.findOrCreateLayer('top-shadow', topInnerLayer, 1);
              }
          
              this.topClip = new SVGClip(this.topLayer);
              this.backClip = new SVGClip(this.backLayer);
          
              this.backShadowElement     = this.findOrCreateLayer('back-shadow', backInnerLayer, 1);
              this.backReflectionElement = this.findOrCreateLayer('back-reflection', backInnerLayer, 2);
              this.bottomShadowElement   = this.findOrCreateLayer('bottom-shadow', this.bottomLayer, 1);
          
              this.usesBoxShadow = !shape;
            }
          
            /**
             * Creates an inline SVG element to be used as a layer for a drop shadow filter
             * effect. Note that drop shadow filters currently have some odd quirks in
             * Blink such as blur radius changing depending on rotation, etc.
             * @param {Object} shape A shape describing the SVG element to be used.
             * @param {HTMLElement} parent The parent element where the layer will be added.
             * @returns {SVGElement}
             * @private
             */
            Peel.prototype.setupDropShadow = function(shape, parent) {
              var svg = createSVGElement('svg', parent, {
                'class': prefix('layer')
              });
              createSVGElement(shape.type, svg, shape.attributes);
              return svg;
            }
          
            /**
             * Wraps the passed element in another layer, preserving its z-index. Also
             * add a "shape-layer" class to the layer which now becomes a shape clip.
             * @param {HTMLElement} el The element to become the wrapped shape layer.
             * @param {string} id The identifier for the new layer that will wrap the element.
             * @returns {HTMLElement} The new element that wraps the shape layer.
             * @private
             */
            Peel.prototype.wrapShapeLayer = function(el, id) {
              var zIndex = getZIndex(el);
              addClass(el, prefix('shape-layer'));
              var outerLayer = this.findOrCreateLayer(id, this.el, zIndex);
              outerLayer.appendChild(el);
              return outerLayer;
            }
          
            /**
             * Sets up the dimensions of the element box and clipping box that area used
             * in the effect.
             * @private
             */
            Peel.prototype.setupDimensions = function() {
              this.width  = this.el.offsetWidth;
              this.height = this.el.offsetHeight;
              this.center = new Point(this.width / 2, this.height / 2);
          
              this.elementBox  = this.getScaledBox(1);
              this.clippingBox = this.getScaledBox(this.getOption('clippingBoxScale'));
            }
          
            /**
             * Gets a box defined by 4 line segments that is at a scale of the main
             * element.
             * @param {number} scale The scale for the box to be.
             * @private
             */
            Peel.prototype.getScaledBox = function(scale) {
          
              // Box scale is equal to:
              // 1 * the bottom/right scale
              // 0 * the top/left scale.
              var brScale = scale;
              var tlScale = scale - 1;
          
              var tl = new Point(-this.width * tlScale, -this.height * tlScale);
              var tr = new Point( this.width * brScale, -this.height * tlScale);
              var br = new Point( this.width * brScale,  this.height * brScale);
              var bl = new Point(-this.width * tlScale,  this.height * brScale);
          
              return [
                new LineSegment(tl, tr),
                new LineSegment(tr, br),
                new LineSegment(br, bl),
                new LineSegment(bl, tl)
              ];
            }
          
            /**
             * Returns the peel position adjusted by constraints, if there are any.
             * @param {Point} point The peel position to be constrained.
             * @returns {Point}
             * @private
             */
            Peel.prototype.getConstrainedPeelPosition = function(pos) {
              this.constraints.forEach(function(area) {
                var offset = this.getFlipConstraintOffset(area, pos);
                if (offset) {
                  area = new Circle(area.center, area.radius - offset);
                }
                pos = area.constrainPoint(pos);
              }, this);
              return pos;
            }
          
            /**
             * Returns an offset to "pull" a corner in to prevent the peel effect from
             * suddenly flipping around its axis. This offset is intended to be applied
             * on the Y axis when dragging away from the center.
             * @param {Circle} area The constraint to check against.
             * @param {Point} point The peel position to be constrained.
             * @returns {number|undefined}
             * @private
             */
            Peel.prototype.getFlipConstraintOffset = function(area, pos) {
              var offset = this.getOption('flipConstraintOffset');
              if (area === this.flipConstraint && offset) {
                var cornerToCenter = this.corner.subtract(this.center);
                var cornerToConstraint = this.corner.subtract(area.center);
                var baseAngle = cornerToConstraint.getAngle();
          
                // Normalized angles are rotated to be in the same space relative
                // to the constraint.
                var nCornerToConstraint = cornerToConstraint.rotate(-baseAngle);
                var nPosToConstraint = pos.subtract(area.center).rotate(-baseAngle);
          
                // Flip the vector vertically if the corner is in the bottom left or top
                // right relative to the center, as the effect should always pull away
                // from the vertical midline.
                if (cornerToCenter.x * cornerToCenter.y < 0) {
                  nPosToConstraint.y *= -1;
                }
          
                if (nPosToConstraint.x > 0 && nPosToConstraint.y > 0) {
                  return normalize(nPosToConstraint.getAngle(), 45, 0) * offset;
                }
          
              }
            }
          
            /**
             * Gets the line segment that represents the current peel line.
             * @param {Point} point The position of the peel corner.
             * @returns {LineSegment}
             * @private
             */
            Peel.prototype.getPeelLineSegment = function(point) {
              // The point midway between the peel position and the corner.
              var halfToCorner = this.corner.subtract(point).scale(.5);
              var midpoint = point.add(halfToCorner);
              if (halfToCorner.x === 0 && halfToCorner.y === 0) {
                // If the corner is the same as the point, then set half to corner
                // to be the center, and keep the midpoint where it is. This will
                // ensure a non-zero peel line.
                halfToCorner = point.subtract(this.center);
              }
              var l = halfToCorner.getLength()
              var mult = (Math.max(this.width, this.height) / l) * 10;
              var half = halfToCorner.rotate(-90).scale(mult);
              var p1 = midpoint.add(half);
              var p2 = midpoint.subtract(half);
              return new LineSegment(p1, p2);
            }
          
            /**
             * Sets the transform of the back layer.
             * @param {Point} pos The position of the peeling corner.
             * @private
             */
            Peel.prototype.setBackTransform = function(pos) {
              var mirroredCorner = this.flipPointHorizontally(this.corner);
              var r = (this.peelLineRotation - 90) * 2;
              var t = pos.subtract(mirroredCorner.rotate(r));
              var css = 'translate('+ round(t.x) +'px, '+ round(t.y) +'px) rotate('+ round(r) +'deg)';
              setTransform(this.backLayer, css);
          
              // Set the top shadow element here as well, as the
              // position and rotation matches that of the back layer.
              setTransform(this.topShadowElement, css);
            }
          
            /**
             * Gets the distance of the peel line along an imaginary line that runs
             * between the corners that it "faces". For example, if the peel line
             * is rotated 45 degrees, then it can be considered to be between the top left
             * and bottom right corners. This function will return how far the peel line
             * has advanced along that line.
             * @returns {number} A position >= 0.
             * @private
             */
            Peel.prototype.getPeelLineDistance = function() {
              var cornerId, opposingCornerId, corner, opposingCorner;
              if (this.peelLineRotation < 90) {
                cornerId = Peel.Corners.TOP_RIGHT;
                opposingCornerId = Peel.Corners.BOTTOM_LEFT;
              } else if (this.peelLineRotation < 180) {
                cornerId = Peel.Corners.BOTTOM_RIGHT;
                opposingCornerId = Peel.Corners.TOP_LEFT;
              } else if (this.peelLineRotation < 270) {
                cornerId = Peel.Corners.BOTTOM_LEFT;
                opposingCornerId = Peel.Corners.TOP_RIGHT;
              } else if (this.peelLineRotation < 360) {
                cornerId = Peel.Corners.TOP_LEFT;
                opposingCornerId = Peel.Corners.BOTTOM_RIGHT;
              }
              corner = this.getCornerPoint(cornerId);
              opposingCorner = this.getCornerPoint(opposingCornerId);
          
              // Scale the line segment past the original corners so that the effects
              // can have a nice fadeout even past 1.
              var cornerToCorner = new LineSegment(corner, opposingCorner).scale(2);
              var intersect = this.peelLineSegment.getIntersectPoint(cornerToCorner);
              if (!intersect) {
                // If there is no intersect, then assume that it has run past the opposing
                // corner and set the distance to well past the full distance.
                return 2;
              }
              var distanceToPeelLine = corner.subtract(intersect).getLength();
              var totalDistance      = corner.subtract(opposingCorner).getLength();
              return (distanceToPeelLine / totalDistance);
            }
          
            /**
             * Sets shadows and fade effects.
             * @private
             */
            Peel.prototype.setEffects = function() {
              var t = this.getPeelLineDistance();
              this.setTopShadow(t);
              this.setBackShadow(t);
              this.setBackReflection(t);
              this.setBottomShadow(t);
              this.setFade();
            }
          
            /**
             * Sets the top shadow as either a box-shadow or a drop-shadow filter.
             * @param {number} t Position of the peel line from corner to corner.
             * @private
             */
            Peel.prototype.setTopShadow = function(t) {
              if (!this.getOption('topShadow')) {
                return;
              }
              var sBlur  = this.getOption('topShadowBlur');
              var sX     = this.getOption('topShadowOffsetX');
              var sY     = this.getOption('topShadowOffsetY');
              var alpha  = this.getOption('topShadowAlpha');
              var sAlpha = this.exponential(t, 5, alpha);
              if (this.usesBoxShadow) {
                setBoxShadow(this.topShadowElement, sX, sY, sBlur, 0, sAlpha);
              } else {
                setDropShadow(this.topShadowElement, sX, sY, sBlur, sAlpha);
              }
            }
          
            /**
             * Gets a number either distributed along a bell curve or increasing linearly.
             * @param {number} n The number to transform.
             * @param {boolean} dist Whether or not to use distribution.
             * @param {number} mult A multiplier for the result.
             * @returns {number}
             * @private
             */
            Peel.prototype.distributeOrLinear = function(n, dist, mult) {
              if (dist) {
                return distribute(n, mult);
              } else {
                return n * mult;
              }
            }
          
            /**
             * Gets a number either distributed exponentially, clamped to a range between
             * 0 and 1, and multiplied by a multiplier.
             * @param {number} n The number to transform.
             * @param {number} exp The exponent to be used.
             * @param {number} mult A multiplier for the result.
             * @returns {number}
             * @private
             */
            Peel.prototype.exponential = function(n, exp, mult) {
              return mult * clamp(Math.pow(1 + n, exp) - 1);
            }
          
            /**
             * Sets reflection of the back face as a linear gradient.
             * @param {number} t Position of the peel line from corner to corner.
             * @private
             */
            Peel.prototype.setBackReflection = function(t) {
              var stops = [];
              if (this.canSetLinearEffect('backReflection', t)) {
          
                var rDistribute = this.getOption('backReflectionDistribute');
                var rSize = this.getOption('backReflectionSize');
                var rOffset = this.getOption('backReflectionOffset');
                var rAlpha = this.getOption('backReflectionAlpha');
          
                var reflectionSize = this.distributeOrLinear(t, rDistribute, rSize);
                var rStop  = t - rOffset;
                var rMid   = rStop - reflectionSize;
                var rStart = rMid - reflectionSize;
          
                stops.push(getWhiteStop(0, 0));
                stops.push(getWhiteStop(0, rStart));
                stops.push(getWhiteStop(rAlpha, rMid));
                stops.push(getWhiteStop(0, rStop));
              }
              setBackgroundGradient(this.backReflectionElement, 180 - this.peelLineRotation, stops);
            }
          
            /**
             * Sets shadow of the back face as a linear gradient.
             * @param {number} t Position of the peel line from corner to corner.
             * @private
             */
            Peel.prototype.setBackShadow = function(t) {
              var stops = [];
              if (this.canSetLinearEffect('backShadow', t)) {
          
                var sSize       = this.getOption('backShadowSize');
                var sOffset     = this.getOption('backShadowOffset');
                var sAlpha      = this.getOption('backShadowAlpha');
                var sDistribute = this.getOption('backShadowDistribute');
          
                var shadowSize  = this.distributeOrLinear(t, sDistribute, sSize);
                var shadowStop  = t - sOffset;
                var shadowMid   = shadowStop - shadowSize;
                var shadowStart = shadowMid - shadowSize;
          
                stops.push(getBlackStop(0, 0));
                stops.push(getBlackStop(0, shadowStart));
                stops.push(getBlackStop(sAlpha, shadowMid));
                stops.push(getBlackStop(sAlpha, shadowStop));
              }
              setBackgroundGradient(this.backShadowElement, 180 - this.peelLineRotation, stops);
            }
          
            /**
             * Sets the bottom shadow as a linear gradient.
             * @param {number} t Position of the peel line from corner to corner.
             * @private
             */
            Peel.prototype.setBottomShadow = function(t) {
              var stops = [];
              if (this.canSetLinearEffect('bottomShadow', t)) {
          
                // Options
                var sSize = this.getOption('bottomShadowSize');
                var offset = this.getOption('bottomShadowOffset');
                var darkAlpha = this.getOption('bottomShadowDarkAlpha');
                var lightAlpha = this.getOption('bottomShadowLightAlpha');
                var sDistribute = this.getOption('bottomShadowDistribute');
          
                var darkShadowStart = t - (.025 - offset);
                var midShadowStart = darkShadowStart - (this.distributeOrLinear(t, sDistribute, .03) * sSize) - offset;
                var lightShadowStart = midShadowStart - ((.02 * sSize) - offset);
                stops = [
                  getBlackStop(0, 0),
                  getBlackStop(0, lightShadowStart),
                  getBlackStop(lightAlpha, midShadowStart),
                  getBlackStop(lightAlpha, darkShadowStart),
                  getBlackStop(darkAlpha, t)
                ];
              }
              setBackgroundGradient(this.bottomShadowElement, this.peelLineRotation + 180, stops);
            }
          
            /**
             * Whether a linear effect can be set.
             * @param {string} name Name of the effect
             * @param {number} t Current position of the linear effect line.
             * @returns {boolean}
             * @private
             */
            Peel.prototype.canSetLinearEffect = function(name, t) {
              return this.getOption(name) && t > 0;
            }
          
            /**
             * Sets the fading effect of the top layer, if a threshold is set.
             * @private
             */
            Peel.prototype.setFade = function() {
              var threshold = this.fadeThreshold, opacity = 1, n;
              if (threshold) {
                if (this.timeAlongPath !== undefined) {
                  n = this.timeAlongPath;
                } else {
                  n = this.getAmountClipped();
                }
                if (n > threshold) {
                  opacity = (1 - n) / (1 - threshold);
                }
                setOpacity(this.topLayer, opacity);
                setOpacity(this.backLayer, opacity);
                setOpacity(this.bottomShadowElement, opacity);
              }
            }
          
            /**
             * Flips a point along an imaginary vertical midpoint.
             * @param {Array} points The points to be flipped.
             * @returns {Array}
             * @private
             */
            Peel.prototype.flipPointHorizontally = function(p) {
              return new Point(p.x - ((p.x - this.center.x) * 2), p.y);
            }
          
            /**
             * Post setup initialization.
             * @private
             */
            Peel.prototype.init = function() {
              if (this.getOption('setPeelOnInit')) {
                this.setPeelPosition(this.corner);
              }
              addClass(this.el, prefix('ready'));
            }
          
            /**
             * Class that clips an HTMLElement by an SVG path.
             * @param {HTMLElement} el The element to be clipped.
             * @param {Object} [shape] An object defining the SVG element to use in the new
             *     clip path. Defaults to a polygon.
             * @constructor
             */
            function SVGClip (el, shape) {
              this.el = el;
              this.shape = SVGClip.createClipPath(el, shape || {
                'type': 'polygon'
              });
              // Chrome needs this for some reason for the clipping to work.
              setTransform(this.el, 'translate(0px,0px)');
            }
          
            /**
             * Sets up the global SVG element and its nested defs object to use for new
             * clip paths.
             * @returns {SVGElement}
             * @public
             */
            SVGClip.getDefs = function() {
              if (!this.defs) {
                this.svg  = createSVGElement('svg', null, {
                  'class': prefix('svg-clip-element')
                });
                this.defs = createSVGElement('defs', this.svg);
              }
              return this.defs;
            }
          
            /**
             * Creates a new <clipPath> SVG element and sets the passed html element to be
             * clipped by it.
             * @param {HTMLElement} el The html element to be clipped.
             * @param {Object} obj An object defining the SVG element to be used in the
             *     clip path.
             * @returns {SVGElement}
             * @public
             */
            SVGClip.createClipPath = function(el, obj) {
              var id = SVGClip.getId();
              var clipPath = createSVGElement('clipPath', this.getDefs());
              var svgEl = createSVGElement(obj.type, clipPath, obj.attributes);
              setSVGAttribute(clipPath, 'id', id);
              setCSSClip(el, 'url(#' + id + ')');
              return svgEl;
            }
          
            /**
             * Gets the next svg clipping id.
             * @public
             */
            SVGClip.getId = function() {
              if (!SVGClip.id) {
                SVGClip.id = 1;
              }
              return 'svg-clip-' + SVGClip.id++;
            }
          
            /**
             * Sets the "points" attribute of the clip path shape. This only makes sense
             * for polygon shapes.
             * @param {Array} points The points to be used.
             * @public
             */
            SVGClip.prototype.setPoints = function(points) {
              var str = points.map(function(p) {
                return round(p.x) + ',' + round(p.y);
              }).join(' ');
              setSVGAttribute(this.shape, 'points', str);
            }
          
            /**
             * A class that represents a circle.
             * @param {Point} center The center point.
             * @param {Point} radius The radius.
             * @constructor
             */
            function Circle (center, radius) {
              this.center = center;
              this.radius = radius;
            }
          
            /**
             * Determines whether a point is contained within the circle.
             * @param {Point} p The point.
             * @returns {boolean}
             * @public
             */
            Circle.prototype.containsPoint = function(p) {
              if(this.boundingRectContainsPoint(p)) {
                  var dx = this.center.x - p.x;
                  var dy = this.center.y - p.y;
                  dx *= dx;
                  dy *= dy;
                  var distanceSquared = dx + dy;
                  var radiusSquared = this.radius * this.radius;
                  return distanceSquared <= radiusSquared;
              }
              return false;
            }
          
            /**
             * Determines whether a point is contained within the bounding box of the circle.
             * @param {Point} p The point.
             * @returns {boolean}
             * @private
             */
            Circle.prototype.boundingRectContainsPoint = function(p) {
              return p.x >= this.center.x - this.radius && p.x <= this.center.x + this.radius &&
                     p.y >= this.center.y - this.radius && p.y <= this.center.y + this.radius;
            }
          
            /**
             * Moves a point outside the circle to the closest point on the circumference.
             * Rotated angle from the center point should be the same.
             * @param {Point} p The point.
             * @returns {boolean}
             * @public
             */
            Circle.prototype.constrainPoint = function(p) {
              if (!this.containsPoint(p)) {
                var rotation = p.subtract(this.center).getAngle();
                p = this.center.add(new Point(this.radius, 0).rotate(rotation));
              }
              return p;
            }
          
            /**
             * A class that represents a polygon.
             * @constructor
             */
            function Polygon() {
              this.points = [];
            }
          
            /**
             * Gets the area of the polygon.
             * @param {Array} points The points describing the polygon.
             * @public
             */
            Polygon.getArea = function(points) {
              var sum1 = 0, sum2 = 0;
              points.forEach(function(p, i, arr) {
                var next = arr[(i + 1) % arr.length];
                sum1 += (p.x * next.y);
                sum2 += (p.y * next.x);
              });
              return (sum1 - sum2) / 2;
            }
          
            /**
             * Adds a point to the polygon.
             * @param {Point} point
             * @public
             */
            Polygon.prototype.addPoint = function(point) {
              this.points.push(point);
            }
          
            /**
             * Gets the points of the polygon as an array.
             * @returns {Array}
             * @public
             */
            Polygon.prototype.getPoints = function() {
              return this.points;
            }
          
          
            /**
             * A class representing a bezier curve.
             * @param {Point} p1 The starting point.
             * @param {Point} c1 The control point of p1.
             * @param {Point} c2 The control point of p2.
             * @param {Point} p2 The ending point.
             * @constructor
             */
            function BezierCurve (p1, c1, c2, p2) {
              this.p1 = p1;
              this.c1 = c1;
              this.p2 = p2;
              this.c2 = c2;
            }
          
            /**
             * Gets a point along the line segment for a given time.
             * @param {number} t The time along the segment, between 0 and 1.
             * @returns {Point}
             */
            BezierCurve.prototype.getPointForTime = function(t) {
              var b0 = Math.pow(1 - t, 3);
              var b1 = 3 * t * Math.pow(1 - t, 2);
              var b2 = 3 * Math.pow(t, 2) * (1 - t);
              var b3 = Math.pow(t, 3);
          
              var x = (b0 * this.p1.x) + (b1 * this.c1.x) + (b2 * this.c2.x) + (b3 * this.p2.x)
              var y = (b0 * this.p1.y) + (b1 * this.c1.y) + (b2 * this.c2.y) + (b3 * this.p2.y)
              return new Point(x, y);
            }
          
          
            /**
             * A class that represents a line segment.
             * @param {Point} p1 The start of the segment.
             * @param {Point} p2 The end of the segment.
             * @constructor
             */
            function LineSegment (p1, p2) {
              this.p1 = p1;
              this.p2 = p2;
            }
          
            /**
             * @constant
             */
            LineSegment.EPSILON = 1e-6;
          
            /**
             * Gets a point along the line segment for a given time.
             * @param {number} t The time along the segment, between 0 and 1.
             * @returns {Point}
             * @public
             */
            LineSegment.prototype.getPointForTime = function(t) {
              return this.p1.add(this.getVector().scale(t));
            }
          
            /**
             * Takes a scalar and returns a new scaled line segment.
             * @param {number} n The amount to scale the segment by.
             * @returns {LineSegment}
             * @public
             */
            LineSegment.prototype.scale = function(n) {
              var half = 1 + (n / 2);
              var p1 = this.p1.add(this.p2.subtract(this.p1).scale(n));
              var p2 = this.p2.add(this.p1.subtract(this.p2).scale(n));
              return new LineSegment(p1, p2);
            }
          
            /**
             * The determinant is a number that indicates which side of a line a point
             * falls on. A positive number means that the point falls inside the area
             * "clockwise" of the line, ie. the area that the line would sweep if it were
             * rotated 180 degrees. A negative number would mean the point is in the area
             * the line would sweep if it were rotated counter-clockwise, or -180 degrees.
             * 0 indicates that the point falls exactly on the line.
             * @param {Point} p The point to test against.
             * @returns {number} A signed number.
             * @public
             */
            LineSegment.prototype.getPointDeterminant = function(p) {
              var d = ((p.x - this.p1.x) * (this.p2.y - this.p1.y)) - ((p.y - this.p1.y) * (this.p2.x - this.p1.x));
              // Tolerance for near-zero.
              if (d > -LineSegment.EPSILON && d < LineSegment.EPSILON) {
                d = 0;
              }
              return d;
            }
          
            /**
             * Calculates the point at which another line segment intersects, if any.
             * @param {LineSegment} seg The second line segment.
             * @returns {Point|null}
             * @public
             */
            LineSegment.prototype.getIntersectPoint = function(seg2) {
              var seg1 = this;
          
              function crossProduct(p1, p2) {
                return p1.x * p2.y - p1.y * p2.x;
              }
          
              var r = seg1.p2.subtract(seg1.p1);
              var s = seg2.p2.subtract(seg2.p1);
          
              var uNumerator = crossProduct(seg2.p1.subtract(seg1.p1), r);
              var denominator = crossProduct(r, s);
          
              if (denominator == 0) {
                // ignoring colinear and parallel
                return null;
              }
          
              var u = uNumerator / denominator;
              var t = crossProduct(seg2.p1.subtract(seg1.p1), s) / denominator;
          
              if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
                return seg1.p1.add(r.scale(t));
              }
          
              return null;
            }
          
            /**
             * Returns the angle of the line segment in degrees.
             * @returns {number}
             * @public
             */
            LineSegment.prototype.getAngle = function() {
              return this.getVector().getAngle();
            }
          
            /**
             * Gets the vector that represents the line segment.
             * @returns {Point}
             * @private
             */
            LineSegment.prototype.getVector = function() {
              if (!this.vector) {
                this.vector = this.p2.subtract(this.p1);
              }
              return this.vector;
            }
          
            /**
             * A class representing a point or 2D vector.
             * @param {number} x The x coordinate.
             * @param {number} y The y coordinate.
             * @constructor
             */
            function Point (x, y) {
              this.x = x;
              this.y = y;
            }
          
            /**
             * @constant
             */
            Point.DEGREES_IN_RADIANS = 180 / Math.PI;
          
            /**
             * Gets degrees in radians.
             * @param {number} deg
             * @returns {number}
             */
            Point.degToRad = function(deg) {
              return deg / Point.DEGREES_IN_RADIANS;
            };
          
            /**
             * Gets radians in degrees.
             * @param {number} rad
             * @returns {number}
             */
            Point.radToDeg = function(rad) {
              var deg = rad * Point.DEGREES_IN_RADIANS;
              while(deg < 0) deg += 360;
              return deg;
            };
          
            /**
             * Creates a new point given a rotation in degrees and a length.
             * @param {number} deg The rotation of the vector.
             * @param {number} len The length of the vector.
             * @returns {Point}
             */
            Point.vector = function(deg, len) {
              var rad = Point.degToRad(deg);
              return new Point(Math.cos(rad) * len, Math.sin(rad) * len);
            };
          
            /**
             * Adds a point.
             * @param {Point} p
             * @returns {Point}
             */
            Point.prototype.add = function(p) {
              return new Point(this.x + p.x, this.y + p.y);
            };
          
            /**
             * Subtracts a point.
             * @param {Point} p
             * @returns {Point}
             */
            Point.prototype.subtract = function(p) {
              return new Point(this.x - p.x, this.y - p.y);
            };
          
            /**
             * Scales a point by a scalar.
             * @param {number} n
             * @returns {Point}
             */
            Point.prototype.scale = function(n) {
              return new Point(this.x * n, this.y * n);
            };
          
            /**
             * Gets the length of the distance to the point.
             * @returns {number}
             */
            Point.prototype.getLength = function() {
              return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            };
          
            /**
             * Gets the angle of the point in degrees.
             * @returns {number}
             */
            Point.prototype.getAngle = function() {
              return Point.radToDeg(Math.atan2(this.y, this.x));
            };
          
            /**
             * Returns a new point of the same length with a different angle.
             * @param {number} deg The angle in degrees.
             * @returns {Point}
             */
            Point.prototype.setAngle = function(deg) {
              return Point.vector(deg, this.getLength());
            };
          
            /**
             * Rotates the point.
             * @param {number} deg The amount to rotate by in degrees.
             * @returns {Point}
             */
            Point.prototype.rotate = function(deg) {
              return this.setAngle(this.getAngle() + deg);
            };
          
            setCssProperties();
            win.Peel = Peel;
          
          })(window);
    }
}
PAGEPEEL.turnJS = {
    init: function() {
        /**
 * turn.js 3rd release
 * www.turnjs.com
 *
 * Copyright (C) 2012, Emmanuel Garcia.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Any redistribution, use, or modification is done solely for personal 
 * benefit and not for any commercial purpose or for monetary gain.
 * 
 **/

(function($) {

    'use strict';
    
    var has3d,
    
        vendor ='',
    
        PI = Math.PI,
    
        A90 = PI/2,
    
        isTouch = 'ontouchstart' in window,
    
        events = (isTouch) ? {start: 'touchstart', move: 'touchmove', end: 'touchend'}
                : {start: 'mousedown', move: 'mousemove', end: 'mouseup'},
    
        // Contansts used for each corner
        // tl * tr
        // *     *
        // bl * br
    
        corners = {
            backward: ['bl', 'tl'],
            forward: ['br', 'tr'],
            all: ['tl', 'bl', 'tr', 'br']
        },
    
        displays = ['single', 'double'],
    
        // Default options
    
        turnOptions = {
    
            // First page
    
            page: 1,
            
            // Enables gradients
    
            gradients: true,
    
            // Duration of transition in milliseconds
    
            duration: 600,
    
            // Enables hardware acceleration
    
            acceleration: true,
    
            // Display
    
            display: 'double',
    
            // Events
    
            when: null
        },
    
        flipOptions = {
    
            // Back page
            
            folding: null,
    
            // Corners
            // backward: Activates both tl and bl corners
            // forward: Activates both tr and br corners
            // all: Activates all the corners
    
            corners: 'forward',
            
            // Size of the active zone of each corner
    
            cornerSize: 100,
    
            // Enables gradients
    
            gradients: true,
    
            // Duration of transition in milliseconds
    
            duration: 600,
    
            // Enables hardware acceleration
    
            acceleration: true
        },
    
        // Number of pages in the DOM, minimum value: 6
    
        pagesInDOM = 6,
        
        pagePosition = {0: {top: 0, left: 0, right: 'auto', bottom: 'auto'},
                        1: {top: 0, right: 0, left: 'auto', bottom: 'auto'}},
    
        // Gets basic attributes for a layer
    
        divAtt = function(top, left, zIndex, overf) {
            return {'css': {
                        position: 'absolute',
                        top: top,
                        left: left,
                        'overflow': overf || 'hidden',
                        'z-index': zIndex || 'auto'
                        }
                };
        },
    
        // Gets a 2D point from a bezier curve of four points
    
        bezier = function(p1, p2, p3, p4, t) {
            var mum1 = 1 - t,
                mum13 = mum1 * mum1 * mum1,
                mu3 = t * t * t;
    
            return point2D(Math.round(mum13*p1.x + 3*t*mum1*mum1*p2.x + 3*t*t*mum1*p3.x + mu3*p4.x),
                            Math.round(mum13*p1.y + 3*t*mum1*mum1*p2.y + 3*t*t*mum1*p3.y + mu3*p4.y));
        },
        
        // Converts an angle from degrees to radians
    
        rad = function(degrees) {
            return degrees/180*PI;
        },
    
        // Converts an angle from radians to degrees
    
        deg = function(radians) {
            return radians/PI*180;
        },
    
        // Gets a 2D point
    
        point2D = function(x, y) {
            return {x: x, y: y};
        },
    
        // Returns the traslate value
    
        translate = function(x, y, use3d) {
            return (has3d && use3d) ? ' translate3d(' + x + 'px,' + y + 'px, 0px) ' : ' translate(' + x + 'px, ' + y + 'px) ';
        },
    
        // Returns the rotation value
    
        rotate = function(degrees) {
            return ' rotate(' + degrees + 'deg) ';
        },
    
        // Checks if a property belongs to an object
    
        has = function(property, object) {
            return Object.prototype.hasOwnProperty.call(object, property);
        },
    
        // Gets the CSS3 vendor prefix
    
        getPrefix = function() {
            var vendorPrefixes = ['Moz','Webkit','Khtml','O','ms'],
                len = vendorPrefixes.length,
                vendor = '';
    
            while (len--)
                if ((vendorPrefixes[len] + 'Transform') in document.body.style)
                    vendor='-'+vendorPrefixes[len].toLowerCase()+'-';
    
            return vendor;
        },
    
        // Adds gradients
    
        gradient = function(obj, p0, p1, colors, numColors) {
        
            var j, cols = [];
    
            if (vendor=='-webkit-') {
            
                for (j = 0; j<numColors; j++)
                        cols.push('color-stop('+colors[j][0]+', '+colors[j][1]+')');
                
                obj.css({'background-image': '-webkit-gradient(linear, '+p0.x+'% '+p0.y+'%,  '+p1.x+'% '+p1.y+'%, '+ cols.join(',') +' )'});
    
            } else {
    
                // This procedure makes the gradients for non-webkit browsers
                // It will be reduced to one unique way for gradients in next versions
                
                p0 = {x:p0.x/100 * obj.width(), y:p0.y/100 * obj.height()};
                p1 = {x:p1.x/100 * obj.width(), y:p1.y/100 * obj.height()};
    
                var dx = p1.x-p0.x,
                    dy = p1.y-p0.y,
                    angle = Math.atan2(dy, dx),
                    angle2 = angle - Math.PI/2,
                    diagonal = Math.abs(obj.width()*Math.sin(angle2)) + Math.abs(obj.height()*Math.cos(angle2)),
                    gradientDiagonal = Math.sqrt(dy*dy + dx*dx),
                    corner = point2D((p1.x<p0.x) ? obj.width() : 0, (p1.y<p0.y) ? obj.height() : 0),
                    slope = Math.tan(angle),
                    inverse = -1/slope,
                    x = (inverse*corner.x - corner.y - slope*p0.x + p0.y) / (inverse-slope),
                    c = {x: x, y: inverse*x - inverse*corner.x + corner.y},
                    segA = (Math.sqrt( Math.pow(c.x-p0.x,2) + Math.pow(c.y-p0.y,2)));
    
                    for (j = 0; j<numColors; j++)
                        cols.push(' '+colors[j][1]+' '+(( segA + gradientDiagonal*colors[j][0] )*100/diagonal)+'%');
            
                    obj.css({'background-image': vendor+'linear-gradient(' + (-angle) + 'rad,' + cols.join(',') + ')'});
            }
        },
    
    turnMethods = {
    
        // Singleton constructor
        // $('#selector').turn([options]);
    
        init: function(opts) {
    
            // Define constants
            if (has3d===undefined) {
                has3d = 'WebKitCSSMatrix' in window || 'MozPerspective' in document.body.style;
                vendor = getPrefix();
            }
    
            var i, data = this.data(), ch = this.children();
        
            opts = $.extend({width: this.width(), height: this.height()}, turnOptions, opts);
            data.opts = opts;
            data.pageObjs = {};
            data.pages = {};
            data.pageWrap = {};
            data.pagePlace = {};
            data.pageMv = [];
            data.totalPages = opts.pages || 0;
    
            if (opts.when)
                for (i in opts.when)
                    if (has(i, opts.when))
                        this.bind(i, opts.when[i]);
    
    
            this.css({position: 'relative', width: opts.width, height: opts.height});
    
            this.turn('display', opts.display);
    
            if (has3d && !isTouch && opts.acceleration)
                this.transform(translate(0, 0, true));
        
            for (i = 0; i<ch.length; i++)
                this.turn('addPage', ch[i], i+1);
        
            this.turn('page', opts.page);
    
            // allow setting active corners as an option
            corners = $.extend({}, corners, opts.corners);
    
            // Event listeners
    
            $(this).bind(events.start, function(e) {
                for (var page in data.pages)
                    if (has(page, data.pages) && flipMethods._eventStart.call(data.pages[page], e)===false)
                        return false;
            });
                
            $(document).bind(events.move, function(e) {
                for (var page in data.pages)
                    if (has(page, data.pages))
                        flipMethods._eventMove.call(data.pages[page], e);
            }).
            bind(events.end, function(e) {
                for (var page in data.pages)
                    if (has(page, data.pages))
                        flipMethods._eventEnd.call(data.pages[page], e);
    
            });
    
            data.done = true;
    
            return this;
        },
    
        // Adds a page from external data
    
        addPage: function(element, page) {
    
            var incPages = false,
                data = this.data(),
                lastPage = data.totalPages+1;
    
            if (page) {
                if (page==lastPage) {
                    page = lastPage;
                    incPages = true;
                } else if (page>lastPage)
                    throw new Error ('It is impossible to add the page "'+page+'", the maximum value is: "'+lastPage+'"');
    
            } else {
                page = lastPage;
                incPages = true;
            }
    
            if (page>=1 && page<=lastPage) {
    
                // Stop animations
                if (data.done) this.turn('stop');
    
                // Move pages if it's necessary
                if (page in data.pageObjs)
                    turnMethods._movePages.call(this, page, 1);
    
                // Update number of pages
                if (incPages)
                    data.totalPages = lastPage;
    
                // Add element
                data.pageObjs[page] = $(element).addClass('turn-page p' + page);
    
                // Add page
                turnMethods._addPage.call(this, page);
    
                // Update view
                if (data.done)
                    this.turn('update');
    
                turnMethods._removeFromDOM.call(this);
            }
    
            return this;
        },
    
        // Adds a page from internal data
    
        _addPage: function(page) {
            
            var data = this.data(),
                element = data.pageObjs[page];
    
            if (element)
                if (turnMethods._necessPage.call(this, page)) {
                    
                    if (!data.pageWrap[page]) {
    
                        var pageWidth = (data.display=='double') ? this.width()/2 : this.width(),
                            pageHeight = this.height();
    
                        element.css({width:pageWidth, height:pageHeight});
    
                        // Place
                        data.pagePlace[page] = page;
    
                        // Wrapper
                        data.pageWrap[page] = $('<div/>', {'class': 'turn-page-wrapper',
                                                        page: page,
                                                        css: {position: 'absolute',
                                                        overflow: 'hidden',
                                                        width: pageWidth,
                                                        height: pageHeight}}).
                                                        css(pagePosition[(data.display=='double') ? page%2 : 0]);
    
                        // Append to this
                        this.append(data.pageWrap[page]);
    
                        // Move data.pageObjs[page] (element) to wrapper
                        data.pageWrap[page].prepend(data.pageObjs[page]);
                    }
    
                    // If the page is in the current view, create the flip effect
                    if (!page || turnMethods._setPageLoc.call(this, page)==1)
                        turnMethods._makeFlip.call(this, page);
                    
                } else {
    
                    // Place
                    data.pagePlace[page] = 0;
    
                    // Remove element from the DOM
                    if (data.pageObjs[page])
                        data.pageObjs[page].remove();
    
                }
    
        },
    
        // Checks if a page is in memory
        
        hasPage: function(page) {
    
            return page in this.data().pageObjs;
        
        },
    
        // Prepares the flip effect for a page
    
        _makeFlip: function(page) {
    
            var data = this.data();
    
            if (!data.pages[page] && data.pagePlace[page]==page) {
    
                var single = data.display=='single',
                    even = page%2;
                
                data.pages[page] = data.pageObjs[page].
                                    css({width: (single) ? this.width() : this.width()/2, height: this.height()}).
                                    flip({page: page,
                                        next: (single && page === data.totalPages) ? page -1 : ((even || single) ? page+1 : page-1),
                                        turn: this,
                                        duration: data.opts.duration,
                                        acceleration : data.opts.acceleration,
                                        corners: (single) ? 'all' : ((even) ? 'forward' : 'backward'),
                                        backGradient: data.opts.gradients,
                                        frontGradient: data.opts.gradients
                                        }).
                                        flip('disable', data.disabled).
                                        bind('pressed', turnMethods._pressed).
                                        bind('released', turnMethods._released).
                                        bind('start', turnMethods._start).
                                        bind('end', turnMethods._end).
                                        bind('flip', turnMethods._flip);
            }
            return data.pages[page];
        },
    
        // Makes pages within a range
    
        _makeRange: function() {
    
            var page,
                data = this.data(),
                range = this.turn('range');
    
                for (page = range[0]; page<=range[1]; page++)
                    turnMethods._addPage.call(this, page);
    
        },
    
        // Returns a range of `pagesInDOM` pages that should be in the DOM
        // Example:
        // - page of the current view, return true
        // * page is in the range, return true
        // 0 page is not in the range, return false
        //
        // 1 2-3 4-5 6-7 8-9 10-11 12-13
        //    **  **  --   **  **
    
        range: function(page) {
    
            var remainingPages, left, right,
                data = this.data();
                page = page || data.tpage || data.page;
                var view = turnMethods._view.call(this, page);
    
                if (page<1 || page>data.totalPages)
                    throw new Error ('"'+page+'" is not a page for range');
            
                view[1] = view[1] || view[0];
                
                if (view[0]>=1 && view[1]<=data.totalPages) {
    
                    remainingPages = Math.floor((pagesInDOM-2)/2);
    
                    if (data.totalPages-view[1] > view[0]) {
                        left = Math.min(view[0]-1, remainingPages);
                        right = 2*remainingPages-left;
                    } else {
                        right = Math.min(data.totalPages-view[1], remainingPages);
                        left = 2*remainingPages-right;
                    }
    
                } else {
                    left = pagesInDOM-1;
                    right = pagesInDOM-1;
                }
    
                return [Math.max(1, view[0]-left), Math.min(data.totalPages, view[1]+right)];
    
        },
    
        // Detects if a page is within the range of `pagesInDOM` from the current view
    
        _necessPage: function(page) {
            
            if (page===0)
                return true;
    
            var range = this.turn('range');
    
            return page>=range[0] && page<=range[1];
            
        },
    
        // Releases memory by removing pages from the DOM
    
        _removeFromDOM: function() {
    
            var page, data = this.data();
    
            for (page in data.pageWrap)
                if (has(page, data.pageWrap) && !turnMethods._necessPage.call(this, page))
                    turnMethods._removePageFromDOM.call(this, page);
            
    
        },
    
        // Removes a page from DOM and its internal references
    
        _removePageFromDOM: function(page) {
    
            var data = this.data();
    
            if (data.pages[page]) {
                var dd = data.pages[page].data();
                if (dd.f && dd.f.fwrapper)
                    dd.f.fwrapper.remove();
                data.pages[page].remove();
                delete data.pages[page];
            }
    
            if (data.pageObjs[page])
                data.pageObjs[page].remove();
    
            if (data.pageWrap[page]) {
                data.pageWrap[page].remove();
                delete data.pageWrap[page];
            }
    
            delete data.pagePlace[page];
    
        },
    
        // Removes a page
    
        removePage: function(page) {
    
            var data = this.data();
    
            if (data.pageObjs[page]) {
                // Stop animations
                this.turn('stop');
    
                // Remove `page`
                turnMethods._removePageFromDOM.call(this, page);
                delete data.pageObjs[page];
    
                // Move the pages behind `page`
                turnMethods._movePages.call(this, page, -1);
    
                // Resize the size of this magazine
                data.totalPages = data.totalPages-1;
                turnMethods._makeRange.call(this);
    
                // Check the current view
                if (data.page>data.totalPages)
                    this.turn('page', data.totalPages);
            }
    
            return this;
        
        },
    
        // Moves pages
    
        _movePages: function(from, change) {
    
            var page,
                data = this.data(),
                single = data.display=='single',
                move = function(page) {
    
                    var next = page + change,
                        odd = next%2;
    
                    if (data.pageObjs[page])
                        data.pageObjs[next] = data.pageObjs[page].removeClass('page' + page).addClass('page' + next);
    
                    if (data.pagePlace[page] && data.pageWrap[page]) {
                        data.pagePlace[next] = next;
                        data.pageWrap[next] = data.pageWrap[page].css(pagePosition[(single) ? 0 : odd]).attr('page', next);
                        
                        if (data.pages[page])
                            data.pages[next] = data.pages[page].flip('options', {
                                page: next,
                                next: (single || odd) ? next+1 : next-1,
                                corners: (single) ? 'all' : ((odd) ? 'forward' : 'backward')
                            });
    
                        if (change) {
                            delete data.pages[page];
                            delete data.pagePlace[page];
                            delete data.pageObjs[page];
                            delete data.pageWrap[page];
                            delete data.pageObjs[page];
                        }
                }
            };
    
            if (change>0)
                for (page=data.totalPages; page>=from; page--) move(page);
            else
                for (page=from; page<=data.totalPages; page++) move(page);
    
        },
    
        // Sets or Gets the display mode
    
        display: function(display) {
    
            var data = this.data(),
                currentDisplay = data.display;
    
            if (display) {
    
                if ($.inArray(display, displays)==-1)
                    throw new Error ('"'+display + '" is not a value for display');
                
                if (display=='single') {
                    if (!data.pageObjs[0]) {
                        this.turn('stop').
                            css({'overflow': 'hidden'});
                        data.pageObjs[0] = $('<div />', {'class': 'turn-page p-temporal'}).
                                        css({width: this.width(), height: this.height()}).
                                            appendTo(this);
                    }
                } else {
                    if (data.pageObjs[0]) {
                        this.turn('stop').
                            css({'overflow': ''});
                        data.pageObjs[0].remove();
                        delete data.pageObjs[0];
                    }
                }
    
                data.display = display;
    
                if (currentDisplay) {
                    var size = this.turn('size');
                    turnMethods._movePages.call(this, 1, 0);
                    this.turn('size', size.width, size.height).
                            turn('update');
                }
    
                return this;
    
            } else
                return currentDisplay;
        
        },
    
        // Detects if the pages are being animated
    
        animating: function() {
    
            return this.data().pageMv.length>0;
    
        },
    
        // Disables and enables the effect
    
        disable: function(bool) {
    
            var page,
                data = this.data(),
                view = this.turn('view');
    
                data.disabled = bool===undefined || bool===true;
    
            for (page in data.pages)
                if (has(page, data.pages))
                    data.pages[page].flip('disable', bool ? $.inArray(page, view) : false );
    
            return this;
    
        },
    
        // Gets and sets the size
    
        size: function(width, height) {
    
            if (width && height) {
    
                var data = this.data(), pageWidth = (data.display=='double') ? width/2 : width, page;
    
                this.css({width: width, height: height});
    
                if (data.pageObjs[0])
                    data.pageObjs[0].css({width: pageWidth, height: height});
                
                for (page in data.pageWrap) {
                    if (!has(page, data.pageWrap)) continue;
                    data.pageObjs[page].css({width: pageWidth, height: height});
                    data.pageWrap[page].css({width: pageWidth, height: height});
                    if (data.pages[page])
                        data.pages[page].css({width: pageWidth, height: height});
                }
    
                this.turn('resize');
    
                return this;
    
            } else {
                
                return {width: this.width(), height: this.height()};
    
            }
        },
    
        // Resizes each page
    
        resize: function() {
    
            var page, data = this.data();
    
            if (data.pages[0]) {
                data.pageWrap[0].css({left: -this.width()});
                data.pages[0].flip('resize', true);
            }
    
            for (page = 1; page <= data.totalPages; page++)
                if (data.pages[page])
                    data.pages[page].flip('resize', true);
    
    
        },
    
        // Removes an animation from the cache
    
        _removeMv: function(page) {
    
            var i, data = this.data();
                
            for (i=0; i<data.pageMv.length; i++)
                if (data.pageMv[i]==page) {
                    data.pageMv.splice(i, 1);
                    return true;
                }
    
            return false;
    
        },
    
        // Adds an animation to the cache
        
        _addMv: function(page) {
    
            var data = this.data();
    
            turnMethods._removeMv.call(this, page);
            data.pageMv.push(page);
    
        },
    
        // Gets indexes for a view
    
        _view: function(page) {
        
            var data = this.data();
            page = page || data.page;
    
            if (data.display=='double')
                return (page%2) ? [page-1, page] : [page, page+1];
            else
                return [page];
    
        },
    
        // Gets a view
    
        view: function(page) {
    
            var data = this.data(), view = turnMethods._view.call(this, page);
    
            return (data.display=='double') ? [(view[0]>0) ? view[0] : 0, (view[1]<=data.totalPages) ? view[1] : 0]
                    : [(view[0]>0 && view[0]<=data.totalPages) ? view[0] : 0];
    
        },
    
        // Stops animations
    
        stop: function(ok) {
    
            var i, opts, data = this.data(), pages = data.pageMv;
    
            data.pageMv = [];
    
            if (data.tpage) {
                data.page = data.tpage;
                delete data['tpage'];
            }
    
            for (i in pages) {
                if (!has(i, pages)) continue;
                opts = data.pages[pages[i]].data().f.opts;
                flipMethods._moveFoldingPage.call(data.pages[pages[i]], null);
                data.pages[pages[i]].flip('hideFoldedPage');
                data.pagePlace[opts.next] = opts.next;
                
                if (opts.force) {
                    opts.next = (opts.page%2===0) ? opts.page-1 : opts.page+1;
                    delete opts['force'];
                }
    
            }
    
            this.turn('update');
    
            return this;
        },
    
        // Gets and sets the number of pages
    
        pages: function(pages) {
    
            var data = this.data();
    
            if (pages) {
                if (pages<data.totalPages) {
    
                    for (var page = pages+1; page<=data.totalPages; page++)
                        this.turn('removePage', page);
    
                    if (this.turn('page')>pages)
                        this.turn('page', pages);
                }
    
                data.totalPages = pages;
    
                return this;
            } else
                return data.totalPages;
    
        },
    
        // Sets a page without effect
    
        _fitPage: function(page, ok) {
            
            var data = this.data(), newView = this.turn('view', page);
            
            if (data.page!=page) {
                this.trigger('turning', [page, newView]);
                if ($.inArray(1, newView)!=-1) this.trigger('first');
                if ($.inArray(data.totalPages, newView)!=-1) this.trigger('last');
            }
    
            if (!data.pageObjs[page])
                return;
    
            data.tpage = page;
    
            this.turn('stop', ok);
            turnMethods._removeFromDOM.call(this);
            turnMethods._makeRange.call(this);
            this.trigger('turned', [page, newView]);
    
        },
        
        // Turns to a page
    
        _turnPage: function(page) {
    
            var current, next,
                data = this.data(),
                view = this.turn('view'),
                newView = this.turn('view', page);
        
            if (data.page!=page) {
                this.trigger('turning', [page, newView]);
                if ($.inArray(1, newView)!=-1) this.trigger('first');
                if ($.inArray(data.totalPages, newView)!=-1) this.trigger('last');
            }
    
            if (!data.pageObjs[page])
                return;
    
            data.tpage = page;
    
            this.turn('stop');
    
            turnMethods._makeRange.call(this);
    
            if (data.display=='single') {
                current = view[0];
                next = newView[0];
            } else if (view[1] && page>view[1]) {
                current = view[1];
                next = newView[0];
            } else if (view[0] && page<view[0]) {
                current = view[0];
                next = newView[1];
            }
    
            if (data.pages[current]) {
    
                var opts = data.pages[current].data().f.opts;
                data.tpage = next;
                
                if (opts.next!=next) {
                    opts.next = next;
                    data.pagePlace[next] = opts.page;
                    opts.force = true;
                }
    
                if (data.display=='single')
                    data.pages[current].flip('turnPage', (newView[0] > view[0]) ? 'br' : 'bl');
                else
                    data.pages[current].flip('turnPage');
            }
    
        },
    
        // Gets and sets a page
    
        page: function(page) {
    
            page = parseInt(page, 10);
    
            var data = this.data();
    
            if (page>0 && page<=data.totalPages) {
                if (!data.done || $.inArray(page, this.turn('view'))!=-1)
                    turnMethods._fitPage.call(this, page);
                else
                    turnMethods._turnPage.call(this, page);
            
                return this;
    
            } else
                return data.page;
        
        },
    
        // Turns to the next view
    
        next: function() {
    
            var data = this.data();
            return this.turn('page', turnMethods._view.call(this, data.page).pop() + 1);
        
        },
    
        // Turns to the previous view
    
        previous: function() {
            
            var data = this.data();
            return this.turn('page', turnMethods._view.call(this, data.page).shift() - 1);
    
        },
    
        // Adds a motion to the internal list
    
        _addMotionPage: function() {
    
            var opts = $(this).data().f.opts,
                turn = opts.turn,
                dd = turn.data();
    
            opts.pageMv = opts.page;
            turnMethods._addMv.call(turn, opts.pageMv);
            dd.pagePlace[opts.next] = opts.page;
            turn.turn('update');
    
        },
    
        // This event is called in context of flip
    
        _start: function(e, opts, corner) {
    
                var data = opts.turn.data(),
                    event = $.Event('start');
    
                e.stopPropagation();
    
                opts.turn.trigger(event, [opts, corner]);
    
                if (event.isDefaultPrevented()) {
                    e.preventDefault();
                    return;
                }
            
            if (data.display=='single') {
    
                var left = corner.charAt(1)=='l';
                if ((opts.page==1 && left) || (opts.page==data.totalPages && !left))
                    e.preventDefault();
                else {
                    if (left) {
                        opts.next = (opts.next<opts.page) ? opts.next : opts.page-1;
                        opts.force = true;
                    } else
                        opts.next = (opts.next>opts.page) ? opts.next : opts.page+1;
                }
    
            }
    
            turnMethods._addMotionPage.call(this);
        },
    
        // This event is called in context of flip
    
        _end: function(e, turned) {
            
            var that = $(this),
                data = that.data().f,
                opts = data.opts,
                turn = opts.turn,
                dd = turn.data();
    
            e.stopPropagation();
    
            if (turned || dd.tpage) {
    
                if (dd.tpage==opts.next || dd.tpage==opts.page) {
                    delete dd['tpage'];
                    turnMethods._fitPage.call(turn, dd.tpage || opts.next, true);
                }
    
            } else {
                turnMethods._removeMv.call(turn, opts.pageMv);
                turn.turn('update');
            }
            
        },
        
        // This event is called in context of flip
    
        _pressed: function() {
    
            var page,
                that = $(this),
                data = that.data().f,
                turn = data.opts.turn,
                pages = turn.data().pages;
        
            for (page in pages)
                if (page!=data.opts.page)
                    pages[page].flip('disable', true);
    
            return data.time = new Date().getTime();
    
        },
    
        // This event is called in context of flip
    
        _released: function(e, point) {
            
            var that = $(this),
                data = that.data().f;
    
                e.stopPropagation();
    
            if ((new Date().getTime())-data.time<200 || point.x<0 || point.x>$(this).width()) {
                e.preventDefault();
                data.opts.turn.data().tpage = data.opts.next;
                data.opts.turn.turn('update');
                $(that).flip('turnPage');
            }
    
        },
    
        // This event is called in context of flip
        
        _flip: function() {
    
            var opts = $(this).data().f.opts;
    
            opts.turn.trigger('turn', [opts.next]);
    
        },
    
        // Calculate the z-index value for pages during the animation
    
        calculateZ: function(mv) {
    
            var i, page, nextPage, placePage, dpage,
                that = this,
                data = this.data(),
                view = this.turn('view'),
                currentPage = view[0] || view[1],
                r = {pageZ: {}, partZ: {}, pageV: {}},
    
                addView = function(page) {
                    var view = that.turn('view', page);
                    if (view[0]) r.pageV[view[0]] = true;
                    if (view[1]) r.pageV[view[1]] = true;
                };
            
                for (i = 0; i<mv.length; i++) {
                    page = mv[i];
                    nextPage = data.pages[page].data().f.opts.next;
                    placePage = data.pagePlace[page];
                    addView(page);
                    addView(nextPage);
                    dpage = (data.pagePlace[nextPage]==nextPage) ? nextPage : page;
                    r.pageZ[dpage] = data.totalPages - Math.abs(currentPage-dpage);
                    r.partZ[placePage] = data.totalPages*2 + Math.abs(currentPage-dpage);
                }
    
            return r;
        },
    
        // Updates the z-index and display property of every page
    
        update: function() {
    
            var page,
                data = this.data();
    
            if (data.pageMv.length && data.pageMv[0]!==0) {
    
                // Update motion
    
                var apage,
                    pos = this.turn('calculateZ', data.pageMv),
                    view = this.turn('view', data.tpage);
            
                if (data.pagePlace[view[0]]==view[0]) apage = view[0];
                else if (data.pagePlace[view[1]]==view[1]) apage = view[1];
            
                for (page in data.pageWrap) {
    
                    if (!has(page, data.pageWrap)) continue;
    
                    data.pageWrap[page].css({display: (pos.pageV[page]) ? '' : 'none', 'z-index': pos.pageZ[page] || 0});
    
                    if (data.pages[page]) {
                        data.pages[page].flip('z', pos.partZ[page] || null);
    
                        if (pos.pageV[page])
                            data.pages[page].flip('resize');
    
                        if (data.tpage)
                            data.pages[page].flip('disable', true); // data.disabled || page!=apage
                    }
                }
                    
            } else {
    
                // Update static pages
    
                for (page in data.pageWrap) {
                    if (!has(page, data.pageWrap)) continue;
                        var pageLocation = turnMethods._setPageLoc.call(this, page);
                        if (data.pages[page])
                            data.pages[page].flip('disable', data.disabled || pageLocation!=1).flip('z', null);
                }
            }
        },
    
        // Sets the z-index and display property of a page
        // It depends on the current view
    
        _setPageLoc: function(page) {
    
            var data = this.data(),
                view = this.turn('view');
    
            if (page==view[0] || page==view[1]) {
                data.pageWrap[page].css({'z-index': data.totalPages, display: ''});
                return 1;
            } else if ((data.display=='single' && page==view[0]+1) || (data.display=='double' && page==view[0]-2 || page==view[1]+2)) {
                data.pageWrap[page].css({'z-index': data.totalPages-1, display: ''});
                return 2;
            } else {
                data.pageWrap[page].css({'z-index': 0, display: 'none'});
                return 0;
            }
        }
    },
    
    // Methods and properties for the flip page effect
    
    flipMethods = {
    
        // Constructor
    
        init: function(opts) {
    
            if (opts.gradients) {
                opts.frontGradient = true;
                opts.backGradient = true;
            }
    
            this.data({f: {}});
            this.flip('options', opts);
    
            flipMethods._addPageWrapper.call(this);
    
            return this;
        },
    
        setData: function(d) {
            
            var data = this.data();
    
            data.f = $.extend(data.f, d);
    
            return this;
        },
    
        options: function(opts) {
            
            var data = this.data().f;
    
            if (opts) {
                flipMethods.setData.call(this, {opts: $.extend({}, data.opts || flipOptions, opts) });
                return this;
            } else
                return data.opts;
    
        },
    
        z: function(z) {
    
            var data = this.data().f;
            data.opts['z-index'] = z;
            data.fwrapper.css({'z-index': z || parseInt(data.parent.css('z-index'), 10) || 0});
    
            return this;
        },
    
        _cAllowed: function() {
    
            return corners[this.data().f.opts.corners] || this.data().f.opts.corners;
    
        },
    
        _cornerActivated: function(e) {
            if (e.originalEvent === undefined) {
                return false;
            }		
    
            e = (isTouch) ? e.originalEvent.touches : [e];
    
            var data = this.data().f,
                pos = data.parent.offset(),
                width = this.width(),
                height = this.height(),
                c = {x: Math.max(0, e[0].pageX-pos.left), y: Math.max(0, e[0].pageY-pos.top)},
                csz = data.opts.cornerSize,
                allowedCorners = flipMethods._cAllowed.call(this);
    
                if (c.x<=0 || c.y<=0 || c.x>=width || c.y>=height) return false;
    
                if (c.y<csz) c.corner = 't';
                else if (c.y>=height-csz) c.corner = 'b';
                else return false;
                
                if (c.x<=csz) c.corner+= 'l';
                else if (c.x>=width-csz) c.corner+= 'r';
                else return false;
    
            return ($.inArray(c.corner, allowedCorners)==-1) ? false : c;
    
        },
    
        _c: function(corner, opts) {
    
            opts = opts || 0;
            return ({tl: point2D(opts, opts),
                    tr: point2D(this.width()-opts, opts),
                    bl: point2D(opts, this.height()-opts),
                    br: point2D(this.width()-opts, this.height()-opts)})[corner];
    
        },
    
        _c2: function(corner) {
    
            return {tl: point2D(this.width()*2, 0),
                    tr: point2D(-this.width(), 0),
                    bl: point2D(this.width()*2, this.height()),
                    br: point2D(-this.width(), this.height())}[corner];
    
        },
    
        _foldingPage: function(corner) {
    
            var opts = this.data().f.opts;
            
            if (opts.folding) return opts.folding;
            else if(opts.turn) {
                var data = opts.turn.data();
                if (data.display == 'single')
                    return (data.pageObjs[opts.next]) ? data.pageObjs[0] : null;
                else
                    return data.pageObjs[opts.next];
            }
    
        },
    
        _backGradient: function() {
    
            var data =	this.data().f,
                turn = data.opts.turn,
                gradient = data.opts.backGradient &&
                            (!turn || turn.data().display=='single' || (data.opts.page!=2 && data.opts.page!=turn.data().totalPages-1) );
    
    
            if (gradient && !data.bshadow)
                data.bshadow = $('<div/>', divAtt(0, 0, 1)).
                    css({'position': '', width: this.width(), height: this.height()}).
                        appendTo(data.parent);
    
            return gradient;
    
        },
    
        resize: function(full) {
            
            var data = this.data().f,
                width = this.width(),
                height = this.height(),
                size = Math.round(Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2)));
    
            if (full) {
                data.wrapper.css({width: size, height: size});
                data.fwrapper.css({width: size, height: size}).
                    children(':first-child').
                        css({width: width, height: height});
    
                data.fpage.css({width: height, height: width});
    
                if (data.opts.frontGradient)
                    data.ashadow.css({width: height, height: width});
    
                if (flipMethods._backGradient.call(this))
                    data.bshadow.css({width: width, height: height});
            }
    
            if (data.parent.is(':visible')) {
                data.fwrapper.css({top: data.parent.offset().top,
                    left: data.parent.offset().left});
    
                if (data.opts.turn)
                    data.fparent.css({top: -data.opts.turn.offset().top, left: -data.opts.turn.offset().left});
            }
    
            this.flip('z', data.opts['z-index']);
    
        },
    
        // Prepares the page by adding a general wrapper and another objects
    
        _addPageWrapper: function() {
    
            var att,
                data = this.data().f,
                parent = this.parent();
    
            if (!data.wrapper) {
    
                var left = this.css('left'),
                    top = this.css('top'),
                    width = this.width(),
                    height = this.height(),
                    size = Math.round(Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2)));
                
                data.parent = parent;
                data.fparent = (data.opts.turn) ? data.opts.turn.data().fparent : $('#turn-fwrappers');
    
                if (!data.fparent) {
                    var fparent = $('<div/>', {css: {'pointer-events': 'none'}}).hide();
                        fparent.data().flips = 0;
    
                    if (data.opts.turn) {
                        fparent.css(divAtt(-data.opts.turn.offset().top, -data.opts.turn.offset().left, 'auto', 'visible').css).
                                appendTo(data.opts.turn);
                        
                        data.opts.turn.data().fparent = fparent;
                    } else {
                        fparent.css(divAtt(0, 0, 'auto', 'visible').css).
                            attr('id', 'turn-fwrappers').
                                appendTo($('body'));
                    }
    
                    data.fparent = fparent;
                }
    
                this.css({position: 'absolute', top: 0, left: 0, bottom: 'auto', right: 'auto'});
    
                data.wrapper = $('<div/>', divAtt(0, 0, this.css('z-index'))).
                                    appendTo(parent).
                                        prepend(this);
    
                data.fwrapper = $('<div/>', divAtt(parent.offset().top, parent.offset().left)).
                                    hide().
                                        appendTo(data.fparent);
    
                data.fpage = $('<div/>', {css: {cursor: 'default'}}).
                        appendTo($('<div/>', divAtt(0, 0, 0, 'visible')).
                                    appendTo(data.fwrapper));
    
                if (data.opts.frontGradient)
                    data.ashadow = $('<div/>', divAtt(0, 0,  1)).
                        appendTo(data.fpage);
    
                // Save data
    
                flipMethods.setData.call(this, data);
    
                // Set size
                flipMethods.resize.call(this, true);
            }
    
        },
    
        // Takes a 2P point from the screen and applies the transformation
    
        _fold: function(point) {
    
            var that = this,
                a = 0,
                alpha = 0,
                beta,
                px,
                gradientEndPointA,
                gradientEndPointB,
                gradientStartV,
                gradientSize,
                gradientOpacity,
                mv = point2D(0, 0),
                df = point2D(0, 0),
                tr = point2D(0, 0),
                width = this.width(),
                height = this.height(),
                folding = flipMethods._foldingPage.call(this),
                tan = Math.tan(alpha),
                data = this.data().f,
                ac = data.opts.acceleration,
                h = data.wrapper.height(),
                o = flipMethods._c.call(this, point.corner),
                top = point.corner.substr(0, 1) == 't',
                left = point.corner.substr(1, 1) == 'l',
    
                compute = function() {
                    var rel = point2D((o.x) ? o.x - point.x : point.x, (o.y) ? o.y - point.y : point.y),
                        tan = (Math.atan2(rel.y, rel.x)),
                        middle;
    
                    alpha = A90 - tan;
                    a = deg(alpha);
                    middle = point2D((left) ? width - rel.x/2 : point.x + rel.x/2, rel.y/2);
    
                    var gamma = alpha - Math.atan2(middle.y, middle.x),
                        distance =  Math.max(0, Math.sin(gamma) * Math.sqrt(Math.pow(middle.x, 2) + Math.pow(middle.y, 2)));
    
                        tr = point2D(distance * Math.sin(alpha), distance * Math.cos(alpha));
    
                        if (alpha > A90) {
                        
                            tr.x = tr.x + Math.abs(tr.y * Math.tan(tan));
                            tr.y = 0;
    
                            if (Math.round(tr.x*Math.tan(PI-alpha)) < height) {
    
                                point.y = Math.sqrt(Math.pow(height, 2)+2 * middle.x * rel.x);
                                if (top) point.y =  height - point.y;
                                return compute();
    
                            }
                        }
                
                    if (alpha>A90) {
                        var beta = PI-alpha, dd = h - height/Math.sin(beta);
                        mv = point2D(Math.round(dd*Math.cos(beta)), Math.round(dd*Math.sin(beta)));
                        if (left) mv.x = - mv.x;
                        if (top) mv.y = - mv.y;
                    }
    
                    px = Math.round(tr.y/Math.tan(alpha) + tr.x);
                
                    var side = width - px,
                        sideX = side*Math.cos(alpha*2),
                        sideY = side*Math.sin(alpha*2);
                        df = point2D(Math.round( (left ? side -sideX : px+sideX)), Math.round((top) ? sideY : height - sideY));
                        
                    
                    // GRADIENTS
    
                        gradientSize = side*Math.sin(alpha);
                            var endingPoint = flipMethods._c2.call(that, point.corner),
                            far = Math.sqrt(Math.pow(endingPoint.x-point.x, 2)+Math.pow(endingPoint.y-point.y, 2));
    
                        gradientOpacity = (far<width) ? far/width : 1;
    
    
                    if (data.opts.frontGradient) {
    
                        gradientStartV = gradientSize>100 ? (gradientSize-100)/gradientSize : 0;
                        gradientEndPointA = point2D(gradientSize*Math.sin(A90-alpha)/height*100, gradientSize*Math.cos(A90-alpha)/width*100);
                    
                        if (top) gradientEndPointA.y = 100-gradientEndPointA.y;
                        if (left) gradientEndPointA.x = 100-gradientEndPointA.x;
                    }
    
                    if (flipMethods._backGradient.call(that)) {
    
                        gradientEndPointB = point2D(gradientSize*Math.sin(alpha)/width*100, gradientSize*Math.cos(alpha)/height*100);
                        if (!left) gradientEndPointB.x = 100-gradientEndPointB.x;
                        if (!top) gradientEndPointB.y = 100-gradientEndPointB.y;
                    }
                    //
    
                    tr.x = Math.round(tr.x);
                    tr.y = Math.round(tr.y);
    
                    return true;
                },
    
                transform = function(tr, c, x, a) {
                
                    var f = ['0', 'auto'], mvW = (width-h)*x[0]/100, mvH = (height-h)*x[1]/100,
                        v = {left: f[c[0]], top: f[c[1]], right: f[c[2]], bottom: f[c[3]]},
                        aliasingFk = (a!=90 && a!=-90) ? (left ? -1 : 1) : 0;
    
                        x = x[0] + '% ' + x[1] + '%';
    
                    that.css(v).transform(rotate(a) + translate(tr.x + aliasingFk, tr.y, ac), x);
    
                    data.fpage.parent().css(v);
                    data.wrapper.transform(translate(-tr.x + mvW-aliasingFk, -tr.y + mvH, ac) + rotate(-a), x);
    
                    data.fwrapper.transform(translate(-tr.x + mv.x + mvW, -tr.y + mv.y + mvH, ac) + rotate(-a), x);
                    data.fpage.parent().transform(rotate(a) + translate(tr.x + df.x - mv.x, tr.y + df.y - mv.y, ac), x);
    
                    if (data.opts.frontGradient)
                        gradient(data.ashadow,
                                point2D(left?100:0, top?100:0),
                                point2D(gradientEndPointA.x, gradientEndPointA.y),
                                [[gradientStartV, 'rgba(0,0,0,0)'],
                                [((1-gradientStartV)*0.8)+gradientStartV, 'rgba(0,0,0,'+(0.2*gradientOpacity)+')'],
                                [1, 'rgba(255,255,255,'+(0.2*gradientOpacity)+')']],
                                3,
                                alpha);
            
                    if (flipMethods._backGradient.call(that))
                        gradient(data.bshadow,
                                point2D(left?0:100, top?0:100),
                                point2D(gradientEndPointB.x, gradientEndPointB.y),
                                [[0.8, 'rgba(0,0,0,0)'],
                                [1, 'rgba(0,0,0,'+(0.3*gradientOpacity)+')'],
                                [1, 'rgba(0,0,0,0)']],
                                3);
                    
                };
    
            switch (point.corner) {
                case 'tl' :
                    point.x = Math.max(point.x, 1);
                    compute();
                    transform(tr, [1,0,0,1], [100, 0], a);
                    data.fpage.transform(translate(-height, -width, ac) + rotate(90-a*2) , '100% 100%');
                    folding.transform(rotate(90) + translate(0, -height, ac), '0% 0%');
                break;
                case 'tr' :
                    point.x = Math.min(point.x, width-1);
                    compute();
                    transform(point2D(-tr.x, tr.y), [0,0,0,1], [0, 0], -a);
                    data.fpage.transform(translate(0, -width, ac) + rotate(-90+a*2) , '0% 100%');
                    folding.transform(rotate(270) + translate(-width, 0, ac), '0% 0%');
                break;
                case 'bl' :
                    point.x = Math.max(point.x, 1);
                    compute();
                    transform(point2D(tr.x, -tr.y), [1,1,0,0], [100, 100], -a);
                    data.fpage.transform(translate(-height, 0, ac) + rotate(-90+a*2), '100% 0%');
                    folding.transform(rotate(270) + translate(-width, 0, ac), '0% 0%');
                break;
                case 'br' :
                    point.x = Math.min(point.x, width-1);
                    compute();
                    transform(point2D(-tr.x, -tr.y), [0,1,1,0], [0, 100], a);
                    data.fpage.transform(rotate(90-a*2), '0% 0%');
                    folding.transform(rotate(90) + translate(0, -height, ac), '0% 0%');
    
                break;
            }
    
            data.point = point;
        
        },
    
        _moveFoldingPage: function(bool) {
    
            var data = this.data().f,
                folding = flipMethods._foldingPage.call(this);
    
            if (folding) {
                if (bool) {
                    if (!data.fpage.children()[data.ashadow? '1' : '0']) {
                        flipMethods.setData.call(this, {backParent: folding.parent()});
                        data.fpage.prepend(folding);
                    }
                } else {
                    if (data.backParent)
                        data.backParent.prepend(folding);
    
                }
            }
    
        },
    
        _showFoldedPage: function(c, animate) {
    
            var folding = flipMethods._foldingPage.call(this),
                dd = this.data(),
                data = dd.f;
    
            if (!data.point || data.point.corner!=c.corner) {
                var event = $.Event('start');
                this.trigger(event, [data.opts, c.corner]);
    
                if (event.isDefaultPrevented())
                    return false;
            }
    
    
            if (folding) {
    
                if (animate) {
    
                    var that = this, point = (data.point && data.point.corner==c.corner) ? data.point : flipMethods._c.call(this, c.corner, 1);
                
                    this.animatef({from: [point.x, point.y], to:[c.x, c.y], duration: 500, frame: function(v) {
                        c.x = Math.round(v[0]);
                        c.y = Math.round(v[1]);
                        flipMethods._fold.call(that, c);
                    }});
    
                } else	{
    
                    flipMethods._fold.call(this, c);
                    if (dd.effect && !dd.effect.turning)
                        this.animatef(false);
    
                }
    
                if (!data.fwrapper.is(':visible')) {
                    data.fparent.show().data().flips++;
                    flipMethods._moveFoldingPage.call(this, true);
                    data.fwrapper.show();
    
                    if (data.bshadow)
                        data.bshadow.show();
                }
    
                return true;
            }
    
            return false;
        },
    
        hide: function() {
    
            var data = this.data().f,
                folding = flipMethods._foldingPage.call(this);
    
            if ((--data.fparent.data().flips)===0)
                data.fparent.hide();
    
            this.css({left: 0, top: 0, right: 'auto', bottom: 'auto'}).transform('', '0% 100%');
    
            data.wrapper.transform('', '0% 100%');
    
            data.fwrapper.hide();
    
            if (data.bshadow)
                data.bshadow.hide();
    
            folding.transform('', '0% 0%');
    
            return this;
        },
    
        hideFoldedPage: function(animate) {
    
            var data = this.data().f;
    
            if (!data.point) return;
    
            var that = this,
                p1 = data.point,
                hide = function() {
                    data.point = null;
                    that.flip('hide');
                    that.trigger('end', [false]);
                };
    
            if (animate) {
                var p4 = flipMethods._c.call(this, p1.corner),
                    top = (p1.corner.substr(0,1)=='t'),
                    delta = (top) ? Math.min(0, p1.y-p4.y)/2 : Math.max(0, p1.y-p4.y)/2,
                    p2 = point2D(p1.x, p1.y+delta),
                    p3 = point2D(p4.x, p4.y-delta);
            
                this.animatef({
                    from: 0,
                    to: 1,
                    frame: function(v) {
                        var np = bezier(p1, p2, p3, p4, v);
                        p1.x = np.x;
                        p1.y = np.y;
                        flipMethods._fold.call(that, p1);
                    },
                    complete: hide,
                    duration: 800,
                    hiding: true
                    });
    
            } else {
                this.animatef(false);
                hide();
            }
        },
    
        turnPage: function(corner) {
    
            var that = this,
                data = this.data().f;
    
            corner = {corner: (data.corner) ? data.corner.corner : corner || flipMethods._cAllowed.call(this)[0]};
    
            var p1 = data.point || flipMethods._c.call(this, corner.corner, (data.opts.turn) ? data.opts.turn.data().opts.elevation : 0),
                p4 = flipMethods._c2.call(this, corner.corner);
    
                this.trigger('flip').
                    animatef({
                        from: 0,
                        to: 1,
                        frame: function(v) {
                            var np = bezier(p1, p1, p4, p4, v);
                            corner.x = np.x;
                            corner.y = np.y;
                            flipMethods._showFoldedPage.call(that, corner);
                        },
                        
                        complete: function() {
                            that.trigger('end', [true]);
                        },
                        duration: data.opts.duration,
                        turning: true
                    });
    
                data.corner = null;
        },
    
        moving: function() {
    
            return 'effect' in this.data();
        
        },
    
        isTurning: function() {
    
            return this.flip('moving') && this.data().effect.turning;
        
        },
    
        _eventStart: function(e) {
    
            var data = this.data().f;
    
            if (!data.disabled && !this.flip('isTurning')) {
                data.corner = flipMethods._cornerActivated.call(this, e);
                if (data.corner && flipMethods._foldingPage.call(this, data.corner)) {
                    flipMethods._moveFoldingPage.call(this, true);
                    this.trigger('pressed', [data.point]);
                    return false;
                } else
                    data.corner = null;
            }
    
        },
    
        _eventMove: function(e) {
    
            var data = this.data().f;
    
            if (!data.disabled) {
                e = (isTouch) ? e.originalEvent.touches : [e];
            
                if (data.corner) {
    
                    var pos = data.parent.offset();
    
                    data.corner.x = e[0].pageX-pos.left;
                    data.corner.y = e[0].pageY-pos.top;
    
                    flipMethods._showFoldedPage.call(this, data.corner);
                
                } else if (!this.data().effect && this.is(':visible')) { // roll over
                    
                    var corner = flipMethods._cornerActivated.call(this, e[0]);
                    if (corner) {
                        var origin = flipMethods._c.call(this, corner.corner, data.opts.cornerSize/2);
                        corner.x = origin.x;
                        corner.y = origin.y;
                        flipMethods._showFoldedPage.call(this, corner, true);
                    } else
                        flipMethods.hideFoldedPage.call(this, true);
    
                }
            }
        },
    
        _eventEnd: function() {
    
            var data = this.data().f;
    
            if (!data.disabled && data.point) {
                var event = $.Event('released');
                this.trigger(event, [data.point]);
                if (!event.isDefaultPrevented())
                    flipMethods.hideFoldedPage.call(this, true);
            }
    
            data.corner = null;
    
        },
    
        disable: function(disable) {
    
            flipMethods.setData.call(this, {'disabled': disable});
            return this;
    
        }
    },
    
    cla = function(that, methods, args) {
    
        if (!args[0] || typeof(args[0])=='object')
            return methods.init.apply(that, args);
        else if(methods[args[0]] && args[0].toString().substr(0, 1)!='_')
            return methods[args[0]].apply(that, Array.prototype.slice.call(args, 1));
        else
            throw args[0] + ' is an invalid value';
    };
    
    $.extend($.fn, {
    
        flip: function(req, opts) {
            return cla(this, flipMethods, arguments);
        },
    
        turn: function(req) {
            return cla(this, turnMethods, arguments);
        },
    
        transform: function(transform, origin) {
    
            var properties = {};
            
            if (origin)
                properties[vendor+'transform-origin'] = origin;
            
            properties[vendor+'transform'] = transform;
        
            return this.css(properties);
    
        },
    
        animatef: function(point) {
    
            var data = this.data();
    
            if (data.effect)
                clearInterval(data.effect.handle);
    
            if (point) {
    
                if (!point.to.length) point.to = [point.to];
                if (!point.from.length) point.from = [point.from];
                if (!point.easing) point.easing = function (x, t, b, c, data) { return c * Math.sqrt(1 - (t=t/data-1)*t) + b; };
    
                var j, diff = [],
                    len = point.to.length,
                    that = this,
                    fps = point.fps || 30,
                    time = - fps,
                    f = function() {
                        var j, v = [];
                        time = Math.min(point.duration, time + fps);
        
                        for (j = 0; j < len; j++)
                            v.push(point.easing(1, time, point.from[j], diff[j], point.duration));
    
                        point.frame((len==1) ? v[0] : v);
    
                        if (time==point.duration) {
                            clearInterval(data.effect.handle);
                            delete data['effect'];
                            that.data(data);
                            if (point.complete)
                                point.complete();
                            }
                        };
    
                for (j = 0; j < len; j++)
                    diff.push(point.to[j] - point.from[j]);
    
                data.effect = point;
                data.effect.handle = setInterval(f, fps);
                this.data(data);
                f();
            } else {
                delete data['effect'];
            }
        }
    });
    
    
    $.isTouch = isTouch;
    
    })(jQuery);
    }
}