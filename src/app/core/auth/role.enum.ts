export enum Role {
  Student = 'student',
  Instructor = 'instructor',
  AssessmentSpecialist = 'assessment_specialist',
  ProgramManager = 'program_manager',
  Observer = 'observer',
  PlatformAdmin = 'platform_admin',
}

export const ALL_ROLES: Role[] = Object.values(Role);

// Rol bazlı Türkçe görünüm etiketleri (UI'da kullanılıyor)
export const ROLE_LABELS: Record<Role, string> = {
  [Role.Student]: 'Öğrenci',
  [Role.Instructor]: 'Eğitmen',
  [Role.AssessmentSpecialist]: 'Ölçme Uzmanı',
  [Role.ProgramManager]: 'Program Yöneticisi',
  [Role.Observer]: 'Gözlemci',
  [Role.PlatformAdmin]: 'Platform Yöneticisi',
};