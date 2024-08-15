import { Alert, BodyShort, Box, Heading, Label, ReadMore } from '@navikt/ds-react'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  ISuksesskriterie,
  ISuksesskriterieBegrunnelse,
} from '../../constants'
import { Markdown } from '../common/Markdown'
import { LabelAboveContent } from '../common/PropertyLabel'
import {
  getLabelForSuksessKriterie,
  getSuksesskriterieBegrunnelse,
} from './Edit/SuksesskriterieBegrunnelseEdit'
import EtterlevelseCard from './EtterlevelseCard'

interface IProps {
  etterlevelse: IEtterlevelse
  suksesskriterier: ISuksesskriterie[]
  tidligereEtterlevelser?: IEtterlevelse[]
  isBortfiltrert?: boolean
}
export const EtterlevelseViewFields = (props: IProps) => {
  const { etterlevelse, suksesskriterier, tidligereEtterlevelser, isBortfiltrert } = props

  return (
    <div>
      {(etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
        etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
        <div className={'mb-12'}>
          <Alert className="mb-1" size="small" variant="info">
            Dette kravet er dokumentert som ikke relevant 20.05.2022, og senere blitt bortfiltrert
          </Alert>
          <Label>Beskrivelse av hvorfor kraver er ikke relevant</Label>
          <BodyShort>{etterlevelse.statusBegrunnelse}</BodyShort>
        </div>
      )}

      <div className="flex w-full items-center mb-4">
        <Label className="min-w-fit mt-3">Hvilke suksesskriterier er oppfylt?</Label>
        {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
          <div className="flex w-full justify-end">
            <EtterlevelseCard etterlevelse={tidligereEtterlevelser[0]} />
          </div>
        )}
      </div>

      {suksesskriterier.map((suksesskriterium, index) => {
        return (
          <div key={suksesskriterium.navn + '_' + index}>
            <KriterieBegrunnelse
              suksesskriterie={suksesskriterium}
              index={index}
              suksesskriterieBegrunnelser={etterlevelse.suksesskriterieBegrunnelser}
              totalSuksesskriterie={suksesskriterier.length}
              isBortfiltrert={isBortfiltrert}
            />
          </div>
        )
      })}
    </div>
  )
}

export const getSuksesskriterieStatus = (status: ESuksesskriterieStatus) => {
  switch (status) {
    case ESuksesskriterieStatus.IKKE_OPPFYLT:
      return 'Ikke oppfylt'
    case ESuksesskriterieStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case ESuksesskriterieStatus.OPPFYLT:
      return 'Oppfylt'
    default:
      return 'Under arbeid'
  }
}

interface IKriterieBegrunnelseProps {
  suksesskriterie: ISuksesskriterie
  index: number
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  totalSuksesskriterie: number
  isBortfiltrert?: boolean
}

const KriterieBegrunnelse = (props: IKriterieBegrunnelseProps) => {
  const {
    suksesskriterie,
    index,
    suksesskriterieBegrunnelser,
    totalSuksesskriterie,
    isBortfiltrert,
  } = props

  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(
    suksesskriterieBegrunnelser,
    suksesskriterie
  )

  return (
    <Box
      className="mb-4"
      borderColor="border-alt-1"
      padding="8"
      borderWidth="3"
      borderRadius="medium"
    >
      <div className="flex w-full">
        <BodyShort className="min-w-fit">
          Suksesskriterium {index + 1} av {totalSuksesskriterie}
        </BodyShort>

        <div className="flex w-full justify-end">
          {isBortfiltrert && <BodyShort className="text-text-danger">Bortfiltert</BodyShort>}
          {!isBortfiltrert && suksesskriterieBegrunnelse.suksesskriterieStatus && (
            <BodyShort>
              Status: {getSuksesskriterieStatus(suksesskriterieBegrunnelse.suksesskriterieStatus)}
            </BodyShort>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <Heading size="xsmall" level="3">
          {suksesskriterie.navn}
        </Heading>

        <ReadMore header="Utfyllende om kriteriet">
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      <div className="flex w-full">
        {!suksesskriterie.behovForBegrunnelse && (
          <div className="w-full mt-8 ">
            <Label>Suksesskriteriet har ikke behov for begrunnelse.</Label>
          </div>
        )}

        {suksesskriterie.behovForBegrunnelse && (
          <div className="w-full mt-8 ">
            <LabelAboveContent
              fullWidth
              title={getLabelForSuksessKriterie(suksesskriterieBegrunnelse.suksesskriterieStatus)}
              markdown={
                suksesskriterieBegrunnelse.begrunnelse
                  ? suksesskriterieBegrunnelse.begrunnelse
                  : 'Ingen begrunnelse'
              }
            />
          </div>
        )}
      </div>
    </Box>
  )
}

export default EtterlevelseViewFields
