// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var dropdown = document.getElementById('dropdown');

    // Load the saved background color for this page and modify the dropdown
    // value, if needed.
    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    // Ensure the background color is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
	
	//Inspire Me Buton
	var test = document.getElementById('doIt');
    test.addEventListener('click', function() {	
        inspireMe(url);
    });
	
  });
});

function inspireMe(url) {
	url = manipulateUrl(url);
	openNewTab(url)
}
function openNewTab(newUrl) {

	if(newUrl != "")
		chrome.tabs.create({ url: newUrl });
	else
		chrome.tabs.create({ url: "https://www.expedia.com" });
}
function manipulateUrl(url) {
	if(url.indexOf('booking.com') < 0){
		return "";
	}
	
	newUrl = "https://www.expedia.com/Hotel-Search?";
	url = encodeURI(url);
	
	objs = getAllUrlParams(url);
	newUrl = newUrl + "&destination=" + objs.ss;
	newUrl = newUrl + "&startDate=" + objs.checkin_month;
	newUrl = newUrl + "/" + objs.checkin_monthday;
	newUrl = newUrl + "/" + objs.checkin_year;
	newUrl = newUrl + "&endDate=" + objs.checkout_month;
	newUrl = newUrl + "/" + objs.checkout_monthday;
	newUrl = newUrl + "/" + objs.checkout_year;	
	return decodeURI(newUrl);
}

/*
/searchresults.hu.html?label=gen173nr-1FCAEoggJCAlhYSDNiBW5vcmVmaGeIAQGYARHCAQp3aW5kb3dzIDEwyAEM2AEB6AEB-AELkgIBeagCAw&lang=hu&sid=fa202de0342ebfcec91baf38f01543a1
&sb=1&
src=index&
src_elem=sb&
error_url=https%3A%2F%2Fwww.booking.com%2Findex.hu.html%3Flabel%3Dgen173nr-1FCAEoggJCAlhYSDNiBW5vcmVmaGeIAQGYARHCAQp3aW5kb3dzIDEwyAEM2AEB6AEB-AELkgIBeagCAw%3Bsid%3Dfa202de0342ebfcec91baf38f01543a1%3Bsb_price_type%3Dtotal%26%3B&
ss=Budapest%2C+Pest+megye%2C+Magyarorsz%C3%A1g&
checkin_year=2017&
checkin_month=11&
checkin_monthday=28&
checkout_year=2017&
checkout_month=11&
checkout_monthday=30&
no_rooms=1&
group_adults=2&
group_children=0&
from_sf=1&
ss_raw=budpaet&
ac_position=0&
ac_langcode=hu&
dest_id=-850553&
dest_type=city&
search_pageview_id=ef48347d8994007e&search_selected=true&search_pageview_id=ef48347d8994007e&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0


startDate=11/23/2017&endDate=11/24/2017
*/

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    //queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

