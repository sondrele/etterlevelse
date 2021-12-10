import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { FormControl } from 'baseui/form-control'
import { ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { H2 } from 'baseui/typography'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { createNewTilbakemelding, CreateTilbakemeldingRequest } from '../../../../api/TilbakemeldingApi'
import { AdresseType, Krav, Tilbakemelding, TilbakemeldingType, Varslingsadresse } from '../../../../constants'
import { theme } from '../../../../util'
import CustomizedModal from '../../../common/CustomizedModal'
import { TextAreaField } from '../../../common/Inputs'
import LabelWithTooltip from '../../../common/LabelWithTooltip'
import { AddEmail, SlackChannelSearch, SlackUserSearch, VarslingsadresserTagList } from '../../Edit/KravVarslingsadresserEdit'
import { Notification } from 'baseui/notification'
import * as yup from 'yup'

type NyTilbakemeldingModalProps = {
  open?: boolean
  close: (add?: Tilbakemelding) => void
  krav: Krav
  setShowNotification: (varslingsAddress: AdresseType) => void
}

export const NyTilbakemeldingModal = ({
  open,
  close,
  krav,
  setShowNotification
}: NyTilbakemeldingModalProps) => {
  const [error, setError] = useState()
  const [adresseType, setAdresseType] = useState<AdresseType>()

  const submit = (req: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(req)
      .then((t) => {
        setShowNotification(req.varslingsadresse.type)
        close(t)
      })
      .catch((e) => setError(e.error))
  }

  return (
    <CustomizedModal
      size="default"
      overrides={{
        Dialog: {
          style: {
            maxWidth: '514px',
          },
        },
      }}
      closeable={false}
      unstable_ModalBackdropScroll
      isOpen={open}
      onClose={() => close()}
    >
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as CreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, setFieldValue, values, submitForm }) => {
          const setVarslingsadresse = (v?: Varslingsadresse) => {
            setFieldValue('varslingsadresse', v)
            setAdresseType(undefined)
          }
          return (
            <Form>
              <ModalHeader>
                <H2>Spørsmål til kraveier</H2>
              </ModalHeader>
              <ModalBody>
                <Block>
                  <TextAreaField tooltip="Skriv ditt spørsmål i tekstfeltet" label="Ditt spørsmål" name="foersteMelding" placeholder="Skriv her.." />
                  {/* <OptionField label="Type" name="type" clearable={false} options={Object.values(TilbakemeldingType).map((o) => ({ id: o, label: typeText(o) }))} /> */}
                  <Field name="varslingsadresse.adresse">
                    {(p: FieldProps) => (
                      <FormControl label={<LabelWithTooltip label="Varslingsadresse" tooltip="Velg ønsket varslings metode" />} error={p.meta.error}>
                        <Block>
                          <Block display="flex" flexDirection="column" marginTop={theme.sizing.scale600}>
                            {adresseType === AdresseType.SLACK && <SlackChannelSearch add={setVarslingsadresse} />}
                            {adresseType !== AdresseType.SLACK && !values.varslingsadresse && (
                              <Button kind="secondary" size="compact" type="button" icon={faSlackHash} onClick={() => setAdresseType(AdresseType.SLACK)}>
                                Slack-kanal
                              </Button>
                            )}
                            <Block marginTop={theme.sizing.scale400} />
                            {adresseType === AdresseType.SLACK_USER && <SlackUserSearch add={setVarslingsadresse} />}
                            {adresseType !== AdresseType.SLACK_USER && !values.varslingsadresse && (
                              <Button kind="secondary" size="compact" marginLeft type="button" icon={faUser} onClick={() => setAdresseType(AdresseType.SLACK_USER)}>
                                Slack-bruker
                              </Button>
                            )}
                            <Block marginTop={theme.sizing.scale400} />
                            {adresseType === AdresseType.EPOST && <AddEmail add={setVarslingsadresse} />}
                            {adresseType !== AdresseType.EPOST && !values.varslingsadresse && (
                              <Button kind="secondary" size="compact" marginLeft type="button" icon={faEnvelope} onClick={() => setAdresseType(AdresseType.EPOST)}>
                                Epost
                              </Button>
                            )}
                          </Block>
                          {values.varslingsadresse && <VarslingsadresserTagList varslingsadresser={[values.varslingsadresse]} remove={() => setVarslingsadresse(undefined)} />}
                        </Block>
                      </FormControl>
                    )}
                  </Field>
                </Block>
              </ModalBody>
              <ModalFooter>
                <Block display="flex" justifyContent="flex-end">
                  <Block>
                    {error && (
                      <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
                        {error}
                      </Notification>
                    )}
                  </Block>
                  <Button kind="secondary" size="compact" type="button" onClick={close}>
                    {' '}
                    Avbryt{' '}
                  </Button>
                  <Button type="button" marginLeft disabled={isSubmitting} onClick={submitForm}>
                    Lagre
                  </Button>
                </Block>
              </ModalFooter>
            </Form>
          )
        }}
      </Formik>
    </CustomizedModal>
  )
}

const required = 'Påkrevd'

const varslingsadresse: yup.SchemaOf<Varslingsadresse> = yup.object({
  adresse: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(AdresseType)).required(required),
})

const createTilbakemeldingSchema: yup.SchemaOf<CreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(required),
  kravVersjon: yup.number().required(required),
  foersteMelding: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(TilbakemeldingType)).required(required),
  varslingsadresse: varslingsadresse.required(required),
})

const newTilbakemelding = (krav: Krav): Partial<CreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: undefined,
})

export default NyTilbakemeldingModal
