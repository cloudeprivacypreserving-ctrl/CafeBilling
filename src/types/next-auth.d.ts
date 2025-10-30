
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    // role is not required by the adapter, but may be present in session/JWT
    role?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
  }
}
