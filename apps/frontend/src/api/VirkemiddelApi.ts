import axios from 'axios'
import { emptyPage, Krav, KravQL, KravStatus, Or, PageResponse, Virkemiddel } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import { useDebouncedState } from '../util/hooks'

export const getAllVirkemiddel = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getVirkemiddelPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allVirkemiddel: Virkemiddel[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allVirkemiddel = [...allVirkemiddel, ...(await getVirkemiddelPage(currentPage, PAGE_SIZE)).content]
    }
    return allVirkemiddel
  }
}

export const getVirkemiddelPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Virkemiddel>>(`${env.backendBaseUrl}/virkemiddel?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getVirkemiddel = async (id: string) => {
  return (await axios.get<Virkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const deleteVirkemiddel = async (id: string) => {
  return (await axios.delete<Virkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const getVirkemiddelByVirkemiddelType = async (code: string) => {
  return (await axios.get<PageResponse<Virkemiddel>>(`${env.backendBaseUrl}/virkemiddel/virkemiddeltype/${code}`)).data.content
}

export const searchVirkemiddel = async (name: string) => {
  return (await axios.get<PageResponse<Virkemiddel>>(`${env.backendBaseUrl}/virkemiddel/search/${name}`)).data.content
}

export const createVirkemiddel = async (virkemiddel: Virkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.post<Virkemiddel>(`${env.backendBaseUrl}/virkemiddel`, dto)).data
}

export const updateVirkemiddel = async (virkemiddel: Virkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.put<Virkemiddel>(`${env.backendBaseUrl}/virkemiddel/${virkemiddel.id}`, dto)).data
}

export const useVirkemiddelPage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Virkemiddel>>(emptyPage)
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getVirkemiddelPage(page, pageSize).then((r) => {
      setData(r)
      setLoading(false)
    })
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage, loading] as [PageResponse<Virkemiddel>, () => void, () => void, boolean]
}

export const useVirkemiddel = (id: string, onlyLoadOnce?: boolean) => {
  const isCreateNew = id === 'ny'
  const [data, setData] = useState<Virkemiddel | undefined>(isCreateNew ? virkemiddelMapToFormVal({}) : undefined)

  let load = () => {
    if (data && onlyLoadOnce) return
    id && !isCreateNew && getVirkemiddel(id).then(setData)
  }
  useEffect(load, [id])

  return [data, setData, load] as [Virkemiddel | undefined, (v?: Virkemiddel) => void, () => void]
}

export const useSearchVirkemiddel = () => {
  const [search, setSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setSearchResult] = useState<Virkemiddel[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (search && search.length > 2) {
        setLoading(true)

        await searchVirkemiddel(search).then((res) => {
          setSearchResult(res)
        })

        setLoading(false)
      } else {
        setSearchResult([])
      }
    })()
  }, [search])

  return [searchResult, setSearch, loading] as [Virkemiddel[], React.Dispatch<React.SetStateAction<string>>, boolean]
}

export const useVirkemiddelFilter = () => {
  const [data, setData] = useState<Virkemiddel[]>([])
  const [totalDataLength, setTotalDataLenght] = useState<number>(0)
  const [virkemiddelTypeFilter, setVirkemiddelTypeFilter] = useState<string>('')
  const [sortDate, SetSortDate] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let allVirkemiddel = await getAllVirkemiddel()
      setTotalDataLenght(allVirkemiddel.length)

      if (virkemiddelTypeFilter && virkemiddelTypeFilter !== 'alle') {
        allVirkemiddel = allVirkemiddel.filter((v) => v.virkemiddelType?.code === virkemiddelTypeFilter)
      }
      if (sortDate && (sortDate === 'ASC' || sortDate === 'DESC')) {
        if (sortDate === 'ASC') {
          allVirkemiddel.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? 1 : 0))
        } else if (sortDate === 'DESC') {
          allVirkemiddel.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
        }
      } else if (!sortDate || sortDate === '') {
        allVirkemiddel.sort((a, b) => (a.navn > b.navn ? 1 : 0))
      }

      setData(allVirkemiddel)
      setLoading(false)
    })()
  }, [virkemiddelTypeFilter, sortDate])
  return [data, totalDataLength, setVirkemiddelTypeFilter, SetSortDate, loading] as [
    Virkemiddel[],
    number,
    React.Dispatch<React.SetStateAction<string>>,
    React.Dispatch<React.SetStateAction<string>>,
    boolean,
  ]
}

export const virkemiddelToVirkemiddelDto = (virkemiddel: Virkemiddel): Virkemiddel  => {
  const dto = {
    ...virkemiddel,
    regelverk: virkemiddel.regelverk.map((r) => ({ ...r, lov: r.lov.code })),
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const virkemiddelMapToFormVal = (virkemiddel: Partial<Virkemiddel>): Virkemiddel => ({
  id: virkemiddel.id || '',
  navn: virkemiddel.navn || '',
  changeStamp: virkemiddel.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
  regelverk: virkemiddel.regelverk || [],
  virkemiddelType: virkemiddel.virkemiddelType,
  livsSituasjon: virkemiddel.livsSituasjon || '',
})
