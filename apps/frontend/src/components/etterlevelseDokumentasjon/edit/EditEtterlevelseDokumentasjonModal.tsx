import { useEffect, useState } from 'react'
import { searchBehandlingOptions } from '../../../api/BehandlingApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  etterlevelseDokumentasjonSchema,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { Behandling, EtterlevelseDokumentasjonQL, Team, Virkemiddel } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { BoolField, FieldWrapper, InputField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { useSearchTeamOptions } from '../../../api/TeamApi'
import { RenderTagList } from '../../common/TagList'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, CheckboxGroup, Modal } from '@navikt/ds-react'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'

type EditEtterlevelseDokumentasjonModalProps = {
  etterlevelseDokumentasjon?: EtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon?: (e: EtterlevelseDokumentasjonQL) => void
  isEditButton?: boolean
}

export const EditEtterlevelseDokumentasjonModal = (props: EditEtterlevelseDokumentasjonModalProps) => {
  const relevansOptions = codelist.getParsedOptions(ListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(relevansOptions.map((r, i) => i))
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] = useState<boolean>(false)
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<Virkemiddel>()
  const navigate = useNavigate()

  useEffect(() => {
    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.irrelevansFor.length) {
      const irrelevans = props.etterlevelseDokumentasjon.irrelevansFor.map((ir: Code) => relevansOptions.findIndex((o) => o.value === ir.code))
      setSelectedFilter(
        relevansOptions
          .map((r, i) => {
            return i
          })
          .filter((n) => !irrelevans.includes(n)),
      )
    } else {
      setSelectedFilter(
        relevansOptions.map((r, i) => {
          return i
        }),
      )
    }

    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.virkemiddel && props.etterlevelseDokumentasjon.virkemiddel.navn) {
      setSelectedVirkemiddel(props.etterlevelseDokumentasjon.virkemiddel)
    }
  }, [props.etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      await createEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (props.setEtterlevelseDokumentasjon) {
          props.setEtterlevelseDokumentasjon(response)
        }
        navigate(0)
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        const mutatedBehandlinger =
          response.behandlinger &&
          response.behandlinger.map((b) => {
            return { ...b, navn: 'B' + b.nummer + ' ' + b.overordnetFormaal.shortName + ': ' + b.navn }
          })
        if (props.setEtterlevelseDokumentasjon) {
          props.setEtterlevelseDokumentasjon({ ...response, behandlinger: mutatedBehandlinger, virkemiddel: selectedVirkemiddel })
        }
      })
    }
  }

  return (
    <div>
      <Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)} size="small" variant="secondary" className="whitespace-nowrap">
        {props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Nytt etterlevelsesdokument'}
      </Button>

      <Modal
        header={{ heading: props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Opprett nytt etterlevelsesdokument' }}
        open={!!isEtterlevelseDokumentasjonerModalOpen}
        onClose={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}
      >
        <Modal.Body>
          <Formik
            initialValues={etterlevelseDokumentasjonMapToFormVal(props.etterlevelseDokumentasjon ? props.etterlevelseDokumentasjon : {})}
            onSubmit={submit}
            validationSchema={etterlevelseDokumentasjonSchema()}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, submitForm }) => {
              return (
                <Form>
                  <InputField disablePlaceHolder label="Skriv inn tittel på etterlevelsesdokumentet" name="title" />

                  {/* <BoolField label="Er produktet/systemet tilknyttet et virkemiddel?" name="knyttetTilVirkemiddel" /> */}

                  {/* {values.knyttetTilVirkemiddel ? (
                    <FieldWrapper>
                      <Field name="virkemiddelId">
                        {(fp: FieldProps) => {
                          return (
                            <FormControl label={<LabelWithTooltip label={'Legg til virkemiddel'} tooltip="Søk og legg til virkemiddel" />}>
                              <Block>
                                <CustomizedSelect
                                  labelKey={'navn'}
                                  noResultsMsg={intl.emptyTable}
                                  maxDropdownHeight="350px"
                                  searchable={true}
                                  type={TYPE.search}
                                  options={virkemiddelSearchResult}
                                  placeholder={'Søk virkemiddel'}
                                  onInputChange={(event) => setVirkemiddelSearchResult(event.currentTarget.value)}
                                  onChange={(params) => {
                                    let virkemiddel = params.value.length ? params.value[0] : undefined
                                    if (virkemiddel) {
                                      fp.form.values['virkemiddelId'] = virkemiddel.id
                                      setSelectedVirkemiddel(virkemiddel as Virkemiddel)
                                    }
                                  }}
                                  isLoading={loadingVirkemiddelSearchResult}
                                  overrides={selectCustomOverrides('virkemiddelId', fp)}
                                />
                                {selectedVirkemiddel && (
                                  <Tag
                                    variant={VARIANT.outlined}
                                    onActionClick={() => {
                                      setSelectedVirkemiddel(undefined)
                                      fp.form.setFieldValue('virkemiddelId', '')
                                    }}
                                    overrides={{
                                      Text: {
                                        style: {
                                          fontSize: theme.sizing.scale650,
                                          lineHeight: theme.sizing.scale750,
                                          fontWeight: 400,
                                        },
                                      },
                                      Root: {
                                        style: {
                                          ...borderWidth('1px'),
                                          ':hover': {
                                            backgroundColor: ettlevColors.green50,
                                            borderColor: '#0B483F',
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    {selectedVirkemiddel.navn}
                                  </Tag>
                                )}
                              </Block>
                            </FormControl>
                          )
                        }}
                      </Field>
                      <Error fieldName="virkemiddelId" fullWidth />
                    </FieldWrapper>
                  ) : ( */}

                  <FieldArray name="irrelevansFor">
                    {(p: FieldArrayRenderProps) => {
                      return (
                        <div className="h-full pt-5 w-[calc(100% - 16px)]">
                          <CheckboxGroup
                            legend="Hvilke egenskaper gjelder for etterlevelsen?"
                            description="Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon."
                            value={selectedFilter}
                            onChange={(selected) => {
                              setSelectedFilter(selected)

                              const irrelevansListe = relevansOptions.filter((v, i) => !selected.includes(i))
                              p.form.setFieldValue(
                                'irrelevansFor',
                                irrelevansListe.map((il) => codelist.getCode(ListName.RELEVANS, il.value)),
                              )
                              // selected.forEach((value) => {
                              //   const i = parseInt(value)
                              //   if (!selectedFilter.includes(i)) {
                              //     setSelectedFilter([...selectedFilter, i])
                              //     p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === relevansOptions[i].value))
                              //   } else {
                              //     setSelectedFilter(selectedFilter.filter((value) => value !== i))
                              //     p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].value as string))
                              //   }
                              // })
                            }}
                          >
                            {relevansOptions.map((r, i) => {
                              return (
                                <Checkbox key={'relevans_' + r.value} value={i} description={r.description}>
                                  {r.label}
                                </Checkbox>
                              )
                            })}
                          </CheckboxGroup>
                        </div>
                      )
                    }}
                  </FieldArray>

                  {/* DONT REMOVE */}
                  {/* )} */}
                  <div className="mt-2.5">
                    <BoolField
                      label="Behandler løsningen du dokumenterer etterlevelse for personopplysninger?"
                      name="behandlerPersonopplysninger"
                      tooltip="Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å opprette etterlevelse og legge til behandling etterpå."
                    />
                  </div>

                  {values.behandlerPersonopplysninger && (
                    <FieldWrapper>
                      <FieldArray name="behandlinger">
                        {(p: FieldArrayRenderProps) => {
                          return (
                            <div className="mb-4">
                              <LabelWithTooltip
                                label={'Legg til behandlinger fra Behandlingskatalogen'}
                                tooltip="Siden løsningen behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Du kan knytte én eller flere behandlinger til etterlevelsesdokumentet."
                              />
                              <div className="w-full">
                                <AsyncSelect
                                  aria-label="Søk etter behandlinger"
                                  placeholder="Søk etter behandlinger"
                                  components={{ DropdownIndicator }}
                                  noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
                                  controlShouldRenderValue={false}
                                  loadingMessage={() => 'Søker...'}
                                  isClearable={false}
                                  loadOptions={searchBehandlingOptions}
                                  onChange={(value) => {
                                    value && p.push(value)
                                  }}
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      cursor: 'text',
                                      height: '48px',
                                    }),
                                  }}
                                />
                              </div>
                              <RenderTagList list={p.form.values.behandlinger.map((b: Behandling) => b.navn)} onRemove={p.remove} />
                            </div>
                          )
                        }}
                      </FieldArray>
                    </FieldWrapper>
                  )}

                  <div className="mt-2.5">
                    <BoolField
                      label="Er etterlevelsesdokumentet knyttet til et team i Teamkatalogen?"
                      name="knytteTilTeam"
                      tooltip="Når du legger til et team vil medlemmene i det teamet kunne se dette dokumentet under «Mine dokumentasjoner». Dette er ikke nødvendig for å opprette etterlevelsesdokumentet, men anbefales."
                    />
                  </div>

                  {values.knytteTilTeam && (
                    <FieldWrapper>
                      <FieldArray name="teamsData">
                        {(p: FieldArrayRenderProps) => {
                          return (
                            <div>
                              <LabelWithTooltip label="Legg til team fra Teamkatalogen" tooltip="" />
                              <div className="w-full">
                                <AsyncSelect
                                  aria-label="Søk etter team"
                                  placeholder="Søk etter team"
                                  components={{ DropdownIndicator }}
                                  noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
                                  controlShouldRenderValue={false}
                                  loadingMessage={() => 'Søker...'}
                                  isClearable={false}
                                  loadOptions={useSearchTeamOptions}
                                  onChange={(value) => {
                                    value && p.push(value)
                                  }}
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      cursor: 'text',
                                      height: '48px',
                                    }),
                                  }}
                                />
                              </div>
                              <RenderTagList list={p.form.values.teamsData.map((t: Team) => t.name)} onRemove={p.remove} />
                            </div>
                          )
                        }}
                      </FieldArray>
                    </FieldWrapper>
                  )}

                  <div className="flex justify-end">
                    <Button type="button" variant="secondary" onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
                      Avbryt
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                      className="ml-2.5"
                    >
                      {props.isEditButton ? 'Lagre' : 'Opprett'}
                    </Button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  )
}
export default EditEtterlevelseDokumentasjonModal
