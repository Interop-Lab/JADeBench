let globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : void 0;
let contextStore = globalObj['vm_0x5bbf00_4c02f2'] || (globalObj['vm_0x5bbf00_4c02f2'] = {});

try { if (!contextStore['module']) contextStore['module'] = module; } catch(e) {}
try { if (!contextStore['exports']) contextStore['exports'] = exports; } catch(e) {}
try { if (!contextStore['require']) contextStore['require'] = require; } catch(e) {}
try { if (!contextStore['__dirname']) contextStore['__dirname'] = __dirname; } catch(e) {}
try { if (!contextStore['__filename']) contextStore['__filename'] = __filename; } catch(e) {}

function getRandomInt() { return Math.floor(Math.random() * (arguments[1] - arguments[0] + 1)) + arguments[0]; }
function getRandomFloat() { return Math.random() * (arguments[1] - arguments[0]) + arguments[0]; }
function degRad(deg) { return deg * Math.PI / 180; }
function isAngleBetween(angle, start, end) { const diff = (end - start + 360) % 360; const angleDiff = (angle - start + 360) % 360; return angleDiff <= diff; }
function aveArray() { const arr = arguments[0]; let sum = 0; for (let i = 0; i < arr.length; i++) sum += arr[i]; return sum / arr.length; }
function getFontSizeToFit(text, fontFace, maxWidth) { let fontSize = 1; const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); ctx.font = fontSize + 'px ' + fontFace; while (ctx.measureText(text).width < maxWidth) { fontSize++; ctx.font = fontSize + 'px ' + fontFace; } return fontSize - 1; }
function isPointInCircle(px, py, cx, cy, radius) { return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) <= radius; }
function translateXYToElement(x, y, element) { const rect = element.getBoundingClientRect(); return { x: x - rect.left, y: y - rect.top }; }
function getMouseButtonsPressed(event) { const buttons = []; if (event.buttons & 1) buttons.push('left'); if (event.buttons & 2) buttons.push('right'); if (event.buttons & 4) buttons.push('middle'); if (event.buttons & 8) buttons.push('back'); if (event.buttons & 16) buttons.push('forward'); return buttons; }
function getAngle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; }
function getDistanceBetweenPoints(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }
function addAngle(angle, add) { return (angle + add + 360) % 360; }
function diffAngle(a1, a2) { let diff = Math.abs(a1 - a2) % 360; return diff > 180 ? 360 - diff : diff; }
function calcWheelRotationForTargetAngle(currentAngle, targetAngle, rotationPerTick) { let diff = targetAngle - currentAngle; while (diff > 180) diff -= 360; while (diff < -180) diff += 360; return Math.round(diff / rotationPerTick); }
function isObject(obj) { return typeof obj === 'object' && obj !== null; }
function isNumber(value) { return typeof value === 'number' && !isNaN(value); }
function setProp(obj) { const args = arguments; for (let i = 1; i < args.length; i += 2) { obj[args[i]] = args[i + 1]; } return obj; }
function fixFloat(value, precision) { const p = precision || 2; return parseFloat(value.toFixed(p)); }
function easeSinOut(t) { return Math.sin(t * Math.PI / 2); }
function getResizeObserver(callback, element) { return new ResizeObserver(callback); }

contextStore['getResizeObserver'] = getResizeObserver;
globalThis['getResizeObserver'] = contextStore['getResizeObserver'];
contextStore['easeSinOut'] = easeSinOut;
globalThis['easeSinOut'] = contextStore['easeSinOut'];
contextStore['fixFloat'] = fixFloat;
globalThis['fixFloat'] = contextStore['fixFloat'];
contextStore['setProp'] = setProp;
globalThis['setProp'] = contextStore['setProp'];
contextStore['isNumber'] = isNumber;
globalThis['isNumber'] = contextStore['isNumber'];
contextStore['isObject'] = isObject;
globalThis['isObject'] = contextStore['isObject'];
contextStore['calcWheelRotationForTargetAngle'] = calcWheelRotationForTargetAngle;
globalThis['calcWheelRotationForTargetAngle'] = contextStore['calcWheelRotationForTargetAngle'];
contextStore['diffAngle'] = diffAngle;
globalThis['diffAngle'] = contextStore['diffAngle'];
contextStore['addAngle'] = addAngle;
globalThis['addAngle'] = contextStore['addAngle'];
contextStore['getDistanceBetweenPoints'] = getDistanceBetweenPoints;
globalThis['getDistanceBetweenPoints'] = contextStore['getDistanceBetweenPoints'];
contextStore['getAngle'] = getAngle;
globalThis['getAngle'] = contextStore['getAngle'];
contextStore['getMouseButtonsPressed'] = getMouseButtonsPressed;
globalThis['getMouseButtonsPressed'] = contextStore['getMouseButtonsPressed'];
contextStore['translateXYToElement'] = translateXYToElement;
globalThis['translateXYToElement'] = contextStore['translateXYToElement'];
contextStore['isPointInCircle'] = isPointInCircle;
globalThis['isPointInCircle'] = contextStore['isPointInCircle'];
contextStore['getFontSizeToFit'] = getFontSizeToFit;
globalThis['getFontSizeToFit'] = contextStore['getFontSizeToFit'];
contextStore['aveArray'] = aveArray;
globalThis['aveArray'] = contextStore['aveArray'];
contextStore['isAngleBetween'] = isAngleBetween;
globalThis['isAngleBetween'] = contextStore['isAngleBetween'];
contextStore['degRad'] = degRad;
globalThis['degRad'] = contextStore['degRad'];
contextStore['getRandomFloat'] = getRandomFloat;
globalThis['getRandomFloat'] = contextStore['getRandomFloat'];
contextStore['getRandomInt'] = getRandomInt;
globalThis['getRandomInt'] = contextStore['getRandomInt'];

export { addAngle, aveArray, calcWheelRotationForTargetAngle, degRad, diffAngle, easeSinOut, fixFloat, getAngle, getDistanceBetweenPoints, getFontSizeToFit, getMouseButtonsPressed, getRandomFloat, getRandomInt, getResizeObserver, isAngleBetween, isNumber, isObject, isPointInCircle, setProp, translateXYToElement };
