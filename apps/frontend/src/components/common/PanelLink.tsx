import React, {useState} from 'react'
import RouteLink from './RouteLink'
import {Block} from 'baseui/block'
import {borderRadius, paddingAll} from './Style'
import {theme} from '../../util'
import {ettlevColors} from '../../util/theme'
import {LabelLarge, LabelSmall, ParagraphSmall} from 'baseui/typography'
import {arrowRightIcon, navChevronRightIcon} from '../Images'


export const PanelLink = ({href, title, rightTitle, beskrivelse, rightBeskrivelse, panelIcon, flip}:
                            {
                              href: string, title: string, rightTitle?: string, beskrivelse?: string, rightBeskrivelse?: string,
                              flip?: boolean
                              panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
                            }) => {
  const [hover, setHover] = useState(false)

  return (
    <RouteLink href={href} hideUnderline $style={{
      display: 'flex'
    }}>
      <Block overrides={{
        Block: {
          style: {
            width: '100%',
            ...paddingAll(theme.sizing.scale600),
            paddingLeft: theme.sizing.scale300,
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: ettlevColors.white,

            borderWidth: '1px',
            borderColor: ettlevColors.grey100,
            borderStyle: 'solid',
            ...borderRadius('4px'),

            ':hover': {
              position: 'relative',
              boxSizing: 'border-box',
              boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)'
            }
          }
        }
      }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}

        <Block marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale600} $style={{flexGrow: 1}}
               display={'flex'} flexDirection={flip ? 'column-reverse' : 'column'} justifyContent={'center'}>
          <LabelLarge $style={{lineHeight: '20px'}}>{title}</LabelLarge>
          <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>{beskrivelse}</ParagraphSmall>
        </Block>

        {(rightTitle || rightBeskrivelse) &&
        <Block minWidth={'150px'} maxWidth={'150px'} display={'flex'} flexDirection={flip ? 'column-reverse' : 'column'} justifyContent={'center'}>
          {rightTitle && <LabelSmall>{rightTitle}</LabelSmall>}
          {rightBeskrivelse && <ParagraphSmall marginBottom={0} marginTop={rightTitle ? theme.sizing.scale100 : 0}>{rightBeskrivelse}</ParagraphSmall>}
        </Block>}

        <Chevron hover={hover} icon={navChevronRightIcon} distance={'4px'}/>

      </Block>
    </RouteLink>
  )
}


export const PanelLinkCard = (
  {
    href, tittel, beskrivelse, icon, requireLogin,
    height, width, maxWidth
  }: {
    href: string, tittel: string, beskrivelse: string, icon: string, requireLogin?: boolean
    height?: string, width?: string, maxWidth?: string
  }) => {
  const [hover, setHover] = useState(false)

  return (
    <Block width={width} maxWidth={maxWidth}>
      <RouteLink href={href} hideUnderline requireLogin={requireLogin}>
        <Block overrides={{
          Block: {
            style: {
              height: height,

              ...paddingAll(theme.sizing.scale600),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',

              backgroundColor: ettlevColors.white,

              borderWidth: '1px',
              borderColor: ettlevColors.grey100,
              borderStyle: 'solid',
              ...borderRadius('4px'),

              ':hover': {
                boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.24)'
              }
            }
          }
        }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>

          <Block marginTop={theme.sizing.scale900}>
            <Block display={'flex'} justifyContent={'center'} width={'100%'}>
              <img src={icon} alt={'ikon'} aria-hidden width={'30%'}/>
            </Block>

            <Block marginTop={theme.sizing.scale900}>
              <LabelLarge $style={{lineHeight: '20px', textDecoration: hover ? '3px underline ' : undefined}}>{tittel}</LabelLarge>
              <ParagraphSmall>{beskrivelse}</ParagraphSmall>
            </Block>
          </Block>

          <Block placeSelf={'flex-end'}>
            <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'}/>
          </Block>
        </Block>
      </RouteLink>
    </Block>
  )
}

const Chevron = ({hover, icon, distance}: {hover: boolean, icon: string, distance: string}) => (
  <Block marginLeft={hover ? `calc(${theme.sizing.scale600} + ${distance})` : theme.sizing.scale600} alignSelf={'center'}
         marginRight={hover ? '-' + distance : 0}>
    <img src={icon} aria-hidden alt={'Chevron høyre ikon'} width={'24px'} height={'24px'}/>
  </Block>
)
