import archiveImage from '../resources/img/archive.png'
import archive2Image from '../resources/img/archive2.png'
import hammerImage from '../resources/img/hammer.png'
import keyboardImage from '../resources/img/keyboard.png'
import peopleImage from '../resources/img/people.png'
import scalesImage from '../resources/img/scales.png'
import cameraImage from '../resources/img/camera.png'
import guardianImage from '../resources/img/guardian.png'
import navImage from '../resources/img/nav-logo-red.svg'
import moneyImage from '../resources/img/money.png'
import bookImage from '../resources/img/book.png'


import pencilFill from '../resources/icons/pencil-fill.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import barChart from '../resources/icons/bar-chart.svg'
import stepper from '../resources/icons/stepper.svg'
import logo from '../resources/icons/logo.svg'
import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import {codelist, ListName, LovCode, TemaCode} from '../services/Codelist'
import React from 'react'
import {theme} from '../util'

export {
  pencilFill,
  lawBook,
  barChart,
  illustration,
  navImage,
  stepper,
  logo
}

export const temaBilder: {[id: string]: string} = {
  ARCHIVE: archiveImage,
  ARCHIVE2: archive2Image,
  KEYBOARD: keyboardImage,
  PEOPLE: peopleImage,
  BOOK: bookImage,
  SCALES: scalesImage,
  HAMMER: hammerImage,
  MONEY: moneyImage,
  NAV: navImage,
  CAMERA: cameraImage,
  GUARDIAN: guardianImage,
}

const bildeForLov = (code: LovCode) => bildeForTema(code.data?.tema)

const bildeForTema = (code?: string) => {
  const temaCode = codelist.getCode(ListName.TEMA, code)
  const imageCode = temaCode?.data?.image
  return imageCode ? temaBilder[imageCode] || bookImage : bookImage
}

export const LovBilde = (props: {code: LovCode} & BildeProps) => (
  <Bilde {...props} src={bildeForLov(props.code)} alt={`Lov illustrasjon: ${props.code.shortName}`}/>
)

export const TemaBilde = (props: {code: TemaCode} & BildeProps) => (
  <Bilde {...props} src={bildeForTema(props.code.code)} alt={`Tema illustrasjon: ${props.code.shortName}`}/>
)

type BildeProps = {
  width?: string, height?: string, ellipse?: boolean
}

const Bilde = (props: {src: string, alt: string} & BildeProps) => (
  <img src={props.src}
       width={props.width} height={props.height}
       style={{
         objectFit: 'cover',
         borderRadius: props.ellipse ? '15px' : undefined,
         border: props.ellipse ? `2px solid ${theme.colors.mono600}` : undefined
       }}
       alt={props.alt}
  />
)
