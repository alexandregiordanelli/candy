//implementacao propria pq geofirestore e similares estao fazendo diferente do q é recomendado pelo google https://www.youtube.com/watch?v=mx1mMdHBi5Q&t=5s
const g_GEOHASH_PRECISION = 10
const g_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"
const g_EARTH_MERI_CIRCUMFERENCE = 40007860
const g_METERS_PER_DEGREE_LATITUDE = 110574
const g_BITS_PER_CHAR = 5
const g_MAXIMUM_BITS_PRECISION = 22*g_BITS_PER_CHAR
const g_EARTH_EQ_RADIUS = 6378137.0
const g_E2 = 0.00669447819799
const g_EPSILON = 1e-12

const degreesToRadians = degrees => degrees * Math.PI / 180

const encodeGeohash = (location, precision) => {
  precision = precision || g_GEOHASH_PRECISION
  let latitudeRange = {
    min: -90,
    max: 90
  }
  let longitudeRange = {
    min: -180,
    max: 180
  }
  let hash = ""
  let hashVal = 0
  let bits = 0
  let even = 1

  while (hash.length < precision) {
    let val = even ? location[1] : location[0]
    let range = even ? longitudeRange : latitudeRange
    let mid = (range.min + range.max) / 2
    if (val > mid) {
      hashVal = (hashVal << 1) + 1
      range.min = mid
    }
    else {
      hashVal = (hashVal << 1) + 0
      range.max = mid
    }
    even = !even
    if (bits < 4) {
      bits++
    }
    else {
      bits = 0
      hash += g_BASE32[hashVal]
      hashVal = 0
    }
  }
  return hash
}

const metersToLongitudeDegrees = (distance, latitude) => {
  const radians = degreesToRadians(latitude)
  const num = Math.cos(radians)*g_EARTH_EQ_RADIUS*Math.PI/180
  const denom = 1/Math.sqrt(1-g_E2*Math.sin(radians)*Math.sin(radians))
  const deltaDeg = num*denom
  if (deltaDeg  < g_EPSILON)
    return distance > 0 ? 360 : 0
  else
    return Math.min(360, distance/deltaDeg)
}

const longitudeBitsForResolution = (resolution, latitude) => {
  const degs = metersToLongitudeDegrees(resolution, latitude)
  return (Math.abs(degs) > 0.000001) ?  Math.max(1, Math.log(360/degs)/Math.log(2)) : 1
}

const latitudeBitsForResolution = (resolution) => Math.min(Math.log(g_EARTH_MERI_CIRCUMFERENCE/2/resolution)/Math.log(2), g_MAXIMUM_BITS_PRECISION)

const wrapLongitude = longitude => {
  if (longitude <= 180 && longitude >= -180)
    return longitude
  const adjusted = longitude + 180
  if (adjusted > 0)
    return (adjusted % 360) - 180
  else
    return 180 - (-adjusted % 360)
}

const boundingBoxBits = (coordinate, size) => {
  const latDeltaDegrees = size/g_METERS_PER_DEGREE_LATITUDE
  const latitudeNorth = Math.min(90, coordinate[0] + latDeltaDegrees)
  const latitudeSouth = Math.max(-90, coordinate[0] - latDeltaDegrees)
  const bitsLat = Math.floor(latitudeBitsForResolution(size))*2
  const bitsLongNorth = Math.floor(longitudeBitsForResolution(size, latitudeNorth))*2-1
  const bitsLongSouth = Math.floor(longitudeBitsForResolution(size, latitudeSouth))*2-1
  return Math.min(bitsLat, bitsLongNorth, bitsLongSouth, g_MAXIMUM_BITS_PRECISION)
}

