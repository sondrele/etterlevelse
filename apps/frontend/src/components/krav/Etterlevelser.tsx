import { Block } from 'baseui/block'
import { Spinner } from 'baseui/icon'
import { HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import _ from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import { Etterlevelse, EtterlevelseQL, EtterlevelseStatus, ExternalCode, Krav, KravQL, SuksesskriterieStatus } from '../../constants'
import { kravNumView } from '../../pages/KravPage'
import { theme } from '../../util'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import Button from '../common/Button'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../common/CustomizedAccordion'
import CustomizedModal from '../common/CustomizedModal'
import { InfoBlock } from '../common/InfoBlock'
import { PanelButton, PanelLink } from '../common/PanelLink'
import { borderRadius, borderStyle, marginAll } from '../common/Style'
import { ViewEtterlevelse } from '../etterlevelse/ViewEtterlevelse'
import { sadFolderIcon } from '../Images'
import { Option } from 'baseui/select'
import CustomizedSelect from '../common/CustomizedSelect'

const etterlevelseFilter = [
  { label: 'Alle', id: 'ALLE' },
  { label: 'Oppfylt', id: EtterlevelseStatus.FERDIG_DOKUMENTERT },
  { label: 'Ikke relevant', id: EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT },
  { label: 'Ikke oppfylt', id: SuksesskriterieStatus.IKKE_OPPFYLT}
]

export const Etterlevelser = ({ loading, krav, modalVersion }: { loading: boolean; krav: KravQL; modalVersion?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [openEtterlse, setOpenEtterlevelse] = useState<EtterlevelseQL>()
  const [filter, setFilter] = useState<readonly Option[]>([etterlevelseFilter[0]])

  const etterlevelser = (krav.etterlevelser || [])
    .filter((e) => e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
    .sort((a, b) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter((e) => e.etterlevelseDokumentasjon && e.etterlevelseDokumentasjon.title !== 'LEGACY_DATA')

  etterlevelser.map((e) => {
    if (!e.etterlevelseDokumentasjon.teamsData || e.etterlevelseDokumentasjon.teamsData.length === 0) {
      e.etterlevelseDokumentasjon.teamsData = [{
        id: 'INGEN_TEAM', name: 'Ingen team', description: 'ingen',
        tags: [],
        members: [],
        productAreaId: 'INGEN_PO',
        productAreaName: 'Ingen produktområde'
      }]
    }

    e.etterlevelseDokumentasjon.teamsData && e.etterlevelseDokumentasjon.teamsData.forEach((t) => {
      if (!t.productAreaId && !t.productAreaName) {
        t.productAreaId = 'INGEN_PO'
        t.productAreaName = 'Ingen produktområde'
      }
    })

  })


  const filteredEtterlevelse = etterlevelser.filter((e) => {
      if (filter[0].id !== 'ALLE') {
        if(filter[0].id === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
          return e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT || e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT).length > 0
        } else if(filter[0].id === SuksesskriterieStatus.IKKE_OPPFYLT) {
          return e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT).length > 0
        } else if(filter[0].id === SuksesskriterieStatus.OPPFYLT) {
          return e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.OPPFYLT).length > 0
        } else {
          return e.status === filter[0].id
        }
      } else {
        return e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
      }
    }
  )

  const productAreas = _.sortedUniqBy(
    (filteredEtterlevelse
      ?.map((e) => e.etterlevelseDokumentasjon.teamsData && e.etterlevelseDokumentasjon.teamsData).flat()
      .sort((a, b) => (a?.productAreaName || '').localeCompare(b?.productAreaName || ''))
      .filter((team) => !!team) || []),
    (a) => a?.productAreaId,
  )

  return (
    <Block marginBottom="32px" width="100%">
      <HeadingXLarge >Her kan du se hvordan andre team har dokumentert etterlevelse</HeadingXLarge>
      {!loading && etterlevelser.length > 0 && (
        <div className="flex items-center" style={{ paddingTop: '22px', paddingBottom: '22px' }}>
          <LabelSmall $style={{ fontSize: '16px', lineHeight: '18px' }}>Vis:</LabelSmall>
          <div style={{ paddingLeft: '20px', paddingRight: '16px', width: '290px' }}>
            <CustomizedSelect
              size="default"
              clearable={false}
              searchable={false}
              options={etterlevelseFilter}
              value={filter}
              onChange={(params) => {
                setFilter(params.value)
              }}
            />
          </div>
        </div>
      )}
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !etterlevelser.length && (
        <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.red50} />
      )}

      {productAreas.length > 0 ? (
        <CustomizedAccordion accordion={false}>
          {productAreas.map((t) => {
            let productAreaEtterlevelser = filteredEtterlevelse?.filter((e) => e.etterlevelseDokumentasjon.teamsData && t &&
              e.etterlevelseDokumentasjon.teamsData.filter((team) => team.productAreaId === t.productAreaId).length > 0
            )

            const antall = productAreaEtterlevelser.length
            return (
              <CustomizedPanel key={t && t.productAreaId} title={t ? t.productAreaName ? t.productAreaName : t.productAreaId : ''} HeaderActiveBackgroundColor={ettlevColors.green50}>
                {productAreaEtterlevelser.map((e, i) => (
                  <CustomPanelDivider key={e.id}>
                    {modalVersion ? (
                      <PanelButton
                        onClick={() => {
                          setOpenEtterlevelse({ ...e, etterlevelseDokumentasjonId: e.etterlevelseDokumentasjon.id })
                          setIsModalOpen(true)
                        }}
                        square
                        hideBorderBottom={i !== antall - 1}
                        useUnderline
                        title={
                          <span>
                            <strong>
                              E{e.etterlevelseDokumentasjon.etterlevelseNummer}
                            </strong>
                            : {e.etterlevelseDokumentasjon.title}
                          </span>
                        }
                        rightTitle={!!e.etterlevelseDokumentasjon.teamsData && !!e.etterlevelseDokumentasjon.teamsData.length ? e.etterlevelseDokumentasjon.teamsData.map((t) => t.name ? t.name : t.id).join(', ') : 'Ingen team'}
                        rightBeskrivelse={`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}
                        overrides={{
                          Block: {
                            style: {
                              ...borderStyle('hidden'),
                              maxWidth: '812px',
                            },
                          },
                        }}
                      // panelIcon={(hover) => <PageIcon hover={hover} />}
                      />
                    ) : (
                      <PanelLink
                        href={`/etterlevelse/${e.id}`}
                        square
                        hideBorderBottom={i !== antall - 1}
                        useUnderline
                        title={
                          <span>
                            <strong>
                              E{e.etterlevelseDokumentasjon.etterlevelseNummer}
                            </strong>
                            : {e.etterlevelseDokumentasjon.title}
                          </span>
                        }
                        rightTitle={!!e.etterlevelseDokumentasjon.teamsData && !!e.etterlevelseDokumentasjon.teamsData.length ? e.etterlevelseDokumentasjon.teamsData.map((t) => t.name ? t.name : t.id).join(', ') : 'Ingen team'}
                        rightBeskrivelse={`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}
                        overrides={{
                          Block: {
                            style: {
                              ...borderStyle('hidden'),
                            },
                          },
                        }}
                      // panelIcon={(hover) => <PageIcon hover={hover} />}
                      />
                    )}
                  </CustomPanelDivider>
                ))}
              </CustomizedPanel>
            )
          })}
        </CustomizedAccordion>
      ) : (
        <div className="flex item-center">
          <LabelLarge>Ingen etterlevelser med {filter[0].label} status</LabelLarge>
        </div>
      )}



      {modalVersion && openEtterlse && krav && <EtterlevelseModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} etterlevelse={openEtterlse} kravData={krav} />}
    </Block>
  )
}

