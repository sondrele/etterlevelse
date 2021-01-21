import {KravGraphQL} from '../constants'
import {gql} from 'graphql.macro'
import {useQuery} from '@apollo/client'
import {DocumentNode} from 'graphql'

const kravtableQuery = gql`query getKravByFilter ($relevans: [String!], $nummer: Int, $behandlingId: String, $underavdeling: String) {
  krav(filter: {relevans: $relevans, nummer: $nummer, behandlingId: $behandlingId, underavdeling: $underavdeling}) {
    id
    navn
    kravNummer
    kravVersjon
    status
    avdeling {
      code
      shortName
    }
    underavdeling {
      code
      shortName
    }
    etterlevelser {
      id
    }
  }
}`

export type KravFilters = {relevans?: string[], nummer?: number, behandlingId?: string, underavdeling?: string}

export const useKravFilter = (variables: KravFilters, query?: DocumentNode) => {
  const {data, loading} = useQuery<{krav: KravGraphQL[]}>(query || kravtableQuery, {
    variables,
    fetchPolicy: 'cache-and-network'
  })
  return {data: data?.krav, loading}
}
