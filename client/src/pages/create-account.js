import {
    Box,
    Heading
} from 'grommet'
import React from 'react'
import { CreateAccountStep, NextStepsStep, VerifyGrantStep } from '../components/CreateAccount'
import { ProgressBar } from '../components/ProgressBar'



let CreateAccountPage = ({stepNum, ORCID}) => {
    const steps = ['Create Account', 'Verify Grant Information', 'Next Steps']
    const [currentIndex, setCurrentIndex] = React.useState(stepNum)
    const decrement = () => setCurrentIndex(Math.max(-1, currentIndex - 1))
    const increment = () =>
      setCurrentIndex(Math.min(steps.length - 1, currentIndex + 1))

    return(
        <Box width={{min:'500px', max:'800px'}}>
            <Heading serif border='none' level='4'>
                Create an Account
            </Heading>
            <Box width={{min:'400px', max:'700px'}}>
                <Box pad="medium">
                    <ProgressBar steps={steps} index={currentIndex} />
                </Box>
                {currentIndex === 0 && (
                <CreateAccountStep ORCID={ORCID}/>
                )}
                {currentIndex === 1 && (
                <VerifyGrantStep ORCID={ORCID}/>
                )}
                {currentIndex === 2 && (
                <NextStepsStep ORCID={ORCID}/>
                )}
            </Box>
        </Box>
    )
}

const CreateAccount = () => (
  <div className="container">
    <main>
        <CreateAccountPage ORCID='XXXX-XXXX-XXXX' stepNum={0}/>
    </main>
  </div>
)

export default CreateAccount
