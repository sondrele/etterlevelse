import React, {useState} from 'react'
import {Select, Value} from 'baseui/select'
import {codelist, ListName} from '../../../services/Codelist'
import {FieldWrapper} from '../../common/Inputs'
import {FieldArray} from 'formik'
import {FormControl} from 'baseui/form-control'
import {Block} from 'baseui/block'
import {theme} from '../../../util'
import {Input, SIZE} from 'baseui/input'
import Button, {buttonBorderStyle} from '../../common/Button'
import {LabelSmall} from 'baseui/typography'
import {LovView} from '../../Lov'
import {RenderTagList} from '../../common/TagList'
import {Regelverk} from '../../../constants'
import LabelWithTooltip from '../../common/LabelWithTooltip'


export const KravRegelverkEdit = () => {
  const [lov, setLov] = useState<Value>([])
  const [text, setText] = useState('')
  const controlRef = React.useRef<HTMLInputElement | HTMLDivElement>(null)

  const regelverkObject = () => ({lov: codelist.getCode(ListName.LOV, lov[0].id as string)!, spesifisering: text})

  return (
    <FieldWrapper>
      <FieldArray name='regelverk'>
        {p => {
          const add = () => {
            if (!text || !lov.length) return
            p.push(regelverkObject())
            setLov([])
            setText('')
            controlRef.current?.focus()
          }
          return (
            <FormControl>
              <Block>
                <Block>
                  <Block display='flex' alignItems={'flex-end'}>
                    <Block flex={1} width='400px' marginRight={theme.sizing.scale400}>
                      <LabelWithTooltip label={'Regelverk'}
                                        tooltip={'Velg relevant regelverk fra nedtrekksmenyen, og angi hvilke(n) bestemmelse(r) kravet har sin opprinnelse fra.'}/>
                      <Select
                        size={SIZE.compact}
                        controlRef={controlRef}
                        placeholder={'Velg regelverk'}
                        aria-label={'Velg regelverk'}
                        maxDropdownHeight='400px'

                        value={lov}
                        options={codelist.getParsedOptions(ListName.LOV)}
                        onChange={({value}) => {
                          setLov(value)
                        }}
                      />
                    </Block>
                    <Block flex={2} width='100%'>
                      <LabelWithTooltip label={'Paragraf eller kapittel i regelverk'} tooltip={'Beskrivelse'}/>
                      <Input size={SIZE.compact} value={text}
                             onChange={e => setText((e.target as HTMLInputElement).value)}
                             placeholder={'Beskrivelse, paragraf eller kapittel i regelverk'}
                      />
                    </Block>

                    <Block minWidth='107px'>
                      <Button
                        type='button'
                        size='compact'
                        onClick={add}
                        marginLeft
                        $style={buttonBorderStyle}
                        kind='tertiary'
                      >
                        Legg til
                      </Button>
                    </Block>

                  </Block>
                  {!!lov.length && text && <Block display='flex' alignItems='center' marginTop={theme.sizing.scale400}>
                    <LabelSmall marginRight={theme.sizing.scale800}>Forhåndsvisning: </LabelSmall>
                    <LovView regelverk={regelverkObject()}/>
                  </Block>}
                </Block>
                <RenderTagList wide list={p.form.values.regelverk.map((r: Regelverk) => <LovView regelverk={r}/>)} onRemove={p.remove}/>
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
