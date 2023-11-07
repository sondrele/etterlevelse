import moment from 'moment'
import { TilbakemeldingMelding } from '../../../../constants'
import { PersonName } from '../../../common/PersonName'
import { BodyShort } from '@navikt/ds-react'

export const EndretInfo = (props: { melding: TilbakemeldingMelding }) => {
  if (!props.melding.endretAvIdent) return null
  return (
    <div className="justify-end flex w-full">
      <BodyShort className="flex">
        Sist endret av
        <div className="mx-1">
          <PersonName ident={props.melding.endretAvIdent} />
        </div>
        - {moment(props.melding.endretTid).format('lll')}
      </BodyShort>
    </div>
  )
}
export default EndretInfo
