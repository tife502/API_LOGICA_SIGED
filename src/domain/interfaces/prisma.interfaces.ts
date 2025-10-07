// Interfaces para los principales modelos de Prisma
// Basadas en el schema de la base de datos SIGED

// Enums
export enum EmpleadoCargo {
  Docente = 'Docente',
  Rector = 'Rector'
}

export enum EmpleadoEstado {
  activo = 'activo',
  inactivo = 'inactivo',
  suspendido = 'suspendido'
}

export enum SedeEstado {
  activa = 'activa',
  inactiva = 'inactiva'
}

export enum SedeZona {
  urbana = 'urbana',
  rural = 'rural'
}

export enum UsuarioRol {
  super_admin = 'super_admin',
  admin = 'admin',
  gestor = 'gestor'
}

export enum UsuarioEstado {
  activo = 'activo',
  inactivo = 'inactivo',
  suspendido = 'suspendido'
}

export enum AsignacionEmpleadoEstado {
  activa = 'activa',
  finalizada = 'finalizada'
}

export enum HorasExtraJornada {
  mañana = 'mañana',
  tarde = 'tarde',
  sabatina = 'sabatina',
  nocturna = 'nocturna'
}

export enum SuplenciasJornada {
  mañana = 'mañana',
  tarde = 'tarde',
  sabatina = 'sabatina'
}



export enum DocumentosEmpleadoTipo {
  HV = 'HV',
  LICENCIAS = 'LICENCIAS',
  CONTRATO = 'CONTRATO',
  SOPORTE_MEDICO = 'SOPORTE_MEDICO'
}

export enum NivelAcademico {
  estudios_basicos = 'estudios_basicos',
  bachiller = 'bachiller',
  profesional = 'profesional',
  tecnologo = 'tecnologo',
  licenciado = 'licenciado',
  especializacion = 'especializacion',
  magister = 'magister',
  doctorado = 'doctorado'
}

// ============= INTERFACES PARA DATOS REALES (con id, created_at, etc.) =============

