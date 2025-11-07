/**
 * Ejemplos de uso de Prisma para Soldent
 *
 * Este archivo contiene ejemplos de queries y operaciones comunes
 * para el sistema de gestión odontológica.
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// PACIENTES
// ============================================

/**
 * Crear un paciente nuevo con contacto de emergencia
 */
async function createPatientWithEmergencyContact() {
  const patient = await prisma.patient.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE',
      identification: '1234567890',
      identificationType: 'CEDULA',
      phone: '0999123456',
      email: 'juan.perez@example.com',
      address: 'Av. Principal 123',
      city: 'Quito',
      province: 'Pichincha',
      emergencyContacts: {
        create: {
          name: 'María Pérez',
          relationship: 'Esposa',
          phone: '0999654321',
        },
      },
      medicalHistories: {
        create: {
          allergies: JSON.stringify(['Penicilina']),
          chronicDiseases: JSON.stringify(['Diabetes tipo 2']),
          currentMedications: JSON.stringify(['Metformina 500mg']),
          brushingFrequency: 2,
          usesFloss: true,
          smokingHabit: 'NEVER',
          alcoholConsumption: 'OCCASIONAL',
        },
      },
    },
    include: {
      emergencyContacts: true,
      medicalHistories: true,
    },
  });

  return patient;
}

/**
 * Buscar paciente por identificación con toda su información
 */
async function findPatientByIdentification(identification: string) {
  return await prisma.patient.findUnique({
    where: { identification },
    include: {
      emergencyContacts: true,
      medicalHistories: true,
      odontograms: {
        where: { isCurrent: true },
        include: { teeth: true },
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      treatments: {
        where: { status: 'IN_PROGRESS' },
      },
    },
  });
}

/**
 * Buscar pacientes con filtros
 */
async function searchPatients(query: string) {
  return await prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { identification: { contains: query } },
        { phone: { contains: query } },
      ],
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      identification: true,
      phone: true,
      email: true,
    },
    take: 10,
  });
}

// ============================================
// ODONTOGRAMAS
// ============================================

/**
 * Crear odontograma inicial para un paciente
 */
async function createInitialOdontogram(patientId: string, type: 'PERMANENT' | 'TEMPORARY') {
  // Números de dientes según sistema FDI
  const toothNumbers = type === 'PERMANENT'
    ? [
        // Cuadrante 1 (superior derecho)
        '11', '12', '13', '14', '15', '16', '17', '18',
        // Cuadrante 2 (superior izquierdo)
        '21', '22', '23', '24', '25', '26', '27', '28',
        // Cuadrante 3 (inferior izquierdo)
        '31', '32', '33', '34', '35', '36', '37', '38',
        // Cuadrante 4 (inferior derecho)
        '41', '42', '43', '44', '45', '46', '47', '48',
      ]
    : [
        // Temporales
        '51', '52', '53', '54', '55',
        '61', '62', '63', '64', '65',
        '71', '72', '73', '74', '75',
        '81', '82', '83', '84', '85',
      ];

  return await prisma.odontogram.create({
    data: {
      patientId,
      type,
      isCurrent: true,
      teeth: {
        create: toothNumbers.map(number => ({
          toothNumber: number,
          status: 'HEALTHY',
        })),
      },
    },
    include: { teeth: true },
  });
}

/**
 * Actualizar estado de un diente (crea nueva versión de odontograma)
 */
