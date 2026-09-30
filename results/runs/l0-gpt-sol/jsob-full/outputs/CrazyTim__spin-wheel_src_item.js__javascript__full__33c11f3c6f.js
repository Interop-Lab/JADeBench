function getRandomFloat(min = 0, max = 0, precision = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

const Defaults = Object.freeze({
  item: {
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: "",
    labelColor: null,
    value: null,
    weight: 1
  }
});

var Item = class {
  constructor(wheel, props = {}) {
    if (!isObject(wheel)) {
      throw new Error("wheel must be an instance of Wheel");
    }

    if (!isObject(props) && props !== null) {
      throw new Error("props must be an object or null");
    }

    this._wheel = wheel;

    for (const key of Object.keys(Defaults.item)) {
      this[`_${key}`] = Defaults.item[key];
    }

    if (props) {
      this.set(props);
    } else {
      this.set(Defaults.item);
    }
  }

  set(props = {}) {
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
    this._backgroundColor =
      typeof value === "string" ? value : Defaults.item.backgroundColor;
    this._wheel.refresh();
  }

  get image() {
    return this._image;
  }

  set image(value) {
    this._image =
      value instanceof HTMLImageElement ? value : Defaults.item.image;
    this._wheel.refresh();
  }

  get imageOpacity() {
    return this._imageOpacity;
  }

  set imageOpacity(value) {
    this._imageOpacity =
      typeof value === "number" ? value : Defaults.item.imageOpacity;
    this._wheel.refresh();
  }

  get imageRadius() {
    return this._imageRadius;
  }

  set imageRadius(value) {
    this._imageRadius =
      typeof value === "number" ? value : Defaults.item.imageRadius;
    this._wheel.refresh();
  }

  get imageRotation() {
    return this._imageRotation;
  }

  set imageRotation(value) {
    this._imageRotation =
      typeof value === "number" ? value : Defaults.item.imageRotation;
    this._wheel.refresh();
  }

  get imageScale() {
    return this._imageScale;
  }

  set imageScale(value) {
    this._imageScale =
      typeof value === "number" ? value : Defaults.item.imageScale;
    this._wheel.refresh();
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._label = typeof value === "string" ? value : Defaults.item.label;
    this._wheel.refresh();
  }

  get labelColor() {
    return this._labelColor;
  }

  set labelColor(value) {
    this._labelColor =
      typeof value === "string" ? value : Defaults.item.labelColor;
    this._wheel.refresh();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value !== undefined ? value : Defaults.item.value;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = typeof value === "number" ? value : Defaults.item.weight;
    this._wheel.refresh();
  }

  getIndex() {
    const index = this._wheel.items.indexOf(this);

    if (index === -1) {
      throw new Error("Item not found in wheel.items");
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
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
};

export { Item };
