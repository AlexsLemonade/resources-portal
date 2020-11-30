export default (members = []) =>
  members.map((member) => {
    return {
      disabled: false,
      id: `${member.id}`,
      name: `member-${member.id}`,
      value: member.id,
      label: member.full_name,
      member
    }
  })
