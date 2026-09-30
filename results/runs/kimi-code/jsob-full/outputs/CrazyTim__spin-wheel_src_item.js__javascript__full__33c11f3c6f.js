const DEFAULT_ITEM = Object.freeze({
  backgroundColor: null,
  image: null,
  imageOpacity: 1,
  imageRadius: 0.5,
  imageRotation: 0,
  imageScale: 1,
  label: '',
  labelColor: null,
  value: null,
  weight: 1,
});

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function randomFloat(min, max, decimalPlaces = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimalPlaces));
}

class Item {
  constructor(wheel, options = {}) {
    if (!isPlainObject(wheel)) {
      throw new Error('wheel must be an instance of Wheel');
    }
    if (!isPlainObject(options) && options !== null) {
      throw new Error('props must be an Object or null');
    }

    this._wheel = wheel;
    for (const [property, value] of Object.entries(DEFAULT_ITEM)) {
      this[`_${property}`] = value;
    }
    this.init(options || DEFAULT_ITEM);
  }

  init(options = {}) {
    this.backgroundColor = options.backgroundColor;
    this.image = options.image;
    this.imageOpacity = options.imageOpacity;
    this.imageRadius = options.imageRadius;
    this.imageRotation = options.imageRotation;
    this.imageScale = options.imageScale;
    this.label = options.label;
    this.labelColor = options.labelColor;
    this.value = options.value;
    this.weight = options.weight;
  }

  _refreshWheel() {
    this._wheel.refresh();
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === 'string' ? value : DEFAULT_ITEM.backgroundColor;
    this._refreshWheel();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = value instanceof HTMLImageElement ? value : DEFAULT_ITEM.image;
    this._refreshWheel();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = typeof value === 'number' ? value : DEFAULT_ITEM.imageOpacity;
    this._refreshWheel();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = typeof value === 'number' ? value : DEFAULT_ITEM.imageRadius;
    this._refreshWheel();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = typeof value === 'number' ? value : DEFAULT_ITEM.imageRotation;
    this._refreshWheel();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = typeof value === 'number' ? value : DEFAULT_ITEM.imageScale;
    this._refreshWheel();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === 'string' ? value : DEFAULT_ITEM.label;
    this._refreshWheel();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = typeof value === 'string' ? value : DEFAULT_ITEM.labelColor;
    this._refreshWheel();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : DEFAULT_ITEM.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = typeof value === 'number' ? value : DEFAULT_ITEM.weight;
  }

  getIndex() {
    const index = this._wheel.items.indexOf(this);
    if (index < 0) {
      throw new Error('Item not found in wheel');
    }
    return index;
  }

  getCenterAngle() {
    const angles = this._wheel.getItemAngles()[this.getIndex()];
    return angles.start + (angles.end - angles.start) / 2;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    return randomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

export { Item };
