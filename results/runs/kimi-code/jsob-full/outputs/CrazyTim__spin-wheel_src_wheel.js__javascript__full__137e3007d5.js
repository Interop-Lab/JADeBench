function getRandomInt(min = 0, max = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min = 0, max = 0, precision = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}

function isAngleBetween(angle, startAngle, endAngle) {
  return startAngle < endAngle
    ? startAngle <= angle && angle < endAngle
    : startAngle <= angle || angle < endAngle;
}

function aveArray(values = []) {
  let total = 0;
  for (const value of values) {
    if (value) total += typeof value === 'number' ? value : 1;
  }
  return total / values.length || 0;
}

function getFontSizeToFit(text, fontFamily, maxWidth, context) {
  context.save();
  context.font = `1px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  context.restore();
  return maxWidth / measuredWidth;
}

function isPointInCircle(point = { x: 0, y: 0 }, centerX, centerY, radius) {
  const distanceSquared = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
  return distanceSquared <= radius ** 2;
}

function translateXYToElement(point = { x: 0, y: 0 }, element = {}, scale = 1) {
  const bounds = element.getBoundingClientRect();
  return {
    x: (point.x - bounds.left) * scale,
    y: (point.y - bounds.top) * scale,
  };
}

function getMouseButtonsPressed(event = {}) {
  return [1, 2, 4, 8, 16].filter(button => event.buttons & button);
}

function getAngle(x1, y1, x2, y2) {
  let angle = Math.atan2(-(y1 - y2), -(x1 - x2)) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

function getDistanceBetweenPoints(start = { x: 0, y: 0 }, end = { x: 0, y: 0 }) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function addAngle(angle = 0, delta = 0) {
  const sum = angle + delta;
  let normalized = sum > 0 ? sum % 360 : 360 + sum % 360;
  if (normalized === 360) normalized = 0;
  return normalized;
}

function diffAngle(angle = 0, targetAngle = 0) {
  return 180 - addAngle(angle, 180 - targetAngle);
}

function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let delta = fixFloat(((currentRotation % 360) + targetAngle) % 360);
  delta = (direction === 1 ? 360 - delta : 360 + delta) % 360;
  return currentRotation + delta * direction;
}

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
  if (isValid) return action ? action() : val;
  if (val === undefined) return defaultValue;
  throw new Error(errorMessage);
}

function fixFloat(value = 0) {
  return Number(value.toFixed(9));
}

function easeSinOut(progress) {
  return Math.sin(progress * Math.PI / 2);
}

function getResizeObserver(element = {}, callback = {}) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => callback({ redraw: true }));
    observer.observe(element);
    return {
      stop() {
        observer.unobserve(element);
        observer.disconnect();
      },
    };
  }
  window.addEventListener('resize', callback);
  return {
    stop() {
      window.removeEventListener('resize', callback);
    },
  };
}

const arcAdjust = -90;
const baseCanvasSize = 500;
const dragCapturePeriod = 250;

const AlignText = Object.freeze({ left: 'left', right: 'right', center: 'center' });

const Defaults = Object.freeze({
  wheel: {
    borderColor: '#000', borderWidth: 1, debug: false, image: null, isInteractive: true,
    itemBackgroundColors: ['#fff'], itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0, itemLabelColors: ['#000'], itemLabelFont: 'sans-serif',
    itemLabelFontSizeMax: baseCanvasSize, itemLabelRadius: 0.85, itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0, itemLabelStrokeColor: '#fff', itemLabelStrokeWidth: 0, items: [],
    lineColor: '#000', lineWidth: 1, pixelRatio: 0, radius: 0.95, rotation: 0,
    rotationResistance: -35, rotationSpeedMax: 300, offset: { x: 0, y: 0 },
    onCurrentIndexChange: null, onRest: null, onSpin: null, overlayImage: null, pointerAngle: 0,
  },
  item: {
    backgroundColor: null, image: null, imageOpacity: 1, imageRadius: 0.5,
    imageRotation: 0, imageScale: 1, label: '', labelColor: null, value: null, weight: 1,
  },
});

const Debugging = Object.freeze({
  pointerLineColor: '#ff00ff', labelBoundingBoxColor: '#ff00ff',
  labelRadiusColor: '#00ff00', dragPointHue: 300,
});

function register(wheel) {
  registerPointerEvents(wheel);
  wheel._handler_onResize = getResizeObserver(wheel._canvasContainer, ({ redraw = true }) => {
    wheel.resize();
    if (redraw) wheel.draw(performance.now());
  });
  const watchPixelRatio = () => {
    wheel._mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    wheel._mediaQueryList.addEventListener('change', wheel._handler_onDevicePixelRatioChange, { once: true });
  };
  wheel._handler_onDevicePixelRatioChange = () => {
    wheel.resize();
    watchPixelRatio();
  };
  watchPixelRatio();
}

function unregister(wheel) {
  const canvas = wheel.canvas;
  if ('PointerEvent' in window) {
    canvas.removeEventListener('pointerdown', wheel._handler_onPointerDown);
    canvas.removeEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
  } else {
    canvas.removeEventListener('touchstart', wheel._handler_onTouchStart);
    canvas.removeEventListener('mousedown', wheel._handler_onMouseDown);
    canvas.removeEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
  }
  wheel._handler_onResize.stop();
  wheel._mediaQueryList.removeEventListener('change', wheel._handler_onDevicePixelRatioChange);
}

function registerPointerEvents(wheel) {
  const canvas = wheel.canvas;
  const pointFromMouse = event => ({ x: event.clientX, y: event.clientY });
  const pointFromTouch = event => ({ x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY });

  wheel._handler_onPointerMoveRefreshCursor = event => {
    wheel._isCursorOverWheel = wheel.wheelHitTest(pointFromMouse(event));
    wheel.refreshCursor();
  };
  wheel._handler_onMouseMoveRefreshCursor = wheel._handler_onPointerMoveRefreshCursor;

  wheel._handler_onPointerDown = event => {
    const point = pointFromMouse(event);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    event.preventDefault();
    wheel.dragStart(point);
    canvas.setPointerCapture(event.pointerId);
    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromMouse(moveEvent));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      canvas.releasePointerCapture(endEvent.pointerId);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('pointerout', end);
      wheel.dragEnd();
    };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerout', end);
  };

  wheel._handler_onMouseDown = event => {
    const point = pointFromMouse(event);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    wheel.dragStart(point);
    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromMouse(moveEvent));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      wheel.dragEnd();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
  };

  wheel._handler_onTouchStart = event => {
    const point = pointFromTouch(event);
    if (!wheel.isInteractive || !wheel.wheelHitTest(point)) return;
    event.preventDefault();
    wheel.dragStart(point);
    const move = moveEvent => {
      moveEvent.preventDefault();
      wheel.dragMove(pointFromTouch(moveEvent));
    };
    const end = endEvent => {
      endEvent.preventDefault();
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('touchcancel', end);
      wheel.dragEnd();
    };
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('touchcancel', end);
  };

  if ('PointerEvent' in window) {
    canvas.addEventListener('pointerdown', wheel._handler_onPointerDown);
    canvas.addEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
  } else {
    canvas.addEventListener('touchstart', wheel._handler_onTouchStart);
    canvas.addEventListener('mousedown', wheel._handler_onMouseDown);
    canvas.addEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
  }
}

class Item {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) throw new Error('wheel must be an instance of Wheel');
    if (!isObject(props) && props !== null) throw new Error('props must be an Object or null');
    this._wheel = wheel;
    for (const property of Object.keys(Defaults.item)) this[`_${property}`] = Defaults.item[property];
    this.init(props || Defaults.item);
  }

  init(props = {}) {
    for (const property of Object.keys(Defaults.item)) {
      if (property in props) this[property] = props[property];
    }
  }

  get backgroundColor() { return this._backgroundColor; }
  set backgroundColor(value) { this._backgroundColor = (value => typeof value === 'string' ? value : Defaults.item.backgroundColor)(value); this._wheel.refresh(); }

  get image() { return this._image; }
  set image(value) { this._image = (value => value instanceof HTMLImageElement ? value : Defaults.item.image)(value); this._wheel.refresh(); }

  get imageOpacity() { return this._imageOpacity; }
  set imageOpacity(value) { this._imageOpacity = (value => typeof value === 'number' ? value : Defaults.item.imageOpacity)(value); this._wheel.refresh(); }

  get imageRadius() { return this._imageRadius; }
  set imageRadius(value) { this._imageRadius = (value => typeof value === 'number' ? value : Defaults.item.imageRadius)(value); this._wheel.refresh(); }

  get imageRotation() { return this._imageRotation; }
  set imageRotation(value) { this._imageRotation = (value => typeof value === 'number' ? value : Defaults.item.imageRotation)(value); this._wheel.refresh(); }

  get imageScale() { return this._imageScale; }
  set imageScale(value) { this._imageScale = (value => typeof value === 'number' ? value : Defaults.item.imageScale)(value); this._wheel.refresh(); }

  get label() { return this._label; }
  set label(value) { this._label = (value => typeof value === 'string' ? value : Defaults.item.label)(value); this._wheel.refresh(); }

  get labelColor() { return this._labelColor; }
  set labelColor(value) { this._labelColor = (value => typeof value === 'string' ? value : Defaults.item.labelColor)(value); this._wheel.refresh(); }

  get value() { return this._value; }
  set value(value) { this._value = (value => value)(value); this._wheel.refresh(); }

  get weight() { return this._weight; }
  set weight(value) { this._weight = (value => typeof value === 'number' ? value : Defaults.item.weight)(value); this._wheel.refresh(); }

  get index() { return this._wheel.items.indexOf(this); }

  refresh() { this._wheel.refresh(); }
}

class Wheel {
  constructor(container, props = {}) {
    if (!(container instanceof Element)) throw new Error('container must be an instance of Element');
    if (!isObject(props) && props !== null) throw new Error('props must be an Object or null');
    this._frameRequestId = null;
    this._rotationSpeed = 0;
    this._rotationDirection = 1;
    this._spinToTimeEnd = null;
    this._lastSpinFrameTime = null;
    this._isCursorOverWheel = false;
    this.add(container);
    for (const property of Object.keys(Defaults.wheel)) this[`_${property}`] = Defaults.wheel[property];
    this.init(props || Defaults.wheel);
  }
  init(props = {}) {
    this._isInitialising = true;
    const properties = [
      'itemLabelFontSizeMax', 'rotation', 'debug', 'rotationSpeedMax', 'lineWidth',
      'onCurrentIndexChange', 'lineColor', 'items', 'itemBackgroundColors',
      'itemLabelRadiusMax', 'borderWidth', 'radius', 'itemLabelStrokeColor',
      'itemLabelRotation', 'itemLabelBaselineOffset', 'isInteractive', 'image',
      'itemLabelColors', 'itemLabelAlign', 'itemLabelRadius', 'itemLabelFont',
      'rotationResistance', 'borderColor', 'onSpin', 'itemLabelStrokeWidth',
      'overlayImage', 'onRest', 'pointerAngle', 'offset', 'pixelRatio',
    ];
    for (const property of properties) this[property] = props[property];
    this._isInitialising = false;
    this.resize();
  }
  add(container) {
    this._canvasContainer = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this._context = this.canvas.getContext('2d');
    this._canvasContainer.append(this.canvas);
    register(this);
    if (!this._isInitialising) this.resize();
  }
  remove() {
    if (this.canvas === null) return;
    if (this._frameRequestId !== null) window.cancelAnimationFrame(this._frameRequestId);
    unregister(this);
    this._canvasContainer.removeChild(this.canvas);
    this._canvasContainer = null;
    this.canvas = null;
    this._context = null;
  }
  resize() {
    const options89= {
      'IFaaD':function(argument178, argument264) {
        return argument178*argument264;
      },
      'JqhIt':function(argument179, argument265) {
        return argument179-argument265;
      },
      'InWvt':function(argument180, argument266) {
        return argument180-argument266;
      },
      'dDwMg':function(argument181, argument267) {
        return argument181===argument267;
      },
      'FAsYs':function(argument182, argument268) {
        return argument182+argument268;
      },
      'IYVZk':function(argument183, argument269) {
        return argument183*argument269;
      },
      'uwuqv':function(argument184, argument270) {
        return argument184-argument270;
      },
      'qSYsn':function(argument185, argument271) {
        return argument185*argument271;
      },
      'kKxVT':function(argument186, argument272) {
        return argument186-argument272;
      },
      'FVTIH':function(argument187, argument273) {
        return argument187*argument273;
      },
      'UmYpA':function(argument188, argument274) {
        return argument188/argument274;
      },
      'gIMaX':function(argument189, argument275) {
        return argument189*argument275;
      },
      'JOjjA':function(argument190, argument276) {
        return argument190*argument276;
      },
      'ZRIDV':function(argument191, argument277) {
        return argument191+argument277;
      },
      'LbngW':function(argument192, argument278) {
        return argument192*argument278;
      },
      'pUcbO':function(argument193, argument279) {
        return argument193*argument279;
      },
      'fliUc':function(argument194, argument280) {
        return argument194*argument280;
      },
      'Vspkl':function(argument195, argument281) {
        return argument195-argument281;
      },
      'xLZtO':function(argument196, argument282) {
        return argument196===argument282;
      },
      'GNaRR':"center",
      'FfIEH':function(argument197, argument283) {
        return argument197!==argument283;
      },
      'fKezl':"Mbbhg",
      'HBivv':"uvXgd",
      'hCYjw':function(argument198, argument284) {
        return argument198===argument284;
      },
      'pMqJh':"iHpdy",
      'PkwVA':"HQiLD",
      'xcTBX':function(argument199, argument285, argument32, argument4, argument5) {
        return argument199(argument285, argument32, argument4, argument5);
      }
    };
    if(((this.canvas) === (null)))return;
    this.canvas.style.width=((this._canvasContainer.clientWidth) + ('px'));
    
    this.canvas.style.height=((this._canvasContainer.clientHeight) + ('px'));
    const [value960,
    value961]=[((this._canvasContainer.clientWidth) * (this.getActualPixelRatio())),
    ((this._canvasContainer.clientHeight) * (this.getActualPixelRatio()))];
    this.canvas.width=value960,
    this.canvas.height=value961;
    
    const result9=Math.min(value960, value961),
    options90= {
      'w':((result9) - ((result9) * (this._offset.x))),
      'h':((result9) - ((result9) * (this._offset.y)))
    },
    result10=Math.min(((value960) / (options90.w)), ((value961) / (options90.h)));
    this._size=Math.max(((options90.w) * (result10)), ((options90.h) * (result10))),
    this._center= {
      'x':(((value960) / (2)) + ((value960) * (this._offset.x))),
      'y':(((value961) / (2)) + ((value961) * (this._offset.y)))
    },
    this._actualRadius=(((this._size) / (2)) * (this.radius)),
    this._itemLabelFontSize=((this.itemLabelFontSizeMax) * ((this._size) / (baseCanvasSize))),
    this._labelMaxWidth=((this._actualRadius) * ((this.itemLabelRadius) - (this.itemLabelRadiusMax)));
    if(((this.itemLabelAlign) === (options89.GNaRR))) {
      if(((options89.fKezl) !== (options89.HBivv)))this._labelMaxWidth*=2;
      else return this._onSpin;
    }
    for(const item4 of this._items) {
      if(((options89.pMqJh) === (options89.PkwVA))) {
        const result11=value962.getBoundingClientRect();
        return {
          'x':nHAowc.IFaaD(nHAowc.JqhIt(value963.x, result11.left), value964),
          'y':nHAowc.IFaaD(nHAowc.InWvt(value965.y, result11.top), value966)
        };
      }
      else this._itemLabelFontSize=Math.min(this._itemLabelFontSize, (getFontSizeToFit)((item4.label), (this.itemLabelFont), (this._labelMaxWidth), (this._context)));
    }
    this.refresh();
  }
  draw(value967=0) {
    const options94= {
      'aWoUR':function(argument1100, argument286) {
        return argument1100===argument286;
      },
      'kuLYk':"middle",
      'YvThC':function(argument1101, argument287) {
        return argument1101+argument287;
      },
      'CZPdy':"px ",
      'HZEfK':function(argument1102, argument288) {
        return argument1102===argument288;
      },
      'ngChE':"QzXhV",
      'gaPhk':function(argument1103, argument289) {
        return argument1103-argument289;
      },
      'GxOVw':function(argument1104, argument290) {
        return argument1104/argument290;
      },
      'fOeJn':function(argument1105, argument291) {
        return argument1105(argument291);
      },
      'dBKHE':function(argument1106, argument292) {
        return argument1106+argument292;
      },
      'Myxdp':function(argument1107, argument293) {
        return argument1107(argument293);
      },
      'lpiQc':function(argument1108, argument294) {
        return argument1108+argument294;
      }
    };
    this._frameRequestId=null;
    if(((this._context) === (null))||((this.canvas) === (null)))return;
    const value21=this._context;
    value21.clearRect(0, 0, this.canvas.width, this.canvas.height),
    this.animateRotation(value967);
    const result12=this.getItemAngles(this._rotation),
    result13=this.getScaledNumber(this._borderWidth);
    value21.textBaseline=options94.kuLYk;
    
    value21.textAlign=this.itemLabelAlign,
    value21.font=(((this._itemLabelFontSize) + (options94.CZPdy)) + (this.itemLabelFont));
    
    for(const [value1048, value1049]of result12.entries()) {
      if(((options94.ngChE) === (options94.ngChE))) {
        const value22=this._items[value1048],
        value23=new Path2D();
        value23.moveTo(this._center.x, this._center.y),
        value23.arc(this._center.x, this._center.y, ((this._actualRadius) - ((result13) / (2))), (degRad)(((value1049.start) + (arcAdjust))), (degRad)(((value1049.end) + (arcAdjust)))),
        value22.path=value23;
      }
      else this._image=value1050.item.image;
    }
    this.drawItemBackgrounds(value21, result12),
    this.drawItemImages(value21, result12),
    this.drawItemLines(value21, result12),
    this.drawItemLabels(value21, result12),
    this.drawBorder(value21),
    this.drawImage(value21, this._image, false),
    this.drawImage(value21, this._overlayImage, !false),
    this.drawDebugPointerLine(value21),
    this._isInitialising=false;
  }
  drawItemBackgrounds(context, value1051=[]) {
    
    
    
    
    
    
    for(const [value1065, value1066]of value1051.entries()) {
      const value25=this._items[value1065];
      context.fillStyle=value25.backgroundColor??this._itemBackgroundColors[((value1065) % (this._itemBackgroundColors.length))],
      context.fill(value25.path);
    }
  }
  drawItemImages(context, value1067=[]) {
    
    
    
    
    for(const [value1131, value1132]of value1067.entries()) {
      const value26=this._items[value1131];
      if(((value26.image) === (null)))continue;
      context.save(),
      context.clip(value26.path);
      const value27=((value1132.start) + (((value1132.end) - (value1132.start)) / (2)));
      context.translate(((this._center.x) + ((Math.cos((degRad)(((value27) + (arcAdjust))))) * ((this._actualRadius) * (value26.imageRadius)))), ((this._center.y) + ((Math.sin((degRad)(((value27) + (arcAdjust))))) * ((this._actualRadius) * (value26.imageRadius))))),
      context.rotate((degRad)(((value27) + (value26.imageRotation)))),
      context.globalAlpha=value26.imageOpacity;
      const value28=((((this._size) / (500)) * (value26.image.width)) * (value26.imageScale)),
      value29=((((this._size) / (500)) * (value26.image.height)) * (value26.imageScale)),
      value30=((-value28) / (2)),
      value31=((-value29) / (2));
      context.drawImage(value26.image, value30, value31, value28, value29),
      context.restore();
    }
  }
  drawImage(context, image, value1133=false) {
    
    if(((image) === (null)))return;
    context.translate(this._center.x, this._center.y);
    
    if(!value1133)context.rotate((degRad)((this._rotation)));
    
    const value32=value1133?this._size:((this._size) * (this.radius)),
    value33=-((value32) / (2));
    context.drawImage(image, value33, value33, value32, value32),
    context.resetTransform();
  }
  drawDebugPointerLine(context) {
    if (!this.debug) return;
    context.translate(this._center.x, this._center.y);
    context.rotate(degRad(this._pointerAngle + arcAdjust));
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this._actualRadius * 2, 0);
    context.strokeStyle = Debugging.pointerLineColor;
    context.lineWidth = this.getScaledNumber(2);
    context.stroke();
    context.resetTransform();
  }
  drawBorder(context) {
    const options108= {
      'wllsC':function(argument1140, argument2122) {
        return argument1140%argument2122;
      },
      'xPaUJ':function(argument1141, argument2123) {
        return argument1141+argument2123;
      },
      'FceGO':function(argument1142, argument2124, argument33, argument42, argument52) {
        return argument1142(argument2124, argument33, argument42, argument52);
      },
      'azzhH':function(argument1143, argument2125) {
        return argument1143<=argument2125;
      },
      'xCeBQ':"transparent",
      'LeRrm':function(argument1144, argument2126) {
        return argument1144-argument2126;
      },
      'nUcuY':function(argument1145, argument2127) {
        return argument1145/argument2127;
      },
      'MyJKT':function(argument1146, argument2128) {
        return argument1146*argument2128;
      },
      'maZmv':function(argument1147, argument2129) {
        return argument1147===argument2129;
      },
      'AVCAn':"iyLZU",
      'gFKjC':function(argument1148, argument2130) {
        return argument1148*argument2130;
      },
      'cICYb':function(argument1149, argument2131) {
        return argument1149*argument2131;
      },
      'QfVYU':function(argument1150, argument2132) {
        return argument1150*argument2132;
      }
    };
    if(((this._borderWidth) <= (0)))return;
    const result15=this.getScaledNumber(this._borderWidth);
    
    
    const value35=this._borderColor||options108.xCeBQ;
    context.beginPath(),
    context.strokeStyle=value35,
    context.lineWidth=result15,
    context.arc(this._center.x, this._center.y, ((this._actualRadius) - ((result15) / (2))), 0, ((2) * (Math.PI))),
    context.stroke();
    if(this.debug) {
      if(((options108.AVCAn) === (options108.AVCAn))) {
        const result16=this.getScaledNumber(1);
        context.beginPath(),
        context.strokeStyle=context.strokeStyle=Debugging.labelRadiusColor,
        context.lineWidth=result16,
        context.arc(this._center.x, this._center.y, ((this._actualRadius) * (this.itemLabelRadius)), 0, ((2) * (Math.PI))),
        context.stroke(),
        context.beginPath(),
        context.strokeStyle=context.strokeStyle=Debugging.labelRadiusColor,
        context.lineWidth=result16,
        context.arc(this._center.x, this._center.y, ((this._actualRadius) * (this.itemLabelRadiusMax)), 0, ((2) * (Math.PI))),
        context.stroke();
      }
      else return ((((value1250)((this._center.x), (this._center.y), (value1251.x), (value1252.y))) + (90)) % (360));
    }
  }
  drawItemLines(context, itemAngles = []) {
    if (this._lineWidth <= 0) return;
    const lineWidth = this.getScaledNumber(this._lineWidth);
    const borderWidth = this.getScaledNumber(this._borderWidth);
    context.translate(this._center.x, this._center.y);
    for (const itemAngle of itemAngles) {
      context.rotate(degRad(itemAngle.start + arcAdjust));
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(this._actualRadius - borderWidth, 0);
      context.strokeStyle = this.lineColor;
      context.lineWidth = lineWidth;
      context.stroke();
      context.rotate(-degRad(itemAngle.start + arcAdjust));
    }
    context.resetTransform();
  }
  drawItemLabels(context, value1294=[]) {
    
    
    const options115= {
      'wNoOU':function(argument1157, argument2137) {
        return argument1157(argument2137);
      },
      'nOrbZ':function(argument1158, argument2138) {
        return argument1158===argument2138;
      },
      'pbzhF':"string",
      'xJWFT':"Wheel.itemLabelStrokeColor must be a string",
      'ngHeg':"number",
      'McDUX':function(argument1159, argument2139) {
        return argument1159*argument2139;
      },
      'JUocO':function(argument1160, argument2140) {
        return argument1160*argument2140;
      },
      'iQFbc':function(argument1161, argument2141) {
        return argument1161%argument2141;
      },
      'SKwem':"transparent",
      'XWZTZ':function(argument1162, argument2142) {
        return argument1162===argument2142;
      },
      'TqNGE':function(argument1163, argument2143) {
        return argument1163===argument2143;
      },
      'tjxnu':function(argument1164, argument2144) {
        return argument1164+argument2144;
      },
      'uiGcy':function(argument1165, argument2145) {
        return argument1165/argument2145;
      },
      'IwWXp':function(argument1166, argument2146) {
        return argument1166-argument2146;
      },
      'wIhhw':function(argument1167, argument2147) {
        return argument1167+argument2147;
      },
      'UPYRo':function(argument1168, argument2148) {
        return argument1168*argument2148;
      },
      'BveDs':function(argument1169, argument2149) {
        return argument1169+argument2149;
      },
      'UUbhA':function(argument1170, argument2150) {
        return argument1170*argument2150;
      },
      'oRvoK':function(argument1171, argument2151) {
        return argument1171+argument2151;
      },
      'mGITz':function(argument1172, argument2152) {
        return argument1172*argument2152;
      },
      'uPkQf':function(argument1173, argument2153) {
        return argument1173+argument2153;
      },
      'eTPYn':"ipcVv",
      'ihbmY':"wPtvl",
      'GoLgo':function(argument1174, argument2154) {
        return argument1174===argument2154;
      },
      'nHqNp':"left",
      'rKkHE':"OpeGd",
      'ciBpM':function(argument1175, argument2155) {
        return argument1175===argument2155;
      },
      'SjeFM':"center",
      'pMjqQ':function(argument1176, argument2156) {
        return argument1176!==argument2156;
      },
      'LoTcl':"ywsDu",
      'EyAYn':"trMDA",
      'rZHKo':function(argument1177, argument2157) {
        return argument1177/argument2157;
      },
      'dnyLF':function(argument1178, argument2158) {
        return argument1178>argument2158;
      },
      'XeTgX':"eypyI",
      'hiKpo':"vtCRh",
      'uFEOu':"round",
      'LHOCd':"UyKMS",
      'kVvub':"tVkRt",
      'dxcwK':function(argument1179, argument2159) {
        return argument1179*argument2159;
      }
    },
    value37=((this._itemLabelFontSize) * (-this.itemLabelBaselineOffset)),
    result20=this.getScaledNumber(1);
    
    const result21=this.getScaledNumber(((this._itemLabelStrokeWidth) * (2)));
    for(const [value1468, value1469]of value1294.entries()) {
      const value38=this._items[value1468],
      value39=value38.labelColor||(this._itemLabelColors[((value1468) % (this._itemLabelColors.length))]||options115.SKwem);
      if(((value38.label.trim()) === (''))||((value39) === (options115.SKwem)))continue;
      context.save(),
      context.clip(value38.path);
      const value40=((value1469.start) + (((value1469.end) - (value1469.start)) / (2)));
      context.translate(((this._center.x) + ((Math.cos((degRad)(((value40) + (arcAdjust))))) * ((this._actualRadius) * (this.itemLabelRadius)))), ((this._center.y) + ((Math.sin((degRad)(((value40) + (arcAdjust))))) * ((this._actualRadius) * (this.itemLabelRadius))))),
      context.rotate((degRad)(((value40) + (arcAdjust)))),
      context.rotate((degRad)((this.itemLabelRotation)));
      if(this.debug) {
        if(((options115.eTPYn) === (options115.ihbmY)))this._label=value1470;
        else {
          context.save();
          let value41=0;
          if(((this.itemLabelAlign) === (options115.nHqNp)))((options115.rKkHE) === (options115.rKkHE))?value41=this._labelMaxWidth:(this._itemLabelStrokeColor=(value1471)(( {
            'val':value1472, 'isValid':((typeof value1473) === (options115.pbzhF)), 'errorMessage':options115.xJWFT, 'defaultValue':value1474.wheel.itemLabelStrokeColor
          })), this.refresh());
          else ((this.itemLabelAlign) === (options115.SjeFM))&&(((options115.LoTcl) !== (options115.EyAYn))?value41=((this._labelMaxWidth) / (2)):(qFvDWv.nOrbZ(typeof value1475, qFvDWv.ngHeg)?this._imageRadius=value1476:this._imageRadius=value1477.item.imageRadius, this._wheel.refresh()));
          context.beginPath(),
          context.moveTo(value41, 0),
          context.lineTo(((-this._labelMaxWidth) + (value41)), 0),
          context.strokeStyle=Debugging.labelBoundingBoxColor,
          context.lineWidth=result20,
          context.stroke(),
          context.strokeRect(value41, ((-this._itemLabelFontSize) / (2)), -this._labelMaxWidth, this._itemLabelFontSize),
          context.restore();
        }
      }
      if(((this._itemLabelStrokeWidth) > (0))) {
        if(((options115.XeTgX) === (options115.hiKpo)))return this._rotationSpeed;
        else context.lineWidth=result21,
        context.strokeStyle=this._itemLabelStrokeColor,
        context.lineJoin=options115.uFEOu,
        context.strokeText(value38.label, 0, value37);
      }
      context.fillStyle=value39,
      context.fillText(value38.label, 0, value37);
      if(this.debug) {
        if(((options115.LHOCd) !== (options115.kVvub))) {
          const result22=this.getScaledNumber(2);
          context.beginPath(),
          context.arc(0, 0, result22, 0, ((2) * (Math.PI))),
          context.fillStyle=Debugging.labelRadiusColor,
          context.fill();
        }
        else return this._itemBackgroundColors;
      }
      context.restore();
    }
  }
  drawDebugDragPoints(context) {
    const options118= {
    };
    
    
    const value42=options118;
    
    if(!this.debug||!this._dragEvents?.["length"])return;
    const result23=[...this._dragEvents].reverse(),
    result24=this.getScaledNumber(0.5),
    result25=this.getScaledNumber(4);
    for(const [value1521, value15222]of result23.entries()) {
      if(((value42.hiIaI) === (value42.xyqcT)))this._value=value1523;
      else {
        const value43=(((value1521) / (this._dragEvents.length)) * (100));
        context.beginPath(),
        context.arc(value15222.x, value15222.y, result25, 0, ((2) * (Math.PI))),
        context.fillStyle="hsl("+Debugging.dragPointHue+",100%,"+value43+'%)',
        context.strokeStyle=value42.JVXEs,
        context.lineWidth=result24,
        context.fill(),
        context.stroke();
      }
    }
  }
  animateRotation(value1524=0) {
    const options121= {
      'mQWZZ':function(argument1185, argument2164) {
        return argument1185===argument2164;
      },
      'XOEGs':function(argument1186, argument2165) {
        return argument1186+argument2165;
      },
      'LodEn':function(argument1187, argument2166) {
        return argument1187+argument2166;
      },
      'CzPbU':function(argument1188, argument2167) {
        return argument1188*argument2167;
      },
      'sjoWj':function(argument1189, argument2168) {
        return argument1189*argument2168;
      },
      'CjlDS':function(argument1190, argument2169) {
        return argument1190-argument2169;
      },
      'OlCiR':function(argument1191, argument2170) {
        return argument1191-argument2170;
      },
      'sYSTU':function(argument1192, argument2171) {
        return argument1192/argument2171;
      },
      'eCbep':function(argument1193, argument2172) {
        return argument1193/argument2172;
      },
      'fHOJv':function(argument1194, argument2173) {
        return argument1194+argument2173;
      },
      'cqSsR':function(argument1195, argument2174) {
        return argument1195+argument2174;
      },
      'TvZHs':function(argument1196, argument2175) {
        return argument1196*argument2175;
      },
      'MaGyM':function(argument1197, argument2176) {
        return argument1197*argument2176;
      },
      'PqNoW':function(argument1198, argument2177) {
        return argument1198-argument2177;
      },
      'TGnLl':"center",
      'plaNy':function(argument1199, argument2178, argument34, argument43, argument53) {
        return argument1199(argument2178, argument34, argument43, argument53);
      },
      'sVxvX':function(argument1200, argument2179) {
        return argument1200%argument2179;
      },
      'kfBFv':function(argument1201, argument2180) {
        return argument1201===argument2180;
      },
      'QfBGR':function(argument1202, argument2181) {
        return argument1202!==argument2181;
      },
      'iCeiu':function(argument1203, argument2182) {
        return argument1203!==argument2182;
      },
      'Nwhpa':"wytUM",
      'SPRDv':"JvkDt",
      'YAlEB':function(argument1204, argument2183) {
        return argument1204>=argument2183;
      },
      'tvnoU':function(argument1205, argument2184) {
        return argument1205/argument2184;
      },
      'RTAKc':function(argument1206, argument2185) {
        return argument1206<argument2185;
      },
      'JDuLT':function(argument1207, argument2186) {
        return argument1207-argument2186;
      },
      'iZYdm':function(argument1208, argument2187) {
        return argument1208!==argument2187;
      },
      'XcOol':function(argument1209, argument2188) {
        return argument1209-argument2188;
      },
      'jwAVx':function(argument1210, argument2189) {
        return argument1210>argument2189;
      },
      'phVuy':"PmRTs",
      'Ueqni':function(argument1211, argument2190) {
        return argument1211%argument2190;
      },
      'bDNMD':function(argument1212, argument2191) {
        return argument1212===argument2191;
      },
      'awmnL':function(argument1213, argument2192) {
        return argument1213===argument2192;
      },
      'MsNjk':"qJuWd",
      'nuRgt':"oULNc",
      'dvwSt':"xrbuF"
    };
    
    if(((this._spinToTimeEnd) !== (null))) {
      if(((options121.Nwhpa) !== (options121.SPRDv))) {
        if(((value1524) >= (this._spinToTimeEnd))) {
          this.rotation=this._spinToEndRotation,
          this._spinToTimeEnd=null,
          this.raiseEvent_onRest();
          return;
        }
        const value44=((this._spinToTimeEnd) - (this._spinToTimeStart));
        let value45=(((value1524) - (this._spinToTimeStart)) / (value44));
        value45=((value45) < (0))?0:value45;
        const value46=((this._spinToEndRotation) - (this._spinToStartRotation));
        this.rotation=((this._spinToStartRotation) + ((value46) * (this._spinToEasingFunction(value45)))),
        this.refresh();
        return;
      }
      else this.init(value1707.item);
    }
    
    if(((this._lastSpinFrameTime) !== (null))) {
      const value47=((value1524) - (this._lastSpinFrameTime));
      if(((value47) > (0))) {
        if(((options121.phVuy) !== (options121.phVuy))) {
          if(fWMlPf.mQWZZ(this.canvas, null))return;
          this.canvas.style.width=fWMlPf.XOEGs(this._canvasContainer.clientWidth, 'px'),
          this.canvas.style.height=fWMlPf.LodEn(this._canvasContainer.clientHeight, 'px');
          const [value1708,
          value1709]=[fWMlPf.CzPbU(this._canvasContainer.clientWidth, this.getActualPixelRatio()),
          fWMlPf.sjoWj(this._canvasContainer.clientHeight, this.getActualPixelRatio())];
          this.canvas.width=value1708,
          this.canvas.height=value1709;
          const result26=value1710.min(value1708, value1709),
          options122= {
            'w':fWMlPf.CjlDS(result26, fWMlPf.sjoWj(result26, this._offset.x)),
            'h':fWMlPf.OlCiR(result26, fWMlPf.sjoWj(result26, this._offset.y))
          },
          result27=value1711.min(fWMlPf.sYSTU(value1708, options122.w), fWMlPf.eCbep(value1709, options122.h));
          this._size=value1712.max(fWMlPf.sjoWj(options122.w, result27), fWMlPf.sjoWj(options122.h, result27)),
          this._center= {
            'x':fWMlPf.fHOJv(fWMlPf.eCbep(value1708, 2), fWMlPf.sjoWj(value1708, this._offset.x)),
            'y':fWMlPf.cqSsR(fWMlPf.sYSTU(value1709, 2), fWMlPf.CzPbU(value1709, this._offset.y))
          },
          this._actualRadius=fWMlPf.TvZHs(fWMlPf.eCbep(this._size, 2), this.radius),
          this._itemLabelFontSize=fWMlPf.TvZHs(this.itemLabelFontSizeMax, fWMlPf.eCbep(this._size, value1713)),
          this._labelMaxWidth=fWMlPf.MaGyM(this._actualRadius, fWMlPf.PqNoW(this.itemLabelRadius, this.itemLabelRadiusMax));
          fWMlPf.mQWZZ(this.itemLabelAlign, fWMlPf.TGnLl)&&(this._labelMaxWidth*=2);
          for(const item6 of this._items) {
            this._itemLabelFontSize=value1714.min(this._itemLabelFontSize, fWMlPf.plaNy(value1715, item6.label, this.itemLabelFont, this._labelMaxWidth, this._context));
          }
          this.refresh();
        }
        else this.rotation+=((((value47) / (1000)) * (this._rotationSpeed)) % (360)),
        this._rotationSpeed=this.getRotationSpeedPlusDrag(value47),
        ((this._rotationSpeed) === (0))?((options121.MsNjk) === (options121.MsNjk))?(this.raiseEvent_onRest(), this._lastSpinFrameTime=null):this.init(value1716):((options121.nuRgt) === (options121.dvwSt))?(this.rotation+=((((value1717) / (1000)) * (this._rotationSpeed)) % (360)), this._rotationSpeed=this.getRotationSpeedPlusDrag(value1718), ((this._rotationSpeed) === (0))?(this.raiseEvent_onRest(), this._lastSpinFrameTime=null):this._lastSpinFrameTime=value1719):this._lastSpinFrameTime=value1524;
      }
      this.refresh();
      return;
    }
  }
  getRotationSpeedPlusDrag(value1720=0) {
    const options126= {
    };
    
    
    const value48=options126,
    value49=((this._rotationSpeed) + (((this.rotationResistance) * ((value1720) / (1000))) * (this._rotationDirection)));
    if(((this._rotationDirection) === (1))&&((value49) < (0))||((this._rotationDirection) === (-1))&&((value49) >= (0)))return ((value48.CegYX) === (value48.alXds))?this._value:0;
    
    return value49;
  }
  spin(value1759=0) {
    
    
    const options128= {
      'YdwpZ':function(argument1223, argument2202) {
        return argument1223(argument2202);
      },
      'fQdpJ':"rotationSpeed must be a number",
      'NuTfR':"spin"
    };
    
    if(!(isNumber)((value1759)))throw new Error(options128.fQdpJ);
    this._dragEvents=[],
    this.beginSpin(value1759, options128.NuTfR);
  }
  spinTo(targetRotation = 0, duration = 0, easingFunction = null) {
    if (!isNumber(targetRotation)) throw new Error('Error: rotation must be a number');
    if (!isNumber(duration)) throw new Error('Error: duration must be a number');
    this.stop();
    this._dragEvents = [];
    this.animate(targetRotation, duration, easingFunction);
    this.raiseEvent_onSpin({ method: 'spinto', targetRotation, duration });
  }
  spinToItem(value1801=0, value1802=0, value1803=!false, value1804=1, value1805=1, value1806=null) {
    
    this.stop(),
    this._dragEvents=[];
    const value51=value1803?this.items[value1801].getCenterAngle():this.items[value1801].getRandomAngle();
    let result29=(calcWheelRotationForTargetAngle)((this.rotation), ((value51) - (this._pointerAngle)), (value1805));
    result29+=(((value1804) * (360)) * (value1805)),
    this.animate(result29, value1802, value1806);
    const options137= {
    };
    
    
    
    this.raiseEvent_onSpin(options137);
  }
  animate(targetRotation, duration, easingFunction) {
    this._spinToStartRotation = this.rotation;
    this._spinToEndRotation = targetRotation;
    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + duration;
    this._spinToEasingFunction = easingFunction || easeSinOut;
    this.refresh();
  }
  stop() {
    
    this._spinToTimeEnd=null;
    
    
    this._rotationSpeed=0,
    this._lastSpinFrameTime=null;
  }
  getScaledNumber(value) {
    
    
    
    
    
    return (((value) / (baseCanvasSize)) * (this._size));
  }
  getActualPixelRatio() {
    
    
    
    
    
    return ((this._pixelRatio) !== (0))?this._pixelRatio:window.devicePixelRatio;
  }
  wheelHitTest(value1888=options71) {
    
    
    
    if(((this.canvas) === (null)))returnfalse;
    const result31=(translateXYToElement)((value1888), (this.canvas), (this.getActualPixelRatio()));
    return (isPointInCircle)((result31), (this._center.x), (this._center.y), (this._actualRadius));
  }
  refreshCursor() {
    const options157= {
      'DIasf':function(argument1240, argument2218) {
        return argument1240===argument2218;
      },
      'wCtyz':"middle",
      'YCvnQ':function(argument1241, argument2219) {
        return argument1241+argument2219;
      },
      'IJrcV':function(argument1242, argument2220) {
        return argument1242+argument2220;
      },
      'lQOOP':"px ",
      'zrmnH':function(argument1243, argument2221) {
        return argument1243-argument2221;
      },
      'qwqAf':function(argument1244, argument2222) {
        return argument1244/argument2222;
      },
      'Kfkjm':function(argument1245, argument2223) {
        return argument1245(argument2223);
      },
      'rcBwI':function(argument1246, argument2224) {
        return argument1246+argument2224;
      },
      'sqZbi':function(argument1247, argument2225) {
        return argument1247(argument2225);
      },
      'xmfmd':"change",
      'EJsCQ':function(argument1248, argument2226) {
        return argument1248+argument2226;
      },
      'fOQdu':function(argument1249, argument2227) {
        return argument1249===argument2227;
      },
      'LnXqz':function(argument1250, argument2228) {
        return argument1250!==argument2228;
      },
      'UYNzT':"KtaWK",
      'MGNgt':"mDzqS",
      'HEBAN':"Nuffq",
      'OTyqz':"NodVE",
      'oBonZ':"grabbing",
      'JHJUy':function(argument1251, argument2229) {
        return argument1251===argument2229;
      },
      'biEqb':"ciEby",
      'cLmpd':"wMaIP",
      'mNVXN':"grab"
    };
    
    if(((this.canvas) === (null)))return;
    
    if(this.isInteractive) {
      if(((options157.UYNzT) !== (options157.MGNgt))) {
        if(this.isDragging) {
          if(((options157.HEBAN) === (options157.OTyqz))) {
            this._frameRequestId=null;
            if(cQfBdi.DIasf(this._context, null)||cQfBdi.DIasf(this.canvas, null))return;
            const value56=this._context;
            value56.clearRect(0, 0, this.canvas.width, this.canvas.height),
            this.animateRotation(value2010);
            const result32=this.getItemAngles(this._rotation),
            result33=this.getScaledNumber(this._borderWidth);
            value56.textBaseline=cQfBdi.wCtyz,
            value56.textAlign=this.itemLabelAlign,
            value56.font=cQfBdi.YCvnQ(cQfBdi.IJrcV(this._itemLabelFontSize, cQfBdi.lQOOP), this.itemLabelFont);
            for(const [value2011, value2012]of result32.entries()) {
              const value57=this._items[value2011],
              value58=new value2013();
              value58.moveTo(this._center.x, this._center.y),
              value58.arc(this._center.x, this._center.y, cQfBdi.zrmnH(this._actualRadius, cQfBdi.qwqAf(result33, 2)), cQfBdi.Kfkjm(value2014, cQfBdi.rcBwI(value2012.start, value2015)), cQfBdi.sqZbi(value2016, cQfBdi.rcBwI(value2012.end, value2017))),
              value57.path=value58;
            }
            this.drawItemBackgrounds(value56, result32),
            this.drawItemImages(value56, result32),
            this.drawItemLines(value56, result32),
            this.drawItemLabels(value56, result32),
            this.drawBorder(value56),
            this.drawImage(value56, this._image, false),
            this.drawImage(value56, this._overlayImage, !false),
            this.drawDebugPointerLine(value56),
            this._isInitialising=false;
          }
          else {
            this.canvas.style.cursor=options157.oBonZ;
            return;
          }
        }
        if(this._isCursorOverWheel) {
          if(((options157.biEqb) === (options157.cLmpd))) {
            
            const options158= {
            };
            options158.once=!false,
            value2021._mediaQueryList.addEventListener(cQfBdi.xmfmd, value20222._handler_onDevicePixelRatioChange, options158);
          }
          else {
            this.canvas.style.cursor=options157.mNVXN;
            return;
          }
        }
      }
      else value2023[((value2024.length) - (1))].end=((value2025[0].start) + (360));
    }
    this.canvas.style.cursor='';
  }
  getAngleFromCenter(value2026=options72) {
    
    
    
    
    return ((((getAngle)((this._center.x), (this._center.y), (value2026.x), (value2026.y))) + (90)) % (360));
  }
  getCurrentIndex() {
    
    
    
    return this._currentIndex;
  }
  refreshCurrentIndex(value2037=[]) {
    
    
    
    const options166= {
      'nqIQY':function(argument1255, argument2233) {
        return argument1255===argument2233;
      },
      'FShZf':"hquQn",
      'JPZpM':function(argument1256, argument2234, argument310, argument48) {
        return argument1256(argument2234, argument310, argument48);
      },
      'VZlky':function(argument1257, argument2235) {
        return argument1257%argument2235;
      },
      'BOyvI':function(argument1258, argument2236) {
        return argument1258%argument2236;
      }
    };
    if(((this._items.length) === (0)))this._currentIndex=-1;
    for(const [value2069, value2070]of value2037.entries()) {
      if(((options166.FShZf) === (options166.FShZf))) {
        if(!(isAngleBetween)((this._pointerAngle), ((value2070.start) % (360)), ((value2070.end) % (360))))continue;
        if(((this._currentIndex) === (value2069)))break;
        this._currentIndex=value2069;
        if(!this._isInitialising)this.raiseEvent_onCurrentIndexChange();
        break;
      }
      else this._weight=value2071;
    }
  }
  getItemAngles(value2072=0) {
    const options169= {
      'txVsD':function(argument1259, argument2237) {
        return argument1259===argument2237;
      },
      'jfxvU':function(argument1260, argument2238, argument311, argument49) {
        return argument1260(argument2238, argument311, argument49);
      },
      'hAkZj':function(argument1261, argument2239, argument312, argument410, argument56) {
        return argument1261(argument2239, argument312, argument410, argument56);
      },
      'Plkbh':function(argument1262, argument2240) {
        return argument1262/argument2240;
      },
      'UIThA':"SNIXH",
      'qNwMA':"RJNHF",
      'qyIZo':function(argument1263, argument2241) {
        return argument1263*argument2241;
      },
      'xlYAB':function(argument1264, argument2242) {
        return argument1264+argument2242;
      },
      'sbLJt':function(argument1265, argument2243) {
        return argument1265>argument2243;
      },
      'FwojE':function(argument1266, argument2244) {
        return argument1266-argument2244;
      }
    };
    
    let value59=0;
    for(const item7 of this.items) {
      value59+=item7.weight;
    }
    const value60=((360) / (value59));
    
    let value61,
    value62=value2072;
    const items2=[];
    for(const item8 of this._items) {
      if(((options169.UIThA) === (options169.qNwMA))) {
        if(hSywYM.txVsD(this.canvas, null))returnfalse;
        const result34=hSywYM.jfxvU(value2106, value2107, this.canvas, this.getActualPixelRatio());
        return hSywYM.hAkZj(value2108, result34, this._center.x, this._center.y, this._actualRadius);
      }
      else value61=((item8.weight) * (value60)),
      items2.push( {
        'start':value62, 'end':((value62) + (value61))
      }),
      value62+=value61;
    }
    return ((this._items.length) > (1))&&(items2[((items2.length) - (1))].end=((items2[0].start) + (360))),
    items2;
  }
  refresh() {
    const options172= {
    };
    
    
    
    
    const value63=options172;
    ((this._frameRequestId) === (null))&&(((value63.wSptF) === (value63.hjIUk))?this.onRest?.( {
      'type':value63.kOWFM, 'currentIndex':this._currentIndex, 'rotation':this._rotation, ...value2135
    }):this._frameRequestId=window.requestAnimationFrame(argument1268=>this.draw(argument1268)));
  }
  limitSpeed(value2136=0, value2137=0) {
    
    
    
    const result35=Math.min(value2136, value2137);
    return Math.max(result35, -value2137);
  }
  beginSpin(speed = 0, method = '') {
    this.stop();
    this._rotationSpeed = this.limitSpeed(speed, this._rotationSpeedMax);
    this._rotationDirection = this._rotationSpeed >= 0 ? 1 : -1;
    this._lastSpinFrameTime = performance.now();
    this.refresh();
    if (this._rotationSpeed !== 0) {
      this.raiseEvent_onSpin({ method, rotationSpeed: this._rotationSpeed, rotationResistance: this._rotationResistance });
    }
  }
  refreshAriaLabel() {
    const options180= {
    };
    
    const value66=options180;
    if(((this.canvas) === (null)))return;
    this.canvas.setAttribute(value66.rViCQ, value66.FvYyP);
    
    const value67=((this.items.length) >= (2))?" The wheel has "+this.items.length+" slices.":'';
    
    this.canvas.setAttribute(value66.YCBiq, ((value66.xKXgP) + (value67)));
  }
  get borderColor() {
    
    
    
    return this._borderColor;
  }
  set borderColor(argument1274) {
    const options184= {
      'FCMMH':function(argument1275, argument2251) {
        return argument1275(argument2251);
      },
      'RjsQV':function(argument1276, argument2252) {
        return argument1276===argument2252;
      },
      'PvQPP':"string",
      'DcWLK':"Wheel.borderColor must be a string"
    };
    
    
    this._borderColor=(setProp)(( {
      'val':argument1274, 'isValid':((typeof argument1274) === (options184.PvQPP)), 'errorMessage':options184.DcWLK, 'defaultValue':Defaults.wheel.borderColor
    })),
    this.refresh();
  }
  get borderWidth() {
    
    
    
    return this._borderWidth;
  }
  set borderWidth(argument1277) {
    const options190= {
      'WXoBo':function(argument1278, argument2253) {
        return argument1278(argument2253);
      },
      'kgtez':function(argument1279, argument2254) {
        return argument1279(argument2254);
      },
      'TvvGo':"Wheel.borderWidth must be a number"
    };
    this._borderWidth=(setProp)(( {
      'val':argument1277, 'isValid':(isNumber)((argument1277)), 'errorMessage':options190.TvvGo, 'defaultValue':Defaults.wheel.borderWidth
    }));
    
    
    this.refresh();
  }
  get debug() {
    
    
    return this._debug;
  }
  set debug(argument1280) {
    const options194= {
      'LFktl':function(argument1281, argument2255) {
        return argument1281(argument2255);
      },
      'oidxa':function(argument1282, argument2256) {
        return argument1282===argument2256;
      },
      'qbzgp':"boolean",
      'ygjOH':"Wheel.debug must be a boolean"
    };
    this._debug=(setProp)(( {
      'val':argument1280, 'isValid':((typeof argument1280) === (options194.qbzgp)), 'errorMessage':options194.ygjOH, 'defaultValue':Defaults.wheel.debug
    }));
    
    
    this.refresh();
  }
  get image() {
    
    
    return this._image;
  }
  set image(argument1283) {
    
    
    const options199= {
      'NuIlw':function(argument1284, argument2257) {
        return argument1284(argument2257);
      },
      'nrlxC':function(argument1285, argument2258) {
        return argument1285 instanceof argument2258;
      },
      'yGROE':function(argument1286, argument2259) {
        return argument1286===argument2259;
      },
      'EYYnu':"Wheel.image must be a HTMLImageElement or null"
    };
    this._image=(setProp)(( {
      'val':argument1283, 'isValid':((argument1283) instanceof (HTMLImageElement))||((argument1283) === (null)), 'errorMessage':options199.EYYnu, 'defaultValue':Defaults.wheel.image
    }));
    
    this.refresh();
  }
  get isInteractive() {
    
    
    
    return this._isInteractive;
  }
  set isInteractive(argument1287) {
    const options205= {
      'RQxCp':function(argument1288, argument2260) {
        return argument1288(argument2260);
      },
      'nOjLq':function(argument1289, argument2261) {
        return argument1289===argument2261;
      },
      'GTTMm':"boolean",
      'okvJp':"Wheel.isInteractive must be a boolean"
    };
    
    
    this._isInteractive=(setProp)(( {
      'val':argument1287, 'isValid':((typeof argument1287) === (options205.GTTMm)), 'errorMessage':options205.okvJp, 'defaultValue':Defaults.wheel.isInteractive
    })),
    this.refreshCursor();
  }
  get itemBackgroundColors() {
    
    
    
    return this._itemBackgroundColors;
  }
  set itemBackgroundColors(argument1290) {
    const options209= {
      'xpywP':function(argument1291, argument2262) {
        return argument1291(argument2262);
      },
      'soMla':"Wheel.itemBackgroundColors must be an array"
    };
    this._itemBackgroundColors=(setProp)(( {
      'val':argument1290, 'isValid':Array.isArray(argument1290), 'errorMessage':options209.soMla, 'defaultValue':Defaults.wheel.itemBackgroundColors
    }));
    
    
    this.refresh();
  }
  get itemLabelAlign() {
    
    
    
    return this._itemLabelAlign;
  }
  set itemLabelAlign(argument1292) {
    const options212= {
      'uiRDH':function(argument1293, argument2263) {
        return argument1293(argument2263);
      },
      'VjvYg':function(argument1294, argument2264) {
        return argument1294===argument2264;
      },
      'kKzVh':"string",
      'ZHoak':function(argument1295, argument2265) {
        return argument1295===argument2265;
      },
      'PLnSB':function(argument1296, argument2266) {
        return argument1296===argument2266;
      },
      'aiBCR':"Wheel.itemLabelAlign must be one of Constants.AlignText"
    };
    this._itemLabelAlign=(setProp)(( {
      'val':argument1292, 'isValid':((typeof argument1292) === (options212.kKzVh))&&(((argument1292) === (AlignText.left))||((argument1292) === (AlignText.right))||((argument1292) === (AlignText.center))), 'errorMessage':options212.aiBCR, 'defaultValue':Defaults.wheel.itemLabelAlign
    }));
    
    
    this.resize();
  }
  get itemLabelBaselineOffset() {
    
    
    
    return this._itemLabelBaselineOffset;
  }
  set itemLabelBaselineOffset(argument1297) {
    const options217= {
      'WrWjA':function(argument1298, argument2267) {
        return argument1298(argument2267);
      },
      'xRnwg':function(argument1299, argument2268) {
        return argument1299(argument2268);
      },
      'dNNtE':"Wheel.itemLabelBaselineOffset must be a number"
    };
    
    
    this._itemLabelBaselineOffset=(setProp)(( {
      'val':argument1297, 'isValid':(isNumber)((argument1297)), 'errorMessage':options217.dNNtE, 'defaultValue':Defaults.wheel.itemLabelBaselineOffset
    })),
    this.resize();
  }
  get itemLabelColors() {
    
    
    
    return this._itemLabelColors;
  }
  set itemLabelColors(argument1300) {
    
    
    
    const options222= {
      'cqpzl':function(argument1301, argument2269) {
        return argument1301(argument2269);
      },
      'EUOmZ':"Wheel.itemLabelColors must be an array"
    };
    this._itemLabelColors=(setProp)(( {
      'val':argument1300, 'isValid':Array.isArray(argument1300), 'errorMessage':options222.EUOmZ, 'defaultValue':Defaults.wheel.itemLabelColors
    })),
    this.refresh();
  }
  get itemLabelFont() {
    
    
    
    return this._itemLabelFont;
  }
  set itemLabelFont(argument1302) {
    const options225= {
      'HoORn':function(argument1303, argument2270) {
        return argument1303(argument2270);
      },
      'VMwNa':function(argument1304, argument2271) {
        return argument1304===argument2271;
      },
      'ArpFI':"string",
      'wFAZM':"Wheel.itemLabelFont must be a string"
    };
    
    this._itemLabelFont=(setProp)(( {
      'val':argument1302, 'isValid':((typeof argument1302) === (options225.ArpFI)), 'errorMessage':options225.wFAZM, 'defaultValue':Defaults.wheel.itemLabelFont
    }));
    
    this.resize();
  }
  get itemLabelFontSizeMax() {
    
    
    
    return this._itemLabelFontSizeMax;
  }
  set itemLabelFontSizeMax(argument1305) {
    
    
    const options230= {
      'cChrU':function(argument1306, argument2272) {
        return argument1306(argument2272);
      },
      'ESbAS':function(argument1307, argument2273) {
        return argument1307(argument2273);
      },
      'fBfpr':"Wheel.itemLabelFontSizeMax must be a number"
    };
    
    this._itemLabelFontSizeMax=(setProp)(( {
      'val':argument1305, 'isValid':(isNumber)((argument1305)), 'errorMessage':options230.fBfpr, 'defaultValue':Defaults.wheel.itemLabelFontSizeMax
    })),
    this.resize();
  }
  get itemLabelRadius() {
    
    
    
    return this._itemLabelRadius;
  }
  set itemLabelRadius(argument1308) {
    const options236= {
      'HXbao':function(argument1309, argument2274) {
        return argument1309(argument2274);
      },
      'LAHyh':function(argument1310, argument2275) {
        return argument1310(argument2275);
      },
      'MCRla':"Wheel.itemLabelRadius must be a number"
    };
    this._itemLabelRadius=(setProp)(( {
      'val':argument1308, 'isValid':(isNumber)((argument1308)), 'errorMessage':options236.MCRla, 'defaultValue':Defaults.wheel.itemLabelRadius
    }));
    
    
    this.resize();
  }
  get itemLabelRadiusMax() {
    
    
    
    return this._itemLabelRadiusMax;
  }
  set itemLabelRadiusMax(argument1311) {
    
    
    const options243= {
      'LOYbT':function(argument1312, argument2276) {
        return argument1312(argument2276);
      },
      'TTALW':function(argument1313, argument2277) {
        return argument1313(argument2277);
      },
      'zQkuZ':"Wheel.itemLabelRadiusMax must be a number"
    };
    this._itemLabelRadiusMax=(setProp)(( {
      'val':argument1311, 'isValid':(isNumber)((argument1311)), 'errorMessage':options243.zQkuZ, 'defaultValue':Defaults.wheel.itemLabelRadiusMax
    }));
    
    this.resize();
  }
  get itemLabelRotation() {
    
    
    
    return this._itemLabelRotation;
  }
  set itemLabelRotation(argument1314) {
    const options247= {
      'QFdPL':function(argument1315, argument2278) {
        return argument1315(argument2278);
      },
      'ahPrR':"Wheel.itemLabelRotation must be a number"
    };
    
    this._itemLabelRotation=(setProp)(( {
      'val':argument1314, 'isValid':(isNumber)((argument1314)), 'errorMessage':options247.ahPrR, 'defaultValue':Defaults.wheel.itemLabelRotation
    }));
    
    this.refresh();
  }
  get itemLabelStrokeColor() {
    
    
    
    return this._itemLabelStrokeColor;
  }
  set itemLabelStrokeColor(argument1316) {
    
    
    
    const options253= {
      'ltvCv':function(argument1317, argument2279) {
        return argument1317(argument2279);
      },
      'jxcBj':function(argument1318, argument2280) {
        return argument1318===argument2280;
      },
      'IISlg':"string",
      'wycFR':"Wheel.itemLabelStrokeColor must be a string"
    };
    this._itemLabelStrokeColor=(setProp)(( {
      'val':argument1316, 'isValid':((typeof argument1316) === (options253.IISlg)), 'errorMessage':options253.wycFR, 'defaultValue':Defaults.wheel.itemLabelStrokeColor
    })),
    this.refresh();
  }
  get itemLabelStrokeWidth() {
    
    
    
    return this._itemLabelStrokeWidth;
  }
  set itemLabelStrokeWidth(argument1319) {
    
    
    const options258= {
      'QENwz':function(argument1320, argument2281) {
        return argument1320(argument2281);
      },
      'hSjht':"Wheel.itemLabelStrokeWidth must be a number"
    };
    
    this._itemLabelStrokeWidth=(setProp)(( {
      'val':argument1319, 'isValid':(isNumber)((argument1319)), 'errorMessage':options258.hSjht, 'defaultValue':Defaults.wheel.itemLabelStrokeWidth
    })),
    this.refresh();
  }
  get items() {
    
    
    return this._items;
  }
  set items(argument1321) {
    const options265= {
      'ApMmm':function(argument1322, argument2282) {
        return argument1322(argument2282);
      },
      'oVzYJ':"Wheel.items must be an array of Items"
    };
    
    this._items=(setProp)(( {
      'val':argument1321, 'isValid':Array.isArray(argument1321), 'errorMessage':options265.oVzYJ, 'defaultValue':Defaults.wheel.items, 'action':()=> {
        
        const items3=[];
        for(const item9 of argument1321) {
          items3.push(new Item(this, item9));
        }
        return items3;
      }
    })),
    this.refreshAriaLabel(),
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    
    this.resize();
  }
  get lineColor() {
    
    
    return this._lineColor;
  }
  set lineColor(argument1323) {
    const options270= {
      'PGpko':function(argument1324, argument2283) {
        return argument1324(argument2283);
      },
      'MEWEx':function(argument1325, argument2284) {
        return argument1325===argument2284;
      },
      'PAjde':"string",
      'fmdoi':"Wheel.lineColor must be a string"
    };
    
    this._lineColor=(setProp)(( {
      'val':argument1323, 'isValid':((typeof argument1323) === (options270.PAjde)), 'errorMessage':options270.fmdoi, 'defaultValue':Defaults.wheel.lineColor
    }));
    
    this.refresh();
  }
  get lineWidth() {
    
    
    return this._lineWidth;
  }
  set lineWidth(argument1326) {
    const options275= {
      'VpbZR':function(argument1327, argument2285) {
        return argument1327(argument2285);
      },
      'WCDYK':function(argument1328, argument2286) {
        return argument1328(argument2286);
      },
      'TMKYR':"Wheel.lineWidth must be a number"
    };
    
    this._lineWidth=(setProp)(( {
      'val':argument1326, 'isValid':(isNumber)((argument1326)), 'errorMessage':options275.TMKYR, 'defaultValue':Defaults.wheel.lineWidth
    }));
    
    this.refresh();
  }
  get offset() {
    
    
    return this._offset;
  }
  set offset(argument1329) {
    const options279= {
      'PuIWi':function(argument1330, argument2287) {
        return argument1330(argument2287);
      },
      'yniEM':"Wheel.offset must be an object"
    };
    this._offset=(setProp)(( {
      'val':argument1329, 'isValid':(isObject)((argument1329)), 'errorMessage':options279.yniEM, 'defaultValue':Defaults.wheel.offset
    }));
    
    
    this.resize();
  }
  get onCurrentIndexChange() {
    
    
    
    return this._onCurrentIndexChange;
  }
  set onCurrentIndexChange(argument1331) {
    
    
    
    const options285= {
      'awLIZ':function(argument1332, argument2288) {
        return argument1332(argument2288);
      },
      'iDBKv':function(argument1333, argument2289) {
        return argument1333===argument2289;
      },
      'apBoT':"function",
      'WcieF':"Wheel.onCurrentIndexChange must be a function or null"
    };
    this._onCurrentIndexChange=(setProp)(( {
      'val':argument1331, 'isValid':((typeof argument1331) === (options285.apBoT))||((argument1331) === (null)), 'errorMessage':options285.WcieF, 'defaultValue':Defaults.wheel.onCurrentIndexChange
    }));
  }
  get onRest() {
    
    
    return this._onRest;
  }
  set onRest(argument1334) {
    
    
    
    const options289= {
      'axUbV':function(argument1335, argument2290) {
        return argument1335(argument2290);
      },
      'shpFe':function(argument1336, argument2291) {
        return argument1336===argument2291;
      },
      'NXdiR':"function",
      'xTsOc':function(argument1337, argument2292) {
        return argument1337===argument2292;
      },
      'QrYIq':"Wheel.onRest must be a function or null"
    };
    this._onRest=(setProp)(( {
      'val':argument1334, 'isValid':((typeof argument1334) === (options289.NXdiR))||((argument1334) === (null)), 'errorMessage':options289.QrYIq, 'defaultValue':Defaults.wheel.onRest
    }));
  }
  get onSpin() {
    
    
    return this._onSpin;
  }
  set onSpin(argument1338) {
    
    
    const options295= {
      'gmoOg':function(argument1339, argument2293) {
        return argument1339(argument2293);
      },
      'BAbtW':function(argument1340, argument2294) {
        return argument1340===argument2294;
      },
      'kLYgo':"function",
      'HHesb':function(argument1341, argument2295) {
        return argument1341===argument2295;
      },
      'BCfna':"Wheel.onSpin must be a function or null"
    };
    
    this._onSpin=(setProp)(( {
      'val':argument1338, 'isValid':((typeof argument1338) === (options295.kLYgo))||((argument1338) === (null)), 'errorMessage':options295.BCfna, 'defaultValue':Defaults.wheel.onSpin
    }));
  }
  get overlayImage() {
    
    
    
    return this._overlayImage;
  }
  set overlayImage(argument1342) {
    const options301= {
      'kfshL':function(argument1343, argument2296) {
        return argument1343(argument2296);
      },
      'oaKrP':function(argument1344, argument2297) {
        return argument1344 instanceof argument2297;
      },
      'GLFXs':function(argument1345, argument2298) {
        return argument1345===argument2298;
      },
      'MuebB':"Wheel.overlayImage must be a HTMLImageElement or null"
    };
    this._overlayImage=(setProp)(( {
      'val':argument1342, 'isValid':((argument1342) instanceof (HTMLImageElement))||((argument1342) === (null)), 'errorMessage':options301.MuebB, 'defaultValue':Defaults.wheel.overlayImage
    }));
    
    
    this.refresh();
  }
  get pixelRatio() {
    
    
    
    return this._pixelRatio;
  }
  set pixelRatio(argument1346) {
    const options304= {
      'aLDzm':function(argument1347, argument2299) {
        return argument1347(argument2299);
      },
      'RXQbs':function(argument1348, argument2300) {
        return argument1348(argument2300);
      },
      'MJxCB':"Wheel.pixelRatio must be a number"
    };
    
    this._pixelRatio=(setProp)(( {
      'val':argument1346, 'isValid':(isNumber)((argument1346)), 'errorMessage':options304.MJxCB, 'defaultValue':Defaults.wheel.pixelRatio
    })),
    this._dragEvents=[];
    
    this.resize();
  }
  get pointerAngle() {
    
    
    
    return this._pointerAngle;
  }
  set pointerAngle(argument1349) {
    const options310= {
      'RroTK':function(argument1350, argument2301) {
        return argument1350(argument2301);
      },
      'JXJYM':function(argument1351, argument2302) {
        return argument1351>=argument2302;
      },
      'AeUrF':"Wheel.pointerAngle must be a number between 0 and 360"
    };
    
    this._pointerAngle=(setProp)(( {
      'val':argument1349, 'isValid':(isNumber)((argument1349))&&((argument1349) >= (0)), 'errorMessage':options310.AeUrF, 'defaultValue':Defaults.wheel.pointerAngle, 'action':()=>argument1349%(360)
    }));
    
    if(this.debug)this.refresh();
  }
  get radius() {
    
    
    return this._radius;
  }
  set radius(argument1352) {
    const options315= {
      'MeoSm':function(argument1353, argument2303) {
        return argument1353(argument2303);
      },
      'tWVxD':"Wheel.radius must be a number"
    };
    this._radius=(setProp)(( {
      'val':argument1352, 'isValid':(isNumber)((argument1352)), 'errorMessage':options315.tWVxD, 'defaultValue':Defaults.wheel.radius
    }));
    
    
    this.resize();
  }
  get rotation() {
    
    
    return this._rotation;
  }
  set rotation(argument1354) {
    const options318= {
      'nAQYm':function(argument1355, argument2304) {
        return argument1355(argument2304);
      },
      'WvKDn':function(argument1356, argument2305) {
        return argument1356(argument2305);
      },
      'wDTVV':"Wheel.rotation must be a number"
    };
    
    this._rotation=(setProp)(( {
      'val':argument1354, 'isValid':(isNumber)((argument1354)), 'errorMessage':options318.wDTVV, 'defaultValue':Defaults.wheel.rotation
    }));
    
    this.refreshCurrentIndex(this.getItemAngles(this._rotation)),
    this.refresh();
  }
  get rotationResistance() {
    
    
    
    return this._rotationResistance;
  }
  set rotationResistance(argument1357) {
    
    
    const options325= {
      'JSTgo':function(argument1358, argument2306) {
        return argument1358(argument2306);
      },
      'UVrIa':"Wheel.rotationResistance must be a number"
    };
    
    this._rotationResistance=(setProp)(( {
      'val':argument1357, 'isValid':(isNumber)((argument1357)), 'errorMessage':options325.UVrIa, 'defaultValue':Defaults.wheel.rotationResistance
    }));
  }
  get rotationSpeed() {
    
    
    
    return this._rotationSpeed;
  }
  get rotationSpeedMax() {
    
    
    
    return this._rotationSpeedMax;
  }
  set rotationSpeedMax(argument1359) {
    
    
    const options334= {
      'yUACv':function(argument1360, argument2307) {
        return argument1360(argument2307);
      },
      'Gnpzt':function(argument1361, argument2308) {
        return argument1361>=argument2308;
      },
      'pKWbi':"Wheel.rotationSpeedMax must be a number >= 0"
    };
    
    this._rotationSpeedMax=(setProp)(( {
      'val':argument1359, 'isValid':(isNumber)((argument1359))&&((argument1359) >= (0)), 'errorMessage':options334.pKWbi, 'defaultValue':Defaults.wheel.rotationSpeedMax
    }));
  }
  dragStart(value2814=options73) {
    
    
    if(((this.canvas) === (null)))return;
    const result37=(translateXYToElement)((value2814), (this.canvas), (this.getActualPixelRatio()));
    this.isDragging=!false;
    
    this.stop(),
    this._dragEvents=[ {
      'distance':0x0,
      'x':result37.x,
      'y':result37.y,
      'now':performance.now()
    }],
    this.refreshCursor();
  }
  dragMove(value2831=options74) {
    
    
    
    if(((this.canvas) === (null)))return;
    const result38=(translateXYToElement)((value2831), (this.canvas), (this.getActualPixelRatio())),
    result39=this.getAngleFromCenter(result38);
    
    const value68=this._dragEvents[0],
    result40=this.getAngleFromCenter(value68),
    result41=(diffAngle)((result40), (result39));
    this._dragEvents.unshift( {
      'distance':result41, 'x':result38.x, 'y':result38.y, 'now':performance.now()
    });
    if(this.debug&&((this._dragEvents.length) >= (40)))this._dragEvents.pop();
    this.rotation+=result41;
  }
  dragEnd() {
    const options343= {
      'fzJlf':function(argument1368, argument2315) {
        return argument1368(argument2315);
      },
      'yhxIH':function(argument1369, argument2316) {
        return argument1369(argument2316);
      },
      'adsdv':function(argument1370, argument2317) {
        return argument1370>=argument2317;
      },
      'pEwep':"Wheel.pointerAngle must be a number between 0 and 360",
      'QOxoQ':function(argument1371, argument2318) {
        return argument1371!==argument2318;
      },
      'frdZl':"pXMUr",
      'AwBpc':"jorEu",
      'PFivx':function(argument1372, argument2319) {
        return argument1372===argument2319;
      },
      'Jvdnc':function(argument1373, argument2320) {
        return argument1373*argument2320;
      },
      'szycN':function(argument1374, argument2321) {
        return argument1374/argument2321;
      },
      'ZUXTq':"interact"
    };
    this.isDragging=false;
    let value69=0;
    const result42=performance.now();
    
    
    for(const [value2891, value2892]of this._dragEvents.entries()) {
      if(((options343.frdZl) !== (options343.AwBpc))) {
        if(!this.isDragEventTooOld(result42, value2892)) {
          value69+=value2892.distance;
          continue;
        }
        this._dragEvents.length=value2891;
        if(this.debug)this.refresh();
        break;
      }
      else {
        this._pointerAngle=dklXez.fzJlf(value2893,  {
          'val':value2894, 'isValid':dklXez.yhxIH(value2895, value2896)&&dklXez.adsdv(value2897, 0), 'errorMessage':dklXez.pEwep, 'defaultValue':value2898.wheel.pointerAngle, 'action':()=>value2899%(360)
        });
        if(this.debug)this.refresh();
      }
    }
    this.refreshCursor();
    if(((value69) === (0)))return;
    this.beginSpin(((value69) * ((1000) / (dragCapturePeriod))), options343.ZUXTq);
  }
  isDragEventTooOld(value2900=0, value2901= {
  }) {
    
    
    
    
    
    return (((value2900) - (value2901.now)) > (dragCapturePeriod));
  }
  raiseEvent_onCurrentIndexChange(value2908= {
  }) {
    const options347= {
    };
    
    
    
    const value71=options347;
    this.onCurrentIndexChange?.( {
      'type':value71.BWRKL, 'currentIndex':this._currentIndex, ...value2908
    });
  }
  raiseEvent_onRest(value2917= {
  }) {
    const options349= {
    };
    
    const value72=options349;
    
    
    this.onRest?.( {
      'type':value72.rdyZL, 'currentIndex':this._currentIndex, 'rotation':this._rotation, ...value2917
    });
  }
  raiseEvent_onSpin(value2925= {
  }) {
    const options351= {
    };
    
    
    
    const value73=options351,
    options352= {
      'type':value73.hkSiy,
      ...value2925
    };
    this.onSpin?.(options352);
  }
};
export {
  Wheel
};
