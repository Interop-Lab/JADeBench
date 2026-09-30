const require_collection = (() => {
  class Collection {
    constructor() {
      this.items = [];
    }
    add(item) {
      this.items.push(item);
    }
    get(index) {
      return this.items[index];
    }
    size() {
      return this.items.length;
    }
  }
  return Collection;
})();

const require_helpers = (() => {
  function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  function isString(value) {
    return typeof value === 'string';
  }
  function isBoolean(value) {
    return typeof value === 'boolean';
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isObject(value) {
    return value !== null && typeof value === 'object';
  }
  function isFunction(value) {
    return typeof value === 'function';
  }
  function isUndefined(value) {
    return value === undefined;
  }
  function isNull(value) {
    return value === null;
  }
  function isDate(value) {
    return value instanceof Date;
  }
  function isRegExp(value) {
    return value instanceof RegExp;
  }
  function isError(value) {
    return value instanceof Error;
  }
  function isPromise(value) {
    return value instanceof Promise;
  }
  function isIterable(value) {
    return value != null && typeof value[Symbol.iterator] === 'function';
  }
  function isAsyncIterable(value) {
    return value != null && typeof value[Symbol.asyncIterator] === 'function';
  }
  function isPrimitive(value) {
    return value === null || (typeof value !== 'object' && typeof value !== 'function');
  }
  function isSymbol(value) {
    return typeof value === 'symbol';
  }
  function isBigInt(value) {
    return typeof value === 'bigint';
  }
  function isInteger(value) {
    return Number.isInteger(value);
  }
  function isFiniteNumber(value) {
    return Number.isFinite(value);
  }
  function isNaNValue(value) {
    return Number.isNaN(value);
  }
  function isTruthy(value) {
    return Boolean(value);
  }
  function isFalsy(value) {
    return !value;
  }
  function isDefined(value) {
    return value !== undefined;
  }
  function isNotDefined(value) {
    return value === undefined;
  }
  function isNotNull(value) {
    return value !== null;
  }
  function isNullValue(value) {
    return value === null;
  }
  function isArrayBuffer(value) {
    return value instanceof ArrayBuffer;
  }
  function isDataView(value) {
    return value instanceof DataView;
  }
  function isTypedArray(value) {
    return ArrayBuffer.isView(value) && !(value instanceof DataView);
  }
  function isMap(value) {
    return value instanceof Map;
  }
  function isSet(value) {
    return value instanceof Set;
  }
  function isWeakMap(value) {
    return value instanceof WeakMap;
  }
  function isWeakSet(value) {
    return value instanceof WeakSet;
  }
  function isGenerator(value) {
    return value != null && typeof value.next === 'function' && typeof value.throw === 'function' && typeof value.return === 'function';
  }
  function isAsyncGenerator(value) {
    return value != null && typeof value.next === 'function' && typeof value.throw === 'function' && typeof value.return === 'function';
  }
  function isGeneratorFunction(value) {
    return value != null && value.constructor && value.constructor.name === 'GeneratorFunction';
  }
  function isAsyncGeneratorFunction(value) {
    return value != null && value.constructor && value.constructor.name === 'AsyncGeneratorFunction';
  }
  function isAsyncFunction(value) {
    return value != null && value.constructor && value.constructor.name === 'AsyncFunction';
  }
  function isClass(value) {
    return typeof value === 'function' && /^class\s/.test(Function.prototype.toString.call(value));
  }
  function isCallable(value) {
    return typeof value === 'function';
  }
  function isConstructor(value) {
    return typeof value === 'function' && !!value.prototype && !!value.prototype.constructor;
  }
  function isInstanceOf(value, constructor) {
    return value instanceof constructor;
  }
  function isIn(value, object) {
    return value in object;
  }
  function isPropertyOf(value, object) {
    return value in object;
  }
  function isPrototypeOf(value, object) {
    return value.isPrototypeOf(object);
  }
  function isExtensible(value) {
    return Object.isExtensible(value);
  }
  function isFrozen(value) {
    return Object.isFrozen(value);
  }
  function isSealed(value) {
    return Object.isSealed(value);
  }
  function isEnumerable(object, key) {
    return Object.prototype.propertyIsEnumerable.call(object, key);
  }
  function isWritable(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.writable : false;
  }
  function isConfigurable(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.configurable : false;
  }
  function isGetter(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? typeof descriptor.get === 'function' : false;
  }
  function isSetter(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? typeof descriptor.set === 'function' : false;
  }
  function isAccessor(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? (descriptor.get || descriptor.set) : false;
  }
  function isDataDescriptor(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? 'value' in descriptor : false;
  }
  function isAccessorDescriptor(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? (descriptor.get || descriptor.set) : false;
  }
  function isEnumerableProperty(object, key) {
    return Object.prototype.propertyIsEnumerable.call(object, key);
  }
  function isNonEnumerableProperty(object, key) {
    return !Object.prototype.propertyIsEnumerable.call(object, key);
  }
  function isOwnProperty(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }
  function isInheritedProperty(object, key) {
    return key in object && !Object.prototype.hasOwnProperty.call(object, key);
  }
  function isPrototypeProperty(object, key) {
    return key in object && !Object.prototype.hasOwnProperty.call(object, key);
  }
  function isStaticProperty(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }
  function isInstanceProperty(object, key) {
    return key in object && !Object.prototype.hasOwnProperty.call(object, key);
  }
  function isPrivateProperty(object, key) {
    return key in object && !Object.prototype.hasOwnProperty.call(object, key);
  }
  function isPublicProperty(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }
  function isReadOnlyProperty(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.writable === false : false;
  }
  function isWritableProperty(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.writable !== false : false;
  }
  function isConfigurableProperty(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.configurable !== false : false;
  }
  function isNonConfigurableProperty(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor ? descriptor.configurable === false : false;
  }
  function isEnumerablePropertyDescriptor(descriptor) {
    return descriptor ? descriptor.enumerable !== false : false;
  }
  function isNonEnumerablePropertyDescriptor(descriptor) {
    return descriptor ? descriptor.enumerable === false : false;
  }
  function isWritablePropertyDescriptor(descriptor) {
    return descriptor ? descriptor.writable !== false : false;
  }
  function isReadOnlyPropertyDescriptor(descriptor) {
    return descriptor ? descriptor.writable === false : false;
  }
  function isConfigurablePropertyDescriptor(descriptor) {
    return descriptor ? descriptor.configurable !== false : false;
  }
  function isNonConfigurablePropertyDescriptor(descriptor) {
    return descriptor ? descriptor.configurable === false : false;
  }
  function isDataPropertyDescriptor(descriptor) {
    return descriptor ? 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptor(descriptor) {
    return descriptor ? (descriptor.get || descriptor.set) : false;
  }
  function isGetterPropertyDescriptor(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' : false;
  }
  function isSetterPropertyDescriptor(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' : false;
  }
  function isAccessorPropertyDescriptorWithGetter(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' : false;
  }
  function isAccessorPropertyDescriptorWithSetter(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetter(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' : false;
  }
  function isAccessorPropertyDescriptorWithGetterOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set !== 'function' : false;
  }
  function isAccessorPropertyDescriptorWithSetterOnly(descriptor) {
    return descriptor ? typeof descriptor.get !== 'function' && typeof descriptor.set === 'function' : false;
  }
  function isDataPropertyDescriptorWithValue(descriptor) {
    return descriptor ? 'value' in descriptor : false;
  }
  function isDataPropertyDescriptorWithWritable(descriptor) {
    return descriptor ? 'writable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithEnumerable(descriptor) {
    return descriptor ? 'enumerable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithConfigurable(descriptor) {
    return descriptor ? 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueAndWritable(descriptor) {
    return descriptor ? 'value' in descriptor && 'writable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueAndEnumerable(descriptor) {
    return descriptor ? 'value' in descriptor && 'enumerable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueAndConfigurable(descriptor) {
    return descriptor ? 'value' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithWritableAndEnumerable(descriptor) {
    return descriptor ? 'writable' in descriptor && 'enumerable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithWritableAndConfigurable(descriptor) {
    return descriptor ? 'writable' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithEnumerableAndConfigurable(descriptor) {
    return descriptor ? 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueWritableAndEnumerable(descriptor) {
    return descriptor ? 'value' in descriptor && 'writable' in descriptor && 'enumerable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueWritableAndConfigurable(descriptor) {
    return descriptor ? 'value' in descriptor && 'writable' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueEnumerableAndConfigurable(descriptor) {
    return descriptor ? 'value' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithWritableEnumerableAndConfigurable(descriptor) {
    return descriptor ? 'writable' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isDataPropertyDescriptorWithValueWritableEnumerableAndConfigurable(descriptor) {
    return descriptor ? 'value' in descriptor && 'writable' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && !('configurable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'configurable' in descriptor && !('enumerable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && !('configurable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'configurable' in descriptor && !('enumerable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableOnly(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && !('configurable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'configurable' in descriptor && !('enumerable' in descriptor) : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableOnly(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritable(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValue(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSet(descriptor) {
    return descriptor ? typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndSetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && typeof descriptor.set === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor : false;
  }
  function isAccessorPropertyDescriptorWithGetterAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerableAndConfigurableAndWritableAndValueAndGetAndSetAndEnumerable(descriptor) {
    return descriptor ? typeof descriptor.get === 'function' && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor && 'set' in descriptor && 'enumerable' in descriptor && 'configurable' in descriptor && 'writable' in descriptor && 'value' in descriptor && 'get' in descriptor &&
