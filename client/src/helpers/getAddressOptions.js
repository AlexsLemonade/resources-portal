export default (addresses) =>
  addresses.map((address) => ({
    disabled: false,
    id: `${address.id}`,
    name: `address-${address.id}`,
    value: address.id,
    address
  }))