async function updateToothStatus(
  patientId: string,
  toothNumber: string,
  newStatus: string,
  surfaces?: Record<string, string>
) {
  // Obtener odontograma actual
  const currentOdontogram = await prisma.odontogram.findFirst({
    where: { patientId, isCurrent: true },
    include: { teeth: true },
  });

  if (!currentOdontogram) {
    throw new Error('No current odontogram found');
  }

  return await prisma.$transaction(async (tx) => {
    // Marcar odontograma actual como no vigente
    await tx.odontogram.update({
      where: { id: currentOdontogram.id },
      data: { isCurrent: false },
    });

    // Crear nueva versión
    const newOdontogram = await tx.odontogram.create({
      data: {
        patientId,
        type: currentOdontogram.type,
        version: currentOdontogram.version + 1,
        isCurrent: true,
        teeth: {
          create: currentOdontogram.teeth.map(tooth => ({
            toothNumber: tooth.toothNumber,
            status: tooth.toothNumber === toothNumber ? newStatus : tooth.status,
            surfaces: tooth.toothNumber === toothNumber
              ? JSON.stringify(surfaces || {})
              : tooth.surfaces,
          })),
        },
      },
      include: { teeth: true },
    });

    return newOdontogram;
  });
}

// ============================================
// CITAS
// ============================================

/**
 * Verificar disponibilidad de horario
 */
async function checkAvailability(
  doctorId: string,
  date: Date,
  startTime: string,
  duration: number
) {
  const dayOfWeek = date.getDay();

  // Verificar horario de trabajo
  const workSchedule = await prisma.workSchedule.findFirst({
    where: {
      doctorId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!workSchedule) {
    return { available: false, reason: 'Doctor no trabaja este día' };
  }

  // Verificar tiempos bloqueados
  const blockedTime = await prisma.blockedTime.findFirst({
    where: {
      doctorId,
      date,
      startTime: { lte: startTime },
      endTime: { gt: startTime },
    },
  });

  if (blockedTime) {
    return { available: false, reason: `Bloqueado: ${blockedTime.reason}` };
  }

  // Verificar citas existentes
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
      ],
    },
  });

  if (existingAppointment) {
    return { available: false, reason: 'Horario ocupado' };
  }

  return { available: true };
}

/**
 * Crear cita con validación
 */
