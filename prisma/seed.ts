import { ApplicationStatus, JobType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ids = {
  jobSeeker: '10000000-0000-4000-8000-000000000001',
  companyUserA: '10000000-0000-4000-8000-000000000002',
  companyUserB: '10000000-0000-4000-8000-000000000003',
  companyA: '20000000-0000-4000-8000-000000000001',
  companyB: '20000000-0000-4000-8000-000000000002',
  backendJob: '30000000-0000-4000-8000-000000000001',
  frontendJob: '30000000-0000-4000-8000-000000000002',
  dataJob: '30000000-0000-4000-8000-000000000003',
  applicationA: '40000000-0000-4000-8000-000000000001',
  applicationB: '40000000-0000-4000-8000-000000000002',
  historyA1: '50000000-0000-4000-8000-000000000001',
  historyA2: '50000000-0000-4000-8000-000000000002',
  historyB1: '50000000-0000-4000-8000-000000000003',
} as const;

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Demo123!', 12);

  await prisma.user.upsert({
    where: { id: ids.jobSeeker },
    update: {
      name: 'Dina Pencari Kerja',
      email: 'jobseeker@demo.indokerja.test',
      passwordHash,
      role: UserRole.JOB_SEEKER,
    },
    create: {
      id: ids.jobSeeker,
      name: 'Dina Pencari Kerja',
      email: 'jobseeker@demo.indokerja.test',
      passwordHash,
      role: UserRole.JOB_SEEKER,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.companyUserA },
    update: {
      name: 'PT Nusantara Digital Demo',
      email: 'company.one@demo.indokerja.test',
      passwordHash,
      role: UserRole.COMPANY,
    },
    create: {
      id: ids.companyUserA,
      name: 'PT Nusantara Digital Demo',
      email: 'company.one@demo.indokerja.test',
      passwordHash,
      role: UserRole.COMPANY,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.companyUserB },
    update: {
      name: 'CV Karya Teknologi Demo',
      email: 'company.two@demo.indokerja.test',
      passwordHash,
      role: UserRole.COMPANY,
    },
    create: {
      id: ids.companyUserB,
      name: 'CV Karya Teknologi Demo',
      email: 'company.two@demo.indokerja.test',
      passwordHash,
      role: UserRole.COMPANY,
    },
  });

  await prisma.company.upsert({
    where: { id: ids.companyA },
    update: {
      userId: ids.companyUserA,
      name: 'PT Nusantara Digital Demo',
      description: 'Perusahaan teknologi fiktif untuk data pengembangan.',
    },
    create: {
      id: ids.companyA,
      userId: ids.companyUserA,
      name: 'PT Nusantara Digital Demo',
      description: 'Perusahaan teknologi fiktif untuk data pengembangan.',
    },
  });

  await prisma.company.upsert({
    where: { id: ids.companyB },
    update: {
      userId: ids.companyUserB,
      name: 'CV Karya Teknologi Demo',
      description: 'Studio perangkat lunak fiktif untuk keperluan demo.',
    },
    create: {
      id: ids.companyB,
      userId: ids.companyUserB,
      name: 'CV Karya Teknologi Demo',
      description: 'Studio perangkat lunak fiktif untuk keperluan demo.',
    },
  });

  const jobs = [
    {
      id: ids.backendJob,
      companyId: ids.companyA,
      title: 'Backend Developer',
      location: 'Jakarta',
      salary: 12000000,
      jobType: JobType.FULL_TIME,
      description: 'Membangun layanan backend yang aman dan mudah dipelihara.',
    },
    {
      id: ids.frontendJob,
      companyId: ids.companyA,
      title: 'Frontend Developer Intern',
      location: 'Bandung',
      salary: 5000000,
      jobType: JobType.INTERNSHIP,
      description: 'Membantu mengembangkan antarmuka web yang responsif.',
    },
    {
      id: ids.dataJob,
      companyId: ids.companyB,
      title: 'Data Analyst',
      location: 'Surabaya',
      salary: 7500000,
      jobType: JobType.CONTRACT,
      description: 'Mengolah data demo menjadi laporan bisnis yang jelas.',
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({ where: { id: job.id }, update: job, create: job });
  }

  await prisma.application.upsert({
    where: { id: ids.applicationA },
    update: {
      jobId: ids.backendJob,
      jobSeekerId: ids.jobSeeker,
      status: ApplicationStatus.REVIEWING,
    },
    create: {
      id: ids.applicationA,
      jobId: ids.backendJob,
      jobSeekerId: ids.jobSeeker,
      status: ApplicationStatus.REVIEWING,
    },
  });

  await prisma.application.upsert({
    where: { id: ids.applicationB },
    update: {
      jobId: ids.dataJob,
      jobSeekerId: ids.jobSeeker,
      status: ApplicationStatus.APPLIED,
    },
    create: {
      id: ids.applicationB,
      jobId: ids.dataJob,
      jobSeekerId: ids.jobSeeker,
      status: ApplicationStatus.APPLIED,
    },
  });

  const histories = [
    {
      id: ids.historyA1,
      applicationId: ids.applicationA,
      status: ApplicationStatus.APPLIED,
    },
    {
      id: ids.historyA2,
      applicationId: ids.applicationA,
      status: ApplicationStatus.REVIEWING,
    },
    {
      id: ids.historyB1,
      applicationId: ids.applicationB,
      status: ApplicationStatus.APPLIED,
    },
  ];

  for (const history of histories) {
    await prisma.applicationStatusHistory.upsert({
      where: { id: history.id },
      update: {},
      create: history,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed.');
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
