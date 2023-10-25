import React, { useEffect, useState } from 'react'
import { intl } from '../../../util/intl/intl'
import axios from 'axios'
import { env } from '../../../util/env'
import { PageResponse } from '../../../constants'
import moment from 'moment'
import { Markdown } from '../../common/Markdown'
import { Helmet } from 'react-helmet'
import {BodyShort, Box, Heading, Pagination, Select, Spacer} from "@navikt/ds-react";

interface MailLog {
  time: string
  to: string
  subject: string
  body: string
}

const getMailLog = async (start: number, count: number) => {
  return (await axios.get<PageResponse<MailLog>>(`${env.backendBaseUrl}/audit/maillog?pageNumber=${start}&pageSize=${count}`)).data
}

export const MailLogPage = () => {
  const [log, setLog] = useState<PageResponse<MailLog>>({ content: [], numberOfElements: 0, pageNumber: 0, pages: 0, pageSize: 1, totalElements: 0 })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => {
    getMailLog(page - 1, rowsPerPage).then(setLog)
  }, [page, rowsPerPage])

  return (
    <div className="w-full px-16" role="main">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Tilbakemeldings log</title>
      </Helmet>
      <Heading className="mt-4" size="large" spacing>{intl.mailLog}</Heading>
      {log?.content.map((l, i) => {
        let html = l.body
        const bodyIdx = l.body.indexOf('<body>')
        if (bodyIdx >= 0) {
          html = html.substring(l.body.indexOf('<body>') + 6)
          html = html.substring(0, html.lastIndexOf('</body>'))
        }
        // some odd bug in html parser didnt like newlines inside <ul>
        html = html.replace(/\n/g, '')
        const rowNum = log.pageNumber * log.pageSize + i + 1

        return (
          <div key={i} className="mb-6">
            <BodyShort>
              #{rowNum} Tid: {moment(l.time).format('lll')} Til: {l.to}
            </BodyShort>
            <BodyShort className="mb-3">
              Emne: {l.subject}
            </BodyShort>
            <Box className="px-2" borderWidth="2" borderColor="border-subtle" borderRadius="large" background="surface-default">
              <Markdown source={html} escapeHtml={false} />
            </Box>
          </div>
        )
      })}

        <div className="flex w-full justify-center items-center mt-3">
          <Select
            label="Antall rader:"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
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
              onClick={()=>{console.log("page" + page)}}
              page={page}
              onPageChange={setPage}
              count={Math.ceil(log.totalElements / rowsPerPage)}
              prevNextTexts
              size="small"
            />
          </div>
          <Spacer />
          <BodyShort>
            Totalt antall rader: {log.totalElements}
          </BodyShort>
        </div>
    </div>
  )
}
