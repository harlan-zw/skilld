/** Get-or-create for Maps. Polyfill for Map.getOrInsertComputed (not yet in Node.js). */
export function mapInsert<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  let val = map.get(key)
  if (val === undefined) {
    val = create()
    map.set(key, val)
  }
  return val
}
