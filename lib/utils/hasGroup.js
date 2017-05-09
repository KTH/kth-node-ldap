function hasGroup (groupStr, ldapUser) {
  var groups = ldapUser.memberOf

  if (typeof groups === 'string') {
    groups = [ groups ]
  }

  if (groups && groups.length > 0) {
    for (var i = 0; i < groups.length; i++) {
      if (groupStr && groups[ i ].indexOf(groupStr) >= 0) {
        return true
      }
    }
  }
  return false
}

module.exports = hasGroup
