

/**
* Google Apps Script Library for the photoslibrary API
* 
* Documentation can be found: 
* https://developers.google.com/photos/
* 
* OAuth2 Scopes
* https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata
* https://www.googleapis.com/auth/photoslibrary.sharing
* https://www.googleapis.com/auth/photoslibrary
* https://www.googleapis.com/auth/photoslibrary.readonly
* https://www.googleapis.com/auth/photoslibrary.appendonly
* https://www.googleapis.com/auth/drive.photos.readonly
*/

var BASEURL_="https://photoslibrary.googleapis.com/";
var tokenService_;

/*
* Stores the function passed that is invoked to get a OAuth2 token;
* @param {function} service The function used to get the OAuth2 token;
*
*/
function setTokenService(service){
  tokenService_ = service;
}

/*
* Returns an OAuth2 token from your TokenService as a test
* @return {string} An OAuth2 token
*
*/
function testTokenService(){
 return tokenService_();
}

/**
 * Performs a Fetch
 * @param {string} url The endpoint for the URL with parameters
 * @param {Object.<string, string>} options Options to override default fetch options
 * @returns {Object.<string,string>} the fetch results
 * @private
 */
function CALL_(path,options){
  var fetchOptions = {method:"",muteHttpExceptions:true, contentType:"application/json", headers:{Authorization:"Bearer "+tokenService_()}}
  var url = BASEURL_ + path;
  
  for(option in options){
    fetchOptions[option] = options[option];
  }
  
  var response = UrlFetchApp.fetch(url, fetchOptions)
  if(response.getResponseCode() != 200){
    throw new Error(response.getContentText())
  }else{
    return JSON.parse(response.getContentText());
  }
}

/**
 * Performs a Fetch and accumulation using pageToken parameter of the returned results
 * @param {string} url The endpoint for the URL with parameters
 * @param {Object.<string, string>} options Options to override default fetch options
 * @param {string} returnParamPath The path of the parameter to be accumulated
 * @returns {Array.Object.<string,string>} An array of objects
 * @private
 */
function CALLPAGE_(path,options, returnParamPath){
  var fetchOptions = {method:"",muteHttpExceptions:true, contentType:"application/json", headers:{Authorization:"Bearer "+tokenService_()}}
  for(option in options){
    fetchOptions[option] = options[option];
  }
  var url = BASEURL_ + path;  
  var returnArray = [];
  var nextPageToken;
  do{
    if(nextPageToken){
      url = buildUrl_(url, {pageToken:nextPageToken});
    }
    var results = UrlFetchApp.fetch(url, fetchOptions);
    if(results.getResponseCode() != 200){
      throw new Error(results.getContentText());
    }else{
      var resp = JSON.parse(results.getContentText())
      nextPageToken = resp.nextPageToken;
      returnArray  = returnArray.concat(resp[returnParamPath])
    }
    url = BASEURL_ + path;
  }while(nextPageToken);
  return returnArray;
}

/**
 * Builds a complete URL from a base URL and a map of URL parameters. Written by Eric Koleda in the OAuth2 library
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @returns {string} The complete URL.
 * @private
 */
function buildUrl_(url, params) {
  var params = params || {}; //allow for NULL options
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;  
}


/**
* Creates one or more media items in a user's Google Photos library.
If an album id is specified, the media item(s) are also added to the album.
By default the media item(s) will be added to the end of the library or
album.

If an album id and position are both defined, then the media items will
be added to the album at the specified position.

If multiple media items are given, they will be inserted at the specified
position.
*
* @param {object} BatchCreateMediaItemsRequestResource An object containing the BatchCreateMediaItemsRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned BatchCreateMediaItemsResponseResource object
*/
function mediaItemsBatchCreate(BatchCreateMediaItemsRequestResource,options){
  var path = buildUrl_("v1/mediaItems:batchCreate",options);
  var callOptions = {method:"POST",payload:JSON.stringify(BatchCreateMediaItemsRequestResource)};
  var BatchCreateMediaItemsResponseResource = CALL_(path,callOptions);
  return BatchCreateMediaItemsResponseResource;
}

/**
* Searches for media items in a user's Google Photos library.
If no filters are set, then all media items in the user's library will be
returned.

If an album is set, all media items in the specified album will be
returned.

If filters are specified, anything that matches the filters from the user's
library will be listed.

If an album and filters are set, then this will result in an error.
*
* @param {object} SearchMediaItemsRequestResource An object containing the SearchMediaItemsRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned SearchMediaItemsResponseResource object
*/
function mediaItemsSearch(SearchMediaItemsRequestResource,options){
  var path = buildUrl_("v1/mediaItems:search",options);
  var callOptions = {method:"POST",payload:JSON.stringify(SearchMediaItemsRequestResource)};
  var SearchMediaItemsResponseResource = CALLPAGE_(path,callOptions,"mediaItems");
  return SearchMediaItemsResponseResource;
}

