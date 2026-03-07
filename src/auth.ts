import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null
        if (email !== process.env.ADMIN_EMAIL) return null

        const adminPassword = process.env.ADMIN_PASSWORD ?? ''

        // 平文比較（bcryptハッシュでも動作）
        const isValid = adminPassword.startsWith('$2')
          ? await bcrypt.compare(password, adminPassword)
          : password === adminPassword

        if (!isValid) return null

        return { id: 'admin', name: 'Admin', email }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
