import * as React from 'react'
import { ettlevColors, maxPageWidth, responsivePaddingLarge, responsiveWidthLarge, theme } from '../util/theme'
import { HeadingXXLarge, ParagraphLarge } from 'baseui/typography'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Block } from 'baseui/block'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

export const StatusPage = () => {
  ampli.logEvent('sidevisning', { side: 'Status side', sidetittel: 'Status i organisasjonen' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Status i organisasjonen</title>
      </Helmet>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width={responsiveWidthLarge} paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge}>
          <Block paddingTop={theme.sizing.scale800} >
            <CustomizedBreadcrumbs currentPage="Status i organisasjonene" />
          </Block>
        </Block>
      </Block>

      <Block display={'flex'} justifyContent="center" width="100%">
        <Block
          maxWidth={maxPageWidth}
          width={responsiveWidthLarge}
          display="flex"
          justifyContent="center"
          paddingLeft={responsivePaddingLarge}
          paddingRight={responsivePaddingLarge}
        >
          <Block maxWidth="800px">
            <HeadingXXLarge marginTop="54px" marginBottom="32px">
              Status i organisasjonen
            </HeadingXXLarge>

            <ParagraphLarge marginTop="0px" $style={{ fontSize: '22px', color: ettlevColors.green800 }}>
              Vi jobber med å få på plass nyttig statistikk og oversikter over etterlevels Har du innspill hører vi gjerne fra deg på <strong>#etterlevelse</strong>.
            </ParagraphLarge>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
