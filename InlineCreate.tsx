import { PrismaClient } from '@prisma/client'
import data from './seed-data.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Texas Industrial CRM...')

  await prisma.task.deleteMany()
  await prisma.note.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.pursuit.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.occupier.deleteMany()
  await prisma.capital.deleteMany()
  await prisma.user.deleteMany()

  const userIds = new Set((data.users as any[]).map((u: any) => u.id))
  const capitalIds = new Set((data.capitals as any[]).map((c: any) => c.id))
  const activeOccupiers = (data.occupiers as any[]).filter((o: any) => !o.isDeleted)
  const occIds = new Set(activeOccupiers.map((o: any) => o.id))
  const pursuitIds = new Set((data.pursuits as any[]).map((p: any) => p.id))

  console.log(`  → ${(data.users as any[]).length} users`)
  for (const u of data.users as any[]) {
    await prisma.user.create({ data: { id: u.id, name: u.name || 'Unknown', email: u.email || `user${u.id}@example.com`, phone: u.phone || '', roleId: u.roleId } })
  }

  console.log(`  → ${(data.capitals as any[]).length} capitals`)
  for (const c of data.capitals as any[]) {
    await prisma.capital.create({ data: { id: c.id, companyName: c.companyName, ownerCode: c.ownerCode, status: c.status || 'Active', type: c.type as any } })
  }

  console.log(`  → ${activeOccupiers.length} occupiers`)
  for (const o of activeOccupiers) {
    await prisma.occupier.create({
      data: {
        id: o.id, companyName: o.companyName || 'Unknown',
        priority: o.priority as any || 'LOW',
        currentAddress: o.currentAddress || null,
        headquartersAddress: o.headquartersAddress || null,
        sizeOfSpace: o.sizeOfSpace || null,
        leaseExpiration: o.leaseExpiration ? new Date(o.leaseExpiration) : null,
        nextContact: o.nextContact ? new Date(o.nextContact) : null,
        occupierStatus: o.occupierStatus as any || 'IN_PROGRESS',
        dateStarted: o.dateStarted ? new Date(o.dateStarted) : null,
        dealStage: (o.dealStage || 'EARLY_TALKS').replace(/ /g,'_').toUpperCase() as any,
        industry: o.industry || '-',
        primaryBrokerId: o.primaryBrokerId && userIds.has(o.primaryBrokerId) ? o.primaryBrokerId : null,
        brokerId: o.brokerId && userIds.has(o.brokerId) ? o.brokerId : null,
      }
    })
  }

  console.log(`  → ${(data.contacts as any[]).length} contacts`)
  for (const c of data.contacts as any[]) {
    await prisma.contact.create({
      data: {
        id: c.id, name: c.name || 'Unknown', jobTitle: c.jobTitle || '', phone: c.phone || '', email: c.email || '',
        occupierId: c.occupierId && occIds.has(c.occupierId) ? c.occupierId : null,
        capitalId: c.capitalId && capitalIds.has(c.capitalId) ? c.capitalId : null,
      }
    })
  }

  console.log(`  → ${(data.pursuits as any[]).length} pursuits`)
  for (const p of data.pursuits as any[]) {
    await prisma.pursuit.create({
      data: {
        id: p.id, name: p.name, type: p.type as any, assetAnalysisPhase: p.assetAnalysisPhase as any,
        totalSf: p.totalSf || null, submarket: p.submarket || null,
        brokerId: p.brokerId && userIds.has(p.brokerId) ? p.brokerId : null,
        capitalId: p.capitalId && capitalIds.has(p.capitalId) ? p.capitalId : null,
      }
    })
  }

  console.log(`  → ${(data.deals as any[]).length} deals`)
  for (const d of data.deals as any[]) {
    await prisma.deal.create({
      data: {
        id: d.id, name: d.name, phase: d.phase as any, type: d.type as any || null,
        sf: d.sf || null, rate: d.rate || null, term: d.term || null,
        freeRent: d.freeRent || null, ti: d.ti || null,
        projectedDate: d.projectedDate ? new Date(d.projectedDate) : null,
        pendingFee: d.pendingFee || null, probPercentage: d.probPercentage || null,
        purchasePrice: d.purchasePrice || null, ca: d.ca || false,
        occupierId: d.occupierId && occIds.has(d.occupierId) ? d.occupierId : null,
        capitalId: d.capitalId && capitalIds.has(d.capitalId) ? d.capitalId : null,
        leadBrokerId: d.leadBrokerId && userIds.has(d.leadBrokerId) ? d.leadBrokerId : null,
        brokerId: d.brokerId && userIds.has(d.brokerId) ? d.brokerId : null,
        pursuitId: d.pursuitId && pursuitIds.has(d.pursuitId) ? d.pursuitId : null,
      }
    })
  }

  console.log(`  → ${(data.tasks as any[]).length} tasks`)
  for (const t of data.tasks as any[]) {
    await prisma.task.create({
      data: {
        id: t.id, description: t.description || '', status: t.status as any,
        isVisible: t.isVisible !== false, entityId: t.entityId || null,
        brokerId: t.brokerId && userIds.has(t.brokerId) ? t.brokerId : null,
      }
    })
  }

  console.log(`  → ${(data.notes as any[]).length} notes`)
  for (const n of data.notes as any[]) {
    await prisma.note.create({ data: { id: n.id, text: n.text || '' } })
  }

  console.log('✅ Seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
