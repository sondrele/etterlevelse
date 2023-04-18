import { Krav, KravQL, KravStatus, KravVersjon } from '../../constants'
import { Form, Formik } from 'formik'
import { createKrav, getKravByKravNumberAndVersion, kravMapToFormVal, updateKrav } from '../../api/KravApi'
import { Block } from 'baseui/block'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { codelist, ListName } from '../../services/Codelist'
import { InputField, MultiInputField, TextAreaField } from '../common/Inputs'
import axios from 'axios'
import { env } from '../../util/env'
import { KravVarslingsadresserEdit } from './Edit/KravVarslingsadresserEdit'
import { RegelverkEdit } from './Edit/RegelverkEdit'
import { KravSuksesskriterierEdit } from './Edit/KravSuksesskriterieEdit'
import { EditBegreper } from './Edit/KravBegreperEdit'
import { HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import { ettlevColors, maxPageWidth, responsivePaddingLarge, responsiveWidthLarge, theme } from '../../util/theme'
import { getEtterlevelserByKravNumberKravVersion } from '../../api/EtterlevelseApi'
import ErrorModal from '../ErrorModal'
import { Error } from '../common/ModalSchema'
import { ErrorMessageModal } from './ErrorMessageModal'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EditKravMultiOptionField } from './Edit/EditKravMultiOptionField'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../common/Style'
import { Checkbox } from 'baseui/checkbox'
import { warningAlert } from '../Images'
import { user } from '../../services/User'
import { Modal as BaseModal, ModalBody, ModalHeader } from 'baseui/modal'
import { EditKravRelasjoner } from './Edit/EditKravRelasjoner'
import AlertUnsavedPopup from '../common/AlertUnsavedPopup'
import _ from 'lodash'
import { EditVirkemidler } from './Edit/KravEditVirkemidler'

type EditKravProps = {
  krav: KravQL
  close: (k?: Krav) => void
  formRef: React.Ref<any>
  isOpen: boolean | undefined
  setIsOpen: Function
  newVersion?: boolean
  newKrav?: boolean
  alleKravVersjoner: KravVersjon[]
}

const maxInputWidth = '400px'
const inputMarginBottom = theme.sizing.scale900

export const kravModal = () => document.querySelector('#krav-modal')

