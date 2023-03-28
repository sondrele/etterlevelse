import { Block } from 'baseui/block'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { useEffect, useState } from 'react'
import { useSearchBehandling } from '../../../api/BehandlingApi'
import { createEtterlevelseDokumentasjon, etterlevelseDokumentasjonMapToFormVal, updateEtterlevelseDokumentasjon } from '../../../api/EtterlevelseDokumentasjonApi'
import { Behandling, EtterlevelseDokumentasjonQL, Team } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import Button, { buttonContentStyle } from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { FormControl } from 'baseui/form-control'
import { FieldWrapper, InputField } from '../../common/Inputs'
import { ButtonGroup } from 'baseui/button-group'
import { ACCESSIBILITY_TYPE } from 'baseui/popover'
import { PLACEMENT } from 'baseui/toast'
import { StatefulTooltip } from 'baseui/tooltip'
import { ParagraphMedium } from 'baseui/typography'
import { theme } from '../../../util'
import { ettlevColors } from '../../../util/theme'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../../common/Style'
import { checkboxChecked, checkboxUnchecked, checkboxUncheckedHover, editIcon, outlineInfoIcon, plusIcon, searchIcon } from '../../Images'
import { Tag, VARIANT } from 'baseui/tag'
import { Error } from '../../common/ModalSchema'
import CustomizedSelect from '../../common/CustomizedSelect'
import { intl } from '../../../util/intl/intl'
import { SelectOverrides, TYPE } from 'baseui/select'
import { getTeams, useSearchTeam } from '../../../api/TeamApi'
import { RenderTagList } from '../../common/TagList'

type EditEtterlevelseDokumentasjonModalProps = {
  etterlevelseDokumentasjon?: EtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon?: (e: EtterlevelseDokumentasjonQL) => void
  isEditButton?: boolean
}

export const selectCustomOverrides: SelectOverrides = {
  SearchIcon: {
    component: () => <img src={searchIcon} alt="search icon" />,
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  },
  SearchIconContainer: {
    style: {
      width: 'calc(100% - 20px)',
      display: 'flex',
      justifyContent: 'flex-end',
    },
  },
  IconsContainer: {
    style: {
      marginRight: '20px',
    },
  },
  ValueContainer: {
    style: {
      paddingLeft: '10px',
    },
  },
  ControlContainer: {
    style: {
      ...borderWidth('2px'),
    },
  },
}

