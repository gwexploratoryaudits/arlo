import React from 'react'
import FormButtonBar from '../../../Atoms/Form/FormButtonBar'
import FormButton from '../../../Atoms/Form/FormButton'
import { ISidebarMenuItem } from '../../../Atoms/Sidebar'

interface IProps {
  locked: boolean
  prevStage: ISidebarMenuItem
}

const Review: React.FC<IProps> = ({ prevStage }: IProps) => {
  return (
    <div>
      <p>Review</p>
      <FormButtonBar>
        <FormButton onClick={prevStage.activate}>Back</FormButton>
      </FormButtonBar>
    </div>
  )
}

export default Review
