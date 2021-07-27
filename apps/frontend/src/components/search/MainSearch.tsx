import * as React from 'react'
import { ReactElement, useEffect, useState } from 'react'
import { SIZE, TYPE, Value } from 'baseui/select'
import { theme } from '../../util'
import { useDebouncedState, useQueryParam } from '../../util/hooks'
import { prefixBiasedSort } from '../../util/sort'
import { Block } from 'baseui/block'
import { useHistory, useLocation } from 'react-router-dom'
import { urlForObject } from '../common/RouteLink'
import Button from '../common/Button'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { Radio, RadioGroup } from 'baseui/radio'
import { borderColor, paddingZero } from '../common/Style'
import SearchLabel from './components/SearchLabel'
import { NavigableItem, ObjectType } from '../admin/audit/AuditTypes'
import { Behandling, Krav } from '../../constants'
import shortid from 'shortid'
import { searchResultColor } from '../../util/theme'
import { kravName } from '../../pages/KravPage'
import { searchKrav } from '../../api/KravApi'
import { behandlingName, searchBehandling } from '../../api/BehandlingApi'
import { codelist, ListName } from '../../services/Codelist'
import { searchIcon } from '../Images'
import CustomizedSelect from '../common/CustomizedSelect'

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@')

type SearchItem = { id: string; sortKey: string; label: ReactElement; type: NavigableItem | string }

type SearchType = 'all' | ObjectType.Krav | ObjectType.Behandling | ListName.UNDERAVDELING

type GroupedResult = { Krav?: SearchItem[]; Behandling?: SearchItem[]; Underavdeling?: SearchItem[]; all?: SearchItem[]; __ungrouped: SearchItem[] }

type RadioProps = {
  $isHovered: boolean
  $checked: boolean
}

