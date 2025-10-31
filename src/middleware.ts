export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/api/orders/:path*', '/api/reports/:path*'],
}
