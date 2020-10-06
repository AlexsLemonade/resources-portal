export default (addresses) => {
  const filteredAddresses = addresses.filter((a) => !!a)
  return filteredAddresses.map((address) => ({
    disabled: false,
    id: `${address.id}`,
    name: `address-${address.id}`,
    value: address.id,
    address
  }))
}
