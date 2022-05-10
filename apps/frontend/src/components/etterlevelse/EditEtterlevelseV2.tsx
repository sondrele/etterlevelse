import {Etterlevelse, EtterlevelseMetadata, EtterlevelseStatus, Krav, KRAV_FILTER_TYPE, KravQL} from '../../constants'
import {FormikProps} from 'formik'
import {createEtterlevelse, updateEtterlevelse} from '../../api/EtterlevelseApi'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React, {useEffect, useRef, useState} from 'react'
import {theme} from '../../util'
import {getKravByKravNumberAndVersion, KravId} from '../../api/KravApi'
import {kravNumView, query} from '../../pages/KravPage'
import {HeadingXLarge, HeadingXXLarge, LabelSmall, ParagraphMedium} from 'baseui/typography'
import {ettlevColors, maxPageWidth, responsivePaddingExtraLarge, responsivePaddingInnerPage, responsiveWidthInnerPage} from '../../util/theme'
import {user} from '../../services/User'
import {faChevronDown} from '@fortawesome/free-solid-svg-icons'
import {borderColor, borderRadius, borderStyle, borderWidth, marginAll, padding} from '../common/Style'
import {useQuery} from '@apollo/client'
import {informationIcon, warningAlert} from '../Images'
import CustomizedTabs from '../common/CustomizedTabs'
import {Tilbakemeldinger} from '../krav/tilbakemelding/Tilbakemelding'
import Etterlevelser from '../krav/Etterlevelser'
import {Markdown} from '../common/Markdown'
import {Section} from '../../pages/EtterlevelseDokumentasjonPage'
import {getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue} from '../../api/EtterlevelseMetadataApi'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import CustomizedModal from '../common/CustomizedModal'
import {ampli} from '../../services/Amplitude'
import StatusView from '../common/StatusTag'
import {getPageWidth} from '../../util/pageWidth'

type EditEttlevProps = {
  etterlevelse: Etterlevelse
  kravId: KravId
  close: (k?: Etterlevelse) => void
  formRef?: React.Ref<any>
  documentEdit?: boolean
  behandlingNavn?: string
  behandlingId?: string
  behandlingformaal?: string
  behandlingNummer?: number
  varsleMelding?: string
  navigatePath: string
  setNavigatePath: (state: string) => void
  tab: Section
  setTab: (s: Section) => void
  tidligereEtterlevelser: Etterlevelse[] | undefined
  kravFilter: KRAV_FILTER_TYPE
}

