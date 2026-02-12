/**
 * Image Processor — Canvas API helper for resizing and compressing
 * user photos before storing in localStorage.
 *
 * - Resizes to fit within maxSize × maxSize (preserving aspect ratio)
 * - Outputs JPEG at the given quality (0–1)
 * - Returns a base64 data-URL string
 */

export async function resizeImageToBase64(
    file: File,
    maxSize: number = 300,
    quality: number = 0.7
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            const img = new Image()

            img.onload = () => {
                // Calculate scaled dimensions (preserve aspect ratio)
                let { width, height } = img

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width)
                        width = maxSize
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height)
                        height = maxSize
                    }
                }

                // Draw onto canvas
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas 2D context not available'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Export as JPEG data-URL
                const dataUrl = canvas.toDataURL('image/jpeg', quality)
                resolve(dataUrl)
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = reader.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}
