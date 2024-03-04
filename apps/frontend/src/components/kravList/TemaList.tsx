import { Accordion, BodyLong, BodyShort, Button, Label, LinkPanel, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { getAllKrav } from '../../api/KravApi'
import { getAllKravPriority } from '../../api/KravPriorityApi'
import { EKravStatus, IKrav } from '../../constants'
import { EListName, codelist } from '../../services/Codelist'
import { sortKraverByPriority } from '../../util/sort'
import StatusView from '../common/StatusTag'
import { KravPanelHeader } from '../etterlevelseDokumentasjon/KravPanelHeader'
import { EditPriorityModal } from './edit/EditPriorityModal'

export const TemaList = () => {
  const [allActiveKrav, setAllActiveKrav] = useState<IKrav[]>([])
  const [allDraftKrav, setAllDraftKrav] = useState<IKrav[]>([])

  useEffect(() => {
    fetchKrav()
  }, [])

  const fetchKrav = () => {
    ;(async () => {
      const kraver = await getAllKrav()
      const allKravPriority = await getAllKravPriority()

      kraver.map((k) => {
        const priority = allKravPriority.filter(
          (kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon
        )
        k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
        k.kravPriorityUID = priority.length ? priority[0].id : ''
        return k
      })

      setAllActiveKrav(kraver.filter((k) => k.status === EKravStatus.AKTIV))
      setAllDraftKrav(kraver.filter((k) => k.status === EKravStatus.UTKAST))
    })()
  }

  return (
    <Accordion>
      {codelist.getCodes(EListName.TEMA).map((t) => {
        const activeKraver = allActiveKrav?.filter((k) => {
          return k.regelverk.map((r) => r.lov.data && r.lov.data.tema).includes(t.code)
        })
        const draftKraver = allDraftKrav?.filter((k) => {
          return k.regelverk.map((r) => r.lov.data && r.lov.data.tema).includes(t.code)
        })
        return activeKraver && activeKraver.length > 0 ? (
          <Accordion.Item>
            <Accordion.Header key={`${t.code}_krav_list`}>
              <KravPanelHeader title={t.shortName} kravData={[...activeKraver, ...draftKraver]} />
            </Accordion.Header>
            <Accordion.Content>
              <KravTemaList
                activeKraver={sortKraverByPriority(activeKraver, t.shortName)}
                tema={t.shortName}
                refresh={fetchKrav}
                draftKrav={draftKraver}
              />
            </Accordion.Content>
          </Accordion.Item>
        ) : (
          <Accordion.Item>
            <Accordion.Header key={`${t.code}_krav_list`}>
              <KravPanelHeader title={t.shortName} kravData={[]} />
            </Accordion.Header>
            <Accordion.Content>
              <div className="flex w-full ml-6">
                <BodyShort size="small">Ingen krav</BodyShort>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

const getKravTemaRowsWithLabel = (kraver: IKrav[], tema: string) => {
  return kraver.map((k, index) => {
    return (
      <div key={`${k.navn}_${k.kravNummer}_${tema}_${index}`}>
        <LinkPanel href={`/krav/${k.kravNummer}/${k.kravVersjon}`}>
          <LinkPanel.Title className="flex items-center">
            <div className="max-w-xl">
              <BodyShort size="small">
                K{k.kravNummer}.{k.kravVersjon}
              </BodyShort>
              <BodyLong>
                <Label>{k.navn}</Label>
              </BodyLong>
            </div>
            <Spacer />
            <div className="mr-5">
              <StatusView status={k.status} />
            </div>
            <div className="w-44">
              <BodyShort size="small">
                {k.changeStamp.lastModifiedDate !== undefined &&
                k.changeStamp.lastModifiedDate !== ''
                  ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}`
                  : ''}
              </BodyShort>
            </div>
          </LinkPanel.Title>
        </LinkPanel>
      </div>
    )
  })
}

const KravTemaList = (props: {
  activeKraver: IKrav[]
  tema: string
  refresh: () => void
  draftKrav: IKrav[]
}) => {
  const [isEditPriorityModalOpen, setIsEditPriorityModalOpen] = React.useState(false)
  const { activeKraver, tema, refresh, draftKrav } = props

  return (
    <div className="flex flex-col gap-2">
      {getKravTemaRowsWithLabel(draftKrav, tema)}
      {getKravTemaRowsWithLabel(activeKraver, tema)}

      <div className={'w-full flex flex-row-reverse pt-5'}>
        <Button variant="secondary" size="medium" onClick={() => setIsEditPriorityModalOpen(true)}>
          Endre rekkefølge på krav
        </Button>
      </div>

      {activeKraver && isEditPriorityModalOpen && (
        <EditPriorityModal
          tema={tema}
          isOpen={isEditPriorityModalOpen}
          setIsOpen={setIsEditPriorityModalOpen}
          kravListe={activeKraver}
          refresh={refresh}
        />
      )}
    </div>
  )
}
