import { BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import React from 'react'
import { EAdresseType, IBegrep, IKrav, IKravVersjon, TKravQL } from '../../constants'
import { EListName } from '../../services/Codelist'
import { user } from '../../services/User'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { LovViewList } from '../Lov'
import { DotTags } from '../common/DotTag'
import { Markdown } from '../common/Markdown'
import { LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink } from '../common/RouteLink'
import { SuksesskriterieCard } from './Suksesskriterie'

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
)

export const ViewKrav = ({ krav }: { krav: TKravQL }) => {
  return (
    <div>
      <div className="w-full">
        {krav.suksesskriterier.map((s, i) => (
          <SuksesskriterieCard
            key={s.id}
            suksesskriterie={s}
            num={i + 1}
            totalt={krav.suksesskriterier.length}
          />
        ))}
        {/* {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />} */}

        <BodyShort size="small" className="mt-6">
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')}{' '}
          {user.isAdmin() || user.isKraveier()
            ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1]
            : ''}
        </BodyShort>

        {
          //deactivate side panel, waiting for feedback from design
        }
        {/* <div className={"block fixed right-0"}>
        <SidePanel />
      </div> */}
      </div>
    </div>
  )
}

export const AllInfo = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
  header,
}: {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
  header?: boolean
}) => {
  return (
    <div>
      {krav.dokumentasjon.length > 0 && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Kilder">
            <DotTags items={krav.dokumentasjon} markdown inColumn />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header={header} title="Begreper">
          {krav.begreper.map((b, i) => (
            <BegrepView key={'begrep_' + i} begrep={b} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header={header} title="Relasjoner til andre krav">
          {krav.kravRelasjoner.map((kr, i) => (
            <KravRelasjonView key={'kravRelasjon' + i} kravRelasjon={kr} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header={header} title="Kravet er relevant for">
          <DotTags list={EListName.RELEVANS} codes={krav.relevansFor} inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <LabelAboveContent title={'Tidligere versjoner'} header={header}>
            {alleKravVersjoner.map((k, i) => {
              if (k.kravVersjon && parseInt(k.kravVersjon.toString()) < krav.kravVersjon) {
                return (
                  <BodyShort key={'kravVersjon_list_' + i} className={'break-words'}>
                    <ExternalLink
                      href={'/krav/' + k.kravNummer + '/' + k.kravVersjon}
                    >{`K${k.kravNummer}.${k.kravVersjon}`}</ExternalLink>
                  </BodyShort>
                )
              }
              return null
            })}
            {krav.versjonEndringer && (
              <div className="my-8">
                <Label size="medium">Dette er nytt fra forrige versjon</Label>
                <Markdown source={krav.versjonEndringer} />
              </div>
            )}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {krav.regelverk.length && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Regelverk">
            <LovViewList regelverk={krav.regelverk} />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header={header} title="Ansvarlig">
          {krav.underavdeling?.shortName}
        </LabelAboveContent>
      </LabelWrapper>

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Varslingsadresser">
            {krav.varslingsadresser.map((va, i) => {
              if (va.type === EAdresseType.SLACK)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_' + i}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackLink(va.adresse)}>{`#${
                      va.slackChannel?.name || va.adresse
                    }`}</ExternalLink>
                  </div>
                )
              if (va.type === EAdresseType.SLACK_USER)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_USER_' + i}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackUserLink(va.adresse)}>{`${
                      va.slackUser?.name || va.adresse
                    }`}</ExternalLink>
                  </div>
                )
              return (
                <div className="flex mb-2" key={'kravVarsling_list_EMAIL_' + i}>
                  <div className="mr-1">Epost:</div>
                  <ExternalLink href={`mailto:${va.adresse}`} openOnSamePage>
                    {va.adresse}
                  </ExternalLink>
                </div>
              )
            })}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {!noLastModifiedDate && (
        <div>
          <BodyShort size="small">
            Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')}{' '}
            {user.isAdmin() || user.isKraveier()
              ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1]
              : ''}
          </BodyShort>
        </div>
      )}
    </div>
  )
}

const BegrepView = ({ begrep }: { begrep: IBegrep }) => (
  <div className="max-w-2xl">
    <BodyShort className="break-words">
      <ExternalLink href={termUrl(begrep.id)}>{begrep.navn}</ExternalLink>
      {/* {' '}
      - {begrep.beskrivelse} */}
    </BodyShort>
  </div>
)

const KravRelasjonView = ({ kravRelasjon }: { kravRelasjon: Partial<IKrav> }) => (
  <div className="max-w-2xl">
    <BodyShort className="break-words">
      <ExternalLink
        href={`/krav/${kravRelasjon.id}`}
      >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>{' '}
      - {kravRelasjon.navn}
    </BodyShort>
  </div>
)
