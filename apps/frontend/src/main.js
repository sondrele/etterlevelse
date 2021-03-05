import {ApolloProvider} from '@apollo/client'
import {BaseProvider} from 'baseui'
import {Block} from 'baseui/block'
import * as React from 'react'
import {Helmet} from 'react-helmet'
import {BrowserRouter as Router} from 'react-router-dom'
import {Client as Styletron} from 'styletron-engine-atomic'
import {Provider as StyletronProvider} from 'styletron-react'
import {apolloClient} from './api/ApolloClient'
import Header from './components/Header'
import {Footer} from './components/Navigation/Footer'
import Routes from './routes'
import {ampli} from './services/Amplitude'
import {codelist} from './services/Codelist'
import {user} from './services/User'
import {useAwait} from './util/hooks'
import {useNetworkStatus} from './util/network'
import {customTheme} from './util/theme'

const engine = new Styletron()

const containerProps = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',

  alignItems: 'center',
  paddingBottom: '100px',
  paddingLeft: '40px',
  paddingRight: '40px',
  width: 'calc(100% - 80px)',
}

ampli.logEvent('visit_count_etterlevelse')

const Main = (props) => {
  const {history} = props
  useAwait(user.wait())
  useAwait(codelist.wait())

  return (
    <React.Fragment>
      <StyletronProvider value={engine}>
        <BaseProvider theme={customTheme}>
          <ApolloProvider client={apolloClient}>
            <Router history={history}>

              <Helmet>
                <meta charSet="utf-8"/>
                <title>Etterlevelse Beta</title>
              </Helmet>

              <Block {...containerProps}>
                <Header/>
                <Block marginBottom='50px'/>
                <Routes/>
                <Block marginBottom='100px'/>
                <Footer/>
              </Block>

            </Router>
            <ErrorModal/>
          </ApolloProvider>
        </BaseProvider>
      </StyletronProvider>
    </React.Fragment>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
