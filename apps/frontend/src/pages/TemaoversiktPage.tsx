import { Helmet } from 'react-helmet'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { useEffect, useState } from 'react'
import { ampli } from '../services/Amplitude'
import { useForceUpdate } from '../util/hooks'
import { ListName, TemaCode, codelist } from '../services/Codelist'
import { BodyLong, Heading, LinkPanel, Loader, Spacer, Tag } from '@navikt/ds-react'
import { useKravCounter } from './TemaPage'
import { user } from '../services/User'

export const TemaOversiktPage = () => {
  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Tema side', role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER'  })
  }, [])

  return (
    <div className="w-full" role="main" id="content">
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-full max-w-7xl px-8">
          <div className="flex-1 justify-start flex">
            <CustomizedBreadcrumbs currentPage="Forstå kravene" />
            <Helmet>
              <meta charSet="utf-8" />
              <title>Forstå kravene</title>
            </Helmet>
          </div>
          <TemaPanels />
        </div>
      </div>
    </div>
  )
}

export const TemaPanels = () => {
  const [num] = useState<{ [t: string]: number }>({})
  const update = useForceUpdate()

  const updateNum = (tema: string, temaNum: number) => {
    num[tema] = temaNum
    update()
  }

  const kravAntall = Object.values(num).reduce((p, c) => p + c, 0)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))

  return (
    <>
      <div>
        <Heading size="medium">Forstå kravene</Heading>
        <BodyLong>
          Totalt {kravAntall} krav fordelt på {temaListe.length} temaer
        </BodyLong>
      </div>
      <div className="mt-6">
        {temaListe.map((tema) => (
          <TemaPanel key={tema.code} tema={tema} setNum={updateNum} />
        ))}
      </div>
    </>
  )
}

export const TemaPanel = ({ tema, setNum }: { tema: TemaCode; setNum: (tema: string, num: number) => void }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: [...lover.map((l) => l.code)] }, { skip: !lover.length })
  const krav = data?.krav.content || []
  useEffect(() => setNum(tema.code, krav.length), [krav])

  if (loading) {
    return <Loader size="large" />
  }

  return (
    <LinkPanel className="mb-2" key={tema.code} href={'/tema/' + tema.code}>
      <div className="w-full flex items-center ">
        <div>
          <LinkPanel.Title className="flex">{tema.shortName}</LinkPanel.Title>
          <LinkPanel.Description className="lg:flex items-center gap-2">
            {lover.map((l, i) => (
              <div key={l.code} className="flex items-center gap-2">
                {l.shortName}
                {i < lover.length - 1 && <span className="hidden lg:block h-2 w-2 rotate-45 rounded-[1px] bg-red-200"></span>}
              </div>
            ))}
          </LinkPanel.Description>
        </div>
        <Spacer />
        <Tag variant="info">{krav.length || 0} krav</Tag>
      </div>
    </LinkPanel>
  )
}