import { Accordion, Link, Tag } from '@navikt/ds-react'
import { EEtterlevelseStatus, EKravFilterType, IKravPrioritering, TKravQL } from '../../constants'
import { TTemaCode, codelist } from '../../services/Codelist'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { KravCard } from '../etterlevelseDokumentasjonTema/KravCard'
import { filterKrav } from '../etterlevelseDokumentasjonTema/common/utils'

interface IProps {
  etterlevelseDokumentasjonId: string
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
  kravPriority: IKravPrioritering[]
  openAccordions: boolean[]
  setOpenAccordions: React.Dispatch<React.SetStateAction<boolean[]>>
}

export const KravAccordionList = (props: IProps) => {
  const {
    etterlevelseDokumentasjonId,
    relevanteStats,
    utgaattStats,
    temaListe,
    kravPriority,
    openAccordions,
    setOpenAccordions,
  } = props

  const getKravForTema = (tema: TTemaCode) => {
    const lover = codelist.getCodesForTema(tema.code)
    const lovCodes = lover.map((lov) => lov.code)
    const krav = relevanteStats.filter((relevans) =>
      relevans.regelverk.map((regelverk: any) => regelverk.lov.code).some((lov: any) => lovCodes.includes(lov))
    )
    return filterKrav(kravPriority, krav, tema)
  }

  const toggleAccordion = (index: number) => {
    const newState = [...openAccordions]
    newState[index] = !openAccordions[index]
    setOpenAccordions(newState)
  }

  return (
    <Accordion indent={false}>
      {temaListe
        .filter((tema) => getKravForTema(tema).length > 0)
        .map((tema, index) => {
          const kravliste = getKravForTema(tema)
          const utfylteKrav = kravliste.filter(
            (krav) =>
              krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
              krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
          )
          return (
            <Accordion.Item
              key={`${tema.shortName}_panel`}
              className="flex flex-col gap-2"
              open={openAccordions[index]}
            >
              <Accordion.Header id={tema.code} onClick={() => toggleAccordion(index)}>
                <div className="flex gap-4">
                  <span>
                    {tema.shortName} ({utfylteKrav.length} av {kravliste.length} krav er ferdig
                    utfylt)
                  </span>
                  {kravliste.find(
                    (krav) =>
                      krav.kravVersjon === 1 &&
                      (krav.etterlevelseStatus === undefined ||
                        krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                      getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                  ) && <Tag variant="warning">Nytt krav</Tag>}
                  {kravliste.find(
                    (krav) =>
                      krav.kravVersjon > 1 &&
                      (krav.etterlevelseStatus === undefined ||
                        krav.etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE) &&
                      utgaattStats.filter(
                        (kl) => kl.kravNummer === krav.kravNummer && kl.etterlevelser.length > 0
                      ).length > 0 &&
                      getNumberOfDaysBetween(krav.aktivertDato, new Date()) < 30
                  ) && <Tag variant="warning">Ny versjon</Tag>}
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <div className="flex flex-col gap-6">
                  <div>
                    <Link href={`/tema/${tema.code}`} target="_blank">
                      Lær mer om {tema.shortName} (åpnes i ny fane)
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    {kravliste.map((krav, idx) => (
                      <KravCard
                        key={`krav_${idx}`}
                        krav={krav}
                        kravFilter={EKravFilterType.RELEVANTE_KRAV}
                        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                        temaCode={tema.code}
                      />
                    ))}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
    </Accordion>
  )
}
