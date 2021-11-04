import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { H3, Label3 } from 'baseui/typography'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React from 'react'
import { Suksesskriterie, SuksesskriterieBegrunnelse } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors, theme } from '../../../util/theme'
import { CustomizedAccordion, CustomizedPanel } from '../../common/CustomizedAccordion'
import { FieldWrapper } from '../../common/Inputs'
import { Markdown } from '../../common/Markdown'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'
import LabelWithToolTip from '../../common/LabelWithTooltip'
import { borderColor, borderStyle, borderWidth } from '../../common/Style'
import { LabelAboveContent } from '../../common/PropertyLabel'
import { MODE, StatefulButtonGroup } from 'baseui/button-group'
import { Button, ButtonOverrides } from 'baseui/button'

const paddingLeft = '30px'

export const getSuksesskriterieBegrunnelse = (suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[], suksessKriterie: Suksesskriterie) => {
  const sb = suksesskriterieBegrunnelser.find((item) => {
    return item.suksesskriterieId === suksessKriterie.id
  })
  if (!sb) {
    return { suksesskriterieId: suksessKriterie.id, begrunnelse: '', oppfylt: false, ikkeRelevant: false }
  } else {
    return sb
  }
}

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie, disableEdit }: { suksesskriterie: Suksesskriterie[]; disableEdit: boolean }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>{(p) => <KriterieBegrunnelseList props={p} disableEdit={disableEdit} suksesskriterie={suksesskriterie} />}</FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({ props, suksesskriterie, disableEdit }: { props: FieldArrayRenderProps; suksesskriterie: Suksesskriterie[]; disableEdit: boolean }) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <Block key={s.navn + '_' + i}>
            <KriterieBegrunnelse
              disableEdit={disableEdit}
              suksesskriterie={s}
              index={i}
              suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
              update={(updated) => props.replace(i, updated)}
            />
          </Block>
        )
      })}
    </Block>
  )
}

const KriterieBegrunnelse = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  disableEdit,
  update,
}: {
  suksesskriterie: Suksesskriterie
  index: number
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (s: SuksesskriterieBegrunnelse) => void
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const debounceDelay = 500
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)
  const [oppfylt, setOppfylt] = React.useState(!!suksesskriterieBegrunnelse.oppfylt)
  const [ikkerelevant, setIkkeRelevant] = React.useState(!!suksesskriterieBegrunnelse.ikkeRelevant)

  React.useEffect(() => {
    update({ suksesskriterieId: suksesskriterie.id, begrunnelse: begrunnelse, oppfylt: oppfylt, ikkeRelevant: ikkerelevant })
  }, [begrunnelse, oppfylt, ikkerelevant])

  const buttonOverrides = (): ButtonOverrides => {
    return {
      BaseButton: {
        style: {
          ...borderColor(ettlevColors.green800),
          ...borderStyle('solid'),
          ...borderWidth('1px')
        }
      }
    }
  }

  return (
    <Block $style={{ border: '1px solid #C9C9C9' }} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>

      <H3 color={ettlevColors.green800}>
        {suksesskriterie.navn}
      </H3>

      <StatefulButtonGroup
        mode={MODE.radio}
        initialState={{ selected: oppfylt ? 0 : ikkerelevant ? 1 : [] }}
      >
        <Button
          type={'button'}
          overrides={{
            BaseButton: {
              style: {
                ...borderColor(ettlevColors.green800),
                ...borderStyle('solid'),
                ...borderWidth('1px'),
                borderRightWidth: '0px',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px'
              }
            }
          }}
          onClick={() => {
            setOppfylt(!oppfylt)
            setIkkeRelevant(false)
          }}
        >
          Vi Oppfyller
        </Button>
        <Button
          type={'button'}
          overrides={{
            BaseButton: {
              style: {
                ...borderColor(ettlevColors.green800),
                ...borderStyle('solid'),
                ...borderWidth('1px'),
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px'
              }
            }
          }}
          onClick={() => {
            setIkkeRelevant(!ikkerelevant)
            setOppfylt(false)
          }}
        >
          Ikke relevant
        </Button>
      </StatefulButtonGroup>

      {(oppfylt || ikkerelevant) && !disableEdit && (
        <Block marginTop={theme.sizing.scale1000}>
          <FormControl label={<LabelWithToolTip label="Dokumentasjon" />}>
            <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} />
          </FormControl>
          <Error fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`} fullWidth={true} />
        </Block>
      )}

      {(oppfylt || ikkerelevant) && disableEdit && (
        <Block paddingLeft={paddingLeft} marginTop={theme.sizing.scale1000}>
          <LabelAboveContent title="Dokumentasjon" markdown={begrunnelse} />
        </Block>
      )}

      <Block width="100%" height="1px" backgroundColor={ettlevColors.grey100} marginTop="40px" />
      <CustomizedAccordion>
        <CustomizedPanel
          title={<Label3 $style={{ color: ettlevColors.green600 }}>Utfyllende om kriteriet</Label3>}
          overrides={{
            Header: {
              style: {
                backgroundColor: 'transparent',
                maxWidth: '210px',
                paddingLeft: '0px',
                ':hover': {
                  boxShadow: 'none',
                },
              },
            },
            Content: {
              style: {
                backgroundColor: 'transparent',
                borderBottomWidth: 'none',
                borderBottomStyle: 'none',
                borderBottomColor: 'none',
                paddingLeft: '0px',
              },
            },
            PanelContainer: {
              style: {
                ...borderStyle('hidden'),
              },
            },
          }}
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </CustomizedPanel>
      </CustomizedAccordion>
    </Block>
  )
}
