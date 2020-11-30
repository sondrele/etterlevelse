import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import {Paragraph2} from 'baseui/typography'
import remarkGfm from 'remark-gfm'

/**
 * singleWord true remove paragraph wrapper for content
 */
export const Markdown = (props: {source?: string, escapeHtml?: boolean, noMargin?: boolean, verbatim?: boolean}) => {
  const renderers = {
    paragraph: (parProps: any) => props.noMargin ? <React.Fragment {...parProps}/> : <Paragraph2 {...parProps}/>
  }
  return <ReactMarkdown source={props.source || ''}
                        escapeHtml={props.escapeHtml}
                        linkTarget='_blank'
                        renderers={renderers}
                        plugins={[remarkGfm]}
  />
}