// Interface para empleado completo (datos reales de DB)
export interface IEmpleado {
  id: string;
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  direccion: string | null;
  cargo: EmpleadoCargo;
  estado: EmpleadoEstado;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface para sede completa (datos reales de DB)
export interface ISede {
  id: string;
  nombre: string;
  estado: SedeEstado;
  zona: SedeZona;
  direccion: string;
  codigo_DANE: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface para institución educativa completa (datos reales de DB)
export interface IInstitucionEducativa {
  id: string;
  nombre: string;
  rector_encargado_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface para asignación empleado completa (datos reales de DB)
export interface IAsignacionEmpleado {
  id: string;
  empleado_id: string;
  sede_id: string;
  fecha_asignacion: Date | null;
  fecha_fin: Date | null;
  estado: AsignacionEmpleadoEstado;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface para jornada completa (datos reales de DB)
export interface IJornada {
  id: number;
  nombre: string;
  created_at: Date | null;
  updated_at: Date | null;
}


// ============= INTERFACES PARA INFORMACIÓN ACADÉMICA =============

// Interface para crear información académica
export interface ICreateInformacionAcademica {
  empleado_id: string;
  nivel_academico: NivelAcademico;
  anos_experiencia?: number;
  institucion?: string;
  titulo?: string;
}

// Interface para actualizar información académica
export interface IUpdateInformacionAcademica {
  empleado_id?: string;
  nivel_academico?: NivelAcademico;
  anos_experiencia?: number;
  institucion?: string;
  titulo?: string;
}

// Interface para información académica completa
export interface IInformacionAcademica {
  id: string;
  empleado_id: string;
  nivel_academico: NivelAcademico;
  anos_experiencia: number | null;
  institucion: string | null;
  titulo: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface para crear rector completo (request body) - CORREGIDA
export interface ICreateRectorCompletoRequest {
  empleado: ICreateEmpleado;
  informacionAcademica?: ICreateInformacionAcademica;
  institucion: ICreateInstitucionEducativa;
  sedes: {
    crear?: Array<ICreateSede & {
      jornadas?: string[]; // Solo nombres de jornadas existentes: "Mañana", "Tarde", "Sabatina", "Nocturna"
    }>;
    asignar_existentes?: string[];
  };
  fechaAsignacion?: string | Date;
  observaciones?: string;
}

// Interface para respuesta del rector completo
export interface ICreateRectorCompletoResponse {
  rector: IEmpleado;                        // Datos reales del empleado creado
  informacionAcademica?: IInformacionAcademica; // Datos reales de info académica
  institucion: IInstitucionEducativa;      // Datos reales de institución
  sedes: ISede[];                          // Array de sedes reales creadas/asignadas
  asignaciones: IAsignacionEmpleado[];     // Array de asignaciones reales
  jornadaAsignaciones?: Array<{            // Asignaciones de jornadas existentes
    sede_id: string;
    jornada_id: number;
    jornada_nombre: string;
  }>;
  resumen: {
    sedesCreadas: number;
    sedesAsignadas: number;
    asignacionesRealizadas: number;
    jornadasAsignadas?: number;
  };
}

// Interface para filtros de información académica
export interface IInformacionAcademicaFilters {
  empleado_id?: string;
  nivel_academico?: NivelAcademico;
  anos_experiencia_min?: number;
  anos_experiencia_max?: number;
  institucion?: string;
  titulo?: string;
}

// ============= INTERFACES PARA SEDES =============

// Interface para crear sede
export interface ICreateSede {
  nombre: string;
  estado?: SedeEstado;
  zona: SedeZona;
  direccion: string;
  codigo_DANE?: string;
}

// Interface para actualizar sede
export interface IUpdateSede {
  nombre?: string;
  estado?: SedeEstado;
  zona?: SedeZona;
  direccion?: string;
  codigo_DANE?: string;
}

// Interface para filtros de sede
export interface ISedeFilters {
  nombre?: string;
  estado?: SedeEstado;
  zona?: SedeZona;
  codigo_DANE?: string;
}

// Interface para comentarios de sede
export interface ICreateComentarioSede {
  observacion: string;
  sede_id: string;
  usuario_id: string;
}

export interface IUpdateComentarioSede {
  observacion?: string;
}

export interface IComentarioSedeFilters {
  sede_id?: string;
  usuario_id?: string;
}

// Interface para asignación empleado-sede
export interface ICreateAsignacionEmpleado {
  empleado_id: string;
  sede_id: string;
  fecha_asignacion?: Date;
  fecha_fin?: Date;
  estado?: AsignacionEmpleadoEstado;
}

// Interface para actualizar asignación empleado-sede
export interface IUpdateAsignacionEmpleado {
  fecha_fin?: Date;
  estado?: AsignacionEmpleadoEstado;
}

// Interface para filtros de asignación empleado-sede
export interface IAsignacionEmpleadoFilters {
  empleado_id?: string;
  sede_id?: string;
  estado?: AsignacionEmpleadoEstado;
  fecha_asignacion?: Date;
}

// Interface para sede-institución educativa
export interface ICreateSedeIE {
  sede_id: string;
  institucion_educativa_id: string;
}

// Interface para sede-jornada
export interface ICreateSedeJornada {
  sede_id: string;
  jornada_id: number;
}

// Interface para institución educativa
export interface ICreateInstitucionEducativa {
  nombre: string;
  rector_encargado_id?: string;
}

export interface IUpdateInstitucionEducativa {
  nombre?: string;
  rector_encargado_id?: string;
}

export interface IInstitucionEducativaFilters {
  nombre?: string;
  rector_encargado_id?: string;
}

// Interface para crear un empleado
export interface ICreateEmpleado {
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  direccion?: string;
  cargo: EmpleadoCargo;
  estado?: EmpleadoEstado;
}

// Interface para actualizar un empleado
export interface IUpdateEmpleado {
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  direccion?: string;
  cargo?: EmpleadoCargo;
  estado?: EmpleadoEstado;
}

// Interface para crear un usuario
export interface ICreateUsuario {
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  celular?: string;
  contrasena: string;
  rol?: UsuarioRol;
  estado?: UsuarioEstado;
}

// Interface para actualizar un usuario
export interface IUpdateUsuario {
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  celular?: string;
  contrasena?: string;
  rol?: UsuarioRol;
  estado?: UsuarioEstado;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
}

// Interface para el usuario completo (basado en el modelo de Prisma) - ACTUALIZADA
export interface IUsuario {
  id: string;
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  contrasena: string;
  rol: 'super_admin' | 'admin' | 'gestor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  created_at: Date;
  updated_at: Date;
  reset_password_expires: Date | null;  // ✅ AGREGADO
  reset_password_token: string | null;  // ✅ AGREGADO
}

// Interface para crear una sede
export interface ICreateSede {
  nombre: string;
  estado?: SedeEstado;
  zona: SedeZona;
  direccion: string;
  codigo_DANE?: string;
}

// Interface para actualizar una sede
export interface IUpdateSede {
  nombre?: string;
  estado?: SedeEstado;
  zona?: SedeZona;
  direccion?: string;
  codigo_DANE?: string;
}

// Interface para crear asignación de empleado
export interface ICreateAsignacionEmpleado {
  empleado_id: string;
  sede_id: string;
  fecha_asignacion?: Date;
  fecha_fin?: Date;
  estado?: AsignacionEmpleadoEstado;
}

// Interface para actualizar asignación de empleado
export interface IUpdateAsignacionEmpleado {
  empleado_id?: string;
  sede_id?: string;
  fecha_asignacion?: Date;
  fecha_fin?: Date;
  estado?: AsignacionEmpleadoEstado;
}

// Interface para crear horas extra
export interface ICreateHorasExtra {
  empleado_id: string;
  sede_id: string;
  cantidad_horas: number;
  fecha_realizacion: Date;
  jornada: HorasExtraJornada;
  observacion?: string;
}

// Interface para actualizar horas extra
export interface IUpdateHorasExtra {
  empleado_id?: string;
  sede_id?: string;
  cantidad_horas?: number;
  fecha_realizacion?: Date;
  jornada?: HorasExtraJornada;
  observacion?: string;
}

// Interface para crear suplencia
export interface ICreateSuplencia {
  docente_ausente_id: string;
  causa_ausencia: string;
  fecha_inicio_ausencia: Date;
  fecha_fin_ausencia: Date;
  sede_id: string;
  docente_reemplazo_id: string;
  fecha_inicio_reemplazo: Date;
  fecha_fin_reemplazo: Date;
  horas_cubiertas: number;
  jornada: 'ma_ana' | 'tarde' | 'sabatina';
  observacion?: string;
}

// Interface para actualizar suplencia
export interface IUpdateSuplencia {
  docente_ausente_id?: string;
  causa_ausencia?: string;
  fecha_inicio_ausencia?: Date;
  fecha_fin_ausencia?: Date;
  sede_id?: string;
  docente_reemplazo_id?: string;
  fecha_inicio_reemplazo?: Date;
  fecha_fin_reemplazo?: Date;
  horas_cubiertas?: number;
  jornada?: SuplenciasJornada;
  observacion?: string;
}

// Interface para crear institución educativa
export interface ICreateInstitucionEducativa {
  nombre: string;
  rector_encargado_id?: string;
}

// Interface para actualizar institución educativa
export interface IUpdateInstitucionEducativa {
  nombre?: string;
  rector_encargado_id?: string;
}

// Interface para crear información académica
export interface ICreateInformacionAcademica {
  empleado_id: string;
  nivel_academico: NivelAcademico;
  anos_experiencia?: number;
  institucion?: string;
  titulo?: string;
}

// Interface para actualizar información académica
export interface IUpdateInformacionAcademica {
  empleado_id?: string;
  nivel_academico?: NivelAcademico;
  anos_experiencia?: number;
  institucion?: string;
  titulo?: string;
}

// Interface para crear comentario de empleado
export interface ICreateComentarioEmpleado {
  observacion: string;
  empleado_id: string;
  usuario_id: string;
}

// Interface para crear comentario de sede
export interface ICreateComentarioSede {
  observacion: string;
  sede_id: string;
  usuario_id: string;
}

// Interface para crear documento de empleado
export interface ICreateDocumentoEmpleado {
  empleado_id: string;
  tipo_documento: DocumentosEmpleadoTipo;
  nombre: string;
  ruta_relativa: string;
  descripcion?: string;
}

// Interface para actualizar documento de empleado
export interface IUpdateDocumentoEmpleado {
  empleado_id?: string;
  tipo_documento?: DocumentosEmpleadoTipo;
  nombre?: string;
  ruta_relativa?: string;
  descripcion?: string;
}

// Interface para crear acto administrativo
export interface ICreateActoAdministrativo {
  fecha_creacion?: Date;
  nombre: string;
  descripcion?: string;
}

// Interface para actualizar acto administrativo
export interface IUpdateActoAdministrativo {
  fecha_creacion?: Date;
  nombre?: string;
  descripcion?: string;
}

// Interface para crear jornada
export interface ICreateJornada {
  nombre: string;
}

// Interface para filtros de búsqueda de empleados
export interface IEmpleadoFilters {
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  cargo?: EmpleadoCargo;
  estado?: EmpleadoEstado;
  sede_id?: string;
}

// Interface para filtros de búsqueda de usuarios
export interface IUsuarioFilters {
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: UsuarioRol;
  estado?: UsuarioEstado;
  reset_password_token?: string | null;   // ✅ YA ESTABA
  reset_password_expires?: Date | null;   // ✅ YA ESTABA
}

// Interface para filtros de búsqueda de sedes
export interface ISedeFilters {
  nombre?: string;
  estado?: SedeEstado;
  zona?: SedeZona;
  codigo_DANE?: string;
}

// Interface para paginación
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Interface para respuesta paginada
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Interface para respuesta de API
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============= INTERFACES PARA SUPLENCIAS =============

// Interface para suplencia completa (datos reales de DB)
export interface ISuplencias {
  id: string;
  docente_ausente_id: string;
  causa_ausencia: string;
  fecha_inicio_ausencia: Date;
  fecha_fin_ausencia: Date;
  sede_id: string;
  docente_reemplazo_id: string;
  fecha_inicio_reemplazo: Date;
  fecha_fin_reemplazo: Date;
  horas_cubiertas: number;
  jornada: SuplenciasJornada;
  observacion: string | null;
  created_at: Date | null;
}

// ============= INTERFACES PARA DOCUMENTOS DE SUPLENCIAS =============

// Interface para crear documento de suplencia
export interface ICreateDocumentoSuplencia {
  suplencia_id: string;
  nombre: string;
  ruta_relativa: string;
}

// Interface para actualizar documento de suplencia
export interface IUpdateDocumentoSuplencia {
  nombre?: string;
  ruta_relativa?: string;
}

// Interface para documento de suplencia completo (datos reales de DB)
export interface IDocumentoSuplencia {
  id: string;
  suplencia_id: string;
  nombre: string;
  ruta_relativa: string;
  created_at: Date | null;
}