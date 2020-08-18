import React from 'react'
import { Box, Button, Paragraph, Stack, Text } from 'grommet'
import Link from 'next/link'
import { HomepageCard } from '../components/HomepageCard'
import api from '../api'
import { useUser } from '../hooks/useUser'

export const Home = ({ authenticatedUser, token, redirectUrl }) => {
  useUser(authenticatedUser, token, redirectUrl)
  const heroOverlap = '140px'
  const [showSharing, setShowSharing] = React.useState(true)
  return (
    <>
      <Box width="fill" pad={{ bottom: heroOverlap }}>
        <Stack anchor="bottom">
          <Box width="fill" background="gradient" pad={{ bottom: '180px' }}>
            <Box width="xlarge" alignSelf="center">
              <Box alignSelf="center">
                <Text color="turteal-shade-40" size="50px">
                  Childhood Cancer Research Resources
                </Text>
              </Box>
              <Box align="center" direction="row" justify="between">
                <Box width={{ min: '320px', max: '540px' }}>
                  <Text color="turteal-shade-40" size="large">
                    Childhood Cancer Research Resources is a platform to enable
                    discovery and sharing of research resources such as
                    datasets, cell lines, PDX models, plasmids, protocols, and
                    more.
                  </Text>
                </Box>
                <Box pad="large">
                  <img alt="placeholder" src="/temp-hero.svg" />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            direction="row"
            gap="xxlarge"
            margin={{ bottom: `-${heroOverlap}` }}
          >
            <Box
              background="white"
              elevation="medium"
              pad="42px"
              align="start"
              width="366px"
            >
              <Text size="28px" margin={{ top: 'medium' }}>
                Add a Resource
              </Text>
              <Paragraph size="large" margin={{ top: 'small' }}>
                Add a resource to the growing repository of childhood cancer
                research resources.
              </Paragraph>
              <Link href="/resources">
                <Button
                  primary
                  label="Add Resource"
                  margin={{ top: 'medium', bottom: 'small' }}
                />
              </Link>
            </Box>
            <Box
              background="white"
              elevation="medium"
              pad="42px"
              align="start"
              width="366px"
            >
              <Text size="28px" margin={{ top: 'medium' }}>
                Discover Resources
              </Text>
              <Paragraph size="large" margin={{ top: 'small' }}>
                Search the portal for a variety of pediatric cancer focused
                resources.
              </Paragraph>
              <Link href="/search">
                <Button
                  primary
                  label="Search the portal"
                  margin={{ top: 'medium', buttom: 'small' }}
                />
              </Link>
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Box align="center" pad={{ top: 'xlarge' }}>
          <Text color="turteal-shade-40" size="50px">
            Reap the benefits of sharing
          </Text>
          <Box
            pad={{ top: 'xlarge' }}
            width="900px"
            align="start"
            justify="between"
            direction="row"
            gap="68px"
          >
            <HomepageCard
              size="large"
              label="More citations"
              imagePath="/cite.png"
              color="turteal-shade-40"
            >
              <Paragraph width="small">
                Researchers who have data in openly available repositories or
                deposit plasmids in AddGene are more cited.
              </Paragraph>
            </HomepageCard>
            <HomepageCard
              size="large"
              label="Accelerate Research"
              color="turteal-shade-40"
              imagePath="/accelerate.png"
            >
              <Paragraph>
                Spend less time recreating and managing resources and more time
                on your research.
              </Paragraph>
            </HomepageCard>
            <HomepageCard
              size="large"
              label="New Collaborations"
              color="turteal-shade-40"
              imagePath="/collaboration.png"
            >
              <Paragraph>
                Sharing can lead to new and exciting collaborations expanding
                your research.
              </Paragraph>
            </HomepageCard>
          </Box>
        </Box>
      </Box>
      <Box>
        <Box align="center" margin={{ top: 'xlarge' }} background="gradient">
          <Text size="50px">How does it work?</Text>
          <Box
            justifyContents="between"
            direction="row"
            gap="large"
            margin={{ vertical: 'large' }}
          >
            <Box
              background={showSharing ? 'brand' : null}
              round="large"
              align="center"
              pad={{ vertical: 'small', horizontal: 'large' }}
              onClick={() => setShowSharing(true)}
              focusIndicator={false}
            >
              <Text size="xlarge" color={!showSharing ? 'brand' : 'white'}>
                Sharing Resources
              </Text>
            </Box>
            <Box
              background={!showSharing ? 'brand' : null}
              round="large"
              align="center"
              pad={{ vertical: 'small', horizontal: 'large' }}
              onClick={() => setShowSharing(false)}
              focusIndicator={false}
            >
              <Text size="xlarge" color={showSharing ? 'brand' : 'white'}>
                Requesting Resources
              </Text>
            </Box>
          </Box>
          <Box>
            <Box width="xxlarge" pad={{ vertical: 'large' }}>
              {showSharing && (
                <>
                  <Text alignSelf="center" size="large">
                    Resources portal helps streamline your sharing process
                  </Text>
                  <Box direction="row" gap="60px" margin={{ top: 'xlarge' }}>
                    <HomepageCard
                      label="Add a Resource"
                      imagePath="/add-resoruce.svg"
                    >
                      <Paragraph>
                        You can import a resource from an existing repository,
                        like GEO, SRA, AddGene, ATCC, etc. or list a resource
                        with us.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard
                      label="Reuse Material Transfer Agreements (MTAs)"
                      imagePath="/mta.png"
                    >
                      <Paragraph>
                        Add a template MTA to your resources and avoid drafting
                        up MTAs over and over and over again.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard
                      label="Track Requests"
                      imagePath="/track-request.png"
                    >
                      <Paragraph>
                        No more shuffling through your inbox! Monitor requests
                        for all your resources in one place.
                      </Paragraph>
                    </HomepageCard>
                  </Box>
                  <Box direction="row" gap="80px" margin={{ top: 'xlarge' }}>
                    <HomepageCard
                      label="Sharing is a team effort"
                      imagePath="/team.png"
                    >
                      <Paragraph>
                        You can invite members of your lab to help you manage
                        and fulfill requests.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard
                      label="Track impack of your research"
                      imagePath="/impact.png"
                    >
                      <Paragraph>
                        The portal tracks your sharing history. This can be
                        shared with current and future funders to demonstrate
                        the impact of your research.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard
                      label="Cut Down on Grant Paperwork"
                      imagePath="/cut-paperwork.png"
                    >
                      <Paragraph>
                        The portal exports your resources and sharing history to
                        the ALSF grant reporting system to simplify your
                        reports.
                      </Paragraph>
                    </HomepageCard>
                  </Box>
                </>
              )}
              {!showSharing && (
                <>
                  <Text alignSelf="center" size="large">
                    The portal adds transparency and consistency for requesting
                    resources
                  </Text>
                  <Box direction="row" gap="100px" margin={{ top: 'xlarge' }}>
                    <HomepageCard
                      label="Discover Resources"
                      imagePath="/discover.png"
                    >
                      <Paragraph>
                        The portal allows you discover wide variety of resources
                        with ease.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard label="Templated MTAs" imagePath="/mta.png">
                      <Paragraph>
                        Skip months of Material Transfer Agreement (MTA)
                        negotiations. View the template MTA for resources before
                        you make a request.
                      </Paragraph>
                    </HomepageCard>
                    <HomepageCard
                      label="Request and Track"
                      imagePath="/request-n--track.png"
                    >
                      <Paragraph>
                        You can request for resource through the portal and keep
                        tabs on them through the sharing process.
                      </Paragraph>
                    </HomepageCard>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>
        <Box background="brand" pad={{ vertical: '66px' }}>
          <Box alignSelf="center" align="center" width={{ max: 'large' }}>
            <Text size="50px" color="white">
              Create a CCRR portal account!
            </Text>
            <Paragraph color="white" margin={{ top: 'large' }}>
              You can use your existing ORCID iD to create an CCRR Portal
              account. If you don’t have an ORCID iD, you can use the button
              below to create one!
            </Paragraph>
            <Paragraph color="white" margin={{ top: 'medium' }}>
              You can use your CCRR Portal account to request resources, share
              your resources, and track and manage requests.
            </Paragraph>
            <Button
              margin={{ top: 'medium' }}
              color="black-tint-40"
              primary
              label="Create of Connect With ORCID ID"
            />
          </Box>
        </Box>
      </Box>
    </>
  )
}

Home.getInitialProps = async ({ req, query }) => {
  // Revisit how to present errors thrown from this function
  if (!query.code) {
    return {}
  }

  let queryJSON = {email: 'this@willchange.com'}

  if (query.json) {
    queryJSON = JSON.parse(query.json)
  }

  const [tokenRequest, userRequest] = await api.user.login(
    query.code,
    decodeURI(`http://${req.headers.host}${req.url}`),
    queryJSON
  )

  const initialProps = {}

  if (tokenRequest.isOk) {
    initialProps.token = tokenRequest.response.token
    initialProps.redirectUrl = queryJSON.origin_url
  }

  if (userRequest.isOk) {
    initialProps.authenticatedUser = userRequest.response
  }

  return initialProps
}

export default Home
