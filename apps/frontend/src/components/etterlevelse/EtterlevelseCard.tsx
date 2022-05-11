import { Block } from 'baseui/block'
import { useEffect, useState } from 'react'
import { getKravByKravNumberAndVersion } from '../../api/KravApi'
import { Etterlevelse, Krav } from '../../constants'

import Button from '../common/Button'
import { EtterlevelseModal } from '../krav/Etterlevelser'

export const EtterlevelseCard = ({ etterlevelse }: { etterlevelse: Etterlevelse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kravData, setKravData] = useState<Krav>()

  useEffect(() => {
    ;(async () => {
      const krav = await getKravByKravNumberAndVersion(etterlevelse.kravNummer, etterlevelse.kravVersjon)
      if (krav) {
        setKravData(krav)
      }
    })()
  }, [])

  return (
    <Block width="100%">
      <Button type="button" kind={'underline-hover'} onClick={() => setIsModalOpen(true)}>
        Se dokumentasjon på forrige versjon
      </Button>

      {kravData && <EtterlevelseModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} etterlevelse={etterlevelse} kravData={kravData} />}
    </Block>
  )
}
export default EtterlevelseCard
