"use strict";
/**
 * Method to deep clone an object, should already have been tested..
 * @TODO: Test it more..
 *
 * @param originalObject
 * @param circular
 * @returns {*}
 *
 * This code was taken from:
 * https://github.com/cronvel/tree-kit/blob/master/lib/clone.js
 */
function clone(originalObject, circular) {
    if (circular === void 0) { circular = true; }
    // First create an empty object with
    // same prototype of our original source
    var propertyIndex, descriptor, keys, current, nextSource, indexOf, copies = [{
            source: originalObject,
            target: Object.create(Object.getPrototypeOf(originalObject))
        }], cloneObject = copies[0].target, sourceReferences = [originalObject], targetReferences = [cloneObject];
    // First in, first out
    while (current = copies.shift()) {
        keys = Object.getOwnPropertyNames(current.source);
        for (propertyIndex = 0; propertyIndex < keys.length; propertyIndex++) {
            // Save the source's descriptor
            descriptor = Object.getOwnPropertyDescriptor(current.source, keys[propertyIndex]);
            if (!descriptor.value || typeof descriptor.value !== 'object') {
                Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                continue;
            }
            nextSource = descriptor.value;
            descriptor.value = Array.isArray(nextSource) ?
                [] :
                Object.create(Object.getPrototypeOf(nextSource));
            if (circular) {
                indexOf = sourceReferences.indexOf(nextSource);
                if (indexOf !== -1) {
                    // The source is already referenced, just assign reference
                    descriptor.value = targetReferences[indexOf];
                    Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                    continue;
                }
                sourceReferences.push(nextSource);
                targetReferences.push(descriptor.value);
            }
            Object.defineProperty(current.target, keys[propertyIndex], descriptor);
            copies.push({ source: nextSource, target: descriptor.value });
        }
    }
    return cloneObject;
}
exports.clone = clone;
/**
 * @args an Array of any kind of objects
 * @cb callback to return a unique identifier;
 * if this is duplicate, the object will not be stored in result.
 * @returns {Array}
 */
function mergeArrays(args, cb) {
    if (cb === void 0) { cb = undefined; }
    for (var arg_idx in args) {
        if (!Array.isArray(args[arg_idx])) {
            throw new Error('Will only mergeArrays arrays');
        }
    }
    var seen = {}, result = [], identity;
    for (var i = 0; i < args.length; i++) {
        for (var j = 0; j < args[i].length; j++) {
            identity = typeof cb !== 'undefined' ? cb(args[i][j]) : args[i][j];
            if (seen[identity] !== true) {
                result.push(args[i][j]);
                seen[identity] = true;
            }
        }
    }
    return result;
}
exports.mergeArrays = mergeArrays;
/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param args Array of all the object to take keys from
 * @returns result object
 */
function mergeObjects(args) {
    for (var i = 0; i < args.length; i++) {
        if (Object.prototype.toString.call(args[i]) !== '[object Object]') {
            throw new Error('Will only take objects as inputs');
        }
    }
    var result = {};
    for (var i = 0; i < args.length; i++) {
        for (var key in args[i]) {
            if (args[i].hasOwnProperty(key)) {
                result[key] = args[i][key];
            }
        }
    }
    return result;
}
exports.mergeObjects = mergeObjects;
/**
 * @TODO Test !!!
 *
 * @param object
 * @param cb
 */
function findKey(obj, cb) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && cb(obj[key])) {
            return key;
        }
    }
    return undefined;
}
exports.findKey = findKey;