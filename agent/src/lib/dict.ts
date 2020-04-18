/* eslint no-use-before-define: 0 */
const { NSArray, NSData, NSDictionary, NSNumber, NSPropertyListSerialization } = ObjC.classes

const NSPropertyListImmutable = 0

export function valueOf(value: ObjC.Object): any {
  if (value === null || typeof value !== 'object')
    return value
  if (value.isKindOfClass_(NSArray))
    return arrayFromNSArray(value)
  if (value.isKindOfClass_(NSDictionary))
    return dictFromNSDictionary(value)
  if (value.isKindOfClass_(NSNumber))
    return value.floatValue()
  return value.toString()
}

type Dictionary = { [key: string]: any }

export function dictFromNSDictionary(nsDict: ObjC.Object): Dictionary {
  const jsDict: { [key: string]: any } = {}
  const keys = nsDict.allKeys()
  const count = keys.count()
  for (let i = 0; i < count; i++) {
    const key = keys.objectAtIndex_(i)
    const value = nsDict.objectForKey_(key)
    jsDict[key.toString()] = valueOf(value)
  }

  return jsDict
}


export function dictFromPlistCharArray(address: NativePointer, size: number): Dictionary {
  const format = Memory.alloc(Process.pointerSize)
  const err = Memory.alloc(Process.pointerSize).writePointer(NULL)
  const data = NSData.dataWithBytesNoCopy_length_freeWhenDone_(address, size, 0)
  const dict = NSPropertyListSerialization.propertyListFromData_mutabilityOption_format_errorDescription_(
    data,
    NSPropertyListImmutable,
    format,
    err,
  )

  const desc = err.readPointer()
  if (!desc.isNull())
    throw new Error(new ObjC.Object(desc).toString())

  return dictFromNSDictionary(dict)
}


export function arrayFromNSArray(original: ObjC.Object, limit: number = Infinity): object[] {
  const arr = []
  const count = original.count()
  const len = Number.isNaN(limit) ? Math.min(count, limit) : count
  for (let i = 0; i < len; i++) {
    const val = original.objectAtIndex_(i)
    arr.push(valueOf(val))
  }
  return arr
}