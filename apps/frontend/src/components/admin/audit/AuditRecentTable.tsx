import { useEffect, useState } from 'react'
import moment from 'moment'
import { AuditButton } from './AuditButton'
import { AuditActionIcon } from './AuditComponents'
import { emptyPage, PageResponse } from '../../../constants'
import { AuditItem, ObjectType } from './AuditTypes'
import { intl } from '../../../util/intl/intl'
import { getAudits } from '../../../api/AuditApi'
import * as _ from 'lodash'
import { JsonView } from 'react-json-view-lite'
import { ampli } from '../../../services/Amplitude'
import {BodyShort, Button, Heading, Label, Modal, Pagination, Select, Spacer, Table, Tooltip} from '@navikt/ds-react'

const CodeView = ({ audit }: { audit: AuditItem }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <Button key={audit.id} onClick={() => setModalOpen(!modalOpen)} variant="tertiary">
        Vis data
      </Button>
      <Modal
        key={audit.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-h-[75%] overflow-y-scroll"
      >
        <Modal.Header>Data visning</Modal.Header>
        <Modal.Body>
          <JsonView data={audit.data} />
        </Modal.Body>
      </Modal>
    </div>
  )
}

export const AuditRecentTable = (props: { show: boolean; tableType?: ObjectType }) => {
  const [audits, setAudits] = useState<PageResponse<AuditItem>>(emptyPage)
  const [limit, setLimit] = useState(20)
  const [table, setTable] = useState<ObjectType | undefined>(props.tableType)
  const [page, setPage] = useState(1)

  useEffect(() => {
    ; (async () => {
      props.show && setAudits(await getAudits(page - 1, limit, table))
    })()
  }, [page, limit, props.show, table])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > audits.pages) {
      return
    }
    setPage(nextPage)
  }

  useEffect(() => {
    const nextPageNum = Math.ceil(audits.totalElements / limit)
    if (audits.totalElements && nextPageNum < page) {
      setPage(nextPageNum)
    }
  }, [limit, audits.totalElements])

  if (!props.show) {
    return null
  }

  const tableOptions = Object.keys(ObjectType).map((ot) => ({ id: ot, label: ot }))

  ampli.logEvent('sidevisning', { side: 'Varsel side for admin', sidetittel: 'Log side for varslinger' })

  return (
    <div>
      <div className="flex justify-between my-4">
        <Heading size="small" level="2">{intl.lastChanges}</Heading>
        {!props.tableType && (
          <div className="w-72 flex justify-between items-center">
            <Label className="mr-2">
              {intl.table}:
            </Label>
            <Select
              label="Velg type for versjonering"
              hideLabel
              onChange={(e) => {
                if (e.target.value === 'Codelist') {
                  setTable(e.target.value.toUpperCase() as ObjectType)
                } else {
                  setTable(e.target.value as ObjectType)
                }
              }}
            >
              <option value="">Velg type for versjonering</option>
              {tableOptions.map((to, i) => <option key={i + '_' + to.label} value={to.id}>{to.label}</option>)}
            </Select>
          </div>
        )}
      </div>

      <Table size="large" zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader className="w-[13%]">{intl.time}</Table.ColumnHeader>
            <Table.ColumnHeader className="w-[17%]">{intl.action}</Table.ColumnHeader>
            <Table.ColumnHeader>{intl.id}</Table.ColumnHeader>
            <Table.ColumnHeader>{intl.user}</Table.ColumnHeader>
            <Table.ColumnHeader>Endring</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {audits.content.map((audit: AuditItem, index) => {
            const length = window.innerWidth > 1000 ? (window.innerWidth > 1200 ? 40 : 30) : 20
            const rowNum = audits.pageNumber * audits.pageSize + index + 1
            return (
              <Table.Row key={audit.id}>
                <Table.HeaderCell className="w-[13%] text-end" scope="row">
                  <div className="flex">
                    <div className="mr-2">
                      {rowNum}
                    </div>
                    <AuditButton variant="tertiary" id={audit.tableId} auditId={audit.id}>
                      <Tooltip content={audit.time} placement="top">
                        <div>
                          {moment(audit.time).fromNow()}
                        </div>
                      </Tooltip>
                    </AuditButton>
                  </div>
                </Table.HeaderCell>
                <Table.DataCell className="w-[17%]">
                  <div className="flex">
                    <AuditActionIcon action={audit.action} /> {audit.table}
                  </div>
                </Table.DataCell>
                <Table.DataCell>
                  <Tooltip content={audit.tableId} placement="top">
                    <div>{_.truncate(audit.tableId, { length })}</div>
                  </Tooltip>
                </Table.DataCell>
                <Table.DataCell>
                  {audit.user}
                </Table.DataCell>
                <Table.DataCell>
                    <CodeView audit={audit}/>
                </Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <div className="flex w-full justify-center items-center mt-3">
        <Select
          label="Antall rader:"
          value={limit}
          onChange={(e) => {
            setLimit((parseInt(e.target.value)))
          }}
          size="small"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>
        <Spacer />
        <div>
          <Pagination
            page={page}
            onPageChange={(page) => handlePageChange(page)}
            count={audits.pages}
            prevNextTexts
            size="small"
          />
        </div>
        <Spacer />
        <BodyShort>
          Totalt antall rader: {audits.totalElements}
        </BodyShort>
      </div>
    </div >
  )
}

