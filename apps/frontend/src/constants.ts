import {Code} from './services/Codelist'

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
}

type Not<T> = { [key in keyof T]?: never }
export type Or<T, U> = (T & Not<U>) | (U & Not<T>)

export interface UserInfo {
  loggedIn: boolean;
  groups: string[];
  ident?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  content: T[];
}

export interface GraphQLResponse<T> {
  errors?: {message: string}[]
  data: T
}

export interface ChangeStamp {
  lastModifiedBy: string;
  lastModifiedDate: string;
}

export interface DomainObject {
  changeStamp: ChangeStamp
  version: number
}

export interface Krav extends DomainObject {
  id: string

  kravNummer: number
  kravVersjon: number
  navn: string
  beskrivelse: string
  hensikt: string
  utdypendeBeskrivelse: string
  versjonEndringer: string
  dokumentasjon: string[]
  implementasjoner: string[]
  begreper: string[]
  kontaktPersoner: string[]
  rettskilder: string[]
  tagger: string[]
  periode?: Periode
  avdeling?: Code
  underavdeling?: Code
  relevansFor: Code[]
  status: KravStatus

  nyKravVersjon: boolean
}

export interface Etterlevelse extends DomainObject {
  id: string

  behandlingId: string
  kravNummer: number
  kravVersjon: number
  etterleves: boolean
  begrunnelse: string
  dokumentasjon: string[]
  fristForFerdigstillelse: string
  status: EtterlevelseStatus
}

export interface Behandling extends BehandlingEtterlevData {
  id: string
  navn: string
  nummer: number
  overordnetFormaal: ExternalCode
  formaal?: string
  avdeling?: ExternalCode
  linjer: ExternalCode[]
  systemer: ExternalCode[]
  teams: string[]
}

export interface BehandlingEtterlevData {
  id: string
  relevansFor: Code[]
}

export interface Periode {
  start: string
  slutt: string
}

export enum EtterlevelseStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG'
}

export enum KravStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG'
}

export const emptyPage = {content: [], numberOfElements: 0, pageNumber: 0, pages: 0, pageSize: 1, totalElements: 0}


export interface TeamResource {
  navIdent: string;
  givenName: string;
  familyName: string;
  fullName: string;
  email: string;
  resourceType: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  productAreaId?: string;
  slackChannel?: string;
  tags: string[];
  members: Member[];
}

export interface Member {
  name?: string;
  email?: string;
}

export interface ExternalCode {
  list: string;
  code: string;
  shortName: string;
  description: string;
}

export type EtterlevelseQL = Etterlevelse & {
  behandling: Behandling
}

export type KravGraphQL = Krav & {
  etterlevelser: (EtterlevelseQL)[]
}
