import { privateRoutes } from './constants'

export const PRIVATE_ROUTES = privateRoutes.matcher.map((item) =>
  item.replace('/:path*', ''),
)
