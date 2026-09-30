const itemDefaults = Object.freeze({
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
});

function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

function getRandomFloat(min = 0, max = 1, decimalPlaces = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimalPlaces));
}

class Item {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) {
      throw new Error("wheel must be an object");
    }
    if (!isObject(props) && props !== null) {
      throw new Error("item properties must be an object or null");
    }

    this._wheel = wheel;
    for (const key of Object.keys(itemDefaults)) {
      this[`_${key}`] = itemDefaults[key];
    }

    this.init(props || itemDefaults);
  }

  init(props = {}) {
    this.backgroundColor = props.backgroundColor;
    this.image = props.image;
    this.imageOpacity = props.imageOpacity;
    this.imageRadius = props.imageRadius;
    this.imageRotation = props.imageRotation;
    this.imageScale = props.imageScale;
    this.label = props.label;
    this.labelColor = props.labelColor;
    this.value = props.value;
    this.weight = props.weight;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = typeof value === "string" ? value : itemDefaults.backgroundColor;
    this._wheel.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image = value instanceof HTMLImageElement ? value : itemDefaults.image;
    this._wheel.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity = typeof value === "number" ? value : itemDefaults.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius = typeof value === "number" ? value : itemDefaults.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation = typeof value === "number" ? value : itemDefaults.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale = typeof value === "number" ? value : itemDefaults.imageScale;
    this._wheel.refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === "string" ? value : itemDefaults.label;
    this._wheel.refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor = typeof value === "string" ? value : itemDefaults.labelColor;
    this._wheel.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : itemDefaults.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = typeof value === "number" ? value : itemDefaults.weight;
    this._wheel.refresh();
  }

  getIndex() {
    const index = this._wheel.items.indexOf(this);
    if (index === -1) {
      throw new Error("item not found in wheel items");
    }
    return index;
  }

  getCenterAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    return angle.start + (angle.end - angle.start) / 2;
  }

  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }

  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }

  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}

export { Item };
