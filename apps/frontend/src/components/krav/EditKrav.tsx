import { Krav, KravQL, KravStatus } from '../../constants'
import { Form, Formik } from 'formik'
import { createKrav, mapToFormVal, updateKrav } from '../../api/KravApi'
import { Block } from 'baseui/block'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { ListName } from '../../services/Codelist'
import { kravStatus } from '../../pages/KravPage'
import { DateField, InputField, MultiInputField, MultiOptionField, OptionField, TextAreaField } from '../common/Inputs'
import axios from 'axios'
import { env } from '../../util/env'
import { KravVarslingsadresserEdit } from './Edit/KravVarslingsadresserEdit'
import { KravRegelverkEdit } from './Edit/KravRegelverkEdit'
import { KravSuksesskriterierEdit } from './Edit/KravSuksesskriterieEdit'
import { EditBegreper } from './Edit/KravBegreperEdit'
import { H1, H2, LabelLarge } from 'baseui/typography'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import { maxPageWidth } from '../../util/theme'

type EditKravProps = {
  krav: KravQL,
  close: (k?: Krav) => void,
  formRef: React.Ref<any>,
  isOpen: boolean | undefined,
  setIsOpen: Function
}

const padding = 212
const paddingPx = padding + 'px'
const width = `calc(100% - ${padding * 2}px)`
const maxInputWidth = '400px'

export const kravModal = () => document.querySelector('#krav-modal')