export const EditEtterlevelseV2 = ({
  kravId,
  etterlevelse,
  varsleMelding,
  close,
  formRef,
  documentEdit,
  behandlingNavn,
  behandlingId,
  behandlingformaal,
  behandlingNummer,
  navigatePath,
  setNavigatePath,
  tidligereEtterlevelser,
  tab,
  setTab,
  kravFilter,
}: EditEttlevProps) => {
  const { data, loading } = useQuery<{ kravById: KravQL }, KravId>(query, {
    variables: kravId,
    skip: !kravId.id && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const etterlevelserLoading = loading
  const [krav, setKrav] = useState<KravQL>()
  const [nyereKrav, setNyereKrav] = React.useState<Krav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [editedEtterlevelse, setEditedEtterlevelse] = React.useState<Etterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<Etterlevelse> | undefined> = useRef()
  const [pageWidth, setPageWidth] = useState<number>(1276)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      behandlingId: behandlingId,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    }),
  )

  const [isVersjonEndringerModalOpen, setIsVersjonEndringerModalOpen] = React.useState<boolean>(false)

  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      behandlingId &&
        kravId.kravNummer &&
        getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion(behandlingId, kravId.kravNummer, kravId.kravVersjon).then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          } else {
            setEtterlevelseMetadata(
              mapEtterlevelseMetadataToFormValue({
                id: 'ny',
                behandlingId: behandlingId,
                kravNummer: kravId.kravNummer,
                kravVersjon: kravId.kravVersjon,
              }),
            )
          }
        })
    })()
  }, [])

  useEffect(() => {
    const reportWindowSize = () => {
      setPageWidth(getPageWidth())
    }
    window.onresize = reportWindowSize
  })

  const submit = async (etterlevelse: Etterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse: etterlevelse.status !== EtterlevelseStatus.OPPFYLLES_SENERE ? '' : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser:
        etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
          ? [
              ...etterlevelse.suksesskriterieBegrunnelser.map((s) => {
                return {
                  ...s,
                  oppfylt: false,
                  ikkeRelevant: true,
                  underArbeid: false,
                }
              }),
            ]
          : [...etterlevelse.suksesskriterieBegrunnelser],
    }

    if (etterlevelse.id) {
      close(await updateEtterlevelse(mutatedEtterlevelse))
    } else {
      close(await createEtterlevelse(mutatedEtterlevelse))
    }
  }

  useEffect(() => {
    if (data?.kravById) {
      setKrav(data.kravById)
      getKravByKravNumberAndVersion(data.kravById.kravNummer, data.kravById.kravVersjon + 1).then(setNyereKrav)
    }
  }, [data])

  useEffect(() => {
    if (nyereKrav && !user.isAdmin()) {
      setDisableEdit(true)
    }
  }, [nyereKrav])

  return (
    <Block width="100%">
      {krav && (
        <Block
          width="100%"
          $style={{
            ...borderWidth('1px'),
            ...borderStyle('solid'),
            ...borderColor(ettlevColors.green800),
          }}
        >
          <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
            <Block paddingLeft={responsivePaddingInnerPage} paddingRight={responsivePaddingInnerPage}>
              <Block display={'flex'}>
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    color: ettlevColors.white,
                  }}
                >
                  {kravNumView(krav)}
                </ParagraphMedium>
                {kravFilter !== KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                  <StatusView
                    status={kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ? 'Utgått' : 'Bortfiltrert'}
                    statusDisplay={{
                      background: ettlevColors.grey50,
                      ...borderStyle('solid'),
                    }}
                    lineHeight={'16px'}
                    fontSize={'16px'}
                    fontStyle={'italic'}
                    overrides={{
                      Root: {
                        style: {
                          marginLeft: '21px',
                        },
                      },
                      Contents: {
                        style: {
                          ...marginAll('2px'),
                        },
                      },
                      Body: {
                        style: {
                          ...marginAll('2px'),
                        },
                      },
                    }}
                  />
                )}
              </Block>
              <HeadingXXLarge $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', color: ettlevColors.white }}>{krav.navn}</HeadingXXLarge>

              {kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </ParagraphMedium>
              )}

              {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er utgått.</strong> Dere skal ikke dokumentere ny etterlevelse på dette kravet.
                </ParagraphMedium>
              )}

              {tidligereEtterlevelser && tidligereEtterlevelser.length >= 1 && kravFilter !== KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor="transparent"
                  $style={{
                    marginTop: '16px',
                  }}
                >
                  <img
                    src={warningAlert}
                    alt=""
                    width="24px"
                    height="24px"
                    style={{
                      marginRight: '5px',
                    }}
                  />
                  <ParagraphMedium
                    $style={{
                      lineHeight: '22px',
                      marginTop: '0px',
                      marginBottom: '0px',
                      fontWeight: 600,
                      color: ettlevColors.white,
                    }}
                  >
                    Dette er en ny versjon.
                  </ParagraphMedium>
                  {krav.versjonEndringer && (
                    <Button
                      type="button"
                      kind="underline-hover"
                      $style={{
                        marginLeft: '2px',
                        ':hover': { textDecoration: 'none' },
                      }}
                      onClick={() => setIsVersjonEndringerModalOpen(true)}
                    >
                      <ParagraphMedium
                        $style={{
                          lineHeight: '22px',
                          marginTop: '0px',
                          marginBottom: '0px',
                          fontWeight: 600,
                          color: ettlevColors.white,
                          textDecoration: 'underline',
                        }}
                      >
                        Se hva som er nytt fra forrige versjon.
                      </ParagraphMedium>
                    </Button>
                  )}
                </Block>
              )}

              {varsleMelding && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor={'#E5F0F7'}
                  $style={{
                    ...padding('12px', '16px'),
                    ...borderColor('#005B82'),
                    ...borderWidth('1px'),
                    ...borderStyle('solid'),
                    ...borderRadius('4px'),
                    marginTop: '16px',
                  }}
                >
                  <img src={informationIcon} alt="" width={'24px'} height={'24px'} />
                  <ParagraphMedium marginLeft={theme.sizing.scale500} marginTop="0px" marginBottom="0px">
                    {varsleMelding}
                  </ParagraphMedium>
                </Block>
              )}

              {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                <Block display="flex" justifyContent="flex-start" alignItems="center" marginTop="32px">
                  <LabelSmall $style={{ color: ettlevColors.white, fontSize: '18px', lineHeight: '14px', textAlign: 'right' }}>
                    Tildelt:{' '}
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? etterlevelseMetadata.tildeltMed[0] : 'Ikke tildelt'}
                  </LabelSmall>
                  <TildeltPopoever
                    etterlevelseMetadata={etterlevelseMetadata}
                    setEtterlevelseMetadata={setEtterlevelseMetadata}
                    icon={faChevronDown}
                    iconColor={ettlevColors.white}
                  />
                </Block>
              )}
            </Block>
          </Block>
          <Block backgroundColor={ettlevColors.green100} paddingLeft={responsivePaddingInnerPage} paddingRight={responsivePaddingInnerPage}>
            <HeadingXLarge $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', paddingTop: '41px' }}>Hensikten med kravet</HeadingXLarge>
            <Markdown noMargin p1 sources={Array.isArray(krav.hensikt) ? krav.hensikt : [krav.hensikt]} fontSize={'21px'} maxWidth={'800px'} />
          </Block>

          <Block
            display={'flex'}
            justifyContent="center"
            width="100%"
            paddingTop="33px"
            $style={{
              background: `linear-gradient(top, ${ettlevColors.green100} 83px, ${ettlevColors.grey25} 0%)`,
            }}
          >
            <CustomizedTabs
              fontColor={ettlevColors.green600}
              activeColor={ettlevColors.green800}
              tabBackground={ettlevColors.green100}
              activeKey={tab}
              onChange={(k) => {
                ampli.logEvent('klikk', {
                  sidetittel: `B${behandlingNummer?.toString()} ${behandlingNavn?.toString()}`,
                  section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
                  title: k.activeKey.toString(),
                  type: 'tab',
                })
                if (k.activeKey !== 'dokumentasjon' && etterlevelseFormRef.current && etterlevelseFormRef.current.values) {
                  setEditedEtterlevelse(etterlevelseFormRef.current.values)
                }
                setTab(k.activeKey as Section)
              }}
              overrides={{
                Root: {
                  style: {
                    width: '100%',
                  },
                },
                TabList: {
                  style: {
                    width: pageWidth <= 960 ? 'calc(100% - 32px)' : 'calc(100% - 400px)',
                    paddingLeft: pageWidth <= 960 ? '16px' : '200px',
                    paddingRight: pageWidth <= 960 ? '16px' : '200px',
                    marginLeft: '0px',
                    marginRight: '0px',
                  },
                },
              }}
              tabs={[
                {
                  title: 'Dokumentasjon',
                  key: 'dokumentasjon',
                  content: (
                    <EtterlevelseEditFields
                      viewMode={kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV ? false : true}
                      kravFilter={kravFilter}
                      krav={krav}
                      etterlevelse={etterlevelse}
                      submit={submit}
                      formRef={etterlevelseFormRef}
                      varsleMelding={varsleMelding}
                      behandlingId={behandlingId}
                      behandlingNummer={behandlingNummer || 0}
                      behandlingformaal={behandlingformaal || ''}
                      behandlingNavn={behandlingNavn || ''}
                      disableEdit={disableEdit}
                      documentEdit={documentEdit}
                      close={close}
                      setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                      isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                      navigatePath={navigatePath}
                      setNavigatePath={setNavigatePath}
                      editedEtterlevelse={editedEtterlevelse}
                      tidligereEtterlevelser={tidligereEtterlevelser}
                    />
                  ),
                },
                {
                  title: 'Eksempler på etterlevelse',
                  key: 'etterlevelser',
                  content: (
                    <Block
                      display={'flex'}
                      justifyContent="center"
                      width={responsiveWidthInnerPage}
                      paddingLeft={responsivePaddingInnerPage}
                      paddingRight={responsivePaddingInnerPage}
                    >
                      <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                    </Block>
                  ),
                },
                {
                  title: 'Spørsmål og svar',
                  key: 'tilbakemeldinger',
                  content: (
                    <Block
                      display={'flex'}
                      justifyContent="center"
                      width={responsiveWidthInnerPage}
                      paddingLeft={responsivePaddingInnerPage}
                      paddingRight={responsivePaddingInnerPage}
                    >
                      <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                    </Block>
                  ),
                },
              ]}
            />
          </Block>

          <CustomizedModal
            onClose={() => setIsVersjonEndringerModalOpen(false)}
            isOpen={isVersjonEndringerModalOpen}
            size="full"
            overrides={{
              Dialog: {
                style: {
                  ...borderRadius('0px'),
                  ...marginAll('0px'),
                  width: '100%',
                  maxWidth: maxPageWidth,
                },
              },
            }}
          >
            <Block width="100%">
              <Block
                paddingTop="120px"
                paddingBottom="40px"
                backgroundColor={ettlevColors.green800}
                paddingLeft={responsivePaddingExtraLarge}
                paddingRight={responsivePaddingExtraLarge}
              >
                <LabelSmall color={ettlevColors.white}>
                  K{krav.kravNummer}.{krav.kravVersjon}
                </LabelSmall>
                <HeadingXXLarge marginTop="0px" marginBottom="0px" color={ettlevColors.white}>
                  {krav.navn}
                </HeadingXXLarge>
              </Block>
              <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
                <Block minHeight="300px">
                  <HeadingXLarge marginTop="0px" marginBottom="24px">
                    Dette er nytt fra forrige versjon
                  </HeadingXLarge>
                  <Markdown source={krav.versjonEndringer} />
                </Block>
                <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                  <Button onClick={() => setIsVersjonEndringerModalOpen(false)}>Lukk visning</Button>
                </Block>
              </Block>
            </Block>
          </CustomizedModal>
        </Block>
      )}
    </Block>
  )
}