export const EtterlevelseModal = ({
  isModalOpen,
  setIsModalOpen,
  etterlevelse,
  kravData,
}: {
  isModalOpen: boolean
  setIsModalOpen: (state: boolean) => void
  etterlevelse: Etterlevelse
  kravData: Krav
}) => {
  return (
    <CustomizedModal
      onClose={() => setIsModalOpen(false)}
      closeIconColor={ettlevColors.white}
      closeIconHoverColor={ettlevColors.green100}
      isOpen={isModalOpen}
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
        <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
          <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
            <ParagraphMedium
              $style={{
                marginTop: '0px',
                marginBottom: '0px',
                color: ettlevColors.white,
              }}
            >
              {kravNumView(kravData)}
            </ParagraphMedium>
            <HeadingXXLarge $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', color: ettlevColors.white }}>{kravData.navn}</HeadingXXLarge>
          </Block>
        </Block>

        <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
          <ViewEtterlevelse etterlevelse={etterlevelse} viewMode krav={kravData} modalVersion />
          <Block display="flex" justifyContent="flex-end" paddingBottom="31px" paddingTop="95px">
            <Button
              onClick={() => {
                setIsModalOpen(false)
              }}
            >
              Lukk visning
            </Button>
          </Block>
        </Block>
      </Block>
    </CustomizedModal>
  )
}

export default Etterlevelser