export const EditKrav = ({ krav, close, formRef, isOpen, setIsOpen }: EditKravProps) => {
  const [stickyHeader, setStickyHeader] = React.useState(false)

  const submit = async (krav: KravQL) => {
    if (krav.id) {
      close(await updateKrav(krav))
    } else {
      close(await createKrav(krav))
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStickyHeader(false)
      return
    }
    const listener = () => setStickyHeader(true)
    setTimeout(() => kravModal()?.addEventListener('scroll', listener), 200)
    return () => kravModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  return (
    <Block maxWidth={maxPageWidth}>
      <CustomizedModal
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        overrides={{
          Root: {
            props: {
              id: 'krav-modal'
            }
          }
        }}
      >
        <Formik
          onSubmit={submit}
          initialValues={mapToFormVal(krav)}
          validationSchema={kravSchema()}
          innerRef={formRef}
        >{({ isSubmitting, submitForm }) => (
          <Form>
            <Block
              backgroundColor='#112724'
              paddingTop='20px'
              paddingBottom='20px'
              paddingLeft={paddingPx}
              paddingRight='32px'
              position='sticky'
              top={0}
              display={!stickyHeader ? 'block' : 'flex'}
              $style={{ zIndex: 1 }}
            >
              {stickyHeader && (
                <Block display='flex' width='100%' justifyContent='flex-start'>
                  <LabelLarge $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}</LabelLarge>
                </Block>
              )}
              <Block display='flex' justifyContent='flex-end'>
                <Button
                  size='compact'
                  $style={{ color: '#112724', backgroundColor: '#F8F8F8', ':hover': { backgroundColor: '#F8F8F8' } }}
                  onClick={submitForm}
                  disabled={isSubmitting}
                  type={'button'}
                  marginLeft>
                  Lagre
                </Button>
                <Button
                  size='compact'
                  $style={{ color: '#F8F8F8' }}
                  kind={'tertiary'}
                  type={'button'}
                  onClick={close}
                  marginLeft>
                  Avbryt
                </Button>
              </Block>
              {!stickyHeader && (
                <Block>
                  <H1 $style={{ color: '#F8F8F8' }}>Rediger kravside: </H1>
                  <H2 $style={{ color: '#F8F8F8' }}>{`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`} </H2>
                </Block>
              )}
            </Block>
            <Block>
              <Block backgroundColor='#F1F1F1' paddingLeft={paddingPx} paddingRight={paddingPx}>
                <InputField label='Krav-tittel' name='navn' tooltip={'Gi kravet en kort tittel. Kravet formuleres som en aktivitet eller målsetting.'} />
                <TextAreaField marginBottom='0px' label='Hensikt' name='hensikt' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                  tooltip={'Bruk noen setninger på å forklare hensikten med kravet. Formålet er at leseren skal forstå hvorfor vi har dette kravet.'} />
              </Block>

              <Block display='flex' width='100%' justifyContent='center'>
                <Block width={width}>
                  <H2>Om Kravet</H2>
                  <KravSuksesskriterierEdit />
                  <TextAreaField label='Beskrivelse' name='beskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                    tooltip={'Beskriv selve innholdet i kravet.'} />
                  {/*
                      <TextAreaField label='Utfyllende beskrivelse' name='utdypendeBeskrivelse' markdown shortenLinks onImageUpload={onImageUpload(krav.id)}
                        tooltip={'Legg til en utfyllende beskrivelse av kravet. Benyttes kun der det er behov for det.'} /> */}

                  <Block marginBottom='49px'>
                    <LabelLarge><b>Dokumentasjon</b></LabelLarge>
                  </Block>

                  <MultiInputField maxInputWidth={maxInputWidth} linkLabel='Navn på dokumentasjon' name='dokumentasjon' link label='Lenke eller websaknr' tooltip='Lenke til dokumentasjon'
                    linkTooltip={'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller Websak.'} />
                  <KravRegelverkEdit />
                  <MultiInputField label='Relevante implementasjoner' name='implementasjoner' tooltip={'Vis til gode eksisterende implementasjoner som ivaretar kravet.'} />
                  {/* <MultiInputField label='Rettskilder' name='rettskilder' link /> */}

                  <Block marginBottom='49px'>
                    <LabelLarge><b>Gruppering og etiketter</b></LabelLarge>
                  </Block>

                  <Block width='100%' maxWidth={maxInputWidth}>
                    <MultiOptionField label='Relevant for' name='relevansFor' listName={ListName.RELEVANS}
                      tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'} />
                  </Block>

                  <MultiInputField maxInputWidth={maxInputWidth} label='Etiketter' name='tagger' tooltip={'Tag kravet med et eller flere nøkkelord. Hensikten er å skape relasjon(er) til andre krav.'} />

                  <Block width='100%' maxWidth={maxInputWidth}>
                    <EditBegreper />
                  </Block>

                  <Block marginBottom='49px'>
                    <LabelLarge><b>Egenskaper</b></LabelLarge>
                  </Block>

                  <Block width='100%' maxWidth={maxInputWidth}>
                    <OptionField label='Status' name='status' options={Object.values(KravStatus).map(id => ({ id, label: kravStatus(id) }))}
                      tooltip={'Velg status for kravet. Utkast er kun synlig for kraveier selv. Aktiv/utgått er synlig for alle.'} />
                  </Block>

                  <KravVarslingsadresserEdit />
                  {/* 
                      <DateField label='Gyldig fra' name='periode.start' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'}/>
                      <DateField label='Gyldig til' name='periode.slutt' tooltip={'Legg til gyldighetsperiode for kravet der det er aktuelt. Hvis ikke skal feltene være blanke.'}/>

                      <OptionField label='Avdeling' name='avdeling' listName={ListName.AVDELING} tooltip={'Angi hvilken avdeling som har det overordnede ansvaret for kravet.'} />
                      <OptionField label='Ansvarlig' name='Ansvarlig' listName={ListName.UNDERAVDELING}
                                   tooltip={'Angi hvilken seksjon/underavdeling som har ansvaret for kravet.'}/>

                      <TextAreaField label='Endringer fra forrige versjon' name='versjonEndringer'
                                     tooltip={'Gi informasjon om hva som er endret siden forrige versjon av kravet.'}/> 
                                     */}
                </Block>
              </Block>
            </Block>
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

const kravSchema = () => {
  return yup.object({})
}
