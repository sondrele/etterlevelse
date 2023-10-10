import {Spinner} from './Spinner'
import {theme} from '../../util'
import {Cell, Row, Table} from './Table'
import RouteLink from './RouteLink'
import React from 'react'
import {gql, useQuery} from '@apollo/client'
import {EtterlevelseDokumentasjon, PageResponse} from '../../constants'
import {DotTags} from "./DotTag";
import {ListName} from "../../services/Codelist";

const query = gql`
  query getEtterlevelsedokumentasjon($relevans: [String!]) {
    etterlevelseDokumentasjon(filter: { relevans: $relevans }) {
      content {
        id
        title
        etterlevelseNummer
        irrelevansFor {
          code
          shortName
        }
      }
    }
  }
`

export const EtterlevelseDokumentasjonFilterTable = (props: { emptyText?: string }) => {
  const {data, loading} = useQuery<{ etterlevelseDokumentasjon: PageResponse<EtterlevelseDokumentasjon> }>(query)

  return loading && !data ? (
    <Spinner size={theme.sizing.scale2400}/>
  ) : (
    <Table
      data={data!.etterlevelseDokumentasjon.content}
      emptyText={props.emptyText || 'etterlevelseDokumentasjoner'}
      headers={[
        {title: 'Etterlevelsenummer', column: 'etterlevelseNummer', small: true},
        {title: 'Tittel', column: 'title'},
        {title: 'Irrelevant for', column: 'irrelevansFor'}
      ]}
      config={{
        initialSortColumn: 'etterlevelseNummer',
        useDefaultStringCompare: true,
        sorting: {
          title: (a, b) => a.title.localeCompare(b.title),
          etterlevelseNummer: (a, b) => a.etterlevelseNummer - b.etterlevelseNummer,
          irrelevansFor: (a, b) => a.irrelevansFor.length - b.irrelevansFor.length
        },
      }}
      render={(state) => {
        return state.data.map((etterlevelseDokumentasjon, i) => {
          return (
            <Row key={i}>
              <Cell small>E{etterlevelseDokumentasjon.etterlevelseNummer}</Cell>
              <Cell>
                <RouteLink href={`/dokumentasjon/${etterlevelseDokumentasjon.id}`}>{etterlevelseDokumentasjon.title}</RouteLink>
              </Cell>
              <Cell>
                <DotTags list={ListName.RELEVANS} codes={etterlevelseDokumentasjon.irrelevansFor} linkCodelist/>
              </Cell>
            </Row>
          )
        })
      }}
    />
  )
}
