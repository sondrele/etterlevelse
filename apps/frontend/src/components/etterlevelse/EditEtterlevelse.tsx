import { Etterlevelse, EtterlevelseStatus, Krav } from '../../constants'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { createEtterlevelse, mapToFormVal, updateEtterlevelse } from '../../api/EtterlevelseApi'
import { Block } from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import { etterlevelseStatus } from '../../pages/EtterlevelsePage'
import { BoolField, DateField, MultiInputField, OptionField, TextAreaField } from '../common/Inputs'
import { theme } from '../../util'
import { FormControl } from 'baseui/form-control'
import { useKrav, useSearchKrav } from '../../api/KravApi'
import { kravName, kravNumView } from '../../pages/KravPage'
import { behandlingName, useBehandling, useSearchBehandling } from '../../api/BehandlingApi'
import CustomizedSelect from '../common/CustomizedSelect'
import { H2, Label3, Paragraph2 } from 'baseui/typography'
import { ExternalLink } from '../common/RouteLink'
import { circlePencilIcon } from '../Images'
import { ettlevColors } from '../../util/theme'
import { Card } from 'baseui/card'

type EditEttlevProps = {
  etterlevelse: Etterlevelse
  krav: Krav
  close: (k?: Etterlevelse) => void
  formRef?: React.Ref<any>
  lockBehandlingAndKrav?: boolean
  documentEdit?: boolean
}

const padding = '70px'

export const EditEtterlevelse = ({ krav, etterlevelse, close, formRef, lockBehandlingAndKrav, documentEdit }: EditEttlevProps) => {

  const submit = async (etterlevelse: Etterlevelse) => {
    if (etterlevelse.id) {
      close(await updateEtterlevelse(etterlevelse))
    } else {
      close(await createEtterlevelse(etterlevelse))
    }
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapToFormVal(etterlevelse)}
      validationSchema={etterlevelseSchema()}
      innerRef={formRef}
    >{({ values, isSubmitting, submitForm }: FormikProps<Etterlevelse>) => (
      <Form>
        <Card>
          <Block display='flex'>
            <Block display='flex' marginRight={theme.sizing.scale800}>
              <img src={circlePencilIcon} alt='pencil-icon' />
            </Block>
            <Block>
              <Paragraph2 $style={{ marginTop: '0px', marginBottom: '0px' }}>
                {kravNumView(krav)}
              </Paragraph2>
              <H2 $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.navMorkGra }}>
                {krav.navn}
              </H2>
            </Block>
          </Block>
          <Block marginLeft={padding}>
            <Paragraph2>
              Gå til
            <ExternalLink href={'/krav/' + krav?.kravNummer + '/' + krav?.kravNummer}>
                detaljert kravbeskrivelse
            </ExternalLink>
             for mer informasjon om kravet, eksempler på dokumentert etterlevelse og tilbakemeldinger til kraveier
          </Paragraph2>
          </Block>

          <Block backgroundColor={ettlevColors.green50}>
            <Block paddingLeft={padding} paddingRight={padding} paddingTop={theme.sizing.scale1000} paddingBottom={theme.sizing.scale1600}>
              <Label3 $style={{ lineHeight: '32px' }}>
                Velg suksesskriterier for dokumentasjon
              </Label3>

              {!lockBehandlingAndKrav && <>
                <SearchBehandling id={values.behandlingId} />
                <SearchKrav kravNummer={values.kravNummer} kravVersjon={values.kravVersjon} />
              </>}

              {
                krav.suksesskriterier.map((s, i) => {

                  return (
                    <Block key={s.navn + '_' + i} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
                      <Paragraph2>
                        {s.navn}
                      </Paragraph2>

                      <TextAreaField label='' name='begrunnelse' markdown />

                    </Block>
                  )
                })
              }

              {/* 
              {!documentEdit &&
                <>
                  <Block height={theme.sizing.scale600} />

                  <BoolField label='Etterleves' name='etterleves' />
                </>
              }

              <TextAreaField label='Dokumentasjon' name='begrunnelse' markdown /> 
              */}

              {/*           
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>

          <Block height={theme.sizing.scale600}/>

          <DateField label='Frist for ferdigstillelse' name='fristForFerdigstillelse'/>

          <Block height={theme.sizing.scale600}/> 
         */}

              {!documentEdit && <OptionField label='Status' name='status' options={Object.values(EtterlevelseStatus).map(id => ({ id, label: etterlevelseStatus(id) }))} />}

            </Block>
          </Block>
        </Card>

        {!documentEdit &&
          <Block display='flex' justifyContent='flex-end' marginTop={theme.sizing.scale850} marginBottom={theme.sizing.scale3200}>
            <Button type='button' kind='secondary' marginRight onClick={close}>Avbryt</Button>
            <Button type='button' disabled={isSubmitting} onClick={submitForm}>Lagre</Button>
          </Block>}
      </Form>
    )
      }
    </Formik >
  )
}

const etterlevelseSchema = () => {
  return yup.object({})
}

export const SearchKrav = (props: { kravNummer: number, kravVersjon: number }) => {
  const [results, setSearch, loading] = useSearchKrav()
  const [krav, setKrav] = useKrav(props, true)

  return (
    <Field name={'kravNummer'}>
      {(p: FieldProps<string>) => {
        return <FormControl label={'Krav'} error={p.meta.error}>
          <CustomizedSelect
            placeholder={'Søk krav'}
            maxDropdownHeight='400px'
            filterOptions={o => o}
            searchable
            noResultsMsg='Ingen resultat'

            options={results.map(k => ({ id: k.id, label: kravName(k) }))}
            value={krav ? [{ id: krav.id, label: kravName(krav) }] : []}
            onChange={({ value }) => {
              const kravSelect = value.length ? results.find(k => k.id === value[0].id)! : undefined
              setKrav(kravSelect)
              p.form.setFieldValue('kravNummer', kravSelect?.kravNummer)
              p.form.setFieldValue('kravVersjon', kravSelect?.kravVersjon)
            }}
            onInputChange={event => setSearch(event.currentTarget.value)}
            isLoading={loading}
          />
        </FormControl>
      }
      }
    </Field>
  )
}

export const SearchBehandling = (props: { id: string }) => {
  const [results, setSearch, loading] = useSearchBehandling()
  const [behandling, setBehandling] = useBehandling(props.id)

  return (
    <Field name={'behandlingId'}>
      {(p: FieldProps<string>) => {
        return <FormControl label={'Behandling'} error={p.meta.error}>
          <CustomizedSelect
            placeholder={'Søk behandling'}
            maxDropdownHeight='400px'
            filterOptions={o => o}
            searchable
            noResultsMsg='Ingen resultat'

            options={results.map(k => ({ id: k.id, label: behandlingName(k) }))}
            value={behandling ? [{ id: behandling.id, label: behandlingName(behandling) }] : []}
            onChange={({ value }) => {
              const select = value.length ? results.find(k => k.id === value[0].id)! : undefined
              setBehandling(select)
              p.form.setFieldValue('behandlingId', select?.id)
            }}
            onInputChange={event => setSearch(event.currentTarget.value)}
            isLoading={loading}
          />
        </FormControl>
      }
      }
    </Field>
  )
}
