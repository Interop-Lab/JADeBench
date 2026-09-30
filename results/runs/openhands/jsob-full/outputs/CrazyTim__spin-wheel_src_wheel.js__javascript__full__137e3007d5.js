function getRandomInt(minInclusive=0, maxExclusive=0){
  return minInclusive=Math.ceil(minInclusive), maxExclusive=Math.floor(maxExclusive), ((Math.floor(((Math.random())*(((maxExclusive)-(minInclusive))))))+(minInclusive));
}
function getRandomFloat(min=0, max=0, decimalPlaces=14){
  return ((parseFloat)((((((Math.random())*(((max)-(min)))))+(min)).toFixed(decimalPlaces))));
}
function degRad(degrees=0){
  return ((((degrees)*(Math.PI)))/(180));
}
function isAngleBetween(angle, startAngle, endAngle){
  if(((startAngle)<(endAngle)))return ((startAngle)<=(angle))&&((angle)<(endAngle));
  return ((startAngle)<=(angle))||((angle)<(endAngle));
}
function aveArray(values=[]){
  let total=0;
  for(const value of values){
    if(value)total+=((typeof value)===("number"))? value: 1;
  }
  return ((total)/(values.length))||0;
}
function getFontSizeToFit(text, fontFamily, maxWidth, context){
  context.save();
  context.font="1px "+fontFamily;
  const measuredWidth=context.measureText(text).width;
  return context.restore(), ((maxWidth)/(measuredWidth));
}
const defaultCircleTestPoint={
};
defaultCircleTestPoint.x=0, defaultCircleTestPoint.y=0;
function isPointInCircle(point=defaultCircleTestPoint, centerX, centerY, radius){
  const distanceSquared=((((((point.x)-(centerX)))**(2)))+(((((point.y)-(centerY)))**(2))));
  return ((distanceSquared)<=(((radius)**(2))));
}
const defaultClientPoint={
};
defaultClientPoint.x=0, defaultClientPoint.y=0;
function translateXYToElement(clientPoint=defaultClientPoint, element={
}, scale=1){
  const boundingRect=element.getBoundingClientRect();
  return{
    'x': ((((clientPoint.x)-(boundingRect.left)))*(scale)), 'y': ((((clientPoint.y)-(boundingRect.top)))*(scale))
  };
}
function getMouseButtonsPressed(mouseEvent={
}){
  return[1, 2, 4, 8, 16].filter(buttonMask=>mouseEvent.buttons&buttonMask);
}
function getAngle(x1, y1, x2, y2){
  const deltaX=((x1)-(x2)), deltaY=((y1)-(y2));
  let angleDegrees=Math.atan2(-deltaY, -deltaX);
  angleDegrees*=((180)/(Math.PI));
  if(((angleDegrees)<(0)))angleDegrees+=360;
  return angleDegrees;
}
const defaultPointA={
};
defaultPointA.x=0, defaultPointA.y=0;
const defaultPointB={
};
defaultPointB.x=0, defaultPointB.y=0;
function getDistanceBetweenPoints(pointA=defaultPointA, pointB=defaultPointB){
  return Math.hypot(((pointB.x)-(pointA.x)), ((pointB.y)-(pointA.y)));
}
function addAngle(angle=0, amount=0){
  const sum=((angle)+(amount));
  let normalizedAngle;
  ((sum)>(0))? normalizedAngle=((sum)%(360)): normalizedAngle=((360)+(((sum)%(360))));
  if(((normalizedAngle)===(360)))normalizedAngle=0;
  return normalizedAngle;
}
function diffAngle(fromAngle=0, toAngle=0){
  const inverseTargetOffset=((180)-(toAngle)), normalizedDifferenceBase=((addAngle)((fromAngle), (inverseTargetOffset)));
  return ((180)-(normalizedDifferenceBase));
}
function calcWheelRotationForTargetAngle(currentRotation=0, targetAngle=0, direction=1){
  let rotationAdjustment=((((((currentRotation)%(360)))+(targetAngle)))%(360));
  rotationAdjustment=((fixFloat)(rotationAdjustment));
  return rotationAdjustment=((((direction)===(1))? ((360)-(rotationAdjustment)): ((360)+(rotationAdjustment)))%(360)), rotationAdjustment*=direction, ((currentRotation)+(rotationAdjustment));
}
function isObject(value){
  return ((typeof value)===("object"))&&!Array.isArray(value)&&((value)!==(null));
}
function isNumber(value){
  return ((typeof value)===("number"))&&!Number.isNaN(value);
}
function setProp({
  val: value, isValid: isValid, errorMessage: errorMessage, defaultValue: defaultValue, action: action=null
}){
  if(isValid){
    return action? ((action)()): value;
  } else{
    if(((value)===(void(0))))return defaultValue;
  }
  throw new Error(errorMessage);
}
function fixFloat(value=0){
  return ((Number)((value.toFixed(9))));
}
function easeSinOut(progress){
  return Math.sin(((((progress)*(Math.PI)))/(2)));
}
function getResizeObserver(element={
}, callback={
}){
  if(window.ResizeObserver){
    {
      const resizeObserver=new ResizeObserver(()=>{
        const callbackOptions={
        };callbackOptions.redraw=true;((callback)(callbackOptions));
      });
      return resizeObserver.observe(element),{
        'stop': ()=>{
          resizeObserver.unobserve(element);
          resizeObserver.disconnect();
        }
      };
    }
  }
  return window.addEventListener("resize", callback),{
    'stop': ()=>{
      window.removeEventListener("resize", callback);
    }
  };
}
var arcAdjust=-90, baseCanvasSize=500, dragCapturePeriod=250;
const alignTextValues={
};
alignTextValues.left="left", alignTextValues.right="right", alignTextValues.center="center";
var AlignText=Object.freeze(alignTextValues);
const defaultWheelOffset={
};
defaultWheelOffset.x=0, defaultWheelOffset.y=0;
const wheelDefaults={
};
wheelDefaults.borderColor="#000", wheelDefaults.borderWidth=1, wheelDefaults.debug=false, wheelDefaults.image=null, wheelDefaults.isInteractive=true, wheelDefaults.itemBackgroundColors=["#fff"], wheelDefaults.itemLabelAlign=AlignText.right, wheelDefaults.itemLabelBaselineOffset=0, wheelDefaults.itemLabelColors=["#000"], wheelDefaults.itemLabelFont="sans-serif", wheelDefaults.itemLabelFontSizeMax=baseCanvasSize, wheelDefaults.itemLabelRadius=0.85, wheelDefaults.itemLabelRadiusMax=0.2, wheelDefaults.itemLabelRotation=0, wheelDefaults.itemLabelStrokeColor="#fff", wheelDefaults.itemLabelStrokeWidth=0, wheelDefaults.items=[], wheelDefaults.lineColor="#000", wheelDefaults.lineWidth=1, wheelDefaults.pixelRatio=0, wheelDefaults.radius=0.95, wheelDefaults.rotation=0, wheelDefaults.rotationResistance=-(35), wheelDefaults.rotationSpeedMax=0x12c, wheelDefaults.offset=defaultWheelOffset, wheelDefaults.onCurrentIndexChange=null, wheelDefaults.onRest=null, wheelDefaults.onSpin=null, wheelDefaults.overlayImage=null, wheelDefaults.pointerAngle=0;
const itemDefaults={
};
itemDefaults.backgroundColor=null, itemDefaults.image=null, itemDefaults.imageOpacity=1, itemDefaults.imageRadius=0.5, itemDefaults.imageRotation=0, itemDefaults.imageScale=1, itemDefaults.label='', itemDefaults.labelColor=null, itemDefaults.value=null, itemDefaults.weight=1;
const defaults={
};
defaults.wheel=wheelDefaults, defaults.item=itemDefaults;
var Defaults=Object.freeze(defaults);
const debuggingValues={
};
debuggingValues.pointerLineColor="#ff00ff", debuggingValues.labelBoundingBoxColor="#ff00ff", debuggingValues.labelRadiusColor="#00ff00", debuggingValues.dragPointHue=0x12c;
var Debugging=Object.freeze(debuggingValues);
function register(wheel={
}){
  ((registerPointerEvents)(wheel));
  wheel._handler_onResize=((getResizeObserver)((wheel._canvasContainer), (({
    redraw: redraw=true
  })=>{
    {
      wheel.resize();if(redraw)wheel.draw(performance.now());
    }
  })));
  const registerDevicePixelRatioListener=()=>{
    wheel._mediaQueryList=window.matchMedia("(resolution: "+window.devicePixelRatio+"dppx)");
    const listenerOptions={
    };
    listenerOptions.once=true, wheel._mediaQueryList.addEventListener("change", wheel._handler_onDevicePixelRatioChange, listenerOptions);
  };
  wheel._handler_onDevicePixelRatioChange=()=>{
    wheel.resize();
    ((registerDevicePixelRatioListener)());
  }, ((registerDevicePixelRatioListener)());
}
function unregister(wheel={
}){
  const canvas=wheel.canvas;
  (("PointerEvent") in (window))? (canvas.removeEventListener("pointerdown", wheel._handler_onPointerDown), canvas.removeEventListener("pointermove", wheel._handler_onPointerMoveRefreshCursor)): (canvas.removeEventListener("touchstart", wheel._handler_onTouchStart), canvas.removeEventListener("mousedown", wheel._handler_onMouseDown), canvas.removeEventListener("mousemove", wheel._handler_onMouseMoveRefreshCursor));
  wheel._handler_onResize.stop();
  wheel._mediaQueryList.removeEventListener("change", wheel._handler_onDevicePixelRatioChange);
}
function registerPointerEvents(wheel={
}){
  const canvas=wheel.canvas;
  wheel._handler_onPointerMoveRefreshCursor=(pointerEvent={
  })=>{
    {
      const pointerPosition={
      };
      pointerPosition.x=pointerEvent.clientX, pointerPosition.y=pointerEvent.clientY;
      const point=pointerPosition;
      wheel._isCursorOverWheel=wheel.wheelHitTest(point), wheel.refreshCursor();
    }
  }, wheel._handler_onMouseMoveRefreshCursor=(mouseEvent={
  })=>{
    const mousePosition={
    };
    mousePosition.x=mouseEvent.clientX, mousePosition.y=mouseEvent.clientY;
    const point=mousePosition;
    wheel._isCursorOverWheel=wheel.wheelHitTest(point);
    wheel.refreshCursor();
  };
  wheel._handler_onPointerDown=(pointerDownEvent={
  })=>{
    const pointerPosition={
    };
    pointerPosition.x=pointerDownEvent.clientX, pointerPosition.y=pointerDownEvent.clientY;
    const dragStartPoint=pointerPosition;
    if(!wheel.isInteractive)return;
    if(!wheel.wheelHitTest(dragStartPoint))return;
    pointerDownEvent.preventDefault(), wheel.dragStart(dragStartPoint), canvas.setPointerCapture(pointerDownEvent.pointerId), canvas.addEventListener("pointermove", onPointerMove), canvas.addEventListener("pointerup", onPointerEnd), canvas.addEventListener("pointercancel", onPointerEnd), canvas.addEventListener("pointerout", onPointerEnd);
    function onPointerMove(pointerMoveEvent={
    }){
      pointerMoveEvent.preventDefault();
      const dragPoint={
      };
      dragPoint.x=pointerMoveEvent.clientX, dragPoint.y=pointerMoveEvent.clientY;
      wheel.dragMove(dragPoint);
    }
    function onPointerEnd(pointerEndEvent={
    }){
      pointerEndEvent.preventDefault();
      canvas.releasePointerCapture(pointerEndEvent.pointerId);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerEnd);
      canvas.removeEventListener("pointercancel", onPointerEnd);
      canvas.removeEventListener("pointerout", onPointerEnd);
      wheel.dragEnd();
    }
  }, wheel._handler_onMouseDown=(mouseDownEvent={
  })=>{
    const mousePosition={
    };
    mousePosition.x=mouseDownEvent.clientX;
    mousePosition.y=mouseDownEvent.clientY;
    const dragStartPoint=mousePosition;
    if(!wheel.isInteractive)return;
    if(!wheel.wheelHitTest(dragStartPoint))return;
    wheel.dragStart(dragStartPoint), document.addEventListener("mousemove", onMouseMove), document.addEventListener("mouseup", onMouseUp);
    function onMouseMove(mouseMoveEvent={
    }){
      {
        mouseMoveEvent.preventDefault();
        const dragPoint={
        };
        dragPoint.x=mouseMoveEvent.clientX, dragPoint.y=mouseMoveEvent.clientY, wheel.dragMove(dragPoint);
      }
    }
    function onMouseUp(mouseUpEvent={
    }){
      mouseUpEvent.preventDefault(), document.removeEventListener("mousemove", onMouseMove), document.removeEventListener("mouseup", onMouseUp), wheel.dragEnd();
    }
  }, wheel._handler_onTouchStart=(touchStartEvent={
  })=>{
    const touchPosition={
    };
    touchPosition.x=touchStartEvent.targetTouches[0].clientX, touchPosition.y=touchStartEvent.targetTouches[0].clientY;
    const dragStartPoint=touchPosition;
    if(!wheel.isInteractive)return;
    if(!wheel.wheelHitTest(dragStartPoint))return;
    touchStartEvent.preventDefault(), wheel.dragStart(dragStartPoint), canvas.addEventListener("touchmove", onTouchMove), canvas.addEventListener("touchend", onTouchEnd), canvas.addEventListener("touchcancel", onTouchEnd);
    function onTouchMove(touchMoveEvent={
    }){
      {
        touchMoveEvent.preventDefault();
        const dragPoint={
        };
        dragPoint.x=touchMoveEvent.targetTouches[0].clientX, dragPoint.y=touchMoveEvent.targetTouches[0].clientY, wheel.dragMove(dragPoint);
      }
    }
    function onTouchEnd(touchEndEvent={
    }){
      touchEndEvent.preventDefault();
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      wheel.dragEnd();
    }
  }, (("PointerEvent") in (window))? (canvas.addEventListener("pointerdown", wheel._handler_onPointerDown), canvas.addEventListener("pointermove", wheel._handler_onPointerMoveRefreshCursor)): (canvas.addEventListener("touchstart", wheel._handler_onTouchStart), canvas.addEventListener("mousedown", wheel._handler_onMouseDown), canvas.addEventListener("mousemove", wheel._handler_onMouseMoveRefreshCursor));
}
var Item=class{
  constructor(wheel, props={
  }){
    if(!((isObject)(wheel)))throw new Error("wheel must be an instance of Wheel");
    if(!((isObject)(props))&&((props)!==(null)))throw new Error("props must be an Object or null");
    this._wheel=wheel;
    for(const propertyName of Object.keys(Defaults.item)){
      this[(('_')+(propertyName))]=Defaults.item[propertyName];
    }
    if(props){
      this.init(props);
    } else this.init(Defaults.item);
  }
  init(props={
  }){
    this.backgroundColor=props.backgroundColor;
    this.image=props.image;
    this.imageOpacity=props.imageOpacity;
    this.imageRadius=props.imageRadius;
    this.imageRotation=props.imageRotation;
    this.imageScale=props.imageScale;
    this.label=props.label;
    this.labelColor=props.labelColor;
    this.value=props.value;
    this.weight=props.weight;
  }
  get backgroundColor(){
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor){
    ((typeof backgroundColor)===("string"))? this._backgroundColor=backgroundColor: this._backgroundColor=Defaults.item.backgroundColor, this._wheel.refresh();
  }
  get image(){
    return this._image;
  }
  set image(image){
    if(((image) instanceof (HTMLImageElement))){
      this._image=image;
    } else this._image=Defaults.item.image;
    this._wheel.refresh();
  }
  get imageOpacity(){
    return this._imageOpacity;
  }
  set imageOpacity(imageOpacity){
    ((typeof imageOpacity)===("number"))? this._imageOpacity=imageOpacity: this._imageOpacity=Defaults.item.imageOpacity, this._wheel.refresh();
  }
  get imageRadius(){
    return this._imageRadius;
  }
  set imageRadius(imageRadius){
    if(((typeof imageRadius)===("number"))){
      this._imageRadius=imageRadius;
    } else{
      this._imageRadius=Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }
  get imageRotation(){
    return this._imageRotation;
  }
  set imageRotation(imageRotation){
    if(((typeof imageRotation)===("number")))this._imageRotation=imageRotation;
    else{
      this._imageRotation=Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }
  get imageScale(){
    return this._imageScale;
  }
  set imageScale(imageScale){
    ((typeof imageScale)===("number"))? this._imageScale=imageScale: this._imageScale=Defaults.item.imageScale, this._wheel.refresh();
  }
  get label(){
    return this._label;
  }
  set label(label){
    ((typeof label)===("string"))? this._label=label: this._label=Defaults.item.label, this._wheel.refresh();
  }
  get labelColor(){
    return this._labelColor;
  }
  set labelColor(labelColor){
    if(((typeof labelColor)===("string"))){
      this._labelColor=labelColor;
    } else{
      this._labelColor=Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }
  get value(){
    return this._value;
  }
  set value(value){
    ((value)!==(void(0)))? this._value=value: this._value=Defaults.item.value;
  }
  get weight(){
    return this._weight;
  }
  set weight(weight){
    if(((typeof weight)===("number"))){
      this._weight=weight;
    } else this._weight=Defaults.item.weight;
  }
  getIndex(){
    const itemIndex=this._wheel.items.findIndex(item=>item===this);
    if(((itemIndex)===(-1)))throw new Error("Item not found in parent Wheel");
    return itemIndex;
  }
  getCenterAngle(){
    const itemAngle=this._wheel.getItemAngles()[this.getIndex()];
    return ((itemAngle.start)+(((((itemAngle.end)-(itemAngle.start)))/(2))));
  }
  getStartAngle(){
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }
  getEndAngle(){
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }
  getRandomAngle(){
    return ((getRandomFloat)((this.getStartAngle()), (this.getEndAngle())));
  }
};
const defaultHitTestPoint={
};
defaultHitTestPoint.x=0, defaultHitTestPoint.y=0;
const defaultAnglePoint={
};
defaultAnglePoint.x=0, defaultAnglePoint.y=0;
const defaultDragStartPoint={
};
defaultDragStartPoint.x=0, defaultDragStartPoint.y=0;
const defaultDragMovePoint={
};
defaultDragMovePoint.x=0, defaultDragMovePoint.y=0;
var Wheel=class{
  constructor(container, props={
  }){
    if(!((container) instanceof (Element)))throw new Error("container must be an instance of Element");
    if(!((isObject)(props))&&((props)!==(null)))throw new Error("props must be an Object or null");
    this._frameRequestId=null;
    this._rotationSpeed=0;
    this._rotationDirection=1, this._spinToTimeEnd=null, this._lastSpinFrameTime=null, this._isCursorOverWheel=false, this.add(container);
    for(const propertyName of Object.keys(Defaults.wheel)){
      this[(('_')+(propertyName))]=Defaults.wheel[propertyName];
    }
    props? this.init(props): this.init(Defaults.wheel);
  }
  init(props={
  }){
    this._isInitialising=true;
    this.borderColor=props.borderColor;
    this.borderWidth=props.borderWidth;
    this.debug=props.debug;
    this.image=props.image;
    this.isInteractive=props.isInteractive;
    this.itemBackgroundColors=props.itemBackgroundColors;
    this.itemLabelAlign=props.itemLabelAlign;
    this.itemLabelBaselineOffset=props.itemLabelBaselineOffset;
    this.itemLabelColors=props.itemLabelColors;
    this.itemLabelFont=props.itemLabelFont;
    this.itemLabelFontSizeMax=props.itemLabelFontSizeMax;
    this.itemLabelRadius=props.itemLabelRadius;
    this.itemLabelRadiusMax=props.itemLabelRadiusMax;
    this.itemLabelRotation=props.itemLabelRotation;
    this.itemLabelStrokeColor=props.itemLabelStrokeColor;
    this.itemLabelStrokeWidth=props.itemLabelStrokeWidth;
    this.items=props.items;
    this.lineColor=props.lineColor;
    this.lineWidth=props.lineWidth;
    this.pixelRatio=props.pixelRatio;
    this.rotationSpeedMax=props.rotationSpeedMax;
    this.radius=props.radius;
    this.rotation=props.rotation;
    this.rotationResistance=props.rotationResistance;
    this.offset=props.offset;
    this.onCurrentIndexChange=props.onCurrentIndexChange;
    this.onRest=props.onRest;
    this.onSpin=props.onSpin;
    this.overlayImage=props.overlayImage;
    this.pointerAngle=props.pointerAngle;
  }
  add(container){
    this._canvasContainer=container;
    this.canvas=document.createElement("canvas");
    this.canvas.style.display="block";
    this._context=this.canvas.getContext('2d');
    this._canvasContainer.append(this.canvas);
    ((register)(this));
    if(((this._isInitialising)===false))this.resize();
  }
  remove(){
    if(((this.canvas)===(null)))return;
    if(((this._frameRequestId)!==(null)))window.cancelAnimationFrame(this._frameRequestId);
    ((unregister)(this));
    this._canvasContainer.removeChild(this.canvas);
    this._canvasContainer=null;
    this.canvas=null;
    this._context=null;
  }
  resize(){
    if(((this.canvas)===(null)))return;
    this.canvas.style.width=((this._canvasContainer.clientWidth)+('px'));
    this.canvas.style.height=((this._canvasContainer.clientHeight)+('px'));
    const [canvasWidth, canvasHeight]=[((this._canvasContainer.clientWidth)*(this.getActualPixelRatio())), ((this._canvasContainer.clientHeight)*(this.getActualPixelRatio()))];
    this.canvas.width=canvasWidth, this.canvas.height=canvasHeight;
    const baseSize=Math.min(canvasWidth, canvasHeight), offsetAdjustedSize={
      'w': ((baseSize)-(((baseSize)*(this._offset.x)))), 'h': ((baseSize)-(((baseSize)*(this._offset.y))))
    }, fitScale=Math.min(((canvasWidth)/(offsetAdjustedSize.w)), ((canvasHeight)/(offsetAdjustedSize.h)));
    this._size=Math.max(((offsetAdjustedSize.w)*(fitScale)), ((offsetAdjustedSize.h)*(fitScale))), this._center={
      'x': ((((canvasWidth)/(2)))+(((canvasWidth)*(this._offset.x)))), 'y': ((((canvasHeight)/(2)))+(((canvasHeight)*(this._offset.y))))
    }, this._actualRadius=((((this._size)/(2)))*(this.radius)), this._itemLabelFontSize=((this.itemLabelFontSizeMax)*(((this._size)/(baseCanvasSize)))), this._labelMaxWidth=((this._actualRadius)*(((this.itemLabelRadius)-(this.itemLabelRadiusMax))));
    if(((this.itemLabelAlign)===("center"))){
      this._labelMaxWidth*=2;
    }
    for(const item of this._items){
      this._itemLabelFontSize=Math.min(this._itemLabelFontSize, ((getFontSizeToFit)((item.label), (this.itemLabelFont), (this._labelMaxWidth), (this._context))));
    }
    this.refresh();
  }
  draw(frameTimestamp=0){
    this._frameRequestId=null;
    if(((this._context)===(null))||((this.canvas)===(null)))return;
    const context=this._context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.animateRotation(frameTimestamp);
    const itemAngles=this.getItemAngles(this._rotation), borderWidthPx=this.getScaledNumber(this._borderWidth);
    context.textBaseline="middle";
    context.textAlign=this.itemLabelAlign, context.font=((((this._itemLabelFontSize)+("px ")))+(this.itemLabelFont));
    for(const [itemIndex, itemAngle]of itemAngles.entries()){
      {
        const item=this._items[itemIndex], itemPath=new Path2D();
        itemPath.moveTo(this._center.x, this._center.y), itemPath.arc(this._center.x, this._center.y, ((this._actualRadius)-(((borderWidthPx)/(2)))), ((degRad)((((itemAngle.start)+(arcAdjust))))), ((degRad)((((itemAngle.end)+(arcAdjust)))))), item.path=itemPath;
      }
    }
    this.drawItemBackgrounds(context, itemAngles), this.drawItemImages(context, itemAngles), this.drawItemLines(context, itemAngles), this.drawItemLabels(context, itemAngles), this.drawBorder(context), this.drawImage(context, this._image, false), this.drawImage(context, this._overlayImage, true), this.drawDebugPointerLine(context), this._isInitialising=false;
  }
  drawItemBackgrounds(context, itemAngles=[]){
    for(const [itemIndex, itemAngle]of itemAngles.entries()){
      const item=this._items[itemIndex];
      context.fillStyle=item.backgroundColor?? this._itemBackgroundColors[((itemIndex)%(this._itemBackgroundColors.length))], context.fill(item.path);
    }
  }
  drawItemImages(context, itemAngles=[]){
    for(const [itemIndex, itemAngle]of itemAngles.entries()){
      const item=this._items[itemIndex];
      if(((item.image)===(null)))continue;
      context.save(), context.clip(item.path);
      const itemCenterAngle=((itemAngle.start)+(((((itemAngle.end)-(itemAngle.start)))/(2))));
      context.translate(((this._center.x)+(((Math.cos(((degRad)((((itemCenterAngle)+(arcAdjust)))))))*(((this._actualRadius)*(item.imageRadius)))))), ((this._center.y)+(((Math.sin(((degRad)((((itemCenterAngle)+(arcAdjust)))))))*(((this._actualRadius)*(item.imageRadius))))))), context.rotate(((degRad)((((itemCenterAngle)+(item.imageRotation)))))), context.globalAlpha=item.imageOpacity;
      const imageWidth=((((((this._size)/(500)))*(item.image.width)))*(item.imageScale)), imageHeight=((((((this._size)/(500)))*(item.image.height)))*(item.imageScale)), imageX=((-imageWidth)/(2)), imageY=((-imageHeight)/(2));
      context.drawImage(item.image, imageX, imageY, imageWidth, imageHeight), context.restore();
    }
  }
  drawImage(context, image, isOverlay=false){
    if(((image)===(null)))return;
    context.translate(this._center.x, this._center.y);
    if(!isOverlay)context.rotate(((degRad)(this._rotation)));
    const imageSize=isOverlay? this._size: ((this._size)*(this.radius)), imageOffset=-((imageSize)/(2));
    context.drawImage(image, imageOffset, imageOffset, imageSize, imageSize), context.resetTransform();
  }
  drawDebugPointerLine(context){
    if(!this.debug)return;
    context.translate(this._center.x, this._center.y);
    context.rotate(((degRad)((((this._pointerAngle)+(arcAdjust))))));
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(((this._actualRadius)*(2)), 0);
    context.strokeStyle=Debugging.pointerLineColor;
    context.lineWidth=this.getScaledNumber(2);
    context.stroke();
    context.resetTransform();
  }
  drawBorder(context){
    if(((this._borderWidth)<=(0)))return;
    const borderWidthPx=this.getScaledNumber(this._borderWidth);
    const borderColor=this._borderColor||"transparent";
    context.beginPath(), context.strokeStyle=borderColor, context.lineWidth=borderWidthPx, context.arc(this._center.x, this._center.y, ((this._actualRadius)-(((borderWidthPx)/(2)))), 0, ((2)*(Math.PI))), context.stroke();
    if(this.debug){
      {
        const debugLineWidthPx=this.getScaledNumber(1);
        context.beginPath(), context.strokeStyle=context.strokeStyle=Debugging.labelRadiusColor, context.lineWidth=debugLineWidthPx, context.arc(this._center.x, this._center.y, ((this._actualRadius)*(this.itemLabelRadius)), 0, ((2)*(Math.PI))), context.stroke(), context.beginPath(), context.strokeStyle=context.strokeStyle=Debugging.labelRadiusColor, context.lineWidth=debugLineWidthPx, context.arc(this._center.x, this._center.y, ((this._actualRadius)*(this.itemLabelRadiusMax)), 0, ((2)*(Math.PI))), context.stroke();
      }
    }
  }
  drawItemLines(context, itemAngles=[]){
    if(((this._lineWidth)<=(0)))return;
    const lineWidthPx=this.getScaledNumber(this._lineWidth), borderWidthPx=this.getScaledNumber(this._borderWidth);
    context.translate(this._center.x, this._center.y);
    for(const itemAngle of itemAngles){
      context.rotate(((degRad)((((itemAngle.start)+(arcAdjust))))));
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(((this._actualRadius)-(borderWidthPx)), 0);
      context.strokeStyle=this.lineColor;
      context.lineWidth=lineWidthPx;
      context.stroke();
      context.rotate(-((degRad)((((itemAngle.start)+(arcAdjust))))));
    }
    context.resetTransform();
  }
  drawItemLabels(context, itemAngles=[]){
    const labelBaselineY=((this._itemLabelFontSize)*(-this.itemLabelBaselineOffset)), debugLineWidthPx=this.getScaledNumber(1);
    const labelStrokeWidthPx=this.getScaledNumber(((this._itemLabelStrokeWidth)*(2)));
    for(const [itemIndex, itemAngle]of itemAngles.entries()){
      const item=this._items[itemIndex], labelColor=item.labelColor||(this._itemLabelColors[((itemIndex)%(this._itemLabelColors.length))]||"transparent");
      if(((item.label.trim())===(''))||((labelColor)===("transparent")))continue;
      context.save(), context.clip(item.path);
      const itemCenterAngle=((itemAngle.start)+(((((itemAngle.end)-(itemAngle.start)))/(2))));
      context.translate(((this._center.x)+(((Math.cos(((degRad)((((itemCenterAngle)+(arcAdjust)))))))*(((this._actualRadius)*(this.itemLabelRadius)))))), ((this._center.y)+(((Math.sin(((degRad)((((itemCenterAngle)+(arcAdjust)))))))*(((this._actualRadius)*(this.itemLabelRadius))))))), context.rotate(((degRad)((((itemCenterAngle)+(arcAdjust)))))), context.rotate(((degRad)(this.itemLabelRotation)));
      if(this.debug){
        {
          context.save();
          let labelBoxAnchorX=0;
          if(((this.itemLabelAlign)===("left")))labelBoxAnchorX=this._labelMaxWidth;
          else ((this.itemLabelAlign)===("center"))&&(labelBoxAnchorX=((this._labelMaxWidth)/(2)));
          context.beginPath(), context.moveTo(labelBoxAnchorX, 0), context.lineTo(((-this._labelMaxWidth)+(labelBoxAnchorX)), 0), context.strokeStyle=Debugging.labelBoundingBoxColor, context.lineWidth=debugLineWidthPx, context.stroke(), context.strokeRect(labelBoxAnchorX, ((-this._itemLabelFontSize)/(2)), -this._labelMaxWidth, this._itemLabelFontSize), context.restore();
        }
      }
      if(((this._itemLabelStrokeWidth)>(0))){
        context.lineWidth=labelStrokeWidthPx, context.strokeStyle=this._itemLabelStrokeColor, context.lineJoin="round", context.strokeText(item.label, 0, labelBaselineY);
      }
      context.fillStyle=labelColor, context.fillText(item.label, 0, labelBaselineY);
      if(this.debug){
        {
          const debugPointRadius=this.getScaledNumber(2);
          context.beginPath(), context.arc(0, 0, debugPointRadius, 0, ((2)*(Math.PI))), context.fillStyle=Debugging.labelRadiusColor, context.fill();
        }
      }
      context.restore();
    }
  }
  drawDebugDragPoints(context){
    if(!this.debug||!this._dragEvents?.["length"])return;
    const reversedDragEvents=[...this._dragEvents].reverse(), lineWidthPx=this.getScaledNumber(0.5), pointRadius=this.getScaledNumber(4);
    for(const [eventIndex, dragEvent]of reversedDragEvents.entries()){
      {
        const lightnessPercent=((((eventIndex)/(this._dragEvents.length)))*(100));
        context.beginPath(), context.arc(dragEvent.x, dragEvent.y, pointRadius, 0, ((2)*(Math.PI))), context.fillStyle="hsl("+Debugging.dragPointHue+",100%,"+lightnessPercent+'%)', context.strokeStyle="#000", context.lineWidth=lineWidthPx, context.fill(), context.stroke();
      }
    }
  }
  animateRotation(frameTimestamp=0){
    if(((this._spinToTimeEnd)!==(null))){
      {
        if(((frameTimestamp)>=(this._spinToTimeEnd))){
          this.rotation=this._spinToEndRotation, this._spinToTimeEnd=null, this.raiseEvent_onRest();
          return;
        }
        const animationDuration=((this._spinToTimeEnd)-(this._spinToTimeStart));
        let progress=((((frameTimestamp)-(this._spinToTimeStart)))/(animationDuration));
        progress=((progress)<(0))? 0: progress;
        const rotationDelta=((this._spinToEndRotation)-(this._spinToStartRotation));
        this.rotation=((this._spinToStartRotation)+(((rotationDelta)*(this._spinToEasingFunction(progress))))), this.refresh();
        return;
      }
    }
    if(((this._lastSpinFrameTime)!==(null))){
      const elapsedMs=((frameTimestamp)-(this._lastSpinFrameTime));
      if(((elapsedMs)>(0))){
        this.rotation+=((((((elapsedMs)/(1000)))*(this._rotationSpeed)))%(360)), this._rotationSpeed=this.getRotationSpeedPlusDrag(elapsedMs), ((this._rotationSpeed)===(0))? (this.raiseEvent_onRest(), this._lastSpinFrameTime=null): this._lastSpinFrameTime=frameTimestamp;
      }
      this.refresh();
      return;
    }
  }
  getRotationSpeedPlusDrag(elapsedMs=0){
    const nextRotationSpeed=((this._rotationSpeed)+(((((this.rotationResistance)*(((elapsedMs)/(1000)))))*(this._rotationDirection))));
    if(((this._rotationDirection)===(1))&&((nextRotationSpeed)<(0))||((this._rotationDirection)===(-1))&&((nextRotationSpeed)>=(0)))return 0;
    return nextRotationSpeed;
  }
  spin(rotationSpeed=0){
    if(!((isNumber)(rotationSpeed)))throw new Error("rotationSpeed must be a number");
    this._dragEvents=[], this.beginSpin(rotationSpeed, "spin");
  }
  spinTo(targetRotation=0, duration=0, easingFunction=null){
    if(!((isNumber)(targetRotation)))throw new Error("Error: rotation must be a number");
    if(!((isNumber)(duration)))throw new Error("Error: duration must be a number");
    this.stop();
    this._dragEvents=[];
    this.animate(targetRotation, duration, easingFunction);
    const spinEvent={
    };
    spinEvent.method="spinto", spinEvent.targetRotation=targetRotation, spinEvent.duration=duration, this.raiseEvent_onSpin(spinEvent);
  }
  spinToItem(targetItemIndex=0, duration=0, landOnCenter=true, revolutions=1, direction=1, easingFunction=null){
    this.stop(), this._dragEvents=[];
    const targetItemAngle=landOnCenter? this.items[targetItemIndex].getCenterAngle(): this.items[targetItemIndex].getRandomAngle();
    let targetRotation=((calcWheelRotationForTargetAngle)((this.rotation), (((targetItemAngle)-(this._pointerAngle))), (direction)));
    targetRotation+=((((revolutions)*(360)))*(direction)), this.animate(targetRotation, duration, easingFunction);
    const spinEvent={
    };
    spinEvent.method="spintoitem", spinEvent.targetItemIndex=targetItemIndex, spinEvent.targetRotation=targetRotation, spinEvent.duration=duration;
    this.raiseEvent_onSpin(spinEvent);
  }
  animate(targetRotation, duration, easingFunction){
    this._spinToStartRotation=this.rotation;
    this._spinToEndRotation=targetRotation;
    this._spinToTimeStart=performance.now();
    this._spinToTimeEnd=((this._spinToTimeStart)+(duration));
    this._spinToEasingFunction=((easingFunction)||(easeSinOut));
    this.refresh();
  }
  stop(){
    this._spinToTimeEnd=null;
    this._rotationSpeed=0, this._lastSpinFrameTime=null;
  }
  getScaledNumber(value){
    return ((((value)/(baseCanvasSize)))*(this._size));
  }
  getActualPixelRatio(){
    return ((this._pixelRatio)!==(0))? this._pixelRatio: window.devicePixelRatio;
  }
  wheelHitTest(clientPoint=defaultHitTestPoint){
    if(((this.canvas)===(null)))return false;
    const canvasPoint=((translateXYToElement)((clientPoint), (this.canvas), (this.getActualPixelRatio())));
    return ((isPointInCircle)((canvasPoint), (this._center.x), (this._center.y), (this._actualRadius)));
  }
  refreshCursor(){
    if(((this.canvas)===(null)))return;
    if(this.isInteractive){
      {
        if(this.isDragging){
          {
            this.canvas.style.cursor="grabbing";
            return;
          }
        }
        if(this._isCursorOverWheel){
          {
            this.canvas.style.cursor="grab";
            return;
          }
        }
      }
    }
    this.canvas.style.cursor='';
  }
  getAngleFromCenter(point=defaultAnglePoint){
    return ((((((getAngle)((this._center.x), (this._center.y), (point.x), (point.y))))+(90)))%(360));
  }
  getCurrentIndex(){
    return this._currentIndex;
  }
  refreshCurrentIndex(itemAngles=[]){
    if(((this._items.length)===(0)))this._currentIndex=-1;
    for(const [itemIndex, itemAngle]of itemAngles.entries()){
      {
        if(!((isAngleBetween)((this._pointerAngle), (((itemAngle.start)%(360))), (((itemAngle.end)%(360))))))continue;
        if(((this._currentIndex)===(itemIndex)))break;
        this._currentIndex=itemIndex;
        if(!this._isInitialising)this.raiseEvent_onCurrentIndexChange();
        break;
      }
    }
  }
  getItemAngles(startRotation=0){
    let totalWeight=0;
    for(const item of this.items){
      totalWeight+=item.weight;
    }
    const degreesPerWeight=((360)/(totalWeight));
    let itemArc, currentStartAngle=startRotation;
    const itemAngles=[];
    for(const item of this._items){
      itemArc=((item.weight)*(degreesPerWeight)), itemAngles.push({
        'start': currentStartAngle, 'end': ((currentStartAngle)+(itemArc))
      }), currentStartAngle+=itemArc;
    }
    return ((this._items.length)>(1))&&(itemAngles[((itemAngles.length)-1)].end=((itemAngles[0].start)+(360))), itemAngles;
  }
  refresh(){
    ((this._frameRequestId)===(null))&&(this._frameRequestId=window.requestAnimationFrame(frameTimestamp=>this.draw(frameTimestamp)));
  }
  limitSpeed(speed=0, maxAbsoluteSpeed=0){
    const upperClampedSpeed=Math.min(speed, maxAbsoluteSpeed);
    return Math.max(upperClampedSpeed, -maxAbsoluteSpeed);
  }
  beginSpin(rotationSpeed=0, method=''){
    this.stop();
    this._rotationSpeed=this.limitSpeed(rotationSpeed, this._rotationSpeedMax);
    this._lastSpinFrameTime=performance.now();
    this._rotationDirection=((this._rotationSpeed)>=(0))? 1: -1;
    ((this._rotationSpeed)!==(0))&&this.raiseEvent_onSpin({
      'method': method, 'rotationSpeed': this._rotationSpeed, 'rotationResistance': this._rotationResistance
    });
    this.refresh();
  }
  refreshAriaLabel(){
    if(((this.canvas)===(null)))return;
    this.canvas.setAttribute("role", "img");
    const sliceCountDescription=((this.items.length)>=(2))? " The wheel has "+this.items.length+" slices.": '';
    this.canvas.setAttribute("aria-label", (("An image of a spinning prize wheel.")+(sliceCountDescription)));
  }
  get borderColor(){
    return this._borderColor;
  }
  set borderColor(borderColor){
    this._borderColor=((setProp)(({
      'val': borderColor, 'isValid': ((typeof borderColor)===("string")), 'errorMessage': "Wheel.borderColor must be a string", 'defaultValue': Defaults.wheel.borderColor
    }))), this.refresh();
  }
  get borderWidth(){
    return this._borderWidth;
  }
  set borderWidth(borderWidth){
    this._borderWidth=((setProp)(({
      'val': borderWidth, 'isValid': ((isNumber)(borderWidth)), 'errorMessage': "Wheel.borderWidth must be a number", 'defaultValue': Defaults.wheel.borderWidth
    })));
    this.refresh();
  }
  get debug(){
    return this._debug;
  }
  set debug(debug){
    this._debug=((setProp)(({
      'val': debug, 'isValid': ((typeof debug)===("boolean")), 'errorMessage': "Wheel.debug must be a boolean", 'defaultValue': Defaults.wheel.debug
    })));
    this.refresh();
  }
  get image(){
    return this._image;
  }
  set image(image){
    this._image=((setProp)(({
      'val': image, 'isValid': ((image) instanceof (HTMLImageElement))||((image)===(null)), 'errorMessage': "Wheel.image must be a HTMLImageElement or null", 'defaultValue': Defaults.wheel.image
    })));
    this.refresh();
  }
  get isInteractive(){
    return this._isInteractive;
  }
  set isInteractive(isInteractive){
    this._isInteractive=((setProp)(({
      'val': isInteractive, 'isValid': ((typeof isInteractive)===("boolean")), 'errorMessage': "Wheel.isInteractive must be a boolean", 'defaultValue': Defaults.wheel.isInteractive
    }))), this.refreshCursor();
  }
  get itemBackgroundColors(){
    return this._itemBackgroundColors;
  }
  set itemBackgroundColors(itemBackgroundColors){
    this._itemBackgroundColors=((setProp)(({
      'val': itemBackgroundColors, 'isValid': Array.isArray(itemBackgroundColors), 'errorMessage': "Wheel.itemBackgroundColors must be an array", 'defaultValue': Defaults.wheel.itemBackgroundColors
    })));
    this.refresh();
  }
  get itemLabelAlign(){
    return this._itemLabelAlign;
  }
  set itemLabelAlign(itemLabelAlign){
    this._itemLabelAlign=((setProp)(({
      'val': itemLabelAlign, 'isValid': ((typeof itemLabelAlign)===("string"))&&(((itemLabelAlign)===(AlignText.left))||((itemLabelAlign)===(AlignText.right))||((itemLabelAlign)===(AlignText.center))), 'errorMessage': "Wheel.itemLabelAlign must be one of Constants.AlignText", 'defaultValue': Defaults.wheel.itemLabelAlign
    })));
    this.resize();
  }
  get itemLabelBaselineOffset(){
    return this._itemLabelBaselineOffset;
  }
  set itemLabelBaselineOffset(itemLabelBaselineOffset){
    this._itemLabelBaselineOffset=((setProp)(({
      'val': itemLabelBaselineOffset, 'isValid': ((isNumber)(itemLabelBaselineOffset)), 'errorMessage': "Wheel.itemLabelBaselineOffset must be a number", 'defaultValue': Defaults.wheel.itemLabelBaselineOffset
    }))), this.resize();
  }
  get itemLabelColors(){
    return this._itemLabelColors;
  }
  set itemLabelColors(itemLabelColors){
    this._itemLabelColors=((setProp)(({
      'val': itemLabelColors, 'isValid': Array.isArray(itemLabelColors), 'errorMessage': "Wheel.itemLabelColors must be an array", 'defaultValue': Defaults.wheel.itemLabelColors
    }))), this.refresh();
  }
  get itemLabelFont(){
    return this._itemLabelFont;
  }
  set itemLabelFont(itemLabelFont){
    this._itemLabelFont=((setProp)(({
      'val': itemLabelFont, 'isValid': ((typeof itemLabelFont)===("string")), 'errorMessage': "Wheel.itemLabelFont must be a string", 'defaultValue': Defaults.wheel.itemLabelFont
    })));
    this.resize();
  }
  get itemLabelFontSizeMax(){
    return this._itemLabelFontSizeMax;
  }
  set itemLabelFontSizeMax(itemLabelFontSizeMax){
    this._itemLabelFontSizeMax=((setProp)(({
      'val': itemLabelFontSizeMax, 'isValid': ((isNumber)(itemLabelFontSizeMax)), 'errorMessage': "Wheel.itemLabelFontSizeMax must be a number", 'defaultValue': Defaults.wheel.itemLabelFontSizeMax
    }))), this.resize();
  }
  get itemLabelRadius(){
    return this._itemLabelRadius;
  }
  set itemLabelRadius(itemLabelRadius){
    this._itemLabelRadius=((setProp)(({
      'val': itemLabelRadius, 'isValid': ((isNumber)(itemLabelRadius)), 'errorMessage': "Wheel.itemLabelRadius must be a number", 'defaultValue': Defaults.wheel.itemLabelRadius
    })));
    this.resize();
  }
  get itemLabelRadiusMax(){
    return this._itemLabelRadiusMax;
  }
  set itemLabelRadiusMax(itemLabelRadiusMax){
    this._itemLabelRadiusMax=((setProp)(({
      'val': itemLabelRadiusMax, 'isValid': ((isNumber)(itemLabelRadiusMax)), 'errorMessage': "Wheel.itemLabelRadiusMax must be a number", 'defaultValue': Defaults.wheel.itemLabelRadiusMax
    })));
    this.resize();
  }
  get itemLabelRotation(){
    return this._itemLabelRotation;
  }
  set itemLabelRotation(itemLabelRotation){
    this._itemLabelRotation=((setProp)(({
      'val': itemLabelRotation, 'isValid': ((isNumber)(itemLabelRotation)), 'errorMessage': "Wheel.itemLabelRotation must be a number", 'defaultValue': Defaults.wheel.itemLabelRotation
    })));
    this.refresh();
  }
  get itemLabelStrokeColor(){
    return this._itemLabelStrokeColor;
  }
  set itemLabelStrokeColor(itemLabelStrokeColor){
    this._itemLabelStrokeColor=((setProp)(({
      'val': itemLabelStrokeColor, 'isValid': ((typeof itemLabelStrokeColor)===("string")), 'errorMessage': "Wheel.itemLabelStrokeColor must be a string", 'defaultValue': Defaults.wheel.itemLabelStrokeColor
    }))), this.refresh();
  }
  get itemLabelStrokeWidth(){
    return this._itemLabelStrokeWidth;
  }
  set itemLabelStrokeWidth(itemLabelStrokeWidth){
    this._itemLabelStrokeWidth=((setProp)(({
      'val': itemLabelStrokeWidth, 'isValid': ((isNumber)(itemLabelStrokeWidth)), 'errorMessage': "Wheel.itemLabelStrokeWidth must be a number", 'defaultValue': Defaults.wheel.itemLabelStrokeWidth
    }))), this.refresh();
  }
  get items(){
    return this._items;
  }
  set items(items){
    this._items=((setProp)(({
      'val': items, 'isValid': Array.isArray(items), 'errorMessage': "Wheel.items must be an array of Items", 'defaultValue': Defaults.wheel.items, 'action': ()=>{
        const itemInstances=[];for(const itemProps of items){
          itemInstances.push(new Item(this, itemProps));
        }
        return itemInstances;
      }
    }))), this.refreshAriaLabel(), this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.resize();
  }
  get lineColor(){
    return this._lineColor;
  }
  set lineColor(lineColor){
    this._lineColor=((setProp)(({
      'val': lineColor, 'isValid': ((typeof lineColor)===("string")), 'errorMessage': "Wheel.lineColor must be a string", 'defaultValue': Defaults.wheel.lineColor
    })));
    this.refresh();
  }
  get lineWidth(){
    return this._lineWidth;
  }
  set lineWidth(lineWidth){
    this._lineWidth=((setProp)(({
      'val': lineWidth, 'isValid': ((isNumber)(lineWidth)), 'errorMessage': "Wheel.lineWidth must be a number", 'defaultValue': Defaults.wheel.lineWidth
    })));
    this.refresh();
  }
  get offset(){
    return this._offset;
  }
  set offset(offset){
    this._offset=((setProp)(({
      'val': offset, 'isValid': ((isObject)(offset)), 'errorMessage': "Wheel.offset must be an object", 'defaultValue': Defaults.wheel.offset
    })));
    this.resize();
  }
  get onCurrentIndexChange(){
    return this._onCurrentIndexChange;
  }
  set onCurrentIndexChange(onCurrentIndexChange){
    this._onCurrentIndexChange=((setProp)(({
      'val': onCurrentIndexChange, 'isValid': ((typeof onCurrentIndexChange)===("function"))||((onCurrentIndexChange)===(null)), 'errorMessage': "Wheel.onCurrentIndexChange must be a function or null", 'defaultValue': Defaults.wheel.onCurrentIndexChange
    })));
  }
  get onRest(){
    return this._onRest;
  }
  set onRest(onRest){
    this._onRest=((setProp)(({
      'val': onRest, 'isValid': ((typeof onRest)===("function"))||((onRest)===(null)), 'errorMessage': "Wheel.onRest must be a function or null", 'defaultValue': Defaults.wheel.onRest
    })));
  }
  get onSpin(){
    return this._onSpin;
  }
  set onSpin(onSpin){
    this._onSpin=((setProp)(({
      'val': onSpin, 'isValid': ((typeof onSpin)===("function"))||((onSpin)===(null)), 'errorMessage': "Wheel.onSpin must be a function or null", 'defaultValue': Defaults.wheel.onSpin
    })));
  }
  get overlayImage(){
    return this._overlayImage;
  }
  set overlayImage(overlayImage){
    this._overlayImage=((setProp)(({
      'val': overlayImage, 'isValid': ((overlayImage) instanceof (HTMLImageElement))||((overlayImage)===(null)), 'errorMessage': "Wheel.overlayImage must be a HTMLImageElement or null", 'defaultValue': Defaults.wheel.overlayImage
    })));
    this.refresh();
  }
  get pixelRatio(){
    return this._pixelRatio;
  }
  set pixelRatio(pixelRatio){
    this._pixelRatio=((setProp)(({
      'val': pixelRatio, 'isValid': ((isNumber)(pixelRatio)), 'errorMessage': "Wheel.pixelRatio must be a number", 'defaultValue': Defaults.wheel.pixelRatio
    }))), this._dragEvents=[];
    this.resize();
  }
  get pointerAngle(){
    return this._pointerAngle;
  }
  set pointerAngle(pointerAngle){
    this._pointerAngle=((setProp)(({
      'val': pointerAngle, 'isValid': ((isNumber)(pointerAngle))&&((pointerAngle)>=(0)), 'errorMessage': "Wheel.pointerAngle must be a number between 0 and 360", 'defaultValue': Defaults.wheel.pointerAngle, 'action': ()=>pointerAngle%(360)
    })));
    if(this.debug)this.refresh();
  }
  get radius(){
    return this._radius;
  }
  set radius(radius){
    this._radius=((setProp)(({
      'val': radius, 'isValid': ((isNumber)(radius)), 'errorMessage': "Wheel.radius must be a number", 'defaultValue': Defaults.wheel.radius
    })));
    this.resize();
  }
  get rotation(){
    return this._rotation;
  }
  set rotation(rotation){
    this._rotation=((setProp)(({
      'val': rotation, 'isValid': ((isNumber)(rotation)), 'errorMessage': "Wheel.rotation must be a number", 'defaultValue': Defaults.wheel.rotation
    })));
    this.refreshCurrentIndex(this.getItemAngles(this._rotation)), this.refresh();
  }
  get rotationResistance(){
    return this._rotationResistance;
  }
  set rotationResistance(rotationResistance){
    this._rotationResistance=((setProp)(({
      'val': rotationResistance, 'isValid': ((isNumber)(rotationResistance)), 'errorMessage': "Wheel.rotationResistance must be a number", 'defaultValue': Defaults.wheel.rotationResistance
    })));
  }
  get rotationSpeed(){
    return this._rotationSpeed;
  }
  get rotationSpeedMax(){
    return this._rotationSpeedMax;
  }
  set rotationSpeedMax(rotationSpeedMax){
    this._rotationSpeedMax=((setProp)(({
      'val': rotationSpeedMax, 'isValid': ((isNumber)(rotationSpeedMax))&&((rotationSpeedMax)>=(0)), 'errorMessage': "Wheel.rotationSpeedMax must be a number >= 0", 'defaultValue': Defaults.wheel.rotationSpeedMax
    })));
  }
  dragStart(clientPoint=defaultDragStartPoint){
    if(((this.canvas)===(null)))return;
    const canvasPoint=((translateXYToElement)((clientPoint), (this.canvas), (this.getActualPixelRatio())));
    this.isDragging=true;
    this.stop(), this._dragEvents=[{
      'distance': 0, 'x': canvasPoint.x, 'y': canvasPoint.y, 'now': performance.now()
    }], this.refreshCursor();
  }
  dragMove(clientPoint=defaultDragMovePoint){
    if(((this.canvas)===(null)))return;
    const canvasPoint=((translateXYToElement)((clientPoint), (this.canvas), (this.getActualPixelRatio()))), currentAngle=this.getAngleFromCenter(canvasPoint);
    const previousDragEvent=this._dragEvents[0], previousAngle=this.getAngleFromCenter(previousDragEvent), angleDelta=((diffAngle)((previousAngle), (currentAngle)));
    this._dragEvents.unshift({
      'distance': angleDelta, 'x': canvasPoint.x, 'y': canvasPoint.y, 'now': performance.now()
    });
    if(this.debug&&((this._dragEvents.length)>=(40)))this._dragEvents.pop();
    this.rotation+=angleDelta;
  }
  dragEnd(){
    this.isDragging=false;
    let capturedAngleDelta=0;
    const now=performance.now();
    for(const [eventIndex, dragEvent]of this._dragEvents.entries()){
      {
        if(!this.isDragEventTooOld(now, dragEvent)){
          capturedAngleDelta+=dragEvent.distance;
          continue;
        }
        this._dragEvents.length=eventIndex;
        if(this.debug)this.refresh();
        break;
      }
    }
    this.refreshCursor();
    if(((capturedAngleDelta)===(0)))return;
    this.beginSpin(((capturedAngleDelta)*(((1000)/(dragCapturePeriod)))), "interact");
  }
  isDragEventTooOld(now=0, dragEvent={
  }){
    return ((((now)-(dragEvent.now)))>(dragCapturePeriod));
  }
  raiseEvent_onCurrentIndexChange(additionalEventData={
  }){
    this.onCurrentIndexChange?.({
      'type': "currentIndexChange", 'currentIndex': this._currentIndex, ...additionalEventData
    });
  }
  raiseEvent_onRest(additionalEventData={
  }){
    this.onRest?.({
      'type': "rest", 'currentIndex': this._currentIndex, 'rotation': this._rotation, ...additionalEventData
    });
  }
  raiseEvent_onSpin(additionalEventData={
  }){
    const event={
      'type': "spin", ...additionalEventData
    };
    this.onSpin?.(event);
  }
};
export{
  Wheel
};
