import { Helmet } from 'react-helmet'
import { deleteEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { useState } from 'react'
import { UpdateMessage } from './EtterlevelseAdminPage'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Button, Heading, TextField } from '@navikt/ds-react'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  
  return (
    <div className="w-full" id="content" role="main">
      <div className="w-full flex justify-center items-center flex-col mt-6">
        <div className="w-full max-w-7xl px-8">
          <div className="flex-1 justify-start flex">
            <CustomizedBreadcrumbs currentPage="Administrere Etterlevelse Dokumentasjon" />
          </div>
          <div>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Administrere Etterlevelse Dokumentasjon</title>
            </Helmet>
            <Heading size="xlarge">Administrere Etterlevelse Dokumentasjon</Heading>
          </div>

          <div className="mt-5">
            <div className="flex items-end">
              <TextField
                label="Slett etterlevelse dokumentasjon med uid"
                placeholder='Etterlevelse dokumentasjon UID'
                onChange={(e) => setEtterlevelseDokumentasjonId(e.target.value)}
                className="w-full mr-3"
              />
              <Button
                disabled={!etterlevelseDokumentasjonId}
                variant="secondary"
                onClick={() => {
                  setUpdateMessage('')
                  deleteEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                    .then(() => {
                      setUpdateMessage('Sletting vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId)
                      setEtterlevelseDokumentasjonId('')
                    })
                    .catch((e) => {
                      setUpdateMessage('Oppdatering mislykket, error: ' + e)
                    })
                }}
              >
                Slett
              </Button>
            </div>
          </div>
          <UpdateMessage message={updateMessage} />
        </div>
      </div>
    </div>
  )
}
export default EtterlevelseDokumentasjonAdminPage
