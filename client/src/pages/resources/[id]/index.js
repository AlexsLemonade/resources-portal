import { useLoader } from '../../../common/hooks';
import { getResourceDetails } from '../../../common/api';
import { useRouter } from 'next/router';
import { Details } from '../../../resources';

export default function() {
  const router = useRouter();
  const { data } = useLoader(() => getResourceDetails({ id: router.query.id }));

  if (!data) return null;

  return (
    <div className="container">
      <main>
        <h1 className="title">{data.title}</h1>

        {data && <Details category={data.category} data={data} />}
      </main>
    </div>
  );
}
