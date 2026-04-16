import { forwardRef, type ImgHTMLAttributes } from 'react'

type StaticImageLike = {
  src: string
  width?: number
  height?: number
}

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean
  src?: string | StaticImageLike
}

const Image = forwardRef<HTMLImageElement, NextImageProps>(function Image(
  { fill, style, src, width, height, ...props },
  ref,
) {
  const resolvedSrc = typeof src === 'string' ? src : src?.src
  const resolvedWidth = typeof width === 'number' ? width : typeof src === 'object' ? src?.width : undefined
  const resolvedHeight = typeof height === 'number' ? height : typeof src === 'object' ? src?.height : undefined

  if (fill) {
    return (
      <img
        ref={ref}
        {...props}
        src={resolvedSrc}
        style={{
          ...style,
          height: '100%',
          width: '100%',
          objectFit: style?.objectFit || 'cover',
        }}
      />
    )
  }

  return (
    <img
      ref={ref}
      {...props}
      src={resolvedSrc}
      width={resolvedWidth}
      height={resolvedHeight}
      style={style}
    />
  )
})

export default Image
