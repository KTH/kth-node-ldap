const log = require('kth-node-log')

module.exports = function (options) {
  const adminGroup = options.adminGroup // config.auth.adminGroup

  return {
    SetLdapUser: function (req, ldapResponse, pgtIou) {
      if (ldapResponse) {
        log.debug('ldapResponse.ugUsername: ' + ldapResponse.ugUsername)
        var groups = ldapResponse.memberOf
        var isAdmin = false

        if (typeof groups === 'string') {
          groups = [ ldapResponse.memberOf ]
        }

        if (groups && groups.length > 0) {
          for (var i = 0; i < groups.length; i++) {
            if (adminGroup && groups[ i ].indexOf(adminGroup) >= 0) {
              isAdmin = true
              break
            }
          }
        }

        req.session.ldapUserName = ldapResponse.ugUsername
        req.session.ldapDisplayName = ldapResponse.displayName
        req.session.ldapEmail = ldapResponse.mail
        req.session.isAdmin = isAdmin
        req.session.pgtIou = pgtIou
      }
    },

    GetLdapUser: function (req) {
      return {
        name: req.session.ldapDisplayName || '',
        username: req.session.ldapUserName || '',
        email: req.session.ldapEmail || '',
        isAdmin: req.session.isAdmin || false
      }
    }
  }
}