export const EditKrav = ({ krav, close, formRef, isOpen, setIsOpen, newVersion, newKrav, alleKravVersjoner }: EditKravProps) => {
  const [stickyHeader, setStickyHeader] = React.useState(false)
  const [stickyFooterStyle, setStickyFooterStyle] = React.useState(true)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorModalMessage, setErrorModalMessage] = React.useState('')
  const [varlselMeldingActive, setVarselMeldingActive] = React.useState<boolean>(krav.varselMelding ? true : false)
  const [UtgaattKravMessage, setUtgaattKravMessage] = React.useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = React.useState<boolean>(false)

  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState<boolean>(false)
  const [isFormDirty, setIsFormDirty] = React.useState<boolean>(false)

  const kravSchema = () =>
    yup.object({
      navn: yup.string().required('Du må oppgi et navn til kravet'),
      suksesskriterier: yup.array().test({
        name: 'suksesskriterierCheck',
        message: errorMessage,
        test: function (suksesskriterier) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return suksesskriterier && suksesskriterier.length > 0 && suksesskriterier.every((s) => s.navn) ? true : false
          }
          return true
        },
      }),
      hensikt: yup.string().test({
        name: 'hensiktCheck',
        message: errorMessage,
        test: function (hensikt) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return hensikt ? true : false
          }
          return true
        },
      }),
      regelverk: yup.array().test({
        name: 'regelverkCheck',
        message: errorMessage,
        test: function (regelverk) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return regelverk && regelverk.length > 0 ? true : false
          }
          return true
        },
      }),
      varslingsadresser: yup.array().test({
        name: 'varslingsadresserCheck',
        message: errorMessage,
        test: function (varslingsadresser) {
          const { parent } = this
          if (parent.status === KravStatus.AKTIV) {
            return varslingsadresser && varslingsadresser.length > 0 ? true : false
          }
          return true
        },
      }),
      status: yup.string().test({
        name: 'statusCheck',
        message: 'Det er ikke lov å sette versjonen til utgått. Det eksistere en aktiv versjon som er lavere enn denne versjonen',
        test: function (status) {
          const { parent } = this
          const nyesteAktivKravVersjon = alleKravVersjoner.filter((k) => k.kravStatus === KravStatus.AKTIV)
          if (status === KravStatus.UTGAATT && nyesteAktivKravVersjon.length >= 1 && parent.kravVersjon > nyesteAktivKravVersjon[0].kravVersjon) {
            return false
          }
          return true
        },
      }),
    })

  const submit = async (krav: KravQL) => {
    setIsFormDirty(false)
    const regelverk = codelist.getCode(ListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(ListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
      varselMelding: varlselMeldingActive ? krav.varselMelding : undefined,
    }

    const etterlevelser = await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    if (etterlevelser.totalElements > 0 && krav.status === KravStatus.UTKAST && !newVersion) {
      setErrorModalMessage('Kravet kan ikke settes til «Utkast» når det er tilknyttet dokumentasjon av etterlevelse')
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(!!mutatedKrav.varselMelding)
    } else {
      close(await createKrav(mutatedKrav))
      setVarselMeldingActive(!!mutatedKrav.varselMelding)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStickyHeader(false)
      return
    }
    const listener = (event: any) => {
      const buttonPosition = document.querySelector('.content_container')?.clientHeight || 0
      if (event.target.scrollTop === 0) {
        setStickyHeader(false)
      } else if (event.target.scrollTop > buttonPosition) {
        setStickyFooterStyle(false)
      } else {
        setStickyFooterStyle(true)
        setStickyHeader(true)
      }
    }
    setTimeout(() => kravModal()?.addEventListener('scroll', listener), 200)
    return () => kravModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  return (
    <Block maxWidth={maxPageWidth}>
      <CustomizedModal
        onClose={() => {
          if (isFormDirty) {
            setIsAlertModalOpen(true)
          } else {
            setIsOpen(false)
          }
        }}
        isOpen={isOpen}
        overrides={{
          Root: {
            props: {
              id: 'krav-modal',
            },
          },
        }}
      >
        <Formik
          onSubmit={submit}
          initialValues={!newKrav && newVersion ? kravMapToFormVal({ ...krav, versjonEndringer: '' }) : kravMapToFormVal(krav)}
          validationSchema={kravSchema()}
          innerRef={formRef}
        >
          {({ values, errors, isSubmitting, submitForm, setErrors, initialValues }) => (
            <Form
              onChange={() => {
                if (
                  !_.isEqual(initialValues, {
                    ...values,
                    suksesskriterier: values.suksesskriterier.map((s) => {
                      return { ...s, __typename: 'Suksesskriterie' }
                    }),
                  })
                ) {
                  setIsFormDirty(true)
                }
              }}
            >
              <AlertUnsavedPopup
                isActive={isFormDirty}
                isModalOpen={isAlertModalOpen}
                setIsModalOpen={setIsAlertModalOpen}
                onClose={() => close(values)}
                onSubmit={() => submit(values)}
              />
              <Block
                backgroundColor={ettlevColors.green800}
                paddingTop="23px"
                paddingBottom={!stickyHeader ? '48px' : '20px'}
                paddingLeft={responsivePaddingLarge}
                paddingRight={responsivePaddingLarge}
                position="sticky"
                top={0}
                display={!stickyHeader ? 'block' : 'flex'}
                $style={{ zIndex: 3 }}
              >
                {stickyHeader && (
                  <Block display="flex" width="100%" justifyContent="flex-start">
                    <LabelLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</LabelLarge>
                  </Block>
                )}
                {!stickyHeader && (
                  <Block width="100%">
                    <HeadingXXLarge $style={{ color: '#F8F8F8' }}>{newVersion ? 'Ny versjon' : newKrav ? 'Ny krav' : 'Rediger kravside'}: </HeadingXXLarge>
                    <HeadingXLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`} </HeadingXLarge>
                    {newVersion && (
                      <Notification
                        closeable
                        overrides={{
                          Body: {
                            style: {
                              backgroundColor: ettlevColors.warning50,
                              ...borderWidth('1px'),
                              ...borderColor('#D47B00'),
                              ...borderRadius('4px'),
                              width: '100%',
                            },
                          },
                        }}
                      >
                        <Block display="flex">
                          <Block marginRight="12px">
                            <img src={warningAlert} alt="warning icon" />
                          </Block>
                          <Block>
                            <LabelSmall $style={{ fontSize: '16px', lineHeight: '20px' }}>Sikker på at du vil opprette en ny versjon?</LabelSmall>
                            <ParagraphXSmall $style={{ fontSize: '16px', lineHeight: '20px' }}>
                              Ny versjon av kravet skal opprettes når det er <strong>vesentlige endringer</strong> i kravet som gjør at <strong>teamene må revurdere</strong> sin
                              besvarelse av kravet. Ved alle mindre justeringer, endre i det aktive kravet, og da slipper teamene å revurdere sin besvarelse.
                            </ParagraphXSmall>
                          </Block>
                        </Block>
                      </Notification>
                    )}
                  </Block>
                )}
              </Block>
              <Block>
                <Block
                  className="title_container"
                  backgroundColor={ettlevColors.grey50}
                  paddingTop="48px"
                  paddingLeft={responsivePaddingLarge}
                  paddingRight={responsivePaddingLarge}
                  paddingBottom="64px"
                >
                  <InputField
                    marginBottom={inputMarginBottom}
                    label="Krav-tittel"
                    name="navn"
                    tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'}
                  />
                  <Block marginBottom="55px">
                    <Checkbox
                      overrides={{
                        Checkmark: {
                          style: ({ $isFocused }) => ({
                            outlineColor: $isFocused ? ettlevColors.focusOutline : undefined,
                            outlineWidth: $isFocused ? '3px' : undefined,
                            outlineStyle: $isFocused ? 'solid' : undefined,
                          }),
                        },
                      }}
                      checked={varlselMeldingActive}
                      onChange={() => setVarselMeldingActive(!varlselMeldingActive)}
                    >
                      Gi kravet en varselmelding (eks. for kommende krav)
                    </Checkbox>
                    {varlselMeldingActive && (
                      <Block width="100%" marginLeft="30px" marginTop="24px">
                        <TextAreaField label="Forklaring til etterlevere" name="varselMelding" maxCharacter={100} rows={1} setIsFormDirty={setIsFormDirty} />
                      </Block>
                    )}
                  </Block>
                  <TextAreaField
                    label="Hensikt"
                    name="hensikt"
                    height="250px"
                    marginBottom="0px"
                    markdown
                    shortenLinks
                    onImageUpload={onImageUpload(krav.id)}
                    tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'}
                    setIsFormDirty={setIsFormDirty}
                  />
                  <Error fieldName={'hensikt'} fullWidth />
                </Block>

                <Block className="content_container" display="flex" width="100%" justifyContent="center">
                  <Block width={responsiveWidthLarge}>
                    <HeadingXLarge marginBottom={inputMarginBottom}>Suksesskriterier</HeadingXLarge>
                    <KravSuksesskriterierEdit setIsFormDirty={setIsFormDirty} newVersion={!!newVersion} />

                    <Block marginBottom={inputMarginBottom}>
                      <HeadingXLarge>Dokumentasjon</HeadingXLarge>
                    </Block>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      linkLabel="Navn på kilde"
                      name="dokumentasjon"
                      link
                      label="Lenke eller websaknr"
                      tooltip="Lenke til dokumentasjon"
                      linkTooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'}
                      setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde.' })}
                    />
                    {errors.dokumentasjon && <ErrorMessageModal msg={errors.dokumentasjon} fullWidth={true} />}
                    <RegelverkEdit />
                    {errors.regelverk && <ErrorMessageModal msg={errors.regelverk} fullWidth={true} />}

                    <TextAreaField
                      label="Relevante implementasjoner"
                      name="implementasjoner"
                      height="250px"
                      markdown
                      tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'}
                      setIsFormDirty={setIsFormDirty}
                    />

                    {!newKrav && (
                      <TextAreaField
                        label="Endringer siden siste versjon"
                        name="versjonEndringer"
                        height="250px"
                        marginBottom="0px"
                        markdown
                        shortenLinks
                        tooltip={'Beskrivelse av hva som er nytt siden siste versjon.'}
                        setIsFormDirty={setIsFormDirty}
                      />
                    )}

                    {/* <MultiInputField label='Rettskilder' name='rettskilder' link /> */}

                    <Block marginTop="80px" marginBottom={inputMarginBottom}>
                      <HeadingXLarge>Gruppering og etiketter</HeadingXLarge>
                    </Block>

                    <Block width="100%" maxWidth={maxInputWidth}>
                      <EditVirkemidler />
                    </Block>

                    <Block width="100%" maxWidth={maxInputWidth}>
                      <EditKravMultiOptionField
                        marginBottom={inputMarginBottom}
                        name="relevansFor"
                        label="Relevant for"
                        listName={ListName.RELEVANS}
                        tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}
                      />
                      {errors.relevansFor && <ErrorMessageModal msg={errors.relevansFor} fullWidth={true} />}
                    </Block>

                    <MultiInputField
                      marginBottom={inputMarginBottom}
                      maxInputWidth={maxInputWidth}
                      label="Etiketter"
                      name="tagger"
                      tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'}
                    />

                    <Block width="100%" maxWidth={maxInputWidth} marginBottom="80px">
                      <EditBegreper />
                    </Block>

                    <Block width="100%" maxWidth={maxInputWidth} marginBottom="80px">
                      <EditKravRelasjoner />
                    </Block>

                    <Block marginBottom={inputMarginBottom}>
                      <HeadingXLarge>Egenskaper</HeadingXLarge>
                    </Block>

                    <KravVarslingsadresserEdit />
                    {errors.varslingsadresser && <ErrorMessageModal msg={errors.varslingsadresser} fullWidth={true} />}
                    <Block width={'100%'}>
                      {Object.keys(errors).length > 0 && !errors.dokumentasjon && (
                        <Block display="flex" width="100%" marginTop="3rem" marginBottom=".6em">
                          <Block width="100%">
                            <Notification
                              overrides={{
                                Body: {
                                  style: {
                                    width: 'auto',
                                    ...borderStyle('solid'),
                                    ...borderWidth('1px'),
                                    ...borderColor(ettlevColors.red600),
                                    ...borderRadius('4px'),
                                  },
                                },
                              }}
                              kind={NKIND.negative}
                            >
                              <Block display="flex" justifyContent="center">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  style={{
                                    marginRight: '5px',
                                  }}
                                />
                                <ParagraphMedium marginBottom="0px" marginTop="0px" $style={{ lineHeight: '18px' }}>
                                  Du må fylle ut alle obligatoriske felter
                                </ParagraphMedium>
                              </Block>
                            </Notification>
                          </Block>
                        </Block>
                      )}
                    </Block>
                  </Block>
                </Block>
                <Block
                  className="button_container"
                  backgroundColor={ettlevColors.grey25}
                  position="sticky"
                  bottom={0}
                  display="flex"
                  flexDirection="column"
                  paddingLeft={responsivePaddingLarge}
                  paddingRight={responsivePaddingLarge}
                  paddingBottom="16px"
                  paddingTop="16px"
                  $style={{
                    boxShadow: stickyFooterStyle ? '0px -4px 4px rgba(0, 0, 0, 0.12)' : '',
                    zIndex: 3,
                  }}
                >
                  {errors.status && (
                    <Block marginBottom="12px">
                      <Error fieldName="status" fullWidth />
                    </Block>
                  )}

                  <Block display="flex" width="100%">
                    <Block display="flex" width="100%">
                      {krav.status === KravStatus.AKTIV && !newVersion && (
                        <Block marginRight="9px">
                          <Button
                            size="compact"
                            kind="secondary"
                            onClick={() => {
                              setUtgaattKravMessage(true)
                            }}
                            disabled={isSubmitting}
                            type={'button'}
                          >
                            Sett kravet til utgått
                          </Button>
                        </Block>
                      )}

                      {user.isAdmin() && krav.status === KravStatus.UTGAATT && !newVersion && (
                        <Block marginRight="9px">
                          <Button
                            size="compact"
                            kind="secondary"
                            onClick={() => {
                              setAktivKravMessage(true)
                            }}
                            disabled={isSubmitting}
                            type={'button'}
                          >
                            Sett versjonen til aktiv
                          </Button>
                        </Block>
                      )}

                      {user.isAdmin() && !newVersion && (
                        <Block marginRight="9px">
                          <Button
                            size="compact"
                            kind="secondary"
                            onClick={() => {
                              values.status = KravStatus.UTKAST
                              submitForm()
                            }}
                            disabled={isSubmitting}
                            type={'button'}
                          >
                            Sett kravet til utkast
                          </Button>
                        </Block>
                      )}

                      <BaseModal
                        overrides={{ Dialog: { style: { ...borderRadius('4px') } } }}
                        closeable={false}
                        isOpen={UtgaattKravMessage}
                        onClose={() => setUtgaattKravMessage(false)}
                      >
                        <ModalHeader>Sikker på at du vil sette kravet til utgått?</ModalHeader>
                        <ModalBody>Denne handligen kan ikke reverseres</ModalBody>
                        <Block marginRight="24px" marginLeft="24px" marginBottom="34px" marginTop="27px" display="flex" justifyContent="center">
                          <Block display="flex" width="100%">
                            <Button onClick={() => setUtgaattKravMessage(false)} kind={'secondary'} marginRight>
                              Nei, avbryt handlingen
                            </Button>
                          </Block>
                          <Block display="flex" width="100%" justifyContent="flex-end">
                            <Button
                              onClick={() => {
                                values.status = KravStatus.UTGAATT
                                submitForm()
                                setUtgaattKravMessage(false)
                              }}
                            >
                              Ja, sett til utgått
                            </Button>
                          </Block>
                        </Block>
                      </BaseModal>

                      <BaseModal
                        overrides={{ Dialog: { style: { ...borderRadius('4px') } } }}
                        closeable={false}
                        isOpen={aktivKravMessage}
                        onClose={() => setAktivKravMessage(false)}
                      >
                        <ModalHeader>Sikker på at du vil sette versjonen til aktiv?</ModalHeader>
                        <ModalBody>Kravet har en nyere versjon som settes til utkast</ModalBody>
                        <Block marginRight="24px" marginLeft="24px" marginBottom="34px" marginTop="27px" display="flex" justifyContent="center">
                          <Block display="flex" width="100%">
                            <Button onClick={() => setAktivKravMessage(false)} kind={'secondary'} marginRight>
                              Nei, avbryt handlingen
                            </Button>
                          </Block>
                          <Block display="flex" width="100%" justifyContent="flex-end">
                            <Button
                              onClick={async () => {
                                const newVersionOfKrav = await getKravByKravNumberAndVersion(krav.kravNummer, krav.kravVersjon + 1)
                                if (newVersionOfKrav) {
                                  updateKrav(
                                    kravMapToFormVal({
                                      ...newVersionOfKrav,
                                      status: KravStatus.UTKAST,
                                    }) as KravQL,
                                  ).then(() => {
                                    values.status = KravStatus.AKTIV
                                    submitForm()
                                    setAktivKravMessage(false)
                                  })
                                } else {
                                  values.status = KravStatus.AKTIV
                                  submitForm()
                                  setAktivKravMessage(false)
                                }
                              }}
                            >
                              Ja, sett til aktiv
                            </Button>
                          </Block>
                        </Block>
                      </BaseModal>
                    </Block>
                    <Block display="flex" justifyContent="flex-end" width="100%">
                      <Button size="compact" kind={'secondary'} type={'button'} onClick={close} marginLeft>
                        Avbryt
                      </Button>

                      <Button
                        size="compact"
                        kind="primary"
                        onClick={() => {
                          if (newVersion) {
                            values.status = KravStatus.UTKAST
                          } else {
                            values.status = krav.status
                          }
                          submitForm()
                        }}
                        disabled={isSubmitting}
                        type={'button'}
                        marginLeft
                      >
                        {newVersion || krav.status !== KravStatus.AKTIV ? 'Lagre' : 'Publiser endringer'}
                      </Button>

                      {(newVersion || krav.status === KravStatus.UTKAST) && (
                        <Button
                          size="compact"
                          onClick={() => {
                            values.status = KravStatus.AKTIV
                            submitForm()
                          }}
                          disabled={isSubmitting}
                          type={'button'}
                          marginLeft
                        >
                          Publiser og gjør aktiv
                        </Button>
                      )}
                    </Block>
                  </Block>
                </Block>

                <Block backgroundColor={ettlevColors.grey50} paddingTop="48px" paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingBottom="64px">
                  <TextAreaField label="Notater (Kun synlig for kraveier)" name="notat" height="250px" markdown tooltip={'Kraveiers notater'} />
                </Block>
              </Block>
              <ErrorModal isOpen={showErrorModal} errorMessage={errorModalMessage} submit={setShowErrorModal} />
            </Form>
          )}
        </Formik>
      </CustomizedModal>
    </Block>
  )
}

const onImageUpload = (kravId: string) => async (file: File) => {
  const config = { headers: { 'content-type': 'multipart/form-data' } }
  const formData = new FormData()
  formData.append('file', file)
  const id = (await axios.post<string[]>(`${env.backendBaseUrl}/krav/${kravId}/files`, formData, config)).data[0]

  return `/api/krav/${kravId}/files/${id}`
}

const errorMessage = 'Feltet er påkrevd'
