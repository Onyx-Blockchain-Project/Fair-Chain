const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample Stellar testnet addresses
const SAMPLE_ADDRESSES = {
  factories: [
    'GAA3KDJIGWT7QI6A7B6NG7KMY3FSJ5AXEOTUQO7QC5WXK2VUTWF2YJ2H',
    'GBCXFHFZXKQ7C37C3HQXXJZGPWVD4UHCXVTYQQGJJYD4OWWM4YXFSDJN',
    'GCOUQP3XBQBEKBKX4IHRO2Q23D2R6D3QTQDEAIH6STWFVRQYWEZFTKSU',
    'GDQX6QMBYWGFUV6YNYXQWA4JMJE6TUVQHNJCQC5BKQGKMPRULGRWVLJQ',
    'GCBYMXVQGJCTK4B5SRJXJMJUPJKYGU2WKK7MJXQNQJXYGQKIJ3HC5BCY',
    'GAWNFUCCVDFHGJGURWA7YOFDET4G7OJ4C4UBJEBQBNQFOXNRW2EWQEZI',
    'GDMTXS6JTC2XJDAT2T2GQWEOMKPJESGONL2F4WHZQWOIYLQQFVX67WVO',
    'GAKDDBBVBU6TQ2B4NBPFJIOQ7ROQPEKGRYTUQXDYXMMVVVQWFWIUBP7Y',
  ],
  auditors: [
    'GAHVQJVDNQ3Y4P2KKGXBKSQMVRBEZXAHJSJ2J74J4XNV2DCHJPSJNKRJ',
    'GCH4LMBXWGG4ZGLVVMLBW5CVRAS4L2XXZUD3NTVP5P42MYFOERUMXVSN',
    'GA2KYX3QUAEKTVD4HEJVWAFXBBACYKXOAQDWNR6LNSQTMZDZM4GPPTNN',
    'GCWVKPZKMVHK2C5BK3XNPNBQATVQTUJRGJGDO3CX52QZLCKM6GY5YB2X',
    'GAHMSNMT5VQZ2KMXDQUZHMQIQB4DR2YMLJTMIX5JKPRJAHEXKYVGUOBC',
  ],
  lenders: [
    'GBB3J3GVQ5W3WK5QPDS2DHRJB6RPNFMQHZ3FKME5UVQJGXJLSWNGFVMI',
    'GCHJWQNPFVXVE7RWXNZGNB3VK3FKRGQQ6QWX5RDVNJVSO2O7MTTQHQQL',
  ],
  buyers: [
    'GDRBIVJFIPL3HSYTRLCHDCFX2WG52W2E5XNMKS2JKG4HTXUIQVU3KJUH',
    'GCZZDSKKCQ3JQDFDVCR3P3GQZFTMQYQJFDN6EZLAQMVWB3SK7BRGXRUQ',
  ],
};

