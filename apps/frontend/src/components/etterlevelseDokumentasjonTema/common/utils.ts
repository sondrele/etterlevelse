import _ from 'lodash'
import {
  EEtterlevelseStatus,
  IEtterlevelse,
  IKravPrioritering,
  ISuksesskriterieBegrunnelse,
  TKravQL,
} from '../../../constants'
import { mapEtterlevelseData } from '../../../pages/EtterlevelseDokumentasjonTemaPage'
import { TTemaCode } from '../../../services/Codelist'
import { sortKravListeByPriority } from '../../../util/sort'

export const filterKrav = (
  allKravPriority: IKravPrioritering[],
  kravList?: TKravQL[],
  temaData?: TTemaCode,
  filterFerdigDokumentert?: boolean
) => {
  const unfilteredkraver = kravList ? _.cloneDeep(kravList) : []

  unfilteredkraver.map((krav) => {
    const priority = allKravPriority.filter(
      (kravPriority) =>
        kravPriority.kravNummer === krav.kravNummer && kravPriority.kravVersjon === krav.kravVersjon
    )
    krav.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
    return krav
  })

  const sortedKrav = sortKravListeByPriority<TKravQL>(unfilteredkraver, temaData?.shortName || '')

  const mapped = sortedKrav.map((krav) => {
    const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
    return {
      kravNummer: krav.kravNummer,
      kravVersjon: krav.kravVersjon,
      navn: krav.navn,
      status: krav.status,
      suksesskriterier: krav.suksesskriterier,
      varselMelding: krav.varselMelding,
      prioriteringsId: krav.prioriteringsId,
      changeStamp: krav.changeStamp,
      aktivertDato: krav.aktivertDato,
      ...mapEtterlevelseData(etterlevelse),
    }
  })

  if (filterFerdigDokumentert) {
    for (let index = mapped.length - 1; index > 0; index--) {
      if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped[index - 1].gammelVersjon = true
      } else if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus !== EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped.splice(index - 1, 1)
      }
    }
  }
  return mapped
}

export const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({
  kravNummer: it.kravNummer,
  kravVersjon: it.kravVersjon,
})

export const syncEtterlevelseKriterieBegrunnelseWithKrav = (
  etterlevelse: IEtterlevelse,
  krav?: TKravQL
) => {
  const suksesskriterieBegrunnelse: ISuksesskriterieBegrunnelse[] = []

  krav?.suksesskriterier.forEach((k) => {
    suksesskriterieBegrunnelse.push(
      etterlevelse.suksesskriterieBegrunnelser.filter((e) => e.suksesskriterieId === k.id)[0]
    )
  })

  return suksesskriterieBegrunnelse
}
