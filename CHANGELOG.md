# Changelog

## [5.3.0] - 2024-04-18

Updated readme to remove some config that was never used.

## [5.0.0] - 2023-09-05

### Breaking

- Plain ldapjs-client is removed, only ldapts from now.  
  `search` and `searchOne` are no longer exposed on the `client`-object  
  `search` returns an array of results, instead of a `SearchResult` instance  
  No change should be needed if the app alredy uses env `USE_LDAPTS=true`  
  Env `USE_LDAPTS` is no longer used and should be removed.

- getSessionUserHelpers is removed.
