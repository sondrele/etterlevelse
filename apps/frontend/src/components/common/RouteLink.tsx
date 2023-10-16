import { useLocation, useNavigate } from 'react-router-dom'
import React from 'react'
import { AuditItem, NavigableItem, ObjectType } from '../admin/audit/AuditTypes'
import { Block } from 'baseui/block'
import { AuditButton } from '../admin/audit/AuditButton'
import { KIND } from 'baseui/button'
import { ListName } from '../../services/Codelist'
import CustomizedLink from './CustomizedLink'
import _ from 'lodash'
import { user } from '../../services/User'
import { loginUrl } from '../Header'
import { ettlevColors } from '../../util/theme'
import { Link } from '@navikt/ds-react'

type RouteLinkProps = {
  href?: string
  hideUnderline?: boolean
  plain?: boolean
  requireLogin?: boolean
  fontColor?: string
  ariaLabel?: string
  openinnewtab: boolean
} & any

const RouteLink = (props: RouteLinkProps) => {
  const { hideUnderline, plain, requireLogin, style, fontColor, ariaLabel, ...restprops } = props
  const navigate = useNavigate()
  const location = useLocation()

  const onClick = (e: Event) => {
    if (requireLogin && !user.isLoggedIn()) return
    e.preventDefault()
    if (!props.href) {
      navigate(-1)
      restprops.onClick && restprops.onClick()
    }
    navigate(props.href)
    restprops.onClick && restprops.onClick()
  }

  const customStyle = {
    textDecoration: hideUnderline ? 'none' : undefined,
    color: fontColor ? fontColor : plain ? 'inherit !important' : undefined,
    fontWeight: 'normal',
  }

  const mergedStyle = _.merge(customStyle, props.style)

  const href = !requireLogin || user.isLoggedIn() ? restprops.href : loginUrl(location, restprops.href)

  return (
    <CustomizedLink
      aria-label={ariaLabel}
      style={mergedStyle}
      {...restprops}
      href={href}
      onClick={props.href && props.href.includes('https') ? undefined : onClick}
      target={props.openinnewtab ? '_blank' : undefined}
      rel={props.openinnewtab ? 'noreferrer noopener' : undefined}
    />
  )
}

export default RouteLink

type ObjectLinkProps = {
  id?: string
  type: NavigableItem
  audit?: AuditItem
  withHistory?: boolean
  children?: any
  disable?: boolean
  hideUnderline?: boolean
  fontColor?: string
  external?: boolean
}

export const urlForObject = (type: NavigableItem | string, id: string, audit?: AuditItem) => {
  switch (type) {
    case ObjectType.Krav:
      return `/krav/${id}`
    case ObjectType.Etterlevelse:
      return `/etterlevelse/${id}`
    case ObjectType.EtterlevelseDokumentasjon:
      return `/dokumentasjon/${id}`
    case ObjectType.BehandlingData:
    case ObjectType.Behandling:
      return `/behandling/${id}`
    case ListName.RELEVANS:
      return `/relevans/${id}`
    case ListName.UNDERAVDELING:
      return `/underavdeling/${id}`
    case ListName.LOV:
      return `/lov/${id}`
    case ListName.TEMA:
      return `/tema/${id}`
    case ObjectType.Codelist:
      return `/admin/codelist/${id}`
    case ObjectType.Melding:
      return '/admin/varsel'
  }
  console.warn("couldn't find object type" + type)
  return ''
}

export const ObjectLink = (props: ObjectLinkProps) => {
  if (!props.id) return null
  let link

  if (props.disable) {
    link = props.children
  } else link = <ExternalLink href={urlForObject(props.type, props.id, props.audit)}>{props.children}</ExternalLink>

  return props.withHistory ? (
    <Block color={props.fontColor ? props.fontColor : ettlevColors.green800} display="flex" justifyContent="space-between" width="100%" alignItems="center">
      {link}
      <AuditButton fontColor={props.fontColor} id={props.id} kind={KIND.tertiary} />
    </Block>
  ) : (
    link
  )
}

export const ExternalLink = ({
  href,
  children,
  className,
  label,
  openOnSamePage,
}: {
  href: string
  className?: string
  label?: string
  children: React.ReactNode
  openOnSamePage?: boolean
}) => {
  return (
    <Link className={className} href={href} target={openOnSamePage ? '_self' : '_blank'} rel="noopener noreferrer" aria-label={label}>
      {children} {!openOnSamePage && ' (åpnes i ny fane)'}
    </Link>
  )
}
