declare module '*.svg' {
  import type { PureComponent, SVGProps } from 'react'

  declare const url: string
  declare class SVG extends PureComponent<SVGProps<SVGElement>> {}
  export { SVG as ReactComponent }
  export default url
}
