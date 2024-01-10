import { BodyLong, BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import { ETilbakemeldingRolle, ITilbakemelding, ITilbakemeldingMelding } from '../../../constants'
import { PersonName } from '../../common/PersonName'
import { Portrait } from '../../common/Portrait'
import EndretInfo from './edit/EndreInfo'
import MeldingKnapper from './edit/MeldingKnapper'

export const ResponseMelding = (props: {
  m: ITilbakemeldingMelding
  tilbakemelding: ITilbakemelding
  oppdater: (t: ITilbakemelding) => void
  remove: (t: ITilbakemelding) => void
}) => {
  const { m, tilbakemelding, oppdater, remove } = props
  const kraveier = m.rolle === ETilbakemeldingRolle.KRAVEIER
  const sisteMelding =
    m.meldingNr === tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].meldingNr

  return (
    <div className="flex flex-col mb-4 p-2">
      <div className="flex w-full">
        <Portrait ident={m.fraIdent} />
        <div className="flex flex-col w-full ml-2.5">
          <div className="flex items-center w-full">
            <Label>{<PersonName ident={m.fraIdent} kraveier={kraveier} />}</Label>
            <BodyShort className="ml-6">Sendt: {moment(m.tid).format('lll')}</BodyShort>
          </div>
          <div className="flex w-full">
            <BodyLong className="mr-7 mt-1">{m.innhold}</BodyLong>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-4 pl-12">
        {sisteMelding && (
          <MeldingKnapper
            melding={m}
            tilbakemeldingId={tilbakemelding.id}
            oppdater={oppdater}
            remove={remove}
          />
        )}
        <EndretInfo melding={m} />
      </div>
    </div>
  )
}
export default ResponseMelding