const boundingBoxCoordinates = (center, radius) => {
  const latDegrees = radius/g_METERS_PER_DEGREE_LATITUDE
  const latitudeNorth = Math.min(90, center[0] + latDegrees)
  const latitudeSouth = Math.max(-90, center[0] - latDegrees)
  const longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth)
  const longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth)
  const longDegs = Math.max(longDegsNorth, longDegsSouth)
  return [
    [center[0], center[1]],
    [center[0], wrapLongitude(center[1] - longDegs)],
    [center[0], wrapLongitude(center[1] + longDegs)],
    [latitudeNorth, center[1]],
    [latitudeNorth, wrapLongitude(center[1] - longDegs)],
    [latitudeNorth, wrapLongitude(center[1] + longDegs)],
    [latitudeSouth, center[1]],
    [latitudeSouth, wrapLongitude(center[1] - longDegs)],
    [latitudeSouth, wrapLongitude(center[1] + longDegs)]
  ]
}

const geohashQuery = (geohash, bits) => {
  const precision = Math.ceil(bits/g_BITS_PER_CHAR)
  if (geohash.length < precision) {
    console.warn("geohash.length < precision: "+geohash.length+" < "+precision+" bits="+bits+" g_BITS_PER_CHAR="+g_BITS_PER_CHAR)
    return [geohash, geohash+"~"]
  }
  geohash = geohash.substring(0, precision)
  const base = geohash.substring(0, geohash.length - 1)
  const lastValue = g_BASE32.indexOf(geohash.charAt(geohash.length - 1))
  const significantBits = bits - (base.length*g_BITS_PER_CHAR)
  const unusedBits = (g_BITS_PER_CHAR - significantBits)
  const startValue = (lastValue >> unusedBits) << unusedBits
  const endValue = startValue + (1 << unusedBits)
  if (endValue >= g_BASE32.length) {
    console.warn("endValue > 31: endValue="+endValue+" < "+precision+" bits="+bits+" g_BITS_PER_CHAR="+g_BITS_PER_CHAR)
    return [base+g_BASE32[startValue], base+"~"]
  }
  else {
    return [base+g_BASE32[startValue], base+g_BASE32[endValue]]
  }
}

const geohashQueries = (center, radius) => {
  const queryBits = Math.max(1, boundingBoxBits(center, radius))
  const geohashPrecision = Math.ceil(queryBits/g_BITS_PER_CHAR)
  const coordinates = boundingBoxCoordinates(center, radius)
  const queries = coordinates.map(coordinate => geohashQuery(encodeGeohash(coordinate, geohashPrecision), queryBits))
  return queries.filter((query, index) => {
    return !queries.some((other, otherIndex) => {
      return index > otherIndex && query[0] === other[0] && query[1] === other[1]
    })
  })
}

const distance = (location1, location2) => {
  const radius = 6371 // Earth's radius in kilometers
  const latDelta = degreesToRadians(location2[0] - location1[0])
  const lonDelta = degreesToRadians(location2[1] - location1[1])
  const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
          (Math.cos(degreesToRadians(location1[0])) * Math.cos(degreesToRadians(location2[0])) *
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return radius * c
}

const getQueriesForDocumentsAround = (ref, center, radiusInMeters) => {
    return geohashQueries(center, radiusInMeters).map(location => {
        return ref.where("geohash", ">=", location[0]).where("geohash", "<=", location[1])
    })
}

const removeDuplicates = (array, prop) => array.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos)

const sortByDistance = array => array.sort((a, b) => ((a.distance < b.distance) ? -1 : ((a.distance > b.distance) ? 1 : 0)))

const getDocumentsNearby = (ref, center, radius) => {
    let docs = []
    const promises = []
    getQueriesForDocumentsAround(ref, center, radius).forEach(query => {
        promises.push(query.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                let data = doc.data()
                data.distance = Math.round(distance(center, [data.location.latitude,data.location.longitude]) * 100) / 100
                data.id = doc.id
                if(data.distance < radius)
                    docs.push(data)
            })
            return true
        }))
    })
    return Promise.all(promises).then(e => {
        return sortByDistance(removeDuplicates(docs, "id"))
    })
}

export {
  getDocumentsNearby,
  encodeGeohash
}