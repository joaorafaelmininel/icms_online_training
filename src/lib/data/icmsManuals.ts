// src/lib/data/icmsManuals.ts
// Shared source of truth for the ICMS manuals — used by both the landing
// page section (IcmsManualsSection) and the header's dropdown menu
// (IcmsManualsDropdown), so a new manual only needs to be added in one place.

export interface IcmsManual {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  fileSize?: string;
}

export const icmsManuals: IcmsManual[] = [
  {
    id: 'icms3-team-guide',
    title: { en: 'ICMS3.0 — Team Guide', es: 'ICMS3.0 — Guía de Equipo' },
    description: {
      en: 'Operational reference covering ICMS3.0 field applications, worksite triage, and victim extrication procedures. Intended for USAR team leaders, command point staff, and field personnel.',
      es: 'Referencia operativa sobre las aplicaciones de campo del ICMS3.0, los procedimientos de triaje de sitios de trabajo y de extricación de víctimas. Destinada a líderes de equipo USAR, personal del punto de mando y personal de campo.',
    },
    href: '/manuals/icms3-team-guide.pdf',
    fileSize: 'PDF',
  },
  {
    id: 'icms3-ucc-guide',
    title: { en: 'ICMS3.0 — UCC Guide', es: 'ICMS3.0 — Guía de la UCC' },
    description: {
      en: 'Reference documentation for UCC / Coordination Centre functions, covering sector management, tasking, and team-tracking procedures. Intended for UCC staff, RDC personnel, and sector coordinators.',
      es: 'Documentación de referencia sobre las funciones de la UCC / Centro de Coordinación, que abarca los procedimientos de gestión de sectores, asignación de tareas y seguimiento de equipos. Destinada al personal de la UCC, al RDC y a los coordinadores de sector.',
    },
    href: '/manuals/icms3-ucc-guide.pdf',
    fileSize: 'PDF',
  },
];
