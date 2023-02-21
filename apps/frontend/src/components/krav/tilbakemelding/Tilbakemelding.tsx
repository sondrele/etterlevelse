import { Krav, Tilbakemelding, TilbakemeldingRolle, TilbakemeldingType } from '../../../constants'
import { tilbakemeldingNewMelding, TilbakemeldingNewMeldingRequest, tilbakemeldingslettMelding, useTilbakemeldinger } from '../../../api/TilbakemeldingApi'
import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { theme } from '../../../util'
import { HeadingMedium, HeadingXLarge, LabelSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import Button from '../../common/Button'
import { faChevronDown, faChevronUp, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { borderRadius } from '../../common/Style'
import { Spinner } from '../../common/Spinner'
import moment from 'moment'
import { user } from '../../../services/User'
import { Notification } from 'baseui/notification'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryParam, useRefs } from '../../../util/hooks'
import { ettlevColors } from '../../../util/theme'
import { mailboxPoppingIcon } from '../../Images'
import { InfoBlock } from '../../common/InfoBlock'
import { Portrait } from '../../common/Portrait'
import { PersonName } from '../../common/PersonName'
import CustomizedTextarea from '../../common/CustomizedTextarea'
import * as _ from 'lodash'
import { LoginButton } from '../../Header'
import { CustomizedAccordion, CustomizedPanel } from '../../common/CustomizedAccordion'
import StatusView from '../../common/StatusTag'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ResponseMelding from './ResponseMelding'
import EndretInfo from './edit/EndreInfo'
import MeldingKnapper from './edit/MeldingKnapper'
import NyTilbakemeldingModal from './edit/NyTilbakemeldingModal'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'

const DEFAULT_COUNT_SIZE = 5

export const Tilbakemeldinger = ({ krav, hasKravExpired }: { krav: Krav; hasKravExpired: boolean }) => {
  const [tilbakemeldinger, loading, add, replace, remove] = useTilbakemeldinger(krav.kravNummer, krav.kravVersjon)
  const [focusNr, setFocusNr] = useState<string | undefined>(useQueryParam('tilbakemeldingId'))
  const [addTilbakemelding, setAddTilbakemelding] = useState(false)
  const [count, setCount] = useState(DEFAULT_COUNT_SIZE)
  const location = useLocation()
  const navigate = useNavigate()

  const refs = useRefs<HTMLDivElement>(tilbakemeldinger.map((t) => t.id))
  useEffect(() => {
    !loading && focusNr && setTimeout(() => refs[focusNr]?.current?.scrollIntoView(), 100)
  }, [loading])

  const setFocus = (id: string) => {
    setFocusNr(id)
    if (location.pathname.split('/')[1] === 'krav') navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}?tilbakemeldingId=${id}`, { replace: true })
  }

  return (
    <Block width="100%">
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !!tilbakemeldinger.length && (
        <Block display={'flex'} flexDirection={'column'}>
          <CustomizedAccordion>
            {tilbakemeldinger.slice(0, count).map((t) => {
              const focused = focusNr === t.id
              const { ubesvart, ubesvartOgKraveier, melderOrKraveier, sistMelding } = tilbakeMeldingStatus(t)

              const statusView = (icon: React.ReactNode) => (
                <Block>
                  <Block width="100%" maxWidth="70px">
                    <Block display="flex" flexDirection="column" alignItems="flex-end">
                      <StatusView
                        status={ubesvart ? 'Ubesvart' : 'Besvart'}
                        statusDisplay={
                          ubesvart
                            ? { background: ettlevColors.white, border: ettlevColors.green100 }
                            : {
                                background: ettlevColors.green50,
                                border: ettlevColors.green100,
                              }
                        }
                        overrides={{
                          Root: {
                            style: {
                              ...borderRadius('20px'),
                            },
                          },
                        }}
                      />
                    </Block>
                    <Block width="50px" marginLeft="20px" marginTop="8px" display="flex" flexDirection="column" alignItems="center">
                      {icon}
                    </Block>
                  </Block>
                </Block>
              )

              return (
                <CustomizedPanel
                  onClick={() => setFocus(focused ? '' : t.id)}
                  expanded={t.id === focusNr}
                  noUnderLine
                  key={t.id}
                  overrides={{
                    Header: {
                      style: {
                        display: 'flex',
                        alignItems: 'flex-start',
                      },
                    },
                    Content: {
                      style: {
                        backgroundColor: ettlevColors.white,
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingBottom: '8px',
                      },
                    },
                  }}
                  toggleIcon={{
                    expanded: statusView(<FontAwesomeIcon icon={faChevronUp} />),
                    unexpanded: statusView(<FontAwesomeIcon icon={faChevronDown} />),
                  }}
                  title={
                    <Block display="flex" width="100%" padding={'8px'}>
                      <Portrait ident={t.melderIdent} />
                      <Block display="flex" flexDirection="column" marginLeft={theme.sizing.scale400} width="100%">
                        <Block display="flex" width="100%">
                          <Block display="flex" alignItems="center" width="100%">
                            <LabelSmall>
                              <PersonName ident={t.melderIdent}/>
                            </LabelSmall>
                            <ParagraphSmall marginTop={0} marginBottom={0} marginLeft="24px" $style={{ fontSize: '14px' }}>
                              Sendt: {moment(t.meldinger[0].tid).format('lll')}
                            </ParagraphSmall>
                          </Block>
                        </Block>
                        <Block display="flex" width="100%">
                          <ParagraphMedium marginBottom={0} marginRight="29px" marginTop="4px">
                            {focused ? t.meldinger[0].innhold : _.truncate(t.meldinger[0].innhold, { length: 80, separator: /[.,] +/ })}
                          </ParagraphMedium>
                        </Block>
                      </Block>
                    </Block>
                  }
                >
                  <Block display="flex" width="100%" alignItems="center" marginTop="17px">
                    {focused && t.meldinger.length === 1 && <MeldingKnapper marginLeft melding={t.meldinger[0]} tilbakemeldingId={t.id} oppdater={replace} remove={remove} />}

                    {focused && <EndretInfo melding={t.meldinger[0]} />}
                  </Block>

                  {/* meldingsliste */}
                  {focused && (
                    <Block display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale600}>
                      {t.meldinger.slice(1).map((m) => (
                        <ResponseMelding key={m.meldingNr} m={m} tilbakemelding={t} oppdater={replace} remove={remove} />
                      ))}
                    </Block>
                  )}

                  {/* knapprad bunn */}
                  {melderOrKraveier && user.canWrite() && focused && (
                    <TilbakemeldingSvar
                      tilbakemelding={t}
                      setFocusNummer={setFocusNr}
                      ubesvartOgKraveier={ubesvartOgKraveier}
                      close={(t) => {
                        t && replace(t)
                      }}
                      remove={remove}
                    />
                  )}
                </CustomizedPanel>
              )
            })}
          </CustomizedAccordion>

          {tilbakemeldinger.length > DEFAULT_COUNT_SIZE && (
            <Block $style={{ alignSelf: 'flex-end' }} marginTop={theme.sizing.scale400}>
              <Button kind="tertiary" size="compact" icon={faPlus} onClick={() => setCount(count + DEFAULT_COUNT_SIZE)} disabled={tilbakemeldinger.length <= count}>
                Last flere
              </Button>
            </Block>
          )}
        </Block>
      )}

      {!loading && !tilbakemeldinger.length && (
        <InfoBlock icon={mailboxPoppingIcon} alt={'Åpen mailboks icon'} text={'Det har ikke kommet inn noen tilbakemeldinger'} color={ettlevColors.red50} />
      )}

      {!hasKravExpired && (
        <>
          <Block marginTop={theme.sizing.scale1000}>
            <HeadingXLarge>Spørsmål til kraveier</HeadingXLarge>
            {user.isLoggedIn() ? (
              <ParagraphMedium maxWidth={'600px'}>
                Her kan du stille kraveier et spørsmål dersom det er uklarheter vedrørende hvordan kravet skal forstås. Spørsmål og svar fra kraveier blir synlig for alle på denne
                siden.
              </ParagraphMedium>
            ) : (
              <ParagraphMedium>Du må være innlogget for å stille kraveier et spørsmål, og for å se tidligere spørsmål og svar.</ParagraphMedium>
            )}

            {user.canWrite() && (
              <Button kind={'primary'} size="compact" onClick={() => setAddTilbakemelding(true)}>
                Still et spørsmål
              </Button>
            )}
            {!user.isLoggedIn() && <LoginButton />}
          </Block>

          <NyTilbakemeldingModal
            krav={krav}
            open={addTilbakemelding}
            close={(t) => {
              t && add(t)
              setAddTilbakemelding(false)
            }}
          />
        </>
      )}

      <Block height="300px" />
    </Block>
  )
}

export const tilbakeMeldingStatus = (tilbakemelding: Tilbakemelding) => {
  const sistMelding = tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1]
  const ubesvart = sistMelding.rolle === TilbakemeldingRolle.MELDER
  const melder = user.getIdent() === tilbakemelding.melderIdent
  const rolle = tilbakemelding?.melderIdent === user.getIdent() ? TilbakemeldingRolle.MELDER : TilbakemeldingRolle.KRAVEIER
  const melderOrKraveier = melder || user.isKraveier()
  const ubesvartOgKraveier = ubesvart && user.isKraveier()
  const kanSkrive = (ubesvart && rolle === TilbakemeldingRolle.KRAVEIER) || (!ubesvart && rolle === TilbakemeldingRolle.MELDER)
  return { ubesvart, ubesvartOgKraveier, rolle, melder, melderOrKraveier, sistMelding, kanSkrive }
}

type TilbakemeldingSvarProps = {
  tilbakemelding: Tilbakemelding
  setFocusNummer: (fn: string | undefined) => void
  close: (t: Tilbakemelding) => void
  ubesvartOgKraveier: boolean
  remove: (t: Tilbakemelding) => void
}

const TilbakemeldingSvar = ({ tilbakemelding, setFocusNummer, close, ubesvartOgKraveier, remove }: TilbakemeldingSvarProps) => {
  const melderInfo = tilbakeMeldingStatus(tilbakemelding)
  const [response, setResponse] = useState('')
  const [replyRole, z] = useState(melderInfo.rolle)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const submit = () => {
    if (response) {
      setFocusNummer(tilbakemelding.id)

      const req: TilbakemeldingNewMeldingRequest = {
        tilbakemeldingId: tilbakemelding.id,
        rolle: replyRole,
        melding: response,
      }

      setLoading(true)

      tilbakemeldingNewMelding(req)
        .then((t) => {
          close(t)
          setLoading(false)
          setResponse('')
        })
        .catch((e) => {
          setError(e.error)
          setLoading(false)
        })
    }
  }

  return (
    <Block width={'100%'}>
      {melderInfo.kanSkrive && (
        <HeadingMedium color={ettlevColors.green800} marginBottom="9px" marginTop="34px">
          {ubesvartOgKraveier ? 'Besvar' : 'Ny melding'}
        </HeadingMedium>
      )}
      <Block display="flex" width="100%" alignItems="flex-end" justifyContent="center">
        {melderInfo.kanSkrive && (
          <Block display="flex" width="100%">
            <CustomizedTextarea rows={6} onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)} value={response} disabled={loading} />
          </Block>
        )}

        <Block display="flex" justifyContent="flex-end" flex="1">
          <Block marginBottom="2px" width="188px">
            <Block display="flex" justifyContent="space-between" flexDirection="column" marginLeft={theme.sizing.scale400}>
              {user.isAdmin() && (
                <Block marginBottom={theme.sizing.scale400} display="flex" flexDirection="column">
                  <Button size="compact" icon={faTrashAlt} kind={'secondary'} onClick={() => setDeleteModal(true)}>
                    Slett hele
                  </Button>
                </Block>
              )}
              {/* {user.isKraveier() && !loading && melderInfo.melder && (
              <Block marginBottom={theme.sizing.scale400} display="flex" flexDirection="column">
                <Button
                  size="compact"
                  icon={faSync}
                  kind={'secondary'}
                  onClick={() => setReplyRole(replyRole === TilbakemeldingRolle.MELDER ? TilbakemeldingRolle.KRAVEIER : TilbakemeldingRolle.MELDER)}
                >
                  Jeg er {rolleText(replyRole)}
                </Button>
              </Block>
            )} */}
              {loading && (
                <Block alignSelf="center" marginBottom={theme.sizing.scale400}>
                  <Spinner size={theme.sizing.scale800} />
                </Block>
              )}

              {melderInfo.kanSkrive && (
                <Button kind="primary" size={'compact'} disabled={!response} onClick={submit}>
                  {ubesvartOgKraveier ? 'Svar' : 'Send'}
                </Button>
              )}
            </Block>
          </Block>
        </Block>
        {error && (
          <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
            {error}
          </Notification>
        )}

        {deleteModal && (
          <Modal closeable={false} isOpen onClose={() => setDeleteModal(false)}>
            <ModalHeader>Er du sikker på at du vil slette hele meldingen?</ModalHeader>
            <ModalBody>
              <ParagraphSmall>
                {moment(tilbakemelding.meldinger[0].tid).format('ll')} <PersonName ident={tilbakemelding.meldinger[0].fraIdent} />
              </ParagraphSmall>
              <ParagraphMedium>{tilbakemelding.meldinger[0].innhold}</ParagraphMedium>
            </ModalBody>
            <ModalFooter>
              <Button kind={'secondary'} size={'compact'} onClick={() => setDeleteModal(false)}>
                Avbryt
              </Button>
              <Button
                kind={'primary'}
                size={'compact'}
                marginLeft
                onClick={() =>
                  tilbakemeldingslettMelding({ tilbakemeldingId: tilbakemelding.id, meldingNr: 1 }).then((t) => {
                    remove({ ...t, meldinger: [] })
                    setDeleteModal(false)
                  })
                }
              >
                Slett
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </Block>
    </Block>
  )
}

const rolleText = (rolle: TilbakemeldingRolle) => {
  switch (rolle) {
    case TilbakemeldingRolle.KRAVEIER:
      return 'kraveier'
    case TilbakemeldingRolle.MELDER:
      return 'melder'
  }
}
const typeText = (type: TilbakemeldingType) => {
  switch (type) {
    case TilbakemeldingType.GOD:
      return 'God kravbeskrivelse'
    case TilbakemeldingType.UKLAR:
      return 'Uklar kravbeskrivelse'
    case TilbakemeldingType.ANNET:
      return 'Annet'
  }
}
