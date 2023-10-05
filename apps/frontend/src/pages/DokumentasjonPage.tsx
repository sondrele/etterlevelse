import React, { useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import { ettlevColors, theme } from '../util/theme'
import { Layout2 } from '../components/scaffold/Page'
import { arkPennIcon, ellipse80, saveArchiveIcon } from '../components/Images'
import { EtterlevelseDokumentasjonQL, EtterlevelseDokumentasjonStats, KravQL, KravStatus, PageResponse } from '../constants'
import { gql, useQuery } from '@apollo/client'
import { Code, codelist, ListName } from '../services/Codelist'
import { Button, KIND, SIZE } from 'baseui/button'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'

import { ampli } from '../services/Amplitude'
import { getMainHeader, getNewestKravVersjon, responsiveDisplayEtterlevelseDokumentasjonPage } from '../components/etterlevelseDokumentasjon/common/utils'
import { user } from '../services/User'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../api/ArkiveringApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { TemaCardEtterlevelseDokumentasjon } from '../components/etterlevelseDokumentasjon/TemaCardEtterlevelseDokumentasjon'
import { ArkiveringModal } from '../components/etterlevelseDokumentasjon/ArkiveringModal'
import ExportEtterlevelseModal from '../components/export/ExportEtterlevelseModal'
import { isFerdigUtfylt } from './EtterlevelseDokumentasjonTemaPage'
import { Spinner } from '../components/common/Spinner'
import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Label } from '@navikt/ds-react'

