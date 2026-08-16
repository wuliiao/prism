export function shuffledRest(length: number, exclude: number): number[] {
  const indices: number[] = []
  for (let index = 0; index < length; index += 1) {
    if (index !== exclude) indices.push(index)
  }

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = indices[index]
    const swap = indices[swapIndex]
    if (current === undefined || swap === undefined) continue
    indices[index] = swap
    indices[swapIndex] = current
  }

  return indices
}

export function createShuffleQueue() {
  let bag: number[] = []
  let history: number[] = []

  function reset(length: number, current: number) {
    bag = shuffledRest(length, current)
    history = current >= 0 ? [current] : []
  }

  function clear() {
    bag = []
    history = []
  }

  function takeNext(currentIndex: number, length: number, repeatOff: boolean): number | null {
    if (length <= 1) return repeatOff ? null : 0

    bag = bag.filter((index) => index !== currentIndex && index >= 0 && index < length)

    if (bag.length === 0) {
      if (repeatOff) return null
      reset(length, currentIndex)
    }

    const nextIndex = bag.shift()
    if (nextIndex === undefined) return null
    history.push(nextIndex)
    return nextIndex
  }

  function takePrevious(currentIndex: number, length: number, repeatOff: boolean): number | null {
    if (length <= 1) return repeatOff ? null : 0

    if (history.length > 1) {
      const current = history.pop()
      const prevIndex = history[history.length - 1]
      if (current !== undefined) bag.unshift(current)
      if (prevIndex === undefined) return null
      return prevIndex
    }

    if (repeatOff) return null

    if (bag.length === 0) reset(length, currentIndex)
    const prevIndex = bag.pop()
    if (prevIndex === undefined) return null
    history.push(prevIndex)
    return prevIndex
  }

  return { reset, clear, takeNext, takePrevious }
}
