import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // ROLES Y PERMISOS
  // ============================================

  const permissions = [
    // Pacientes
    { resource: 'patients', action: 'create', description: 'Crear pacientes' },
    { resource: 'patients', action: 'read', description: 'Ver pacientes' },
    { resource: 'patients', action: 'update', description: 'Actualizar pacientes' },
    { resource: 'patients', action: 'delete', description: 'Eliminar pacientes' },

    // Citas
    { resource: 'appointments', action: 'create', description: 'Crear citas' },
    { resource: 'appointments', action: 'read', description: 'Ver citas' },
    { resource: 'appointments', action: 'update', description: 'Actualizar citas' },
    { resource: 'appointments', action: 'delete', description: 'Eliminar citas' },

    // Tratamientos
    { resource: 'treatments', action: 'create', description: 'Crear tratamientos' },
    { resource: 'treatments', action: 'read', description: 'Ver tratamientos' },
    { resource: 'treatments', action: 'update', description: 'Actualizar tratamientos' },
    { resource: 'treatments', action: 'delete', description: 'Eliminar tratamientos' },

    // Historia clínica
    { resource: 'medical-history', action: 'create', description: 'Crear historia clínica' },
    { resource: 'medical-history', action: 'read', description: 'Ver historia clínica' },
    { resource: 'medical-history', action: 'update', description: 'Actualizar historia clínica' },

    // Odontogramas
    { resource: 'odontograms', action: 'create', description: 'Crear odontogramas' },
    { resource: 'odontograms', action: 'read', description: 'Ver odontogramas' },
    { resource: 'odontograms', action: 'update', description: 'Actualizar odontogramas' },

    // Contabilidad
    { resource: 'billing', action: 'create', description: 'Crear transacciones' },
    { resource: 'billing', action: 'read', description: 'Ver contabilidad' },
    { resource: 'billing', action: 'update', description: 'Actualizar transacciones' },
    { resource: 'billing', action: 'delete', description: 'Eliminar transacciones' },

    // Reportes
    { resource: 'reports', action: 'read', description: 'Ver reportes' },
    { resource: 'reports', action: 'export', description: 'Exportar reportes' },

    // Configuración
    { resource: 'settings', action: 'read', description: 'Ver configuración' },
    { resource: 'settings', action: 'update', description: 'Actualizar configuración' },
  ];

  console.log('Creating permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  // Crear roles
  console.log('Creating roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador del sistema con acceso total',
      permissions: {
        connect: await prisma.permission.findMany().then(perms => perms.map(p => ({ id: p.id }))),
      },
    },
  });

  const doctorPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'patients' },
        { resource: 'appointments' },
        { resource: 'treatments' },
        { resource: 'medical-history' },
        { resource: 'odontograms' },
        { resource: 'billing', action: { in: ['create', 'read'] } },
        { resource: 'reports', action: 'read' },
      ],
    },
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: 'doctor' },
    update: {},
    create: {
      name: 'doctor',
      description: 'Doctor odontólogo',
      permissions: {
        connect: doctorPermissions.map(p => ({ id: p.id })),
      },
    },
  });

  const receptionistPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'patients', action: { in: ['create', 'read', 'update'] } },
        { resource: 'appointments' },
        { resource: 'billing', action: { in: ['create', 'read'] } },
        { resource: 'reports', action: 'read' },
      ],
    },
  });

  const receptionistRole = await prisma.role.upsert({
    where: { name: 'receptionist' },
    update: {},
    create: {
      name: 'receptionist',
      description: 'Recepcionista',
      permissions: {
        connect: receptionistPermissions.map(p => ({ id: p.id })),
      },
    },
  });

  // ============================================
  // USUARIOS
  // ============================================

  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@soldent.com' },
    update: {},
    create: {
      email: 'admin@soldent.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      phone: '0999999999',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'doctor@soldent.com' },
    update: {},
    create: {
      email: 'doctor@soldent.com',
      password: hashedPassword,
      firstName: 'Dr. Juan',
      lastName: 'Pérez',
      phone: '0988888888',
      roleId: doctorRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'recepcion@soldent.com' },
    update: {},
    create: {
      email: 'recepcion@soldent.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'González',
      phone: '0977777777',
      roleId: receptionistRole.id,
    },
  });

  // ============================================
  // CÓDIGOS CIE-10
  // ============================================

  console.log('Creating CIE-10 codes...');

  const cie10Codes = [
    // K00: Trastornos del desarrollo y erupción
    { code: 'K00.0', name: 'Anodoncia', category: 'K00: Trastornos del desarrollo y erupción de los dientes', chapter: 'K00-K14' },
    { code: 'K00.1', name: 'Dientes supernumerarios', category: 'K00: Trastornos del desarrollo y erupción de los dientes', chapter: 'K00-K14' },
    { code: 'K00.2', name: 'Anomalías del tamaño y forma de los dientes', category: 'K00: Trastornos del desarrollo y erupción de los dientes', chapter: 'K00-K14' },

    // K01: Dientes incluidos
    { code: 'K01.0', name: 'Dientes incluidos', category: 'K01: Dientes incluidos e impactados', chapter: 'K00-K14' },
    { code: 'K01.1', name: 'Dientes impactados', category: 'K01: Dientes incluidos e impactados', chapter: 'K00-K14' },

    // K02: Caries dental
    { code: 'K02.0', name: 'Caries limitada al esmalte', category: 'K02: Caries dental', chapter: 'K00-K14' },
    { code: 'K02.1', name: 'Caries de la dentina', category: 'K02: Caries dental', chapter: 'K00-K14' },
    { code: 'K02.2', name: 'Caries del cemento', category: 'K02: Caries dental', chapter: 'K00-K14' },
    { code: 'K02.3', name: 'Caries dentaria detenida', category: 'K02: Caries dental', chapter: 'K00-K14' },
    { code: 'K02.9', name: 'Caries dental no especificada', category: 'K02: Caries dental', chapter: 'K00-K14' },

    // K03: Otras enfermedades de tejidos duros
    { code: 'K03.0', name: 'Atrición excesiva de los dientes', category: 'K03: Otras enfermedades de los tejidos duros', chapter: 'K00-K14' },
    { code: 'K03.1', name: 'Abrasión de los dientes', category: 'K03: Otras enfermedades de los tejidos duros', chapter: 'K00-K14' },
    { code: 'K03.2', name: 'Erosión de los dientes', category: 'K03: Otras enfermedades de los tejidos duros', chapter: 'K00-K14' },

    // K04: Enfermedades de la pulpa
    { code: 'K04.0', name: 'Pulpitis', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },
    { code: 'K04.1', name: 'Necrosis de la pulpa', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },
    { code: 'K04.4', name: 'Periodontitis apical aguda', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },
    { code: 'K04.5', name: 'Periodontitis apical crónica', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },
    { code: 'K04.6', name: 'Absceso periapical con fístula', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },
    { code: 'K04.7', name: 'Absceso periapical sin fístula', category: 'K04: Enfermedades de la pulpa y tejidos periapicales', chapter: 'K00-K14' },

    // K05: Gingivitis y periodontitis
    { code: 'K05.0', name: 'Gingivitis aguda', category: 'K05: Gingivitis y enfermedades periodontales', chapter: 'K00-K14' },
    { code: 'K05.1', name: 'Gingivitis crónica', category: 'K05: Gingivitis y enfermedades periodontales', chapter: 'K00-K14' },
    { code: 'K05.2', name: 'Periodontitis aguda', category: 'K05: Gingivitis y enfermedades periodontales', chapter: 'K00-K14' },
    { code: 'K05.3', name: 'Periodontitis crónica', category: 'K05: Gingivitis y enfermedades periodontales', chapter: 'K00-K14' },

    // K06: Trastornos de la encía
    { code: 'K06.0', name: 'Retracción gingival', category: 'K06: Otros trastornos de la encía', chapter: 'K00-K14' },
    { code: 'K06.1', name: 'Hiperplasia gingival', category: 'K06: Otros trastornos de la encía', chapter: 'K00-K14' },

    // K07: Anomalías dentofaciales
    { code: 'K07.0', name: 'Anomalías del tamaño de los maxilares', category: 'K07: Anomalías dentofaciales', chapter: 'K00-K14' },
    { code: 'K07.2', name: 'Anomalías de la relación entre los arcos dentarios', category: 'K07: Anomalías dentofaciales', chapter: 'K00-K14' },
    { code: 'K07.3', name: 'Anomalías de la posición del diente', category: 'K07: Anomalías dentofaciales', chapter: 'K00-K14' },
    { code: 'K07.6', name: 'Trastornos de la articulación temporomandibular', category: 'K07: Anomalías dentofaciales', chapter: 'K00-K14' },

    // K08: Otros trastornos
    { code: 'K08.1', name: 'Pérdida de dientes', category: 'K08: Otros trastornos de los dientes', chapter: 'K00-K14' },
    { code: 'K08.3', name: 'Raíz dental retenida', category: 'K08: Otros trastornos de los dientes', chapter: 'K00-K14' },
  ];

  for (const code of cie10Codes) {
    await prisma.cIE10Code.upsert({
      where: { code: code.code },
      update: {},
      create: code,
    });
  }

  // ============================================
  // CATÁLOGO DE TRATAMIENTOS
  // ============================================

  console.log('Creating treatment catalog...');

  const treatments = [
    // Preventivos
    { code: 'PREV-001', name: 'Limpieza dental (profilaxis)', category: 'Preventivo', baseCost: 35.00, duration: 30 },
    { code: 'PREV-002', name: 'Aplicación de flúor', category: 'Preventivo', baseCost: 20.00, duration: 15 },
    { code: 'PREV-003', name: 'Sellantes dentales', category: 'Preventivo', baseCost: 25.00, duration: 20 },

    // Diagnóstico
    { code: 'DIAG-001', name: 'Consulta inicial', category: 'Diagnóstico', baseCost: 15.00, duration: 30 },
    { code: 'DIAG-002', name: 'Radiografía periapical', category: 'Diagnóstico', baseCost: 10.00, duration: 10 },
    { code: 'DIAG-003', name: 'Radiografía panorámica', category: 'Diagnóstico', baseCost: 30.00, duration: 15 },

    // Restauración
    { code: 'REST-001', name: 'Resina (obturación simple)', category: 'Restauración', baseCost: 45.00, duration: 45 },
    { code: 'REST-002', name: 'Resina (obturación compuesta)', category: 'Restauración', baseCost: 60.00, duration: 60 },
    { code: 'REST-003', name: 'Amalgama', category: 'Restauración', baseCost: 40.00, duration: 45 },
    { code: 'REST-004', name: 'Incrustación', category: 'Restauración', baseCost: 150.00, duration: 90 },

    // Endodoncia
    { code: 'ENDO-001', name: 'Endodoncia unirradicular', category: 'Endodoncia', baseCost: 120.00, duration: 90 },
    { code: 'ENDO-002', name: 'Endodoncia birradicular', category: 'Endodoncia', baseCost: 180.00, duration: 120 },
    { code: 'ENDO-003', name: 'Endodoncia multirradicular', category: 'Endodoncia', baseCost: 220.00, duration: 150 },

    // Cirugía
    { code: 'CIRUG-001', name: 'Extracción simple', category: 'Cirugía', baseCost: 35.00, duration: 30 },
    { code: 'CIRUG-002', name: 'Extracción compleja', category: 'Cirugía', baseCost: 80.00, duration: 60 },
    { code: 'CIRUG-003', name: 'Extracción de cordal', category: 'Cirugía', baseCost: 150.00, duration: 90 },
    { code: 'CIRUG-004', name: 'Cirugía de implante', category: 'Cirugía', baseCost: 600.00, duration: 120 },

    // Prótesis
    { code: 'PROT-001', name: 'Corona de porcelana', category: 'Prótesis', baseCost: 300.00, duration: 90 },
    { code: 'PROT-002', name: 'Corona metal-porcelana', category: 'Prótesis', baseCost: 250.00, duration: 90 },
    { code: 'PROT-003', name: 'Puente fijo 3 unidades', category: 'Prótesis', baseCost: 750.00, duration: 120 },
    { code: 'PROT-004', name: 'Prótesis total removible', category: 'Prótesis', baseCost: 500.00, duration: 180 },
    { code: 'PROT-005', name: 'Prótesis parcial removible', category: 'Prótesis', baseCost: 350.00, duration: 120 },

    // Ortodoncia
    { code: 'ORTO-001', name: 'Brackets metálicos', category: 'Ortodoncia', baseCost: 1200.00, duration: 60 },
    { code: 'ORTO-002', name: 'Brackets estéticos', category: 'Ortodoncia', baseCost: 1500.00, duration: 60 },
    { code: 'ORTO-003', name: 'Control mensual de ortodoncia', category: 'Ortodoncia', baseCost: 40.00, duration: 30 },

    // Periodoncia
    { code: 'PERIO-001', name: 'Raspado y alisado radicular por cuadrante', category: 'Periodoncia', baseCost: 80.00, duration: 60 },
    { code: 'PERIO-002', name: 'Cirugía periodontal', category: 'Periodoncia', baseCost: 200.00, duration: 90 },

    // Estética
    { code: 'ESTET-001', name: 'Blanqueamiento dental', category: 'Estética', baseCost: 200.00, duration: 90 },
    { code: 'ESTET-002', name: 'Carilla de porcelana', category: 'Estética', baseCost: 350.00, duration: 90 },
  ];

  for (const treatment of treatments) {
    await prisma.treatmentCatalog.upsert({
      where: { code: treatment.code },
      update: {},
      create: treatment,
    });
  }

  console.log('✅ Seeding completed!');
  console.log('\n📋 Created:');
  console.log(`  - ${permissions.length} permissions`);
  console.log('  - 3 roles (admin, doctor, receptionist)');
  console.log('  - 3 users');
  console.log(`  - ${cie10Codes.length} CIE-10 codes`);
  console.log(`  - ${treatments.length} treatment catalog items`);
  console.log('\n👤 Test users:');
  console.log('  - admin@soldent.com / admin123');
  console.log('  - doctor@soldent.com / admin123');
  console.log('  - recepcion@soldent.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
