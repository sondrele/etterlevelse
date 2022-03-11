import { Block } from 'baseui/block'
import { H1, Label3 } from 'baseui/typography'
import { useParams } from 'react-router-dom'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import React, { useEffect, useState } from 'react'
import { Etterlevelse, EtterlevelseStatus, Krav } from '../constants'
import { ViewEtterlevelse } from '../components/etterlevelse/ViewEtterlevelse'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { kravNumView } from './KravPage'
import { ettlevColors, maxPageWidth, pageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { getKravByKravNumberAndVersion } from '../api/KravApi'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import moment from 'moment'

export const etterlevelseName = (etterlevelse: Etterlevelse) => `${kravNumView(etterlevelse)}`

export const kravLink = (kravNummer: string) => {
  return kravNummer.replace('.', '/').replace('K', '/krav/')
}

export const getEtterlevelseStatus = (status?: EtterlevelseStatus, frist?: string) => {
  if (!status) return ''
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EtterlevelseStatus.FERDIG:
      return 'Oppfylt'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ikke relevant'
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Oppfylt'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Oppfylles ' + moment(frist).format('ll')
      } else {
        return 'Oppfylles senere'
      }
    default:
      return status
  }
}

export const EtterlevelsePage = () => {
  const params = useParams<{ id?: string }>()
  const [etterlevelse, setEtterlevelse] = useEtterlevelse(params.id)
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const [krav, setKrav] = useState<Krav>()

  const loading = !edit && !etterlevelse

  useEffect(() => {
    etterlevelse && getKravByKravNumberAndVersion(etterlevelse?.kravNummer, etterlevelse?.kravVersjon).then(setKrav)
    if (etterlevelse) {
      ampli.logEvent('sidevisning', { side: 'Etterlevelse side', sidetittel: `Etterlevelse: K${etterlevelse.kravNummer.toString()}.${etterlevelse.kravVersjon.toString()} ${krav?.navn}` })
    }
  }, [etterlevelse])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Forstå kravene',
      href: '/tema',
    },
    {
      pathName: `K${krav?.kravNummer}.${krav?.kravVersjon}`,
      href: '/krav/' + krav?.kravNummer + '/' + krav?.kravVersjon,
    },
  ]

  return (
    <Block width="100%" id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      {loading && <LoadingSkeleton header="Etterlevelse" />}
      {!loading && (
        <Block backgroundColor={ettlevColors.green800} display="flex" width="100%" justifyContent="center" paddingBottom="32px">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Etterlevelse: {etterlevelse?.kravNummer ? 'K' + etterlevelse.kravNummer.toString() + '.' + etterlevelse.kravVersjon.toString() + ' ' + krav?.navn : ''} </title>
          </Helmet>
          <Block maxWidth={maxPageWidth} width="100%">
            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} display="flex" flexDirection="column" justifyContent="center">
              <Block display="flex" width="100%" justifyContent="center" marginTop="24px">
                <Block display="flex" alignItems="center" width="100%">
                  <Block flex="1" display="flex" justifyContent="flex-start">
                    {/* <RouteLink hideUnderline>
                      <Button
                        startEnhancer={<img alt={'Chevron left'} src={chevronLeft} />}
                        size="compact"
                        kind="tertiary"
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                      >
                        {' '}
                        Tilbake
                      </Button>
                    </RouteLink> */}
                    <CustomizedBreadcrumbs fontColor={ettlevColors.grey25} currentPage="Etterlevelse" paths={breadcrumbPaths} />
                  </Block>

                  {/*
                  <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end'>
                    {etterlevelse?.id && user.canWrite() && <DeleteItem fun={() => deleteEtterlevelse(etterlevelse.id)} redirect={'/etterlevelse'} />}
                    {((etterlevelse?.id && user.canWrite())) &&
                      <Button
                        startEnhancer={<img src={editIcon} alt='edit' />}
                        size='compact'
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                        kind={'tertiary'}
                        onClick={() => setEdit(!edit)}
                        marginLeft
                      >
                        {edit ? 'Avbryt' : 'Rediger'}
                      </Button>
                    }
                    {edit &&
                      <Button
                        size='compact'
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                        kind={'tertiary'}
                        onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()}
                        marginLeft
                      >
                        Lagre
                      </Button>
                    }
                  </Block>
                  */}
                </Block>
              </Block>
            </Block>

            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
              <Block maxWidth={pageWidth} width="100%">
                <H1 marginTop="0px" $style={{ color: ettlevColors.grey25 }}>
                  Etterlevelse
                </H1>
                {etterlevelse && etterlevelse?.kravNummer !== 0 && krav && (
                  <Label3
                    $style={{
                      color: ettlevColors.grey25,
                      lineHeight: '23px',
                    }}
                  >
                    {etterlevelseName(etterlevelse) + ' ' + krav?.navn}
                  </Label3>
                )}
              </Block>
            </Block>
          </Block>
        </Block>
      )}

      <Block display="flex" width={responsiveWidthSmall} justifyContent="center" paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
        <Block maxWidth={pageWidth} width="100%">
          {etterlevelse && !loading && krav && <ViewEtterlevelse etterlevelse={etterlevelse} setEtterlevelse={setEtterlevelse} loading={loading} krav={krav} />}
          {/* {
            edit && etterlevelse &&

            <EditEtterlevelse etterlevelse={etterlevelse} formRef={formRef} close={k => {
              if (k) {
                setEtterlevelse(k)
                if (k.id !== etterlevelse.id) {
                  history.push(`/etterlevelse/${k.id}`)
                }
              }
              setEdit(false)
            }} />

          } */}
        </Block>
      </Block>
    </Block>
  )
}