const SmallRadio = (value: SearchType, label: string) => {
  return (
    <Radio
      value={value}
      overrides={{
        Root: {
          style: {
            marginBottom: 0,
          },
        },
        Label: {
          style: (a: RadioProps) => ({
            ...paddingZero,
            ...(a.$isHovered ? { color: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkOuter: {
          style: (a: RadioProps) => ({
            width: theme.sizing.scale500,
            height: theme.sizing.scale500,
            ...(a.$isHovered ? { backgroundColor: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkInner: {
          style: (a: RadioProps) => ({
            width: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
            height: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
          }),
        },
      }}
    >
      <Block font="ParagraphXSmall">{label}</Block>
    </Radio>
  )
}

const SelectType = (props: { type: SearchType; setType: (type: SearchType) => void }) => (
  <Block
    font="ParagraphSmall"
    // position="absolute"
    // marginTop="64px"
    backgroundColor="#FFFFFF"
    display="flex"
    $style={{
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderRightStyle: 'solid',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderBottomWidth: '2px',
      borderLeftColor: '#6B6B6B',
      borderRightColor: '#6B6B6B',
      borderBottomColor: '#6B6B6B',
    }}
  >
    <Block marginLeft="3px" marginRight="3px" marginBottom="3px">
      <RadioGroup onChange={(e) => props.setType(e.target.value as SearchType)} align="horizontal" value={props.type}>
        {SmallRadio('all', 'Alle')}
        {SmallRadio(ObjectType.Krav, 'Krav')}
        {SmallRadio(ObjectType.Behandling, 'Behandling')}
        {SmallRadio(ListName.UNDERAVDELING, 'Underavdeling')}
      </RadioGroup>
    </Block>
  </Block>
)

const kravMap = (t: Krav) => ({
  id: t.id,
  sortKey: t.navn,
  label: <SearchLabel name={kravName(t)} type={'Krav'} backgroundColor={searchResultColor.kravBackground} />,
  type: ObjectType.Krav,
})

const behandlingMap = (t: Behandling) => ({
  id: t.id,
  sortKey: t.navn,
  label: <SearchLabel name={behandlingName(t)} type={'Behandling'} backgroundColor={searchResultColor.behandlingBackground} />,
  type: ObjectType.Behandling,
})

const getCodelist = (search: string, list: ListName, typeName: string) => {
  return codelist
    .getCodes(list)
    .filter((c) => c.shortName.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map(
      (c) =>
        ({
          id: c.code,
          sortKey: c.shortName,
          label: <SearchLabel name={c.shortName} type={typeName} />,
          type: list,
        } as SearchItem),
    )
}

const searchCodelist = (search: string, list: ListName & NavigableItem, typeName: string, backgroundColor: string) =>
  codelist
    .getCodes(list)
    .filter((c) => c.shortName.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map((c) => ({
      id: c.code,
      sortKey: c.shortName,
      label: <SearchLabel name={c.shortName} type={typeName} backgroundColor={backgroundColor} />,
      type: list,
    }))

const order = (type: NavigableItem | string) => {
  switch (type) {
    case ObjectType.Krav:
      return 0
    case ObjectType.Behandling:
      return 1
  }
  return -1
}

const useMainSearch = (searchParam?: string) => {
  const [search, setSearch] = useDebouncedState<string>(searchParam || '', 500)
  const [searchResult, setSearchResult] = React.useState<SearchItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [type, setType] = useState<SearchType>('all')


  useEffect(() => {
    setSearchResult([])

    if (type === ListName.UNDERAVDELING) {
      setSearchResult(getCodelist(search, ListName.UNDERAVDELING, 'Underavdeling'))
    } else {
      if (search && search.replace(/ /g, '').length > 2) {
        ;(async () => {
          let results: SearchItem[] = []
          let searches: Promise<any>[] = []
          const compareFn = (a: SearchItem, b: SearchItem) => prefixBiasedSort(search, a.sortKey, b.sortKey)
          const add = (items: SearchItem[]) => {
            results = [...results, ...items]
            results = results
              .filter((item, index, self) => index === self.findIndex((searchItem) => searchItem.id === item.id))
              .sort((a, b) => {
                const same = a.type === b.type
                const typeOrder = order(a.type) - order(b.type)
                return same || typeOrder !== 0 ? typeOrder : compareFn(a, b)
              })
            setSearchResult(results)
            console.log(results)
          }
          setLoading(true)

          if (type === 'all') {
            add(searchCodelist(search, ListName.UNDERAVDELING, 'Underavdeling', searchResultColor.underavdelingBackground))
          }

          if (type === 'all' || type === ObjectType.Krav) {
            searches.push((async () => add((await searchKrav(search)).map(kravMap)))())
          }
          if (type === 'all' || type === ObjectType.Behandling) {
            searches.push((async () => add((await searchBehandling(search)).map(behandlingMap)))())
          }

          await Promise.all(searches)
          setLoading(false)
        })()
      }
    }
  }, [search, type])
  return [setSearch, searchResult, loading, type, setType] as [(text: string) => void, SearchItem[], boolean, SearchType, (type: SearchType) => void]
}

const MainSearch = () => {
  const searchParam = useQueryParam('search')
  const [setSearch, searchResult, loading, type, setType] = useMainSearch(searchParam)
  const [filter, setFilter] = useState(false)
  const [value, setValue] = useState<Value>(searchParam ? [{ id: searchParam, label: searchParam }] : [])
  const history = useHistory()
  const location = useLocation()
  const filterOption = {
    id: 'filter',
    label: <SelectType type={type} setType={setType} />,
    sortKey: 'filter',
    type: '__ungrouped',
  }
  const [groupedSeachResult, setGroupSearchResult] = useState<GroupedResult>({ __ungrouped: [filterOption] })

  useEffect(() => {
    const groupedResults: GroupedResult = {
      __ungrouped: [filterOption],
      Krav: [],
      all: [],
      Behandling: [],
      Underavdeling: [],
    }

    searchResult.forEach((r: SearchItem) => {
      if (r.type === 'Krav') {
        groupedResults.Krav?.push(r)
      } else if (r.type === 'Behandling') {
        groupedResults.Behandling?.push(r)
      } else if (r.type === 'UNDERAVDELING') {
        groupedResults.Underavdeling?.push(r)
      } else {
        groupedResults.all?.push(r)
      }
    })

    setGroupSearchResult(groupedResults)
  }, [searchResult])

  return (
    <Block width="100%">
      <Block display="flex" position="relative" alignItems="center" width={'100%'}>
        <CustomizedSelect
          closeOnSelect={value ? (value[0] as SearchItem).id === 'filter' ? false : true : true} 
          size={SIZE.compact}
          backspaceRemoves
          startOpen={!!searchParam}
          noResultsMsg={'Ingen'}
          autoFocus={location.pathname === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable
          type={TYPE.search}
          options={groupedSeachResult}
          placeholder={'Søk etter krav eller behandling'}
          aria-label={'Søk etter krav eller behandling'}
          value={value}
          onInputChange={(event) => {
            // if(event.currentTarget.value.type !== ) {}
            setSearch(event.currentTarget.value)
            console.log(event.currentTarget.value[0], 'value')
            setValue([{ id: event.currentTarget.value, label: event.currentTarget.value }])
          }}
          onChange={(params) => {
            const item = params.value[0] as SearchItem
            if (item && item.type !== '__ungrouped') {
              (async () => {
                history.push(urlForObject(item.type, item.id))
              })()
            } else {
              // setValue([])
            }console.log(params.value[0])
          }}
          filterOptions={(options) => options}
          overrides={{
            SearchIcon: {
              component: () => <img src={searchIcon} alt="Søk ikon" />,
            },
            ControlContainer: {
              style: {
                ...(filter ? { borderBottomLeftRadius: 0 } : {}),
                ...(filter ? { borderBottomRightRadius: 0 } : {}),
                backgroundColor: '#FFFFFF',
                ...borderColor('#6B6B6B'),
              },
            },
            DropdownListItem: {
              style: {
                paddingTop: 0,
                paddingRight: '5px',
                paddingBottom: 0,
                paddingLeft: '5px',
              },
            },
          }}
        />
        <Button
          onClick={() => setFilter(!filter)}
          icon={faFilter}
          size="compact"
          kind={filter ? 'primary' : 'tertiary'}
          marginLeft
          $style={{ height: theme.sizing.scale1000, width: theme.sizing.scale1000 }}
          label="Filter søkeresultat"
        />
        {filter && <SelectType type={type} setType={setType} />}
      </Block>
    </Block>
  )
}

export default MainSearch
