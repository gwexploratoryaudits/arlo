import React, { useState, useEffect, useCallback } from 'react'
import EstimateSampleSize from './EstimateSampleSize'
import SelectBallotsToAudit from './SelectBallotsToAudit'
import CalculateRiskMeasurement from './CalculateRiskMeasurement'
import { api } from '../utilities'
import { Audit, CreateAuditParams } from '../../types'
import ResetButton from './ResetButton'
import Wrapper from '../Atoms/Wrapper'

const initialData: Audit = {
  name: '',
  riskLimit: '',
  randomSeed: '',
  contests: [],
  jurisdictions: [],
  rounds: [],
}

interface Props {
  match: {
    params: CreateAuditParams
  }
}

const AuditForms: React.FC<Props> = ({
  match: {
    params: { electionId },
  },
}: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [audit, setAudit] = useState(initialData)

  const getStatus = useCallback(async (): Promise<Audit> => {
    const audit: Audit = await api('/audit/status', { electionId })
    return audit
  }, [electionId])

  const updateAudit = useCallback(async () => {
    const audit = await getStatus()
    setIsLoading(true)
    setAudit(audit)
    setIsLoading(false)
  }, [getStatus])

  useEffect(() => {
    updateAudit()
  }, [updateAudit])

  const showSelectBallotsToAudit =
    !!audit.contests.length &&
    audit.rounds[0].contests.every(c => !!c.sampleSizeOptions)
  const showCalculateRiskMeasurement =
    !!audit.rounds.length && audit.rounds[0].contests.every(c => !!c.sampleSize)

  return (
    <Wrapper>
      <ResetButton
        electionId={electionId}
        disabled={!audit.contests.length}
        updateAudit={updateAudit}
      />

      <EstimateSampleSize
        audit={audit}
        isLoading={isLoading && !showSelectBallotsToAudit}
        setIsLoading={setIsLoading}
        updateAudit={updateAudit}
        getStatus={getStatus}
        electionId={electionId}
      />

      {showSelectBallotsToAudit && (
        <SelectBallotsToAudit
          audit={audit}
          isLoading={isLoading && !showCalculateRiskMeasurement}
          setIsLoading={setIsLoading}
          updateAudit={updateAudit}
          getStatus={getStatus}
          electionId={electionId}
        />
      )}

      {showCalculateRiskMeasurement && (
        <CalculateRiskMeasurement
          audit={audit}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          updateAudit={updateAudit}
          getStatus={getStatus}
          electionId={electionId}
        />
      )}
    </Wrapper>
  )
}

export default AuditForms