export const DokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(params.id)

  const {
    data: relevanteData,
    refetch: refetchRelevanteData,
    loading,
  } = useQuery<{ etterlevelseDokumentasjon: PageResponse<{ stats: EtterlevelseDokumentasjonStats }> }>(statsQuery, {
    variables: { etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id },
  })

  const [relevanteStats, setRelevanteStats] = useState<any[]>([])
  const [utgaattStats, setUtgaattStats] = useState<any[]>([])
  const [arkivModal, setArkivModal] = useState<boolean>(false)

  const filterData = (
    unfilteredData:
      | {
          etterlevelseDokumentasjon: PageResponse<{
            stats: EtterlevelseDokumentasjonStats
          }>
        }
      | undefined,
  ) => {
    const relevanteStatusListe: any[] = []
    const utgaattStatusListe: any[] = []

    unfilteredData?.etterlevelseDokumentasjon.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        } else if (k.regelverk.length && k.status === KravStatus.UTGAATT) {
          utgaattStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        } else if (k.regelverk.length && k.status === KravStatus.UTGAATT) {
          utgaattStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.etterlevelseDokumentasjonId === etterlevelseDokumentasjon?.id) })
        }
      })
    })

    relevanteStatusListe.sort((a, b) => {
      return a.kravNummer - b.kravNummer
    })

    utgaattStatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }
      return a.kravNummer - b.kravNummer
    })

    return [relevanteStatusListe, utgaattStatusListe]
  }

  React.useEffect(() => {
    const [relevanteStatusListe, utgaattStatusListe] = filterData(relevanteData)
    setRelevanteStats(relevanteStatusListe)
    setUtgaattStats(utgaattStatusListe)
  }, [relevanteData])

  React.useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (etterlevelseDokumentasjon) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse Dokumentasjon Page',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title}`,
      })
    }
  }, [etterlevelseDokumentasjon])

  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: KravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  const getRelevansContent = (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
    const emptyRelevans = etterlevelseDokumentasjon.irrelevansFor.length === options.length ? true : false

    return (
        <div className="flex items-center gap-2">
          {emptyRelevans ? (
            <div className="flex items-center gap-1">
              <ExclamationmarkTriangleFillIcon className="text-2xl text-icon-warning" />
              <Label size="small">
                Ingen egenskaper er oppgitt
              </Label>
            </div>
          ) : (
            <Label size="small">
              Aktive egenskaper:
            </Label>
          )}
          {!etterlevelseDokumentasjon.irrelevansFor.length ? getRelevans() : getRelevans(etterlevelseDokumentasjon.irrelevansFor)}
        </div>
    )
  }

  const getSecondaryHeader = (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => (
    <Block width="100%" display={responsiveDisplayEtterlevelseDokumentasjonPage} alignItems="center" justifyContent="space-between" marginTop={'8px'} marginBottom={'8px'}>
      <Block display="flex" alignItems="center">
        <Block>
          <HeadingXLarge marginTop="0px" marginBottom="0px">
            Tema for dokumentasjon
          </HeadingXLarge>
          { // TODO: overskriften er kjip, tenk på det
          }
        </Block>
      </Block>

      <Block display="flex" alignItems="center">
        {user.isAdmin() && (
          <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => setArkivModal(true)} startEnhancer={<img src={saveArchiveIcon} alt="arkiv ikon" />}>
            Arkiver
          </Button>
        )}

        <ExportEtterlevelseModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />

        <Block display="flex" alignItems="baseline" marginRight="30px">
          <ParagraphMedium $style={{ fontWeight: 900, fontSize: '32px', marginTop: 0, marginBottom: 0 }} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {getNewestKravVersjon(relevanteStats).length}
          </ParagraphMedium>
          <ParagraphMedium>krav</ParagraphMedium>
        </Block>

        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />

        <ArkiveringModal
          arkivModal={arkivModal}
          setArkivModal={setArkivModal}
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          etterlevelseArkiv={etterlevelseArkiv}
          setEtterlevelseArkiv={setEtterlevelseArkiv}
        />

        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <ParagraphMedium $style={{ fontWeight: 900, fontSize: '32px', marginTop: 0, marginBottom: 0 }} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {antallFylttKrav}
          </ParagraphMedium>
          <ParagraphMedium>ferdig utfylt</ParagraphMedium>
        </Block>
      </Block>
    </Block>
  )

  const getRelevans = (irrelevans?: Code[]) => {
    if (irrelevans?.length === options.length) {
      return <BodyShort size="small">For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved dokumentasjonen.</BodyShort>
    }

    if (irrelevans) {
      const relevans = options.filter((n) => !irrelevans.map((ir: Code) => ir.code).includes(n.id))

      return (
        <div className="flex flex-wrap gap-1">
          {relevans.map((r, index) => (
            <div key={r.id} className="flex items-center gap-1">
              <BodyShort size="small">{r.label}</BodyShort>
              {index < relevans.length - 1 && <img alt="dot" src={ellipse80} />}
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="flex flex-wrap gap-1">
        {options.map((o, index) => (
          <div key={o.id} className="flex items-center gap-1">
            <BodyShort size="small">{o.label}</BodyShort>
            {index < options.length - 1 && <img alt="dot" src={ellipse80} />}
          </div>
        ))}
      </div>
    )
  }

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
  ]

  return (
    <Block width="100%">
      <Layout2
        headerBackgroundColor={ettlevColors.grey50}
        mainHeader={getMainHeader(etterlevelseDokumentasjon, setEtterlevelseDokumentasjon)}
        secondaryHeaderBackgroundColor={ettlevColors.white}
        secondaryHeader={getSecondaryHeader(etterlevelseDokumentasjon)}
        childrenBackgroundColor={ettlevColors.grey25}
        currentPage={'Tema for dokumentasjon'}
        breadcrumbPaths={breadcrumbPaths}
      >
        <Block backgroundColor={ettlevColors.grey50} marginTop={theme.sizing.scale800}></Block>
        {getRelevansContent(etterlevelseDokumentasjon)}
        {loading ? (
          <Block display="flex" width="100%" justifyContent="center" marginTop={theme.sizing.scale550}>
            <Spinner size="50px" />
          </Block>
        ) : (
          <div className="flex flex-row flex-wrap gap-2 w-full">
            {temaListe.map((tema) => (
              <TemaCardEtterlevelseDokumentasjon
                tema={tema}
                stats={relevanteStats}
                utgaattStats={utgaattStats}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                key={`${tema.shortName}_panel`}
              />
            ))}
          </div>
        )}
        {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <Block>
              <H3>Tema dere har filtrert bort</H3>
              <ParagraphMedium maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</ParagraphMedium>
            </Block>
            <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </Block>
          </>
        )} */}
      </Layout2>
    </Block>
  )
}

export const statsQuery = gql`
  query getEtterlevelseDokumentasjonStats($etterlevelseDokumentasjonId: ID) {
    etterlevelseDokumentasjon(filter: { id: $etterlevelseDokumentasjonId }) {
      content {
        stats {
          fyltKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser {
              behandlingId
              status
              etterlevelseDokumentasjonId
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          ikkeFyltKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser {
              behandlingId
              status
              etterlevelseDokumentasjonId
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          irrelevantKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser {
              behandlingId
              status
              etterlevelseDokumentasjonId
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          utgaattKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser {
              behandlingId
              status
              etterlevelseDokumentasjonId
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          lovStats {
            lovCode {
              code
              shortName
            }
            fyltKrav {
              id
              kravNummer
              kravVersjon
              status
              navn
              kravIdRelasjoner
              kravRelasjoner {
                id
                kravNummer
                kravVersjon
                navn
              }
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            ikkeFyltKrav {
              id
              kravNummer
              kravVersjon
              status
              aktivertDato
              navn
              kravIdRelasjoner
              kravRelasjoner {
                id
                kravNummer
                kravVersjon
                navn
              }
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            irrelevantKrav {
              id
              kravNummer
              kravVersjon
              status
              aktivertDato
              navn
              kravIdRelasjoner
              kravRelasjoner {
                id
                kravNummer
                kravVersjon
                navn
              }
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
          }
        }
      }
    }
  }
`
