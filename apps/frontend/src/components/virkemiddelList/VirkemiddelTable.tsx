import { Block } from 'baseui/block'
import React, { useState } from 'react'
import moment from 'moment'
import { Virkemiddel } from '../../constants'
import { SkeletonPanel } from '../common/LoadingSkeleton'
import { Cell, Row, Table } from '../common/Table'
import Button from '../common/Button'
import { SIZE as ButtonSize } from 'baseui/button/constants'
import { KIND } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ColumnCompares } from '../../util/hooks'
import { EditVirkemiddelModal } from '../virkemiddel/edit/EditVirkemiddelModal'
import DeleteVirkemiddeltModal from '../virkemiddel/edit/DeleteVirkemiddelModal'
import { LovView } from '../Lov'

type VirkmiddelTableProps = {
  virkemidler: Virkemiddel[]
  loading: boolean
  refetchData: () => void
}

const virkemiddelSorting: ColumnCompares<Virkemiddel> = {
  navn: (a, b) => (a.navn || '').localeCompare(b.navn || ''),
  virkemiddelType: (a, b) => (a.virkemiddelType?.shortName || '').localeCompare(b.virkemiddelType?.shortName || ''),
  changeStamp: (a, b) => (a.changeStamp.lastModifiedDate || '').localeCompare(b.changeStamp.lastModifiedDate || ''),
}

export const VirkemiddelTable = ({ virkemidler, loading, refetchData }: VirkmiddelTableProps) => {
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<Virkemiddel>()
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  if (loading) return <SkeletonPanel count={5} />
  return (
    <>
      <Table
        emptyText="koder"
        data={virkemidler}
        config={{
          useDefaultStringCompare: true,
          initialSortColumn: 'navn',
          sorting: virkemiddelSorting,
          pageSizes: [5, 10, 20, 50, 100],
          defaultPageSize: 20,
        }}
        headers={[
          { title: 'Navn', column: 'navn' },
          { title: 'Virkemiddeltype', column: 'virkemiddelType' },
          { title: 'Regelverk', column: 'regelverk' },
          { title: 'Siste endret', column: 'changeStamp' },
          { title: '', small: true },
        ]}
        render={(table) =>
          table.data.slice((table.page - 1) * table.limit, (table.page - 1) * table.limit + table.limit).map((virkemiddel, index) => (
            <Row key={index}>
              <Cell $style={{ wordBreak: 'break-word' }}>{virkemiddel.navn}</Cell>
              <Cell>
                <Block display="flex" flexDirection="column" width="100%">
                  <Block>{virkemiddel.virkemiddelType && virkemiddel.virkemiddelType.shortName}</Block>
                </Block>
              </Cell>
              <Cell>
                <Block>
                  {virkemiddel.regelverk.map((r, i) => {
                    return (
                      <Block key={r + '_' + i} marginBottom={i === virkemiddel.regelverk.length - 1 ? undefined : '8px'}>
                        <LovView regelverk={r} />
                      </Block>
                    )
                  })}
                </Block>
              </Cell>
              <Cell>{moment(virkemiddel.changeStamp.lastModifiedDate).format('ll')}</Cell>
              <Cell small>
                <Block display="flex" justifyContent="flex-end" width="100%">
                  <Button
                    tooltip={'Rediger'}
                    size={ButtonSize.compact}
                    kind={KIND.tertiary}
                    onClick={() => {
                      setSelectedVirkemiddel(virkemiddel)
                      setIsEditModalOpen(true)
                    }}
                    label={'Rediger'}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    tooltip={'Slett'}
                    size={ButtonSize.compact}
                    kind={KIND.tertiary}
                    onClick={() => {
                      setSelectedVirkemiddel(virkemiddel)
                      setIsDeleteModalOpen(true)
                    }}
                    label={'Slett'}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Block>
              </Cell>
            </Row>
          ))
        }
      />
      <EditVirkemiddelModal isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} virkemiddel={selectedVirkemiddel} isEdit={true} refetchData={refetchData} />
      <DeleteVirkemiddeltModal isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} virkemiddel={selectedVirkemiddel} refetchData={refetchData} />
    </>
  )
}
