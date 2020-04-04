import { getResourceDetails } from '../../../common/api';
import { useRouter } from 'next/router';
import { Details } from '../../../resources';

export default function ResourceDetails({ resource }) {
  return (
    <div className="container">
      <main>
        <h1 className="title">{resource.title}</h1>

        <Details category={resource.category} data={resource} />
      </main>
    </div>
  );
}
ResourceDetails.getInitialProps = async ({ query }) => {
  const resource = await getResourceDetails({ id: query.id });
  return { resource };
};
