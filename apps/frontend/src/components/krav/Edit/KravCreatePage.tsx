import { Alert, Button, Checkbox, CheckboxGroup, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kravMapToFormVal } from '../../../api/KravApi'
import { EKravStatus, TKravQL } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import ErrorModal from '../../ErrorModal'
import { IBreadcrumbPaths } from '../../common/CustomizedBreadcrumbs'
import { InputField, MultiInputField, TextAreaField } from '../../common/Inputs'
import { Error } from '../../common/ModalSchema'
import { PageLayout } from '../../scaffold/Page'
import { EditKravMultiOptionField } from './EditKravMultiOptionField'
import { EditKravRelasjoner } from './EditKravRelasjoner'
import { EditBegreper } from './KravBegreperEdit'
import { kravCreateValidation } from './KravSchemaValidation'
import { KravSuksesskriterierEdit } from './KravSuksesskriterieEdit'
import { KravVarslingsadresserEdit } from './KravVarslingsadresserEdit'
import { RegelverkEdit } from './RegelverkEdit'

const kravBreadCrumbPath: IBreadcrumbPaths = {
  href: '/kravliste',
  pathName: 'Forvalte og opprette krav',
}

export const KravCreatePage = () => {
  const [loading, setLoading] = useState(false)
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')

  const maxInputWidth = '400px'

  const navigate = useNavigate()

  const submit = (krav: TKravQL) => {
    setLoading(true)
    const regelverk = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov.code)
    const underavdeling = codelist.getCode(EListName.UNDERAVDELING, regelverk?.data?.underavdeling)

    const mutatedKrav = {
      ...krav,
      underavdeling: underavdeling,
    }

    console.log(mutatedKrav)

    // createKrav(mutatedKrav).then((krav) => {
    //   setLoading(false)
    //   navigate('/krav/' + krav.id)
    // })
  }

  return (
    <PageLayout
      pageTitle="Opprett ny krav"
      currentPage="Opprett ny krav"
      breadcrumbPaths={[kravBreadCrumbPath]}
    >
      {loading && (
        <div className="w-full flex items-center flex-col">
          <Heading level="1" size="medium">
            Jobber med å opprette ny krav. Du vil bli sendt til ny krav side når det er fullført
          </Heading>
          <Loader size="3xlarge" />
        </div>
      )}

      {!loading && (
        <Formik
          onSubmit={submit}
          initialValues={kravMapToFormVal({})}
          validationSchema={kravCreateValidation()}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, errors, isSubmitting, handleReset, submitForm, setErrors }) => (
            <Form>
              <Heading className="mb-6" level="1" size="medium">
                Opprett nytt krav
              </Heading>

              <div>
                <InputField marginBottom label="Krav tittel" name="navn" />
                <div className="mb-14">
                  <CheckboxGroup
                    legend="Send varselmelding"
                    onChange={(value) => {
                      setVarselMeldingActive(value)
                    }}
                  >
                    <Checkbox value="VarselMelding">
                      Gi kravet en varselmelding (eks. for kommende krav)
                    </Checkbox>
                  </CheckboxGroup>

                  {varselMeldingActive.length > 0 && (
                    <div className="w-full ml-8 mt-6">
                      <TextAreaField
                        label="Forklaring til etterlevere"
                        name="varselMelding"
                        maxCharacter={100}
                        rows={2}
                        noPlaceholder
                      />
                    </div>
                  )}

                  <TextAreaField label="Hensikt" name="hensikt" height="250px" markdown />
                </div>

                <div className="flex w-full justify-center">
                  <div className="w-full  mb-2.5">
                    <Heading level="3" size="medium" className="mb-8">
                      Suksesskriterier
                    </Heading>
                    <KravSuksesskriterierEdit />

                    <div className="mb-8">
                      <Heading level="3" size="medium">
                        Dokumentasjon
                      </Heading>
                    </div>

                    <MultiInputField
                      marginBottom
                      maxInputWidth={maxInputWidth}
                      linkLabel="Navn på kilde"
                      name="dokumentasjon"
                      link
                      label="Lenke eller websaknr"
                      tooltip="Lenke til dokumentasjon"
                      linkTooltip={
                        'Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller WebSak.'
                      }
                      setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde.' })}
                    />

                    <Error fieldName="dokumentasjon" />
                    <RegelverkEdit />
                    <Error fieldName="regelverk" />

                    <div className="mt-20">
                      <Heading level="3" size="medium">
                        Gruppering
                      </Heading>
                    </div>

                    <div className="w-full max-w-md">
                      <EditKravMultiOptionField
                        marginBottom
                        name="relevansFor"
                        label="Legg til relevante kategorier"
                        listName={EListName.RELEVANS}
                        tooltip={'Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n'}
                      />

                      <Error fieldName="relevansFor" />
                    </div>

                    <div className="w-full mb-20 max-w-md">
                      <EditBegreper />
                    </div>

                    <div className="w-full mb-20 max-w-md">
                      <EditKravRelasjoner />
                    </div>

                    <div className="mb-8">
                      <Heading level="3" size="medium">
                        Egenskaper
                      </Heading>
                    </div>

                    <KravVarslingsadresserEdit />

                    <Error fieldName="varslingsadresser" />

                    <div className="w-full">
                      {Object.keys(errors).length > 0 && !errors.dokumentasjon && (
                        <div className="flex w-full my-12">
                          <div className="w-full bg-red-300">
                            <Alert variant="warning" role="status">
                              Du må fylle ut alle obligatoriske felter
                            </Alert>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="button_container flex flex-col py-4  bg-gray-50 z-10">
                  {errors.status && (
                    <div className="mb-3">
                      <Error fieldName="status" />
                    </div>
                  )}

                  <div className="flex w-full">
                    <div className="flex w-full justify-end">
                      <Button
                        className="ml-4"
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          handleReset()
                          navigate('/kravliste')
                        }}
                      >
                        Avbryt
                      </Button>

                      <Button
                        className="ml-4"
                        variant="primary"
                        onClick={() => {
                          submitForm()
                        }}
                        disabled={isSubmitting}
                      >
                        Lagre
                      </Button>

                      <Button
                        type="button"
                        className="ml-4"
                        variant="primary"
                        onClick={() => {
                          values.status = EKravStatus.AKTIV
                          submitForm()
                        }}
                        disabled={isSubmitting}
                      >
                        Publiser og gjør aktiv
                      </Button>
                    </div>
                  </div>
                </div>

                <div className=" py-12">
                  <TextAreaField
                    label="Notater (Kun synlig for kraveier)"
                    name="notat"
                    height="250px"
                    markdown
                  />
                </div>
              </div>
              <ErrorModal
                isOpen={showErrorModal}
                errorMessage={errorModalMessage}
                submit={setShowErrorModal}
              />
            </Form>
          )}
        </Formik>
      )}
    </PageLayout>
  )
}
