import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {theme} from '../../util'
import {TeamName} from '../common/TeamName'
import {DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {HeadingSmall} from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import {etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {Behandling, Etterlevelse, EtterlevelseStatus} from '../../constants'
import {Label} from '../common/PropertyLabel'
import {KravFilters, useKravFilter} from '../../api/KravGraphQLApi'
import {Spinner} from '../common/Spinner'
import {Cell, Row, Table} from '../common/Table'
import moment from 'moment'
import Button from '../common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faPlus} from '@fortawesome/free-solid-svg-icons'
import {Modal, ModalBody, ModalHeader} from 'baseui/modal'
import {EditEtterlevelse} from '../etterlevelse/EditEtterlevelse'
import {updateEtterlevelse, useEtterlevelse} from '../../api/EtterlevelseApi'
import {KravId, useKrav} from '../../api/KravApi'
import {ViewKrav} from '../krav/ViewKrav'
import {kravName} from '../../pages/KravPage'

function filterForBehandling(behandling: Behandling): KravFilters {
  return {relevans: behandling.relevansFor.map(c => c.code)}
}

export const ViewBehandling = ({behandling, etterlevelser}: {behandling: Behandling, etterlevelser: Etterlevelse[]}) => {

  return (
    <Block>
      <Block>
        <Label title='Navn'>{behandling.navn}</Label>
        <Label title='Nummer'>{behandling.nummer}</Label>
        <Label title='Overordnet formål'>{behandling.overordnetFormaal.shortName}</Label>
        <Label title=''>{behandling.overordnetFormaal.description}</Label>
        <Label title='Formål'>{behandling.formaal}</Label>

        <Label title='Avdeling'>{behandling.avdeling?.shortName}</Label>
        <Label title='Linjer'>{behandling.linjer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Systemer'>{behandling.systemer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Team'>
          <Block display='flex' flexWrap>
            {behandling.teams.map(t =>
              <Block key={t} marginRight={theme.sizing.scale600}>
                <TeamName id={t} link/>
              </Block>
            )}
          </Block>
        </Label>
        <Label title={'Relevans'}><DotTags list={ListName.RELEVANS} codes={behandling.relevansFor} linkCodelist/></Label>
      </Block>

      <Block marginTop={theme.sizing.scale2400}>
        <HeadingSmall marginBottom={theme.sizing.scale400}>Krav for behandling</HeadingSmall>
        <KravTable behandling={behandling}/>
      </Block>
    </Block>
  )
}
const behandlingKravQuery = `query getKravByFilter ($relevans: [String!], $nummer: Int){
  krav(filter: {relevans: $relevans, nummer: $nummer}) {
    id
    navn
    kravNummer
    kravVersjon
    etterlevelser {
      id
      etterleves
      fristForFerdigstillelse
      status
      behandling {
        nummer
      }
    }
  }
}`

type KravTableData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  etterlevelseId?: string
  etterleves: boolean
  frist?: string
  etterlevelseStatus?: EtterlevelseStatus
}

const KravTable = (props: {behandling: Behandling}) => {
  const [kravFilter, setKravFilter] = useState({})
  useEffect(() => setKravFilter(filterForBehandling(props.behandling)), [props.behandling])
  const [rawData, loading] = useKravFilter(kravFilter, behandlingKravQuery)
  const [data, setData] = useState<KravTableData[]>([])

  useEffect(() => {
    const mapped = rawData.map(krav => {
      let etterlevelse = krav.etterlevelser.find(e => e.behandling.nummer === props.behandling.nummer)
      return ({
        kravNummer: krav.kravNummer,
        kravVersjon: krav.kravVersjon,
        navn: krav.navn,
        etterlevelseId: etterlevelse?.id,
        etterleves: !!etterlevelse?.etterleves,
        frist: etterlevelse?.fristForFerdigstillelse,
        etterlevelseStatus: etterlevelse?.status
      })
    })
    setData(mapped.filter(k => k.etterlevelseId || !mapped.find(k2 => k2.kravNummer === k.kravNummer && k2.kravVersjon > k.kravVersjon)))
  }, [rawData])

  const [edit, setEdit] = useState<string | undefined>()
  const [createNew, setCreateNew] = useState(false)


  return (
    loading ?
      <Spinner size={theme.sizing.scale2400}/> :
      <>
        <Table
          data={data}
          emptyText={'data på behandling som spesifiserer aktuelle krav'}
          headers={[
            {title: 'Nummer', column: 'kravNummer', small: true},
            {title: 'Navn', column: 'navn'},
            {title: 'Etterleves', column: 'etterleves'},
            {title: 'Frist', column: 'frist'},
            {title: 'Status', column: 'etterlevelseStatus'},
            {title: '', small: true},
          ]}
          config={{
            initialSortColumn: 'kravNummer',
            useDefaultStringCompare: true,
            sorting: {
              kravNummer: (a, b) => a.kravNummer === b.kravNummer ? a.kravVersjon - b.kravVersjon : a.kravNummer - b.kravNummer,
            }
          }}
          render={state => {
            return state.data.map((krav, i) => {
              return (
                <Row key={i}>
                  <Cell small>{krav.kravNummer}.{krav.kravVersjon}</Cell>
                  <Cell>
                    <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
                  </Cell>
                  <Cell>
                    {!krav.etterlevelseId && (krav.etterleves ? 'Ja' : 'Nei')}
                    {krav.etterlevelseId && <RouteLink href={`/etterlevelse/${krav.etterlevelseId}`}>{krav.etterleves ? 'Ja' : 'Nei'}</RouteLink>}
                  </Cell>
                  <Cell>{krav.frist && moment(krav.frist).format('ll')}</Cell>
                  <Cell>{etterlevelseStatus(krav.etterlevelseStatus)}</Cell>
                  <Cell small $style={{justifyContent: 'flex-end'}}>
                    {krav.etterlevelseId && <Button size='compact' kind='tertiary' onClick={() => setEdit(krav.etterlevelseId)}><FontAwesomeIcon icon={faEdit}/></Button>}
                    {!krav.etterlevelseId && <Button size='compact' kind='tertiary' onClick={() => setCreateNew(true)}><FontAwesomeIcon icon={faPlus}/></Button>}
                  </Cell>
                </Row>
              )
            })
          }}
        />
        {edit &&
        <Modal isOpen={!!edit}
               onClose={() => setEdit(undefined)}
               unstable_ModalBackdropScroll
               size={'full'}
        >
          <ModalHeader>Rediger etterlevelse</ModalHeader>
          <ModalBody>
            <EditModal etterlevelseId={edit} close={() => setEdit(undefined)}/>
          </ModalBody>
        </Modal>
        }
      </>
  )
}


const EditModal = (props: {etterlevelseId: string, close: () => void}) => {
  const [etterlevelse] = useEtterlevelse(props.etterlevelseId)
  if (!etterlevelse) return <Spinner size={theme.sizing.scale800}/>

  return (
    <Block>
      {etterlevelse && <KravView krav={{kravNummer: etterlevelse.kravNummer, kravVersjon: etterlevelse.kravVersjon}}/>}
      <EditEtterlevelse
        etterlevelse={etterlevelse}
        lockBehandlingAndKrav
        close={e => {
        e && updateEtterlevelse(e)
        props.close()
      }}/>
    </Block>
  )
}

const KravView = (props: {krav: KravId}) => {
  const [krav] = useKrav(props.krav, true)
  const [view, setView] = useState(false)

  return (
    <Block>
      <Button type='button' size='compact' onClick={() => setView(!view)}>{`${(view ? 'Skjul krav' : 'Vis krav')}`}</Button>
      {krav && view &&
      <Block>
        <HeadingSmall>{kravName(krav)}</HeadingSmall>
        <ViewKrav krav={krav} />
      </Block>
      }
    </Block>
  )
}
