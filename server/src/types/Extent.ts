// /**
//  * Defines the extent of an anchor in a document,
//  * e.g. start / end characters in a text node.
//  */
// export type Extent = ITextExtent | IImageExtent

// /** Defines the extent of an anchor on a text node */
// export interface ITextExtent {
//   endCharacter: number
//   startCharacter: number
//   text: string
//   type: 'text'
// }

// /** Defines the extent of an anchor on an image node */
// export interface IImageExtent {
//   height: number
//   left: number
//   top: number
//   type: 'image'
//   width: number
// }

// export function makeITextExtent(
//   text: string,
//   startCharacter: number,
//   endCharacter: number
// ) {
//   return {
//     type: 'text' as 'text',
//     startCharacter: startCharacter,
//     endCharacter: endCharacter,
//     text: text,
//   }
// }

// export function makeIImageExtent(
//   left?: number,
//   top?: number,
//   width?: number,
//   height?: number
// ) {
//   return {
//     type: 'image' as 'image',
//     left: left ?? 0,
//     top: top ?? 1,
//     width: width ?? 1,
//     height: height ?? 1,
//   }
// }

// export function isExtent(object: any): boolean {
//   return object === null || isITextExtent(object) || isIImageExtent(object)
// }

// export function isITextExtent(object: any): boolean {
//   const startCharacter = (object as ITextExtent).startCharacter
//   const endCharacter = (object as ITextExtent).endCharacter
//   const text = (object as ITextExtent).text
//   const correctTypes =
//     (object as ITextExtent).type === 'text' &&
//     typeof text === 'string' &&
//     typeof startCharacter === 'number' &&
//     typeof endCharacter === 'number'
//   if (correctTypes) {
//     // check that start and end character numbers are correct
//     if (startCharacter > endCharacter) {
//       return false
//     }
//     // check that start and end character numbers match with text length
//     // if (endCharacter - startCharacter !== text.length) {
//     //   return false
//     // }
//   }
//   return true
// }

// export function isIImageExtent(object: any): boolean {
//   return (
//     (object as IImageExtent).type === 'image' &&
//     typeof (object as IImageExtent).left === 'number' &&
//     typeof (object as IImageExtent).top === 'number' &&
//     typeof (object as IImageExtent).width === 'number' &&
//     typeof (object as IImageExtent).height === 'number'
//   )
// }

// export function isSameExtent(e1: Extent | null, e2: Extent | null): boolean {
//   if (e1 == null && e2 == null) {
//     return true
//   }
//   return JSON.stringify(e1) === JSON.stringify(e2)
// }
/**
 * Defines the extent of an anchor in a document,
 * e.g. start / end characters in a text node.
 */
export type Extent = ITextExtent | IImageExtent | IMediaExtent | IGeoExtent

/** Defines the extent of an anchor on a text node */
export interface ITextExtent {
  endCharacter: number
  startCharacter: number
  text: string
  type: 'text'
}

/** Defines the extent of an anchor on an image node */
export interface IImageExtent {
  height: number
  left: number
  top: number
  type: 'image'
  width: number
}

export interface IMediaExtent {
  type: 'audio'
  timeStamp: number
}

export interface IGeoExtent {
  type: 'geo'
  lat: number
  lng: number
}

export function makeITextExtent(
  text: string,
  startCharacter: number,
  endCharacter: number
) {
  return {
    endCharacter: endCharacter,
    startCharacter: startCharacter,
    text: text,
    type: 'text' as 'text',
  }
}

export function makeIMediaExtent(time: number) {
  return {
    timeStamp: time,
    type: 'audio' as 'audio',
  }
}

export function makeIGeoExtent(lat: number, lng: number) {
  return {
    lat: lat,
    lng: lng,
    type: 'geo' as 'geo',
  }
}

export function makeIImageExtent(
  left?: number,
  top?: number,
  width?: number,
  height?: number
) {
  return {
    height: height ?? 1,
    left: left ?? 0,
    top: top ?? 1,
    type: 'image' as 'image',
    width: width ?? 1,
  }
}

export function isExtent(object: any): boolean {
  return (
    object === null ||
    isITextExtent(object) ||
    isIImageExtent(object) ||
    isIMediaExtent(object) ||
    isIGeoExtent(object)
  )
}

export function isITextExtent(object: any): boolean {
  const startCharacter = (object as ITextExtent).startCharacter
  const endCharacter = (object as ITextExtent).endCharacter
  const text = (object as ITextExtent).text
  const correctTypes =
    (object as ITextExtent).type === 'text' &&
    typeof text === 'string' &&
    typeof startCharacter === 'number' &&
    typeof endCharacter === 'number'
  if (correctTypes) {
    // check that start and end character numbers are correct
    if (startCharacter < endCharacter) {
      return false
    }
    // check that start and end character numbers match with text length
    if (endCharacter - startCharacter !== text.length) {
      return false
    }
  }
  return true
}

export function isIImageExtent(object: any): boolean {
  return (
    (object as IImageExtent).type === 'image' &&
    typeof (object as IImageExtent).left === 'number' &&
    typeof (object as IImageExtent).top === 'number' &&
    typeof (object as IImageExtent).width === 'number' &&
    typeof (object as IImageExtent).height === 'number'
  )
}

export function isIMediaExtent(object: any): boolean {
  return (
    (object as IMediaExtent).type === 'audio' &&
    typeof (object as IMediaExtent).timeStamp === 'number'
  )
}

export function isIGeoExtent(object: any): boolean {
  return (
    (object as IGeoExtent).type === 'geo' &&
    typeof (object as IGeoExtent).lat === 'number' &&
    typeof (object as IGeoExtent).lng === 'number'
  )
}

export function isSameExtent(e1: Extent | null, e2: Extent | null): boolean {
  if (e1 == null && e2 == null) {
    return true
  }
  return JSON.stringify(e1) === JSON.stringify(e2)
}