const factoryData = [
  {
    walletAddress: SAMPLE_ADDRESSES.factories[0],
    name: 'Sidamo Coffee Cooperative',
    location: 'Sidamo, Ethiopia',
    productType: 'coffee',
    employeeCount: 120,
    certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[1],
    name: 'Addis Ababa Textile Works',
    location: 'Addis Ababa, Ethiopia',
    productType: 'textiles',
    employeeCount: 350,
    certifications: ['ISO 9001', 'GOTS'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[2],
    name: 'Ethiopian Leather Craft',
    location: 'Modjo, Ethiopia',
    productType: 'leather',
    employeeCount: 85,
    certifications: ['Leather Working Group'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[3],
    name: 'Yirgacheffe Organic Coffee',
    location: 'Yirgacheffe, Ethiopia',
    productType: 'coffee',
    employeeCount: 200,
    certifications: ['Organic', 'Fair Trade', 'Bird Friendly'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[4],
    name: 'Hawassa Garment Factory',
    location: 'Hawassa, Ethiopia',
    productType: 'textiles',
    employeeCount: 500,
    certifications: ['ISO 9001', 'BSCI', 'WRAP'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[5],
    name: 'Agricultural Products PLC',
    location: 'Bahir Dar, Ethiopia',
    productType: 'agriculture',
    employeeCount: 75,
    certifications: ['GlobalGAP'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[6],
    name: 'Premium Leather Goods',
    location: 'Debre Birhan, Ethiopia',
    productType: 'leather',
    employeeCount: 45,
    certifications: ['ISO 14001'],
  },
  {
    walletAddress: SAMPLE_ADDRESSES.factories[7],
    name: 'Dire Dawa Coffee Roasters',
    location: 'Dire Dawa, Ethiopia',
    productType: 'coffee',
    employeeCount: 60,
    certifications: ['Fair Trade'],
  },
];

const auditorData = [
  {
    walletAddress: SAMPLE_ADDRESSES.auditors[0],
    name: 'Abebe Kebede',
    email: 'abebe.kebede@auditor.et',
    stakedAmount: 10000000000n, // 1000 XLM
    reputationScore: 95,
    auditsCompleted: 45,
    isActive: true,
  },
  {
    walletAddress: SAMPLE_ADDRESSES.auditors[1],
    name: 'Sarah Johnson',
    email: 'sarah.j@compliance.org',
    stakedAmount: 7500000000n, // 750 XLM
    reputationScore: 88,
    auditsCompleted: 32,
    isActive: true,
  },
  {
    walletAddress: SAMPLE_ADDRESSES.auditors[2],
    name: 'Tigist Haile',
    email: 'tigist.h@audit-et.com',
    stakedAmount: 5000000000n, // 500 XLM (minimum)
    reputationScore: 72,
    auditsCompleted: 18,
    isActive: true,
  },
  {
    walletAddress: SAMPLE_ADDRESSES.auditors[3],
    name: 'Michael Chen',
    email: 'mchen@sustainability.global',
    stakedAmount: 15000000000n, // 1500 XLM
    reputationScore: 97,
    auditsCompleted: 67,
    isActive: true,
  },
  {
    walletAddress: SAMPLE_ADDRESSES.auditors[4],
    name: 'Fatuma Ali',
    email: 'fatuma.ali@ethicalaudit.et',
    stakedAmount: 8000000000n, // 800 XLM
    reputationScore: 82,
    auditsCompleted: 28,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.reputation.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.auditor.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.tradeFinance.deleteMany();
  await prisma.sDGImpact.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create Factories
  console.log('🏭 Creating factories...');
  const createdFactories = await Promise.all(
    factoryData.map(factory =>
      prisma.factory.create({
        data: factory,
      })
    )
  );
  console.log(`✅ Created ${createdFactories.length} factories\n`);

  // Create Auditors
  console.log('👥 Creating auditors...');
  const createdAuditors = await Promise.all(
    auditorData.map(auditor =>
      prisma.auditor.create({
        data: auditor,
      })
    )
  );
  console.log(`✅ Created ${createdAuditors.length} auditors\n`);

  // Create Audits
  console.log('📋 Creating audits...');
  const auditData = [
    {
      auditIdOnChain: 1n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[0],
      factoryAddress: SAMPLE_ADDRESSES.factories[0],
      laborScore: 92,
      environmentalScore: 88,
      qualityScore: 95,
      safetyScore: 90,
      overallScore: 91.25,
      ipfsHash: 'QmX4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest1', 'https://ipfs.io/ipfs/QmTest2'],
      notes: 'Excellent working conditions. All safety protocols followed.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-01-15'),
      verifiedAt: new Date('2024-01-18'),
    },
    {
      auditIdOnChain: 2n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[1],
      factoryAddress: SAMPLE_ADDRESSES.factories[0],
      laborScore: 89,
      environmentalScore: 91,
      qualityScore: 93,
      safetyScore: 87,
      overallScore: 90.0,
      ipfsHash: 'QmY5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvZ',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest3'],
      notes: 'Good improvements since last audit. Wage compliance excellent.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-06-20'),
      verifiedAt: new Date('2024-06-22'),
    },
    {
      auditIdOnChain: 3n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[0],
      factoryAddress: SAMPLE_ADDRESSES.factories[1],
      laborScore: 85,
      environmentalScore: 78,
      qualityScore: 92,
      safetyScore: 80,
      overallScore: 83.75,
      ipfsHash: 'QmZ5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvA',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest4', 'https://ipfs.io/ipfs/QmTest5'],
      notes: 'Good quality control. Environmental practices need improvement.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-02-10'),
      verifiedAt: new Date('2024-02-14'),
    },
    {
      auditIdOnChain: 4n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[3],
      factoryAddress: SAMPLE_ADDRESSES.factories[1],
      laborScore: 88,
      environmentalScore: 82,
      qualityScore: 94,
      safetyScore: 85,
      overallScore: 87.25,
      ipfsHash: 'QmA5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvB',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest6'],
      notes: 'Improved environmental score. Strong quality systems.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-07-05'),
      verifiedAt: new Date('2024-07-08'),
    },
    {
      auditIdOnChain: 5n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[2],
      factoryAddress: SAMPLE_ADDRESSES.factories[2],
      laborScore: 75,
      environmentalScore: 70,
      qualityScore: 88,
      safetyScore: 72,
      overallScore: 76.25,
      ipfsHash: 'QmB5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvC',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest7'],
      notes: 'Small operation with basic compliance. Room for improvement.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-03-01'),
      verifiedAt: new Date('2024-03-05'),
    },
    {
      auditIdOnChain: 6n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[0],
      factoryAddress: SAMPLE_ADDRESSES.factories[3],
      laborScore: 95,
      environmentalScore: 94,
      qualityScore: 96,
      safetyScore: 93,
      overallScore: 94.5,
      ipfsHash: 'QmC5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvD',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest8', 'https://ipfs.io/ipfs/QmTest9'],
      notes: 'Exceptional facility. Model for sustainable coffee production.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-04-12'),
      verifiedAt: new Date('2024-04-15'),
    },
    {
      auditIdOnChain: 7n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[4],
      factoryAddress: SAMPLE_ADDRESSES.factories[4],
      laborScore: 90,
      environmentalScore: 86,
      qualityScore: 91,
      safetyScore: 89,
      overallScore: 89.0,
      ipfsHash: 'QmD5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvE',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest10'],
      notes: 'Large operation with good systems. Minor safety observations.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-05-20'),
      verifiedAt: new Date('2024-05-23'),
    },
    {
      auditIdOnChain: 8n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[1],
      factoryAddress: SAMPLE_ADDRESSES.factories[4],
      laborScore: 91,
      environmentalScore: 88,
      qualityScore: 90,
      safetyScore: 92,
      overallScore: 90.25,
      ipfsHash: 'QmE5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvF',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest11', 'https://ipfs.io/ipfs/QmTest12'],
      notes: 'Continued improvement. Safety issues resolved.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-08-10'),
      verifiedAt: new Date('2024-08-13'),
    },
    {
      auditIdOnChain: 9n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[3],
      factoryAddress: SAMPLE_ADDRESSES.factories[5],
      laborScore: 80,
      environmentalScore: 85,
      qualityScore: 82,
      safetyScore: 78,
      overallScore: 81.25,
      ipfsHash: 'QmF5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvG',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest13'],
      notes: 'Standard agricultural operation. Good environmental awareness.',
      categories: ['Labor', 'Environmental', 'Quality', 'Safety'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-06-01'),
      verifiedAt: new Date('2024-06-04'),
    },
    {
      auditIdOnChain: 10n,
      auditorAddress: SAMPLE_ADDRESSES.auditors[2],
      factoryAddress: SAMPLE_ADDRESSES.factories[6],
      laborScore: 70,
      environmentalScore: 65,
      qualityScore: 85,
      safetyScore: 68,
      overallScore: 72.0,
      ipfsHash: 'QmG5zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvY4zKZ6JqXvH',
      evidenceUrls: ['https://ipfs.io/ipfs/QmTest14'],
      notes: 'Small leather workshop. Needs support for compliance.',
      categories: ['Labor', 'Environmental', 'Quality'],
      status: 'VERIFIED',
      submittedAt: new Date('2024-07-15'),
      verifiedAt: new Date('2024-07-18'),
    },
  ];

  const createdAudits = await Promise.all(
    auditData.map(audit =>
      prisma.audit.create({
        data: audit,
      })
    )
  );
  console.log(`✅ Created ${createdAudits.length} audits\n`);

  // Create Reputations
  console.log('⭐ Creating reputation scores...');
  const reputationData = [
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[0],
      totalScore: 90.6,
      auditorReputationComponent: 91.5,
      evidenceDepthComponent: 88.0,
      recencyComponent: 92.0,
      categoryCoverageComponent: 95.0,
      auditCount: 2,
      lastAuditTimestamp: new Date('2024-06-22'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[1],
      totalScore: 85.5,
      auditorReputationComponent: 92.5,
      evidenceDepthComponent: 80.0,
      recencyComponent: 88.0,
      categoryCoverageComponent: 90.0,
      auditCount: 2,
      lastAuditTimestamp: new Date('2024-07-08'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[2],
      totalScore: 76.25,
      auditorReputationComponent: 72.0,
      evidenceDepthComponent: 70.0,
      recencyComponent: 85.0,
      categoryCoverageComponent: 85.0,
      auditCount: 1,
      lastAuditTimestamp: new Date('2024-03-05'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[3],
      totalScore: 94.5,
      auditorReputationComponent: 95.0,
      evidenceDepthComponent: 95.0,
      recencyComponent: 90.0,
      categoryCoverageComponent: 100.0,
      auditCount: 1,
      lastAuditTimestamp: new Date('2024-04-15'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[4],
      totalScore: 89.6,
      auditorReputationComponent: 85.0,
      evidenceDepthComponent: 90.0,
      recencyComponent: 95.0,
      categoryCoverageComponent: 95.0,
      auditCount: 2,
      lastAuditTimestamp: new Date('2024-08-13'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[5],
      totalScore: 81.25,
      auditorReputationComponent: 97.0,
      evidenceDepthComponent: 75.0,
      recencyComponent: 88.0,
      categoryCoverageComponent: 90.0,
      auditCount: 1,
      lastAuditTimestamp: new Date('2024-06-04'),
    },
    {
      factoryAddress: SAMPLE_ADDRESSES.factories[6],
      totalScore: 72.0,
      auditorReputationComponent: 72.0,
      evidenceDepthComponent: 65.0,
      recencyComponent: 95.0,
      categoryCoverageComponent: 75.0,
      auditCount: 1,
      lastAuditTimestamp: new Date('2024-07-18'),
    },
  ];

  const createdReputations = await Promise.all(
    reputationData.map(reputation =>
      prisma.reputation.create({
        data: reputation,
      })
    )
  );
  console.log(`✅ Created ${createdReputations.length} reputation scores\n`);

  // Create SDG Impact Data
  console.log('🌍 Creating SDG impact data...');
  const sdgData = [
    {
      factoriesRegistered: 8,
      auditsCompleted: 10,
      tradeFinanceUnlocked: 25000000000n, // 2500 XLM
      jobsSupported: 1435,
      smeRevenueGrowth: 15.5,
      wageComplianceRate: 87.5,
      safetyIncidentsReduced: 12.0,
      femaleLedPercent: 35.0,
      co2ReductionTons: 45.5,
      wasteReductionPercent: 18.0,
      sustainableFactories: 6,
      month: 'August',
      year: 2024,
    },
    {
      factoriesRegistered: 6,
      auditsCompleted: 7,
      tradeFinanceUnlocked: 15000000000n,
      jobsSupported: 1100,
      smeRevenueGrowth: 12.0,
      wageComplianceRate: 85.0,
      safetyIncidentsReduced: 8.0,
      femaleLedPercent: 32.0,
      co2ReductionTons: 35.0,
      wasteReductionPercent: 15.0,
      sustainableFactories: 4,
      month: 'July',
      year: 2024,
    },
    {
      factoriesRegistered: 5,
      auditsCompleted: 5,
      tradeFinanceUnlocked: 10000000000n,
      jobsSupported: 950,
      smeRevenueGrowth: 10.0,
      wageComplianceRate: 82.0,
      safetyIncidentsReduced: 5.0,
      femaleLedPercent: 30.0,
      co2ReductionTons: 28.0,
      wasteReductionPercent: 12.0,
      sustainableFactories: 3,
      month: 'June',
      year: 2024,
    },
  ];

  const createdSDG = await Promise.all(
    sdgData.map(sdg =>
      prisma.sDGImpact.create({
        data: sdg,
      })
    )
  );
  console.log(`✅ Created ${createdSDG.length} SDG impact records\n`);

  // Create Disputes
  console.log('⚖️ Creating disputes...');
  const disputeData = [
    {
      disputeIdOnChain: 1n,
      plaintiff: SAMPLE_ADDRESSES.factories[2],
      defendant: SAMPLE_ADDRESSES.auditors[2],
      auditId: 'audit-005',
      reason: 'Auditor did not properly review wage records',
      bond: 1000000000n, // 100 XLM
      status: 'RESOLVED',
      decision: 'DEFENDANT_WIN',
      createdAt: new Date('2024-04-01'),
      resolvedAt: new Date('2024-04-15'),
    },
  ];

  const createdDisputes = await Promise.all(
    disputeData.map(dispute =>
      prisma.dispute.create({
        data: dispute,
      })
    )
  );
  console.log(`✅ Created ${createdDisputes.length} disputes\n`);

  // Create Trade Finance
  console.log('💰 Creating trade finance records...');
  const financeData = [
    {
      financeIdOnChain: 1n,
      factoryAddress: SAMPLE_ADDRESSES.factories[0],
      lenderAddress: SAMPLE_ADDRESSES.lenders[0],
      buyerAddress: SAMPLE_ADDRESSES.buyers[0],
      amount: 5000000000n, // 500 XLM
      invoiceHash: 'QmInvoiceHash1',
      status: 'RELEASED',
      requestedAt: new Date('2024-05-01'),
      approvedAt: new Date('2024-05-03'),
      releasedAt: new Date('2024-05-20'),
    },
    {
      financeIdOnChain: 2n,
      factoryAddress: SAMPLE_ADDRESSES.factories[3],
      lenderAddress: SAMPLE_ADDRESSES.lenders[1],
      buyerAddress: SAMPLE_ADDRESSES.buyers[1],
      amount: 10000000000n, // 1000 XLM
      invoiceHash: 'QmInvoiceHash2',
      status: 'APPROVED',
      requestedAt: new Date('2024-08-01'),
      approvedAt: new Date('2024-08-05'),
    },
  ];

  const createdFinance = await Promise.all(
    financeData.map(finance =>
      prisma.tradeFinance.create({
        data: finance,
      })
    )
  );
  console.log(`✅ Created ${createdFinance.length} trade finance records\n`);

  console.log('✨ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${createdFactories.length} factories`);
  console.log(`   - ${createdAuditors.length} auditors`);
  console.log(`   - ${createdAudits.length} audits`);
  console.log(`   - ${createdReputations.length} reputation scores`);
  console.log(`   - ${createdSDG.length} SDG impact records`);
  console.log(`   - ${createdDisputes.length} disputes`);
  console.log(`   - ${createdFinance.length} trade finance records`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
