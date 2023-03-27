import { Block } from 'baseui/block'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { useState } from 'react'
import { Virkemiddel } from '../../../constants'
import { codelist, ListName } from '../../../services/Codelist'
import Button from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import { editIcon, plusIcon } from '../../Images'
import { Field, FieldProps, Form, Formik } from 'formik'
import { virkemiddelMapToFormVal } from '../../../api/VirkemiddelApi'
import { FieldWrapper, InputField } from '../../common/Inputs'
import { FormControl } from 'baseui/form-control'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import CustomizedSelect from '../../common/CustomizedSelect'
import { selectCustomOverrides } from '../../etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { intl } from '../../../util/intl/intl'
import { Value } from 'baseui/select'
import { KravRegelverkEdit } from '../../krav/Edit/KravRegelverkEdit'

type EditVirkemiddelModalProps = {
  virkemiddel?: Virkemiddel
  setVirkemiddel?: (v: Virkemiddel) => void
  isEdit?: boolean
}

export const EditVirkemiddelModal = (props: EditVirkemiddelModalProps) => {
  const virkemiddelTypeOptions = codelist.getParsedOptions(ListName.VIRKEMIDDELTYPE)
  const lovOptions = codelist.getParsedOptions(ListName.LOV)
  const [isVirkemiddelModalOpen, setIsVirkemiddelModalOpen] = useState<boolean>(false)
  const [valgtVirkemiddeltype, setValgtVirkemiddeltype] = useState<Value>([])

  const submit = async (virkemiddel: Virkemiddel) => {
    console.log(virkemiddel)
  }

  return (
    <Block>
      <Button
        onClick={() => setIsVirkemiddelModalOpen(true)}
        startEnhancer={props.isEdit ? <img src={editIcon} alt="edit icon" /> : <img src={plusIcon} alt="plus icon" />}
        size="compact"
      >
        {props.isEdit ? 'Rediger virkemiddel' : 'Nytt virkemiddel'}
      </Button>

      <CustomizedModal isOpen={!!isVirkemiddelModalOpen} onClose={() => setIsVirkemiddelModalOpen(false)}>
        <ModalHeader>{props.isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel'}</ModalHeader>
        <ModalBody>
          <Formik initialValues={virkemiddelMapToFormVal(props.virkemiddel ? props.virkemiddel : {})} onSubmit={submit}>
            {({ values, submitForm }) => {
              return (
                <Form>
                  <InputField label={'Navn'} name={'navn'} />
                  <FieldWrapper>
                    <Field name="virkemiddelType">
                      {(fp: FieldProps) => {
                        return (
                          <FormControl label={<LabelWithTooltip label="Legg til virkemiddeltype" tooltip="Søk og legg til virkemiddeltype fra kodeverket" />}>
                            <Block width="100%">
                              <CustomizedSelect
                                overrides={selectCustomOverrides}
                                noResultsMsg={intl.emptyTable}
                                maxDropdownHeight="350px"
                                searchable={true}
                                options={virkemiddelTypeOptions}
                                placeholder={'Velg virkemiddeltype'}
                                aria-label={'Velg virkemiddeltype'}
                                value={valgtVirkemiddeltype}
                                onChange={({ value }) => {
                                  setValgtVirkemiddeltype(value)
                                  fp.form.setFieldValue('virkemiddelType', value && value.length ? value[0].id : undefined)
                                }}
                              />
                            </Block>
                          </FormControl>
                        )
                      }}
                    </Field>
                  </FieldWrapper>
                  <KravRegelverkEdit />

                  <InputField label={'Livssituasjon'} name={'livsSituasjon'} />
                  <Button
                    type="button"
                    onClick={() => {
                      submitForm()
                    }}
                  >
                    {props.isEdit ? 'Lagre' : 'Opprett'}
                  </Button>
                  <Button type="button" onClick={() => setIsVirkemiddelModalOpen(false)} marginLeft={true}>
                    Avbryt
                  </Button>
                </Form>
              )
            }}
          </Formik>
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}
