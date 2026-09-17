const MAX_IMAGE_DIMENSION = 1280
const JPEG_QUALITY = 0.72

export function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')

      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Não foi possível preparar a imagem.'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Não foi possível ler a imagem ${file.name}.`))
    }

    image.src = objectUrl
  })
}