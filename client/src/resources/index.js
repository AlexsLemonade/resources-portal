import Dataset from './Dataset';

export const Mappings = {
  CELL_LINE: null,
  PLASMID: null,
  PROTOCOL: null,
  DATASET: Dataset,
  MOUSE_MODEL: null,
  ZEBRAFISH_MODEL: null
};

function findResourceComponent(category) {
  if (Mappings[category]) {
    return Mappings[category];
  }

  throw new Error(
    `Resource category not defined for ${category}. Look into the /resources folder of the project.`
  );
}

const ResourceComponentGetter = key => ({ resource }) => {
  const ResourceComponent = findResourceComponent(resource.category);
  if (!ResourceComponent[key]) {
    throw new Error(`Resource ${category} doesn't have ${key} defined.`);
  }
  const Resource = ResourceComponent[key];

  return <Resource resource={resource} />;
};

export const SearchResult = ResourceComponentGetter('SearchResult');
export const ResourceDetails = ResourceComponentGetter('ResourceDetails');
