import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonGroup, Button, H2, H3 } from '@blueprintjs/core'
import { Wrapper } from '../../Atoms/Wrapper'
import { IAuditSettings } from '../../../types'
import { apiDownload } from '../../utilities'
import CreateAuditBoards from './CreateAuditBoards'
import RoundProgress from './RoundProgress'
import {
  downloadPlaceholders,
  downloadLabels,
  downloadAuditBoardCredentials,
} from './generateSheets'
import { IAuditBoard } from '../useAuditBoards'
import QRs from './QRs'
import RoundDataEntry from './RoundDataEntry'
import useAuditSettingsJurisdictionAdmin from './useAuditSettingsJurisdictionAdmin'
import BatchRoundDataEntry from './BatchRoundDataEntry'
import { useAuthDataContext } from '../../UserContext'
import useBallots, { IBallot } from './useBallots'
import { IRound } from '../useRoundsAuditAdmin'

const PaddedWrapper = styled(Wrapper)`
  flex-direction: column;
  align-items: flex-start;
  width: 510px;
  padding: 30px 0;
`

const SpacedDiv = styled.div`
  margin-bottom: 30px;
`

const StrongP = styled.p`
  font-weight: 500;
`

export interface IRoundManagementProps {
  round: IRound
  auditBoards: IAuditBoard[]
  createAuditBoards: (auditBoards: { name: string }[]) => Promise<boolean>
}

const RoundManagement = ({
  round,
  auditBoards,
  createAuditBoards,
}: IRoundManagementProps) => {
  const { electionId, jurisdictionId } = useParams<{
    electionId: string
    jurisdictionId: string
  }>()
  const { meta } = useAuthDataContext()
  const ballots = useBallots(electionId, jurisdictionId, round.id, auditBoards)
  const auditSettings = useAuditSettingsJurisdictionAdmin(
    electionId,
    jurisdictionId
  )

  if (!meta || !ballots || !auditSettings) return null // Still loading

  const jurisdiction = meta.jurisdictions.find(j => j.id === jurisdictionId)!
  const { roundNum } = round

  if (round.isAuditComplete) {
    return (
      <PaddedWrapper>
        <H2>Congratulations! Your Risk-Limiting Audit is now complete.</H2>
      </PaddedWrapper>
    )
  }

  if (auditBoards.length === 0) {
    return (
      <PaddedWrapper>
        <H3>Round {roundNum} Audit Board Setup</H3>
        <StrongP>
          {ballots.length} ballots to audit in Round {roundNum}
        </StrongP>
        <CreateAuditBoards createAuditBoards={createAuditBoards} />
      </PaddedWrapper>
    )
  }

  return (
    <PaddedWrapper>
      <H3>Round {roundNum} Data Entry</H3>
      <SpacedDiv>
        <StrongP>
          {ballots.length} ballots to audit in Round {roundNum}
        </StrongP>
        <JAFileDownloadButtons
          electionId={electionId}
          jurisdictionId={jurisdictionId}
          jurisdictionName={jurisdiction.name}
          round={round}
          auditSettings={auditSettings}
          ballots={ballots}
          auditBoards={auditBoards}
        />
      </SpacedDiv>
      <SpacedDiv>
        {auditSettings.auditType === 'BATCH_COMPARISON' ? (
          <BatchRoundDataEntry round={round} />
        ) : auditSettings.online ? (
          <RoundProgress auditBoards={auditBoards} />
        ) : (
          <RoundDataEntry round={round} />
        )}
      </SpacedDiv>
    </PaddedWrapper>
  )
}

export interface IJAFileDownloadButtonsProps {
  electionId: string
  jurisdictionId: string
  jurisdictionName: string
  round: IRound
  auditSettings: IAuditSettings
  ballots: IBallot[]
  auditBoards: IAuditBoard[]
}

export const JAFileDownloadButtons = ({
  electionId,
  jurisdictionId,
  jurisdictionName,
  round,
  auditSettings,
  ballots,
  auditBoards,
}: IJAFileDownloadButtonsProps) => (
  <ButtonGroup vertical alignText="left">
    <Button
      icon="th"
      onClick={
        /* istanbul ignore next */ // tested in generateSheets.test.tsx
        () =>
          apiDownload(
            `/election/${electionId}/jurisdiction/${jurisdictionId}/round/${
              round.id
            }/${
              auditSettings.auditType === 'BALLOT_POLLING'
                ? 'ballots'
                : 'batches'
            }/retrieval-list`
          )
      }
    >
      Download Aggregated{' '}
      {auditSettings.auditType === 'BALLOT_POLLING' ? 'Ballot' : 'Batch'}{' '}
      Retrieval List
    </Button>
    <Button
      icon="document"
      onClick={
        /* istanbul ignore next */ // tested in generateSheets.test.tsx
        () =>
          downloadPlaceholders(
            round.roundNum,
            ballots,
            jurisdictionName,
            auditSettings.auditName
          )
      }
    >
      Download Placeholder Sheets
    </Button>
    <Button
      icon="label"
      onClick={
        /* istanbul ignore next */ // tested in generateSheets.test.tsx
        () =>
          downloadLabels(
            round.roundNum,
            ballots,
            jurisdictionName,
            auditSettings.auditName
          )
      }
    >
      Download Ballot Labels
    </Button>
    {auditSettings.online && (
      <>
        <Button
          icon="key"
          onClick={
            /* istanbul ignore next */ // tested in generateSheets.test.tsx
            () =>
              downloadAuditBoardCredentials(
                auditBoards,
                jurisdictionName,
                auditSettings.auditName
              )
          }
        >
          Download Audit Board Credentials
        </Button>
        <QRs passphrases={auditBoards.map(b => b.passphrase)} />
      </>
    )}
  </ButtonGroup>
)

export default RoundManagement
