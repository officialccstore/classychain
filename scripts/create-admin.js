#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

function usage() {
  console.log('Usage: node scripts/create-admin.js --email user@example.com --password secret123 --name "Admin Name"')
  console.log('Or to promote existing user: node scripts/create-admin.js --promote --email user@example.com')
  process.exit(1)
}

const argv = require('minimist')(process.argv.slice(2))

const email = argv.email || argv.e
const password = argv.password || argv.p
const name = argv.name || argv.n || 'Admin'
const promote = argv.promote || argv.promote === true || argv.promote === 'true'

if (!email) {
  usage()
}

async function main() {
  try {
    if (promote) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        console.error('User not found:', email)
        process.exit(1)
      }
      await prisma.user.update({ where: { email }, data: { role: 'admin' } })
      console.log(`Promoted ${email} to admin`)
      return
    }

    if (!password) {
      console.error('Password is required when creating a new admin')
      usage()
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // Update password and role
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.update({ where: { email }, data: { password: hashed, role: 'admin', name } })
      console.log(`Updated existing user ${email} and set role to admin`)
    } else {
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.create({ data: { email, password: hashed, name, role: 'admin' } })
      console.log(`Created admin user ${email}`)
    }
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
