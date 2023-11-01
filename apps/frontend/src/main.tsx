import { ApolloProvider } from '@apollo/client'
import { BaseProvider } from 'baseui'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import AppRoutes from './AppRoutes'
import { codelist } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks'
import { useNetworkStatus } from './util/network'
import { customTheme } from './util/theme'

const engine = new Styletron()

// ampli.logEvent('sidevisning', { sidetittel: 'Etterlevelse' })

const Main = (props: any) => {
  useAwaitUser()
  useAwait(codelist.wait())

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={customTheme}>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter window={window}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Etterlevelse</title>
            </Helmet>

            <div className="min-h-screen relative items-center justify-center w-full bg-gray-100">
              <div className="flex flex-col items-center justify-center w-full bg-gray-100">
                <Header />
                <AppRoutes />
              </div>
              <div className="h-36 bg-gray-100 w-full flex justify-center" >
                <div className=" h-36 bg-white  w-full max-w-7xl"/>
              </div>
            </div>
          </BrowserRouter>
          <ErrorModal />
        </ApolloProvider>
      </BaseProvider>
    </StyletronProvider>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
