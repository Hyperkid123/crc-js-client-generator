interface Parameter {
  name: string
  in: 'query' | 'path' | string
}

export function generateUrl(mask: string, availableParameters: {[key: string]: Parameter}) {
  const result = mask;
  Object.values(availableParameters).forEach(({ name, in: placement }) => {
    if(placement === 'path') {
      result.replace(`{${name}}`, '')
    }
  })
  return result
}