async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: string;
  reason: string;
}) {
  // Verificar disponibilidad
  const availability = await checkAvailability(
    data.doctorId,
    data.date,
    data.startTime,
    data.duration
  );

  if (!availability.available) {
    throw new Error(availability.reason);
  }

  return await prisma.appointment.create({
    data: {
      ...data,
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
}

/**
 * Obtener citas del día para un doctor
 */
async function getDailyAppointments(doctorId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { notIn: ['CANCELLED'] },
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
}

// ============================================
// TRATAMIENTOS Y PAGOS
// ============================================

/**
 * Crear tratamiento con plan de pago
 */
async function createTreatmentWithPaymentPlan(
  patientId: string,
  doctorId: string,
  catalogId: string,
  cost: number,
  installmentsCount: number
) {
  const installmentAmount = cost / installmentsCount;
  const today = new Date();

  return await prisma.$transaction(async (tx) => {
    // Crear tratamiento
    const treatment = await tx.treatment.create({
      data: {
        patientId,
        doctorId,
        catalogId,
        cost,
        balance: cost,
        status: 'PLANNED',
      },
    });

    // Crear plan de pago
    const paymentPlan = await tx.paymentPlan.create({
      data: {
        patientId,
        treatmentId: treatment.id,
        totalAmount: cost,
        balance: cost,
        installments: {
          create: Array.from({ length: installmentsCount }, (_, i) => ({
            number: i + 1,
            amount: installmentAmount,
            dueDate: new Date(today.setMonth(today.getMonth() + i + 1)),
            status: 'PENDING',
          })),
        },
      },
      include: { installments: true },
    });

    return { treatment, paymentPlan };
  });
}

/**
 * Registrar pago de cuota
 */
async function payInstallment(installmentId: string, amount: number, paymentMethod: string) {
  return await prisma.$transaction(async (tx) => {
    const installment = await tx.installment.findUnique({
      where: { id: installmentId },
      include: { paymentPlan: true },
    });

    if (!installment) {
      throw new Error('Installment not found');
    }

    // Crear registro de pago
    const payment = await tx.patientPayment.create({
      data: {
        patientId: installment.paymentPlan.patientId,
        treatmentId: installment.paymentPlan.treatmentId,
        installmentId: installment.id,
        amount,
        paymentMethod,
        concept: `Cuota ${installment.number}`,
      },
    });

    // Actualizar cuota
    await tx.installment.update({
      where: { id: installmentId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });

    // Actualizar plan de pago
    await tx.paymentPlan.update({
      where: { id: installment.paymentPlanId },
      data: {
        paidAmount: { increment: amount },
        balance: { decrement: amount },
      },
    });

    // Actualizar tratamiento
    await tx.treatment.update({
      where: { id: installment.paymentPlan.treatmentId },
      data: {
        paid: { increment: amount },
        balance: { decrement: amount },
      },
    });

    return payment;
  });
}

// ============================================
// REPORTES
// ============================================

/**
 * Reporte financiero mensual
 */
async function getMonthlyFinancialReport(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Ingresos
  const income = await prisma.transaction.aggregate({
    where: {
      type: 'INCOME',
      date: { gte: startDate, lte: endDate },
      deletedAt: null,
    },
    _sum: { amount: true },
  });

  // Egresos
  const expenses = await prisma.transaction.aggregate({
    where: {
      type: 'EXPENSE',
      date: { gte: startDate, lte: endDate },
      deletedAt: null,
    },
    _sum: { amount: true },
  });

  // Egresos por categoría
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      date: { gte: startDate, lte: endDate },
      deletedAt: null,
    },
    _sum: { amount: true },
  });

  return {
    period: { year, month },
    income: income._sum.amount || 0,
    expenses: expenses._sum.amount || 0,
    netIncome: (income._sum.amount || 0) - (expenses._sum.amount || 0),
    expensesByCategory,
  };
}

/**
 * Cuentas por cobrar
 */
async function getAccountsReceivable() {
  return await prisma.paymentPlan.findMany({
    where: {
      status: 'ACTIVE',
      balance: { gt: 0 },
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      installments: {
        where: { status: 'OVERDUE' },
      },
    },
    orderBy: { startDate: 'asc' },
  });
}

/**
 * Cuotas vencidas
 */
async function getOverdueInstallments() {
  const today = new Date();

  return await prisma.installment.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: today },
    },
    include: {
      paymentPlan: {
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

// ============================================
// DIAGNÓSTICOS
// ============================================

/**
 * Crear diagnóstico con tratamiento
 */
async function createDiagnosisWithTreatment(
  patientId: string,
  doctorId: string,
  cie10Code: string,
  treatmentCatalogId: string,
  toothNumber?: string
) {
  return await prisma.$transaction(async (tx) => {
    // Obtener información del CIE-10
    const cie10 = await tx.cIE10Code.findUnique({
      where: { code: cie10Code },
    });

    if (!cie10) {
      throw new Error('CIE-10 code not found');
    }

    // Crear diagnóstico
    const diagnosis = await tx.diagnosis.create({
      data: {
        patientId,
        doctorId,
        cie10Code,
        cie10Name: cie10.name,
        toothNumber,
      },
    });

    // Obtener catálogo de tratamiento
    const catalog = await tx.treatmentCatalog.findUnique({
      where: { id: treatmentCatalogId },
    });

    if (!catalog) {
      throw new Error('Treatment catalog not found');
    }

    // Crear tratamiento
    const treatment = await tx.treatment.create({
      data: {
        patientId,
        doctorId,
        diagnosisId: diagnosis.id,
        catalogId: catalog.id,
        toothNumber,
        cost: catalog.baseCost,
        balance: catalog.baseCost,
        status: 'PLANNED',
      },
    });

    return { diagnosis, treatment };
  });
}

// Exportar funciones de ejemplo
export {
  createPatientWithEmergencyContact,
  findPatientByIdentification,
  searchPatients,
  createInitialOdontogram,
  updateToothStatus,
  checkAvailability,
  createAppointment,
  getDailyAppointments,
  createTreatmentWithPaymentPlan,
  payInstallment,
  getMonthlyFinancialReport,
  getAccountsReceivable,
  getOverdueInstallments,
  createDiagnosisWithTreatment,
};