export const EditEtterlevelseDokumentasjonModal = (props: EditEtterlevelseDokumentasjonModalProps) => {
  const relevansOptions = codelist.getParsedOptions(ListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(relevansOptions.map((r, i) => i))
  const [hover, setHover] = useState<number>()
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] = useState<boolean>(false)
  const [behandlingSearchResult, setbehandlingSearchResult, loadingBehandlingSearchResult] = useSearchBehandling()
  const [selectedBehandling, setSelectedBehandling] = useState<Behandling>()

  const [teamSearchResult, setTeamSearchResult, loadingTeamSearchResult] = useSearchTeam()

  useEffect(() => {
    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.irrelevansFor.length) {
      const irrelevans = props.etterlevelseDokumentasjon.irrelevansFor.map((ir: Code) => relevansOptions.findIndex((o) => o.id === ir.code))
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

    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.behandling && props.etterlevelseDokumentasjon.behandling.navn) {
      setSelectedBehandling(props.etterlevelseDokumentasjon.behandling)
    }
  }, [props.etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      await createEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (props.setEtterlevelseDokumentasjon) {
          props.setEtterlevelseDokumentasjon(response)
        }
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (props.setEtterlevelseDokumentasjon) {
          if (response.teams.length > 0) {
            getTeams(response.teams).then((teamsData) => {
              if (props.setEtterlevelseDokumentasjon) {
                props.setEtterlevelseDokumentasjon({
                  ...response,
                  teamsData: teamsData,
                  behandling: selectedBehandling,
                })
              }
            })
          } else {
            props.setEtterlevelseDokumentasjon({ ...response, behandling: selectedBehandling })
          }
        }
      })
    }
  }

  return (
    <Block>
      <Button
        onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)}
        startEnhancer={props.isEditButton ? <img src={editIcon} alt="edit icon" /> : <img src={plusIcon} alt="plus icon" />}
        size="compact"
      >
        {props.isEditButton ? 'Rediger dokumentasjon' : 'Ny dokumentasjon'}
      </Button>

      <CustomizedModal size="default" isOpen={!!isEtterlevelseDokumentasjonerModalOpen} onClose={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
        <ModalHeader>{props.isEditButton ? 'Rediger dokumentasjonen' : 'Opprett ny dokumentasjon'}</ModalHeader>
        <ModalBody>
          <Formik initialValues={etterlevelseDokumentasjonMapToFormVal(props.etterlevelseDokumentasjon ? props.etterlevelseDokumentasjon : {})} onSubmit={submit}>
            {({ values, submitForm }) => {
              return (
                <Form>
                  <InputField disablePlaceHolder label={'Tittel'} name={'title'} />
                  <FieldWrapper>
                    <FieldArray name="teamsData">
                      {(p: FieldArrayRenderProps) => {
                        return (
                          <FormControl label={<LabelWithTooltip label="Legg til team" tooltip="Søk og legg til team fra teamkatalogen" />}>
                            <Block>
                              <Block display="flex">
                                <CustomizedSelect
                                  overrides={selectCustomOverrides}
                                  placeholder="Søk team"
                                  aria-label="Søk team"
                                  noResultsMsg={intl.emptyTable}
                                  maxDropdownHeight="350px"
                                  searchable={true}
                                  type={TYPE.search}
                                  labelKey="name"
                                  onInputChange={(event) => {
                                    setTeamSearchResult(event.currentTarget.value)
                                  }}
                                  options={teamSearchResult}
                                  onChange={({ value }) => {
                                    value.length && p.push(value[0])
                                  }}
                                  isLoading={loadingTeamSearchResult}
                                  error={!!p.form.errors.teamsData && !!p.form.submitCount}
                                />
                              </Block>
                              <RenderTagList wide list={p.form.values.teamsData.map((t: Team) => t.name)} onRemove={p.remove} />
                            </Block>
                          </FormControl>
                        )
                      }}
                    </FieldArray>
                  </FieldWrapper>
                  <FieldWrapper>
                    <Field name="behandlingId">
                      {(fp: FieldProps) => {
                        return (
                          <FormControl label={<LabelWithTooltip label={'Legg til behandling'} tooltip="Søk og legg til behandling fra Behandlingskatalog" />}>
                            <Block>
                              <CustomizedSelect
                                overrides={selectCustomOverrides}
                                labelKey={'navn'}
                                noResultsMsg={intl.emptyTable}
                                maxDropdownHeight="350px"
                                searchable={true}
                                type={TYPE.search}
                                options={behandlingSearchResult}
                                placeholder={'Søk behandling'}
                                onInputChange={(event) => setbehandlingSearchResult(event.currentTarget.value)}
                                onChange={(params) => {
                                  let behandling = params.value.length ? params.value[0] : undefined
                                  if (behandling) {
                                    fp.form.values['behandlingId'] = behandling.id
                                    setSelectedBehandling(behandling as Behandling)
                                  }
                                }}
                                // error={!!fp.form.errors.begreper && !!fp.form.submitCount}
                                isLoading={loadingBehandlingSearchResult}
                              />
                              {selectedBehandling && (
                                <Tag
                                  variant={VARIANT.outlined}
                                  onActionClick={() => {
                                    setSelectedBehandling(undefined)
                                    fp.form.setFieldValue('behandlingId', '')
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
                                  {selectedBehandling.navn}
                                </Tag>
                              )}
                            </Block>
                          </FormControl>
                        )
                      }}
                    </Field>
                    <Error fieldName="behandlingId" fullWidth />
                  </FieldWrapper>

                  <LabelWithTooltip tooltip="Ved å oppgi egenskaper til etterlevelsen, blir kun relevante krav synlig for dokumentasjon." label={'Filter'} />
                  <FieldArray name="irrelevansFor">
                    {(p: FieldArrayRenderProps) => {
                      return (
                        <FormControl>
                          <Block height="100%" width="calc(100% - 16px)" paddingLeft={theme.sizing.scale700} paddingTop={theme.sizing.scale750}>
                            <ButtonGroup
                              mode="checkbox"
                              kind={KIND.secondary}
                              selected={selectedFilter}
                              size="mini"
                              onClick={(e, i) => {
                                if (!selectedFilter.includes(i)) {
                                  setSelectedFilter([...selectedFilter, i])
                                  p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === relevansOptions[i].id))
                                } else {
                                  setSelectedFilter(selectedFilter.filter((value) => value !== i))
                                  p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].id as string))
                                }
                              }}
                              overrides={{
                                Root: {
                                  style: {
                                    flexWrap: 'wrap',
                                  },
                                },
                              }}
                            >
                              {relevansOptions.map((r, i) => {
                                return (
                                  <BaseUIButton
                                    key={'relevans_' + r.id}
                                    type="button"
                                    startEnhancer={() => {
                                      if (selectedFilter.includes(i)) {
                                        return <img src={checkboxChecked} alt="checked" />
                                      } else if (!selectedFilter.includes(i) && hover === i) {
                                        return <img src={checkboxUncheckedHover} alt="checkbox hover" />
                                      } else {
                                        return <img src={checkboxUnchecked} alt="unchecked" />
                                      }
                                    }}
                                    overrides={{
                                      BaseButton: {
                                        style: {
                                          ...buttonContentStyle,
                                          backgroundColor: selectedFilter.includes(i) ? ettlevColors.green100 : ettlevColors.white,
                                          ...borderWidth('1px'),
                                          ...borderStyle('solid'),
                                          ...borderColor('#6A6A6A'),
                                          paddingLeft: '8px',
                                          paddingRight: '16px',
                                          paddingTop: '8px',
                                          paddingBottom: '10px',
                                          marginRight: '16px',
                                          marginBottom: '16px',
                                          ...borderRadius('4px'),
                                          ':hover': {
                                            backgroundColor: ettlevColors.white,
                                            boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.25), inset 0px -1px 0px rgba(0, 0, 0, 0.25);',
                                          },
                                          ':focus': {
                                            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                                            outlineWidth: '3px',
                                            outlineStyle: 'solid',
                                            outlinwColor: ettlevColors.focusOutline,
                                          },
                                          width: '100%',
                                          maxWidth: '260px',
                                          justifyContent: 'flex-start',
                                        },
                                        props: {
                                          onMouseEnter: () => {
                                            setHover(i)
                                          },
                                          onMouseLeave: () => {
                                            setHover(undefined)
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <Block width="100%" marginRight="5px">
                                      <ParagraphMedium margin="0px" $style={{ lineHeight: '22px' }}>
                                        {r.label}
                                      </ParagraphMedium>
                                    </Block>
                                    <StatefulTooltip
                                      content={() => <Block padding="20px">{r.description}</Block>}
                                      placement={PLACEMENT.bottom}
                                      accessibilityType={ACCESSIBILITY_TYPE.tooltip}
                                      returnFocus
                                      showArrow
                                      autoFocus
                                    >
                                      <Block display="flex" justifyContent="flex-end">
                                        <img src={outlineInfoIcon} alt="informasjons ikon" />
                                      </Block>
                                    </StatefulTooltip>
                                  </BaseUIButton>
                                )
                              })}
                            </ButtonGroup>
                          </Block>
                        </FormControl>
                      )
                    }}
                  </FieldArray>

                  <Block display="flex" justifyContent="flex-end">
                    <Button kind="secondary" type="button" onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
                      Avbryt
                    </Button>
                    <Button
                      marginLeft={true}
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      {props.isEditButton ? 'Lagre' : 'Opprett'}
                    </Button>
                  </Block>
                </Form>
              )
            }}
          </Formik>
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}
export default EditEtterlevelseDokumentasjonModal
