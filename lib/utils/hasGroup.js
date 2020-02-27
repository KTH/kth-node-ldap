/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */

/**
 * Check if the given LDAP user is in the given group.
 */
function hasGroup(groupStr, ldapUser) {
  var groups = ldapUser.memberOf

  if (typeof groups === 'string') {
    groups = [groups]
  }

  if (groups && groups.length > 0) {
    for (var i = 0; i < groups.length; i++) {
      if (groupStr && groupStr === _getGroupName(groups[i])) {
        return true
      }
    }
  }
  return false
}

/**
 * Gets the group name from the given AD_LDAP CN string.
 */
function _getGroupName(CNLdapGroupString) {
  const regex1 = /^CN=/i
  const regex2 = /,.*/i
  return CNLdapGroupString.replace(regex1, '').replace(regex2, '')
}

module.exports = hasGroup
