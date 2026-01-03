const { PrismaClient } = require('@prisma/client')

const globalWithPrisma = globalThis

const prisma = globalWithPrisma.__prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalWithPrisma.__prisma = prisma

module.exports = prisma
