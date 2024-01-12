import { Block } from 'baseui/block'
import { ProgressBar, SIZE } from 'baseui/progress-bar'
import { ParagraphXSmall } from 'baseui/typography'
import moment from 'moment'
import { EKravFilterType, IEtterlevelseDokumentasjon } from '../../constants'
import { isFerdigUtfylt } from '../../pages/EtterlevelseDokumentasjonTemaPage'
import { cardWidth, useKravCounter } from '../../pages/TemaPage'
import { TTemaCode, codelist } from '../../services/Codelist'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { ettlevColors, theme } from '../../util/theme'
import { PanelLinkCard, TPanelLinkCardOverrides } from '../common/PanelLink'
import { HeaderContent } from './HeaderContent'

type TTemaCardEtterlevelseDokumentasjonProps = {
  tema: TTemaCode
  stats: any[]
  utgaattStats: any[]
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  irrelevant?: boolean
}
export const TemaCardEtterlevelseDokumentasjon = (
  props: TTemaCardEtterlevelseDokumentasjonProps
) => {
  const today = new Date()
  const { tema, stats, etterlevelseDokumentasjon, irrelevant, utgaattStats } = props
  const lover = codelist.getCodesForTema(tema.code)
  const lovcodes = lover.map((c) => c.code)
  const krav = stats.filter((k) =>
    k.regelverk.map((r: any) => r.lov.code).some((r: any) => lovcodes.includes(r))
  )
  const utgaattKrav = utgaattStats.filter((k) =>
    k.regelverk.map((r: any) => r.lov.code).some((r: any) => lovcodes.includes(r))
  )
  const { data } = useKravCounter({ lover: lover.map((c) => c.code) }, { skip: !lover.length })

  let nyttKravCounter = 0
  let nyttKravVersjonCounter = 0

  let utfylt = 0
  let underArbeid = 0

  krav.forEach((k) => {
    const kravActivatedDate = moment(k.aktivertDato).toDate()
    const kravAge = getNumberOfDaysBetween(kravActivatedDate, today)
    if (k.etterlevelser.length === 0 && k.kravVersjon === 1 && kravAge < 30) {
      nyttKravCounter += 1
    }
    if (
      k.etterlevelser.length === 0 &&
      k.kravVersjon > 1 &&
      utgaattKrav.filter((kl) => kl.kravNummer === k.kravNummer && kl.etterlevelser.length > 0)
        .length > 0 &&
      kravAge < 30
    ) {
      nyttKravVersjonCounter += 1
    }
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      utfylt += 1
    } else if (k.etterlevelser.length && !isFerdigUtfylt(k.etterlevelser[0].status)) {
      underArbeid += 1
    }
  })

  for (let index = krav.length - 1; index > 0; index--) {
    if (krav[index].kravNummer === krav[index - 1].kravNummer) {
      krav.splice(index - 1, 1)
    }
  }

  const overrides: TPanelLinkCardOverrides = {
    Header: {
      Block: {
        style: {
          backgroundColor: krav.length > 0 ? ettlevColors.green100 : ettlevColors.green50,
          height: '180px',
          paddingBottom: theme.sizing.scale600,
        },
      },
    },
    Content: {
      Block: {
        style: {
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden',
        },
      },
    },
    Root: {
      Block: {
        style: {
          display: 'block',
        },
      },
    },
  }

  return (
    <PanelLinkCard
      width={cardWidth}
      overrides={overrides}
      verticalMargin={theme.sizing.scale400}
      href={`/dokumentasjon/${etterlevelseDokumentasjon.id}/${irrelevant ? 'i' : ''}${tema.code}/${
        EKravFilterType.RELEVANTE_KRAV
      }`}
      tittel={tema.shortName}
      headerContent={
        <HeaderContent
          kravLength={krav.length}
          documentedLength={underArbeid + utfylt}
          nyttKravCounter={nyttKravCounter}
          nyttKravVersjonCounter={nyttKravVersjonCounter}
        />
      }
      flexContent
      hideArrow
      titleColor={ettlevColors.green600}
    >
      <Block display="flex" width="100%">
        {krav.length > 0 ? (
          <Block marginTop={theme.sizing.scale650} width={'100%'}>
            <Block display="flex" flex={1}>
              <ParagraphXSmall marginTop="0px" marginBottom="2px">
                Ferdig utfylt:
              </ParagraphXSmall>
              <Block display="flex" flex={1} justifyContent="flex-end">
                <ParagraphXSmall marginTop="0px" marginBottom="2px">
                  {utfylt} av {krav.length} krav
                </ParagraphXSmall>
              </Block>
            </Block>
            <Block>
              <ProgressBar
                value={utfylt}
                successValue={krav.length}
                size={SIZE.medium}
                overrides={{
                  BarProgress: {
                    style: {
                      backgroundColor: ettlevColors.green800,
                    },
                  },
                  BarContainer: {
                    style: {
                      marginLeft: '0px',
                      marginRight: '0px',
                    },
                  },
                }}
              />
            </Block>
          </Block>
        ) : (
          <ParagraphXSmall
            $style={{ lineHeight: '14px', fontStyle: 'italic' }}
            marginTop="25px"
            marginBottom="0px"
          >
            Tema inneholder {data?.krav.numberOfElements} krav dere har filtrert bort
          </ParagraphXSmall>
        )}
      </Block>
    </PanelLinkCard>
  )
}
