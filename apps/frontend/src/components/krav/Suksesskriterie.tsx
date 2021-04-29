import {Suksesskriterie} from '../../constants'
import {Block} from 'baseui/block'
import {Card} from 'baseui/card'
import {theme} from '../../util'
import {HeadingXLarge, ParagraphMedium} from 'baseui/typography'
import {Markdown} from '../common/Markdown'
import {borderRadius} from '../common/Style'


export const SuksesskriterieCard = (props: {suksesskriterie: Suksesskriterie, num: number, totalt: number}) => {
  const {suksesskriterie, num, totalt} = props

  return (
    <Block marginBottom={theme.sizing.scale800}>
      <Card overrides={{
        Root: {
          style: {
            ...borderRadius('4px')
          }
        }
      }}>
        <ParagraphMedium>SUKSESSKRITERIE {num} AV {totalt}</ParagraphMedium>
        <HeadingXLarge>{suksesskriterie.navn}</HeadingXLarge>
        <Markdown source={suksesskriterie.beskrivelse}/>
      </Card>
    </Block>
  )
}
