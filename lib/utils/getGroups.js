function getGroups (ldapUser) {
  let groups = ldapUser.memberOf
  let groupIds = []

  if (typeof groups === 'string') {
    groups = [ groups ]
  }

  if (groups && Array.isArray(groups)) {
    for (let i = 0; i < groups.length; i++) {
      groupIds.push(groups[i].match(/^CN=([^,]*)/)[1])
    }
  }

  return groupIds
}

module.exports = getGroups
