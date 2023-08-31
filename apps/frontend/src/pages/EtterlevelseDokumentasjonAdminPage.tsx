import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { Helmet } from 'react-helmet'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { deleteEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { useState } from 'react'
import { borderColor } from '../components/common/Style'
import { UpdateMessage } from './EtterlevelseAdminPage'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administrere Dokumentasjon"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administrere Dokumentasjon</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administrere Dokumentasjon</HeadingXXLarge>
        </Block>
      }
    >
      <Block marginTop="20px">
        <LabelLarge>Slett dokumentasjon med uid</LabelLarge>
        <Block display="flex">
          <CustomizedInput
            value={etterlevelseDokumentasjonId}
            placeholder="Dokumentasjon UID"
            onChange={(e) => {
              setEtterlevelseDokumentasjonId(e.target.value)
            }}
            overrides={{
              Root: {
                style: {
                  ...borderColor(ettlevColors.grey200),
                  marginRight: '5px',
                },
              },
            }}
          />
          <Button
            disabled={!etterlevelseDokumentasjonId}
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                .then(() => {
                  setUpdateMessage('Sletting vellykket for dokumentasjon med uid: ' + etterlevelseDokumentasjonId)
                  setEtterlevelseDokumentasjonId('')
                })
                .catch((e) => {
                  setUpdateMessage('Oppdatering mislykket, error: ' + e)
                })
            }}
          >
            Slett
          </Button>
        </Block>
        <UpdateMessage message={updateMessage} />
      </Block>
    </Layout2>
  )
}
export default EtterlevelseDokumentasjonAdminPage
