/* eslint-disable */
export const intoData = (obj: object) => {
  for (const key in obj) {
    const val = (obj as any)[key]
    localStorage.setItem(key, val)
  }
}

export const findData = (...key: any[]) => {
  if (key.length === 1) {
    return localStorage.getItem(key[0])
  } else {
    const karr = []
    for (const item of key) {
      karr.push(localStorage.getItem(item))
    }
    return karr
  }
}

export const delData = (...key: any[]) => {
  for (const i in key) {
    localStorage.removeItem(key[i])
  }
}

export const cleanData = () => {
  localStorage.clear()
}
