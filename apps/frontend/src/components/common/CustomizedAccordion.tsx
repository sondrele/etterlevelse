import { Accordion, AccordionProps, Panel, PanelOverrides, PanelProps } from 'baseui/accordion'
import { ettlevColors, theme } from '../../util/theme'
import { Block } from 'baseui/block'
import { HeadingLarge } from 'baseui/typography'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { borderColor, borderRadius, borderStyle, borderWidth, paddingAll } from './Style'
import _ from 'lodash'

export const CustomizedAccordion = (props: AccordionProps) => {
  return <Accordion {...props} overrides={{}} />
}

interface CustomizedPanelProps {
  HeaderBackgroundColor?: string
  HeaderActiveBackgroundColor?: string
}

type CustomProps = CustomizedPanelProps & PanelProps

export const CustomizedPanel = (props: CustomProps) => {
  const { expanded } = props

  const headerBackgroundColor = props.HeaderBackgroundColor ? props.HeaderBackgroundColor : ettlevColors.white
  const headerActiveBackgroundColor = props.HeaderActiveBackgroundColor ? props.HeaderActiveBackgroundColor : ettlevColors.grey50

  const customOverrides: PanelOverrides<any> = {
    ToggleIcon: {
      component: () => (expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />),
    },
    Header: {
      style: {
        backgroundColor: ettlevColors.white,
        ...borderRadius('4px'),
        ':hover': {
          textDecoration: 'underline',
          color: ettlevColors.green800,
          ...(expanded
            ? {
                boxShadow: 'none',
              }
            : {
                boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)',
              }),
        },
      },
    },
    ContentAnimationContainer: {
      style: {
        overflow: 'visible', // fix box shadows of content
      },
    },
    Content: {
      style: {
        ...borderRadius('4px'),
        backgroundColor: ettlevColors.grey50,
        ...paddingAll('0'),
        overflow: 'visible', // fix box shadows of content
      },
    },
    PanelContainer: {
      style: {
        ...(expanded
          ? {
              ...borderColor(ettlevColors.grey200),
            }
          : {
              ...borderColor(ettlevColors.grey100),
            }),
        ...borderStyle('solid'),
        ...borderWidth('1px'),
        ...borderRadius('4px'),
        marginBottom: theme.sizing.scale200,
        backgroundColor: ettlevColors.white,
      },
    },
  }

  const overrides = _.merge(customOverrides, props.overrides)

  const getTitle = () => {
    if (typeof props.title !== 'string') {
      return props.title
    } else {
      return (
        <Block>
          <HeadingLarge marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
            {props.title}
          </HeadingLarge>
        </Block>
      )
    }
  }

  return <Panel {...props} overrides={overrides} title={getTitle()} />
}

export const CustomPanelDivider = (props: { children: React.ReactNode }) => (
  <Block backgroundColor={ettlevColors.white} $style={{ ...borderRadius('4px') }}>
    <Block width="calc(100% - 48px)" backgroundColor={ettlevColors.grey100} height="1px" marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale800} />
    {props.children}
  </Block>
)
