import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { useBehandling } from '../api/BehandlingApi'
import { HeadingXLarge, LabelSmall, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import { FormikProps } from 'formik'
import { ettlevColors, theme } from '../util/theme'
import { Layout2 } from '../components/scaffold/Page'
import { arkPennIcon, editIcon, ellipse80, warningAlert } from '../components/Images'
import { Behandling, BehandlingEtterlevData, KravQL, KravStatus, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { Code, codelist, ListName } from '../services/Codelist'
import { Button, KIND, SIZE } from 'baseui/button'
import EditBehandlingModal from '../components/behandling/EditBehandlingModal'
import { marginZero } from '../components/common/Style'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { BehandlingStats } from '../components/behandling/ViewBehandling'
import { statsQuery } from '../api/KravApi'
import { TemaCardBehandling } from '../components/behandlingPage/TemaCardBehandling'
import { isFerdigUtfylt } from './BehandlingTemaPage'
import { ampli } from '../services/Amplitude'
import { getMainHeader, getNewestKravVersjon, responsiveDisplayBehandlingPage } from '../components/behandlingPage/common/utils'
import { user } from '../services/User'
import { faFileWord } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StyledLink } from 'baseui/link'
import { env } from '../util/env'

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()
  const navigate = useNavigate()

  const { data: relevanteData, refetch: refetchRelevanteData } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: { behandlingId: behandling?.id },
  })

  const [edit, setEdit] = useState(false)

  const [relevanteStats, setRelevanteStats] = useState<any[]>([])
  const [irrelevanteStats, setIrrelevanteStats] = useState<any[]>([])
  const [utgaattStats, setUtgaattStats] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => {
      if (!user.isLoggedIn()) {
        navigate('/forbidden')
      }
    }, 1)
  }, [])

  const filterData = (
    unfilteredData:
      | {
          behandling: PageResponse<{
            stats: BehandlingStats
          }>
        }
      | undefined,
  ) => {
    const relevanteStatusListe: any[] = []
    const irrelevanteStatusListe: any[] = []
    const utgaattStatusListe: any[] = []

    unfilteredData?.behandling.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        } else if (k.regelverk.length && k.status === KravStatus.UTGAATT) {
          utgaattStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          relevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        } else if (k.regelverk.length && k.status === KravStatus.UTGAATT) {
          utgaattStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        }
      })
    })

    unfilteredData?.behandling.content.forEach(({ stats }) => {
      stats.irrelevantKrav.forEach((k) => {
        if (k.regelverk.length && k.status === KravStatus.AKTIV) {
          irrelevanteStatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        }
      })
    })

    relevanteStatusListe.sort((a, b) => {
      return a.kravNummer - b.kravNummer
    })

    irrelevanteStatusListe.sort((a, b) => {
      return a.kravNummer - b.kravNummer
    })

    utgaattStatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }
      return a.kravNummer - b.kravNummer
    })

    return [relevanteStatusListe, irrelevanteStatusListe, utgaattStatusListe]
  }

  React.useEffect(() => {
    const [relevanteStatusListe, irrelevanteStatusListe, utgaattStatusListe] = filterData(relevanteData)
    setRelevanteStats(relevanteStatusListe)
    setIrrelevanteStats(irrelevanteStatusListe)
    setUtgaattStats(utgaattStatusListe)
  }, [relevanteData])

  React.useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (behandling) {
      ampli.logEvent('sidevisning', { side: 'Behandling side', sidetittel: `B${behandling.nummer.toString()} ${behandling.navn.toString()}` })
    }
  }, [behandling])

  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  let antallFylttKrav = 0

  getNewestKravVersjon(relevanteStats).forEach((k: KravQL) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      antallFylttKrav += 1
    }
  })

  const getPercentageUtfylt = relevanteStats && relevanteStats.length && (antallFylttKrav / relevanteStats.length) * 100

  const getRelevansContent = (behandling: Behandling) => {
    const emptyRelevans = behandling.irrelevansFor.length === options.length ? true : false

    return (
      <Block display="flex" width="100%" alignItems="center">
        <Block width="100%" display="flex">
          {emptyRelevans ? (
            <Block display="flex" alignItems="center">
              <img height="16px" width="16px" src={warningAlert} alt="warning icon" />
              <LabelSmall color={ettlevColors.green600} marginTop="0px" marginBottom="0px" marginRight="5px" marginLeft="5px" $style={{ fontSize: '16px' }}>
                Ingen egenskaper er oppgitt
              </LabelSmall>
            </Block>
          ) : (
            <LabelSmall marginTop="0px" marginBottom="0px" marginRight="5px" $style={{ fontSize: '16px' }}>
              Behandlingen skal etterleve krav for:
            </LabelSmall>
          )}

          {!behandling.irrelevansFor.length ? getRelevans() : getRelevans(behandling.irrelevansFor)}
        </Block>
        <Block display="flex" flex="1" justifyContent="flex-end" $style={{ whiteSpace: 'nowrap' }}>
          <Button onClick={() => setEdit(!edit)} startEnhancer={<img src={editIcon} alt="edit icon" />}>
            Tilpass egenskaper
          </Button>
        </Block>
      </Block>
    )
  }

  const getSecondaryHeader = (behandling: Behandling) => (
    <Block width="100%" display={responsiveDisplayBehandlingPage} alignItems="center" justifyContent="space-between" marginTop={'8px'} marginBottom={'8px'}>
      <Block display="flex" alignItems="center">
        <Block marginRight="12px">
          <img src={arkPennIcon} alt="penn ikon" height="32px" width="32px" />
        </Block>
        <Block>
          <HeadingXLarge marginTop="0px" marginBottom="0px">
            Tema for dokumentasjon
          </HeadingXLarge>
        </Block>
      </Block>

      <Block display="flex" alignItems="center">
      <Block display="flex" alignItems="center" marginRight='12px'>
        <StyledLink
            style={{textDecoration: 'none'}}
            href={`${env.backendBaseUrl}/export/etterlevelse?behandlingId=${behandling.id}`}>
            <Button
              kind={KIND.tertiary}
              size={SIZE.compact}
            >
              <Block marginRight='6px'>
              <FontAwesomeIcon icon={faFileWord} />
              </Block>
              <Block>Eksporter</Block>
            </Button>
          </StyledLink>
        </Block>
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <ParagraphMedium $style={{ fontWeight: 900, fontSize: '32px', marginTop: 0, marginBottom: 0 }} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {getNewestKravVersjon(relevanteStats).length}
          </ParagraphMedium>
          <ParagraphMedium>krav</ParagraphMedium>
        </Block>

        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />

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
      return <ParagraphXSmall>For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved behandlingen.</ParagraphXSmall>
    }

    if (irrelevans) {
      const relevans = options.filter((n) => !irrelevans.map((ir: Code) => ir.code).includes(n.id))

      return (
        <Block display={responsiveDisplayBehandlingPage} flexWrap>
          {relevans.map((r, index) => (
            <Block key={r.id} display="flex">
              <ParagraphXSmall $style={{ ...marginZero, marginRight: '8px', lineHeight: '24px' }}>{r.label}</ParagraphXSmall>
              <Block marginRight="8px" display={['none', 'none', 'none', 'none', 'block', 'block']}>
                {index < relevans.length - 1 ? <img alt="dot" src={ellipse80} /> : undefined}
              </Block>
            </Block>
          ))}
        </Block>
      )
    }
    return (
      <Block display={responsiveDisplayBehandlingPage} flexWrap>
        {options.map((o, index) => (
          <Block key={o.id} display="flex">
            <ParagraphXSmall $style={{ ...marginZero, marginRight: '8px', lineHeight: '24px' }}>{o.label}</ParagraphXSmall>
            <Block marginRight="8px" display={['none', 'none', 'none', 'none', 'block', 'block']}>
              {index < options.length - 1 ? <img alt="dot" src={ellipse80} /> : undefined}
            </Block>
          </Block>
        ))}
      </Block>
    )
  }

  if (!behandling) return <LoadingSkeleton header="Behandling" />

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  return (
    <Block width="100%">
      <Layout2
        headerBackgroundColor={ettlevColors.grey50}
        mainHeader={getMainHeader(behandling)}
        secondaryHeaderBackgroundColor={ettlevColors.white}
        secondaryHeader={getSecondaryHeader(behandling)}
        childrenBackgroundColor={ettlevColors.grey25}
        currentPage={'B' + behandling?.nummer.toString()}
        breadcrumbPaths={breadcrumbPaths}
      >
        <Block backgroundColor={ettlevColors.grey50} marginTop={theme.sizing.scale800}></Block>
        {getRelevansContent(behandling)}
        <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
          {temaListe.map((tema) => (
            <TemaCardBehandling tema={tema} stats={relevanteStats} utgaattStats={utgaattStats} behandling={behandling} key={`${tema.shortName}_panel`} />
          ))}
        </Block>

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

      {edit && (
        <EditBehandlingModal
          showModal={edit}
          behandling={behandling}
          formRef={formRef}
          setBehandling={setBehandling}
          close={(e?: BehandlingEtterlevData) => {
            setEdit(false)
            e && setBehandling({ ...behandling, ...e })
          }}
        />
      )}
    </Block>
  )
}
