import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const email = (credentials?.email ?? '') as string
          const password = (credentials?.password ?? '') as string

          if (!email || !password) return null

          const adminEmail = process.env.ADMIN_EMAIL ?? ''
          const adminPassword = process.env.ADMIN_PASSWORD ?? ''

          if (!adminEmail || !adminPassword) {
            console.error('[auth] ADMIN_EMAIL or ADMIN_PASSWORD is not set')
            return null
          }

          if (email !== adminEmail) return null

          const isValid = adminPassword.startsWith('$2')
            ? await bcrypt.compare(password, adminPassword)
            : password === adminPassword

          if (!isValid) return null

          return { id: 'admin', name: 'Admin', email }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
