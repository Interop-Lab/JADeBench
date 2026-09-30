const DEFAULTS = Object.freeze({
  item: Object.freeze({
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: "",
    labelColor: null,
    value: null,
    weight: 1,
  }),
});

function randomFloat(min = 0, max = 0, decimalPlaces = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimalPlaces));
}

/**
 * One segment of a wheel. The wheel argument is deliberately duck-typed: the
 * original module only requires the methods and properties used below.
 */
class Item {
  constructor(wheel, options = {}) {
    if (typeof wheel !== "object" || wheel === null || Array.isArray(wheel)) {
      throw new Error("wheel must be an instance of Wheel");
    }

    this._wheel = wheel;
    this.init(options);
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

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === "string"
      ? value
      : DEFAULTS.item.backgroundColor;
    this._wheel.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = value instanceof HTMLImageElement
      ? value
      : DEFAULTS.item.image;
    this._wheel.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = typeof value === "number"
      ? value
      : DEFAULTS.item.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = typeof value === "number"
      ? value
      : DEFAULTS.item.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = typeof value === "number"
      ? value
      : DEFAULTS.item.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = typeof value === "number"
      ? value
      : DEFAULTS.item.imageScale;
    this._wheel.refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === "string" ? value : DEFAULTS.item.label;
    this._wheel.refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = typeof value === "string"
      ? value
      : DEFAULTS.item.labelColor;
    this._wheel.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : DEFAULTS.item.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = typeof value === "number" ? value : DEFAULTS.item.weight;
  }

  getIndex() {
    const index = this._wheel.items.indexOf(this);
    if (index === -1) {
      throw new Error("Item not found in parent Wheel");
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
