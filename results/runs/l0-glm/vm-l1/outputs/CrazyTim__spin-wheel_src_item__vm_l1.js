export class Item {
  constructor(options = {}) {
    this.init(options);
  }

  init(options = {}) {
    this.backgroundColor = options.backgroundColor ?? null;
    this.image = options.image ?? null;
    this.imageOpacity = options.imageOpacity ?? 1;
    this.imageRadius = options.imageRadius ?? 0.5;
    this.imageRotation = options.imageRotation ?? 0;
    this.imageScale = options.imageScale ?? 1;
    this.label = options.label ?? '';
    this.labelColor = options.labelColor ?? null;
    this.value = options.value ?? null;
    this.weight = options.weight ?? 1;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(value) {
    this._backgroundColor = value;
  }

  get image() {
    return this._image;
  }
  set image(value) {
    this._image = value;
  }

  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(value) {
    this._imageOpacity = value;
  }

  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(value) {
    this._imageRadius = value;
  }

  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(value) {
    this._imageRotation = value;
  }

  get imageScale() {
    return this._imageScale;
  }
  set imageScale(value) {
    this._imageScale = value;
  }

  get label() {
    return this._label;
  }
  set label(value) {
    this._label = value;
  }

  get labelColor() {
    return this._labelColor;
  }
  set labelColor(value) {
    this._labelColor = value;
  }

  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  get weight() {
    return this._weight;
  }
  set weight(value) {
    this._weight = value;
  }

  getStartAngle() {
    return this._startAngle;
  }

  getCenterAngle() {
    return this._centerAngle;
  }

  getEndAngle() {
    return this._endAngle;
  }

  getIndex() {
    return this._index;
  }
}