/**
* Returns the media item specified based on a given media item id.
*
* @param {string} mediaItemId Identifier of media item to be requested.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned MediaItemResource object
*/
function mediaItemsGet(mediaItemId,options){
  var path = buildUrl_("v1/mediaItems/"+mediaItemId,options);
  var callOptions = {method:"GET"};
  var MediaItemResource = CALL_(path,callOptions);
  return MediaItemResource;
}

/**
* Lists all shared albums shown to a user in the 'Sharing' tab of the
Google Photos app.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ListSharedAlbumsResponseResource object
*/
function sharedAlbumsList(options){
  var path = buildUrl_("v1/sharedAlbums",options);
  var callOptions = {method:"GET"};
  var ListSharedAlbumsResponseItems = CALLPAGE_(path,callOptions,"sharedAlbums");
  return ListSharedAlbumsResponseItems;
}

/**
* Joins a shared album on behalf of the Google Photos user.
*
* @param {object} JoinSharedAlbumRequestResource An object containing the JoinSharedAlbumRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned JoinSharedAlbumResponseResource object
*/
function sharedAlbumsJoin(JoinSharedAlbumRequestResource,options){
  var path = buildUrl_("v1/sharedAlbums:join",options);
  var callOptions = {method:"POST",payload:JSON.stringify(JoinSharedAlbumRequestResource)};
  var JoinSharedAlbumResponseResource = CALL_(path,callOptions);
  return JoinSharedAlbumResponseResource;
}

/**
* Lists all albums shown to a user in the 'Albums' tab of the Google
Photos app.
*
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ListAlbumsResponseResource object
*/
function albumsList(options){
  var path = buildUrl_("v1/albums",options);
  var callOptions = {method:"GET"};
  var ListAlbumsResponseItems = CALLPAGE_(path,callOptions,"albums");
  return ListAlbumsResponseItems;
}

/**
* Returns the album specified by the given album id.
*
* @param {string} albumId Identifier of the album to be requested.
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned AlbumResource object
*/
function albumsGet(albumId,options){
  var path = buildUrl_("v1/albums/"+albumId,options);
  var callOptions = {method:"GET"};
  var AlbumResource = CALL_(path,callOptions);
  return AlbumResource;
}

/**
* Adds an enrichment to a specified position in a defined album.
*
* @param {string} albumId Identifier of the album where the enrichment will be added.
* @param {object} AddEnrichmentToAlbumRequestResource An object containing the AddEnrichmentToAlbumRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned AddEnrichmentToAlbumResponseResource object
*/
function albumsAddEnrichment(albumId,AddEnrichmentToAlbumRequestResource,options){
  var path = buildUrl_("v1/albums/"+albumId+":addEnrichment",options);
  var callOptions = {method:"POST",payload:JSON.stringify(AddEnrichmentToAlbumRequestResource)};
  var AddEnrichmentToAlbumResponseResource = CALL_(path,callOptions);
  return AddEnrichmentToAlbumResponseResource;
}

/**
* Creates an album in a user's Google Photos library.
*
* @param {object} CreateAlbumRequestResource An object containing the CreateAlbumRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned AlbumResource object
*/
function albumsCreate(CreateAlbumRequestResource,options){
  var path = buildUrl_("v1/albums",options);
  var callOptions = {method:"POST",payload:JSON.stringify(CreateAlbumRequestResource)};
  var AlbumResource = CALL_(path,callOptions);
  return AlbumResource;
}

/**
* Marks an album as 'shared' and accessible to other users. This action can
only be performed on albums which were created by the developer via the
API.
*
* @param {string} albumId Identifier of the album to be shared. This album id must belong to an albumcreated by the developer..
* @param {object} ShareAlbumRequestResource An object containing the ShareAlbumRequestResource for this method
* @param {object} options Keypair of all optional parameters for this call
* @return {object} The returned ShareAlbumResponseResource object
*/
function albumsShare(albumId,ShareAlbumRequestResource,options){
  var path = buildUrl_("v1/albums/"+albumId+":share",options);
  var callOptions = {method:"POST",payload:JSON.stringify(ShareAlbumRequestResource)};
  var ShareAlbumResponseResource = CALL_(path,callOptions);
  return ShareAlbumResponseResource;
}
