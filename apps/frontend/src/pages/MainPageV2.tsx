import { Narrow, Page, Wide } from '../components/scaffold/Page'
import { ettlevColors, theme } from '../util/theme'
import { Block } from 'baseui/block'
import { H2, HeadingXXLarge, Label4, Paragraph1, Paragraph2 } from 'baseui/typography'
import { PanelLink, PanelLinkCard } from '../components/common/PanelLink'
import { grafIconBg, handWithLeaf, paperPenIconBg, paragrafIconBg } from '../components/Images'
import { Card } from 'baseui/card'
import { borderColor, borderRadius, borderStyle, borderWidth, margin, paddingAll } from '../components/common/Style'
import ReactPlayer from 'react-player'
import { Button, SIZE } from 'baseui/button'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { buttonBorderStyle, buttonContentStyle } from '../components/common/Button'
import React, { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli } from '../services/Amplitude'


const cardWidth = ['95%', '95%', '95%', '95%', '31%', '31%']
const cardHeight = ['auto', 'auto', 'auto', 'auto', '140px', '140px']
const cardMarginRight = ['none', 'none', 'none', 'none', theme.sizing.scale800, theme.sizing.scale800]

export const MainPageV2 = () => {

  const [forsideVarsel, setForsideVarsle] = useState<Melding>()

  useEffect(() => {
    (async () => {
      await getMeldingByType(MeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  ampli.logEvent('sidevisning', { side: 'Hovedside' })

  return (
    <Page
      hideBackBtn
      headerBackgroundColor={ettlevColors.green800}
      backgroundColor={ettlevColors.grey50}
      headerOverlap={'100px'}
      rawMain
      header={
        <HeadingXXLarge display={'flex'} flexDirection={'column'} color={ettlevColors.white} marginTop={theme.sizing.scale1400} marginBottom={theme.sizing.scale1400}>
          <span style={{ fontWeight: 400 }}>Støtte til etterlevelse</span>
          <span>som sikrer rettssikkerheten til brukerne våre</span>
        </HeadingXXLarge>
      }
    >
      <Block display={'flex'} flexDirection={'column'} alignItems={'center'} width={'100%'}>
        <Wide>
          <Block display={'flex'} justifyContent={'center'} flexWrap>
            <PanelLinkCard
              marginRight={cardMarginRight}
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              href={'/tema'}
              tittel={'Forstå kravene'}
              icon={paragrafIconBg}
              beskrivelse={'Få oversikt over krav til etterlevelse, og bli trygg på at du kjenner til alle relevante krav for det du lager'}
            />

            <PanelLinkCard
              marginRight={cardMarginRight}
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              requireLogin
              href={'/behandlinger'}
              tittel={'Dokumentere etterlevelse'}
              icon={paperPenIconBg}
              beskrivelse={'Se hvilke krav som gjelder din løsning og dokumenter hvordan løsningen etterlever kravene'}
            />
            <PanelLinkCard
              height={cardHeight}
              width={cardWidth}
              verticalMargin={theme.sizing.scale300}
              href={'/status'}
              tittel={'Status i organisasjonen'}
              icon={grafIconBg}
              beskrivelse={'Følg med på status og se hvor godt NAV sine produktområder  dokumenterer på kravene'}
            />
          </Block>
        </Wide>

        <Narrow>
          <Block
            $style={{}}
            marginTop={theme.sizing.scale1600}
            marginBottom={theme.sizing.scale900}
          // paddingLeft={theme.sizing.scale800}
          // paddingRight={theme.sizing.scale800}
          >
            {forsideVarsel && forsideVarsel.meldingStatus === MeldingStatus.ACTIVE &&
              <Block
                $style={{
                  ...borderWidth('1px'),
                  ...borderStyle('solid'),
                  ...borderColor(forsideVarsel.alertType === AlertType.INFO ? ettlevColors.navDypBla : ettlevColors.navOransje),
                  backgroundColor: forsideVarsel.alertType === AlertType.INFO ? ettlevColors.navLysBla : ettlevColors.warning50,
                  ...paddingAll('32px'),
                  marginBottom: '64px'
                }}
              >
                <Markdown source={forsideVarsel.melding} />
              </Block>
            }
            <H2 $style={{ fontWeight: 300, fontSize: '32px', lineHeight: '42px' }} marginTop="0px" marginBottom="0px">
              Etterlevelseskravene er
            </H2>
            <H2 $style={{ wordBreak: 'break-word', fontSize: '32px', lineHeight: '42px' }} marginTop="0px" marginBottom="0px">
              basert på norske lover og regler
            </H2>
            <Paragraph2 $style={{ maxWidth: '600px', width: '100%' }}>
              Hvorfor er etterlevelse viktig, og hvordan bør vi jobbe med kravene? Se filmen om etterlevelse og få en introduksjon på under 2 minutter
            </Paragraph2>
          </Block>

          <Card
            overrides={{
              Root: {
                style: {
                  ...borderRadius('4px'),
                  // ...margin(theme.sizing.scale1600, theme.sizing.scale800),
                  marginTop: '0px',
                },
              },
            }}
          >
            <Block
              $style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ReactPlayer
                controls={true}
                playing={true}
                playIcon={
                  <Button
                    onClick={() => { ampli.logEvent('klikk', {title: 'Etterlevelse video spilt', type: 'Se film knapp'}) }}
                    kind="secondary"
                    size={SIZE.compact}
                    $style={buttonBorderStyle}
                    startEnhancer={<FontAwesomeIcon icon={faPlay} />}
                    overrides={{
                      BaseButton: {
                        style: {
                          ...buttonContentStyle,
                        },
                      },
                    }}
                  >
                    {' '}
                    Se film{' '}
                  </Button>
                }
                width="100%"
                height="414px"
                url="videos/EtterlevelseskravMedTeksting.mp4"
                light={'img/EtterlevelseVideoDark.png'}
              />
            </Block>
          </Card>

          <Block
            $style={{
              ...margin(theme.sizing.scale800, '0'),
              border: `1px solid ${ettlevColors.grey100}`,
              borderRadius: '4px',
              backgroundColor: ettlevColors.white,
            }}
          >
            <PanelLink
              href="/help"
              title={
                <Paragraph1 marginBottom={0} marginTop={0}>
                  Mer om etterlevelse i NAV
                </Paragraph1>
              }
              beskrivelse={<Label4>Hvordan kravene blir til og hvordan jobbe med etterlevelse i produktutviklingen</Label4>}
              panelIcon={<img src={handWithLeaf} alt={''} />}
              overrides={{
                Block: {
                  style: {
                    width: 'calc(100% - 24px)',
                    maxWidth: '820px',
                    ':hover': {
                      boxSizing: 'content-box',
                    },
                  },
                },
              }}
            />
          </Block>

          <Block
            $style={{
              ...margin(theme.sizing.scale1600, theme.sizing.scale600),
            }}
          >
            {/* <HeadingXLarge display={'flex'} flexDirection={'column'} color={ettlevColors.green800}>
              <span style={{ fontWeight: 400 }}>Her kan det stå</span>
              <span>litt tekst som beskriver animasjonsfilmen</span>
            </HeadingXLarge>

            <Block>
              <ParagraphMedium>Kjerneinnholdet / budskapet i filmen.</ParagraphMedium>

              <ParagraphMedium>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Gravida venenatis, a mattis ut tempor, proin aliquam aenean. Nec amet tincidunt ut odio habitant vel
                blandit et id. At in sed enim cursus nisi. A fermentum pellentesque nulla lacus viverra a, ultrices.
              </ParagraphMedium>
            </Block> */}
          </Block>
        </Narrow>
      </Block>
    </Page>
  )
}
