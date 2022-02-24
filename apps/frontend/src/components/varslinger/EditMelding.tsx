import { Block } from 'baseui/block'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import React, { useState } from 'react'
import { createMelding, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../../constants'
import { FieldWrapper, TextAreaField } from '../common/Inputs'
import Button from '../common/Button'
import { eyeSlash } from '../Images'
import { borderColor } from '../common/Style'
import { ettlevColors, theme } from '../../util/theme'
import { Spinner } from '../common/Spinner'
import { FormControl } from 'baseui/form-control'
import { Radio, RadioGroup } from 'baseui/radio'
import { Paragraph2 } from 'baseui/typography'

export const getAlertTypeText = (type: AlertType) => {
  if (!type) return ''
  switch (type) {
    case AlertType.INFO:
      return 'Informasjon'
    case AlertType.WARNING:
      return 'Varsel'
    default:
      return type
  }
}

export const EditMelding = ({ melding, setMelding, isLoading, maxChar }: { melding: Partial<Melding>, setMelding: Function, isLoading: boolean, maxChar?: number }) => {

  const [disableEdit, setDisableEdit] = useState<boolean>(false)
  const [meldingAlertType, setMeldingAlertType] = useState<string>(melding.alertType ? melding.alertType : AlertType.WARNING)
  const [radioHover, setRadioHover] = useState<string>('')

  const submit = async (melding: Melding) => {
    console.log(melding)
    setDisableEdit(true)
    if (melding.id) {
      await updateMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    } else {
      await createMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    }
  }

  if (isLoading) {
    return (
      <Block display="flex" justifyContent="center">
        <Spinner size={theme.sizing.scale2400} />
      </Block>
    )
  }

  return (
    <Block>
      <Formik
        onSubmit={submit}
        initialValues={mapMeldingToFormValue(melding)}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {(
          { values, submitForm }: FormikProps<Melding>
        ) => (
          <Block>
            <FieldWrapper>
              <Field name="alertType">
                {(p: FieldProps<string>) => (
                  <FormControl
                    label="Varsel type"
                    overrides={{
                      Label: {
                        style: {
                          color: ettlevColors.navMorkGra,
                          fontWeight: 700,
                          lineHeight: '48px',
                          fontSize: '18px',
                          marginTop: '0px',
                          marginBottom: '0px',
                        },
                      },
                    }}
                  >
                    <RadioGroup
                      disabled={disableEdit}
                      onMouseEnter={(e) => setRadioHover(e.currentTarget.children[1].getAttribute('value') || '')}
                      onMouseLeave={() => setRadioHover('')}
                      overrides={{
                        Root: {
                          style: {
                            width: '100%',
                            alignItems: 'flex-start',
                          },
                        },
                        Label: {
                          style: {
                            fontSize: '18px',
                            fontWeight: 400,
                            lineHeight: '22px',
                            width: '100%',
                          },
                        },
                        RadioMarkOuter: {
                          style: {
                            height: theme.sizing.scale600,
                            width: theme.sizing.scale600,
                          },
                        },
                      }}
                      value={meldingAlertType}
                      onChange={(event) => {
                        p.form.setFieldValue('alertType', event.currentTarget.value)
                        setMeldingAlertType(event.currentTarget.value)
                      }}
                    >
                      {Object.values(AlertType).map((id) => {
                        return (
                          <Radio value={id} key={id}>
                            <Block $style={{ textDecoration: radioHover === id ? 'underline' : 'none' }}>
                              <Paragraph2 $style={{ lineHeight: '22px' }} marginTop="0px" marginBottom="0px">
                                {getAlertTypeText(id)}
                              </Paragraph2>
                            </Block>
                          </Radio>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                )}
              </Field>
            </FieldWrapper>

            <TextAreaField maxCharacter={maxChar} markdown height="200px" label={melding.meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'} noPlaceholder name="melding" />

            <Block display="flex" justifyContent="flex-end" width="100%" >
              {melding.meldingStatus === MeldingStatus.ACTIVE &&
                <Button
                  marginRight
                  kind="secondary"
                  disabled={disableEdit}
                  startEnhancer={<img src={eyeSlash} alt="" />}
                  onClick={() => {
                    values.meldingStatus = MeldingStatus.DEACTIVE
                    submitForm()
                  }}
                  $style={{
                    ...borderColor(ettlevColors.grey200)
                  }}
                >
                  Skjul meldingen
                </Button>}
              <Button
                disabled={disableEdit}
                onClick={() => {
                  values.meldingStatus = MeldingStatus.ACTIVE
                  submitForm()
                }}
              >
                Publiser
              </Button>
            </Block>
          </Block>
        )}
      </Formik>
    </Block>
  )
}

export default EditMelding
