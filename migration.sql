generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum DealPhase {
  LEASES_CONTRACTS
  WORKING_DEALS
  TRACKING_DEALS
  COLD
}

enum DealType {
  TREP
  LAND
  LISTING
  INVESTMENT_SALES
}

enum PursuitPhase {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum PursuitType {
  TREP
  LAND
  LISTING
  INVESTMENT_SALES
  ACQUISITION
}

enum OccupierStatus {
  IN_PROGRESS
  LOST
  WON
}

enum OccupierPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum DealStage {
  EARLY_TALKS
  ENDED
  PROSPECT
  COMPLETED
}

enum CapitalType {
  INVESTOR_OWNER
  DEVELOPER
}

enum TaskStatus {
  PENDING
  COMPLETE
}

model User {
  id               Int        @id @default(autoincrement())
  name             String
  email            String     @unique
  phone            String     @default("")
  jobTitle         String?
  roleId           Int?
  createdAt        DateTime   @default(now())
  dealsAsLead      Deal[]     @relation("LeadBroker")
  dealsAsBroker    Deal[]     @relation("Broker")
  pursuits         Pursuit[]
  tasks            Task[]
  occupiersPrimary Occupier[] @relation("PrimaryBroker")
  occupiersBroker  Occupier[] @relation("SecondaryBroker")
}

model Occupier {
  id                  Int              @id @default(autoincrement())
  companyName         String
  priority            OccupierPriority @default(LOW)
  currentAddress      String?
  headquartersAddress String?
  sizeOfSpace         Int?
  leaseExpiration     DateTime?
  nextContact         DateTime?
  occupierStatus      OccupierStatus   @default(IN_PROGRESS)
  dateStarted         DateTime?
  dealStage           DealStage        @default(EARLY_TALKS)
  industry            String?          @default("-")
  isDeleted           Boolean          @default(false)
  primaryBrokerId     Int?
  brokerId            Int?
  createdAt           DateTime         @default(now())
  primaryBroker       User?            @relation("PrimaryBroker", fields: [primaryBrokerId], references: [id])
  broker              User?            @relation("SecondaryBroker", fields: [brokerId], references: [id])
  contacts            Contact[]
  deals               Deal[]
}

model Contact {
  id         Int       @id @default(autoincrement())
  name       String
  jobTitle   String    @default("")
  phone      String    @default("")
  email      String    @default("")
  occupierId Int?
  capitalId  Int?
  occupier   Occupier? @relation(fields: [occupierId], references: [id])
  capital    Capital?  @relation(fields: [capitalId], references: [id])
}

model Capital {
  id          Int         @id @default(autoincrement())
  companyName String
  ownerCode   String?
  status      String      @default("Active")
  type        CapitalType @default(DEVELOPER)
  createdAt   DateTime    @default(now())
  contacts    Contact[]
  deals       Deal[]
  pursuits    Pursuit[]
}

model Deal {
  id             Int        @id @default(autoincrement())
  name           String
  phase          DealPhase  @default(TRACKING_DEALS)
  type           DealType?
  sf             Int?
  rate           Float?
  term           Int?
  freeRent       Int?
  ti             Float?
  projectedDate  DateTime?
  pendingFee     Float?
  probPercentage Float?
  purchasePrice  Float?
  ca             Boolean    @default(false)
  occupierId     Int?
  capitalId      Int?
  leadBrokerId   Int?
  brokerId       Int?
  pursuitId      Int?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  occupier       Occupier?  @relation(fields: [occupierId], references: [id])
  capital        Capital?   @relation(fields: [capitalId], references: [id])
  leadBroker     User?      @relation("LeadBroker", fields: [leadBrokerId], references: [id])
  broker         User?      @relation("Broker", fields: [brokerId], references: [id])
  pursuit        Pursuit?   @relation(fields: [pursuitId], references: [id])
}

model Pursuit {
  id                 Int          @id @default(autoincrement())
  name               String
  type               PursuitType  @default(TREP)
  assetAnalysisPhase PursuitPhase @default(IN_PROGRESS)
  totalSf            Float?
  submarket          String?
  brokerId           Int?
  capitalId          Int?
  createdAt          DateTime     @default(now())
  broker             User?        @relation(fields: [brokerId], references: [id])
  capital            Capital?     @relation(fields: [capitalId], references: [id])
  deals              Deal[]
}

model Task {
  id          Int        @id @default(autoincrement())
  description String
  status      TaskStatus @default(PENDING)
  isVisible   Boolean    @default(true)
  entityId    Int?
  entityType  String?
  brokerId    Int?
  createdAt   DateTime   @default(now())
  broker      User?      @relation(fields: [brokerId], references: [id])
}

model Note {
  id         Int      @id @default(autoincrement())
  text       String
  entityId   Int?
  entityType String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
