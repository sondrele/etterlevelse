import {createTheme, lightThemePrimitives} from 'baseui'
import {colors} from 'baseui/tokens'
import {Theme, ThemePrimitives} from 'baseui/theme'
import {RecursivePartial} from '../constants'
import '@fontsource/source-sans-pro/400.css'
import '@fontsource/source-sans-pro/600.css'
import '@fontsource/source-sans-pro/700.css'
import '@fontsource/source-sans-pro/900.css'

export const primitives: ThemePrimitives & {primary150: string, primary350: string} = {
  ...lightThemePrimitives,
  primaryA: '#3e3832',
  primary: '#19548a',
  primary50: '#F2F8FD',
  primary100: '#eaf4fc',
  primary150: '#C1DBF2',
  primary200: '#99c2e8',
  primary300: '#396FA1',
  primary350: '#0067c5',
  primary400: '#19548a',
  primary500: colors.blue500,
  primary600: colors.blue600,
  primary700: colors.blue700,
  primaryFontFamily: 'Source Sans Pro',
}

export const searchResultColor = {
  kravBackground: '#FFE9CC',
  behandlingBackground: '#F5DBEB',
  underavdelingBackground: '#99C2E8',
}

const overrides: RecursivePartial<Theme> = {
  colors: {
    buttonTertiaryText: '#112724',
    buttonTertiaryHover: 'transparent',
    linkVisited: primitives.primary400,
    inputFill: '#FFFFFF',
    inputFillActive: '#FFFFFF',
    inputEnhancerFill: primitives.primary100,
    borderFocus: '#112825', // same as inputFillActive to hide

    tabBarFill: colors.white,
  },
  borders: {
    buttonBorderRadius: '4px',
    inputBorderRadius: '4px',
  },
  typography: {
    // Increase weight 500->600 on bold texts
    font150: {fontWeight: 600},
    font250: {fontWeight: 600},
    font350: {fontWeight: 600},
    font450: {fontWeight: 600},
    font550: {fontWeight: 600},
    font650: {fontWeight: 600},
    font750: {fontWeight: 600},
    font850: {fontWeight: 600},
    font950: {fontWeight: 600},
    font1050: {fontWeight: 600},
    font1150: {fontWeight: 600},
    font1250: {fontWeight: 600},
    font1350: {fontWeight: 600},
    font1450: {fontWeight: 600},
  },
}

export const theme = createTheme(primitives, overrides)
export const pageWidth = '750px'

const breakpoints: any = {
  xsmall: 375,
  small: 480,
  medium: 648,
  large: 768,
  xlarge: 960,
  xxlarge: 1276
}

const ResponsiveTheme = Object.keys(breakpoints).reduce(
  (acc: any, key: any) => {
    acc.mediaQuery[key] = `@media screen and (min-width: ${breakpoints[key]}px)`
    return acc
  },
  {
    breakpoints,
    mediaQuery: {},
  }
)
export const customTheme = {...theme, ...ResponsiveTheme}
